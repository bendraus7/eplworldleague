import roster from '../data/roster.json';
import identities from '../data/identities.json';
import { editor, writeAllowed, validateBio, exactIdentity, historyFor } from './player-core.mjs';

type Env = { DB?: D1Database; EPL_EDITOR_EMAILS?: string };
const json = (value: unknown, status=200) => Response.json(value, {status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const base='https://bracketmesh.com';
const flights = new Map<string,Promise<any>>();
async function source(env: Env, key:string, path:string, ttl=600000):Promise<any> {
  const previous=await env.DB!.prepare('SELECT payload, fetched_at FROM source_cache WHERE cache_key=?').bind(key).first<{payload:string;fetched_at:string}>();
  if(previous && Date.now()-Date.parse(previous.fetched_at)<ttl) return {...JSON.parse(previous.payload),fetchedAt:previous.fetched_at,stale:false};
  if(flights.has(key)) return flights.get(key);
  const promise=(async()=>{
    try {
      const response=await fetch(base+path,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(12000)});
      if(!response.ok) throw new Error('BracketMesh unavailable');
      const value=await response.json(); const now=new Date().toISOString();
      await env.DB!.prepare('INSERT INTO source_cache(cache_key,payload,fetched_at) VALUES(?,?,?) ON CONFLICT(cache_key) DO UPDATE SET payload=excluded.payload,fetched_at=excluded.fetched_at').bind(key,JSON.stringify(value),now).run();
      return {...value as object,fetchedAt:now,stale:false};
    } catch {
      if(previous) return {...JSON.parse(previous.payload),fetchedAt:previous.fetched_at,stale:true};
      throw new Error('BracketMesh is temporarily unavailable. Please try again.');
    }
  })();
  flights.set(key,promise); try{return await promise;}finally{flights.delete(key);}
}
async function directory(env:Env) {
  const value=await source(env,'directory','/api/players');
  if(!Array.isArray(value.players)) throw new Error('Player directory unavailable');
  return value;
}
async function links(env:Env) {
  const records=await env.DB!.prepare('SELECT player_id,dupr_code,profile_id FROM player_identities').all<{player_id:string;dupr_code:string;profile_id:string}>();
  const map=new Map(identities.map(p=>[p.playerId,p]));
  records.results.forEach(p=>map.set(p.player_id,{playerId:p.player_id,duprCode:p.dupr_code,profileId:p.profile_id} as any));
  return map;
}
function publicPlayer(p:any, match:any) {
  return {...p,linked:!!match,dupr:match?{code:match.duprCode,profileId:match.profileId,name:match.duprName||match.name,doubles:typeof match.doublesRating==='number'?match.doublesRating:null,url:`https://dashboard.dupr.com/dashboard/player/${encodeURIComponent(match.profileId)}`,location:match.location||null}:null};
}
export async function playerApi(request:Request, env:Env) {
  const url=new URL(request.url), path=url.pathname;
  if(path==='/api/session') return json({signedIn:!!request.headers.get('oai-authenticated-user-id'),canEdit:!!editor(request,env)});
  if(!env.DB) return json({error:'Player data is being configured. Please try again shortly.'},503);
  try {
    if(path==='/api/players' && request.method==='GET') {
      const [data,map]=await Promise.all([directory(env),links(env)]);
      return json({players:roster.map(p=>publicPlayer(p,exactIdentity(map.get(p.id),data.players))),fetchedAt:data.fetchedAt,stale:data.stale});
    }
    if(path==='/api/player-candidates' && request.method==='GET') {
      if(!editor(request,env)) return json({error:'Organizer access required'},403);
      const q=(url.searchParams.get('q')||'').trim().toLowerCase();
      if(q.length<2) return json({players:[]});
      const data=await directory(env);
      return json({players:data.players.filter((p:any)=>[p.name,p.duprName,p.duprCode,...p.aliases||[]].join(' ').toLowerCase().includes(q)).slice(0,30).map((p:any)=>({name:p.name,code:p.duprCode,profileId:p.profileId,rating:p.doublesRating,location:p.location}))});
    }
    const route=path.match(/^\/api\/players\/([a-z0-9-]+)(?:\/(bio|identity))?$/);
    if(!route) return json({error:'Not found'},404);
    const p=roster.find(p=>p.id===route[1]); if(!p) return json({error:'Player not found'},404);
    if(request.method==='PUT' && route[2]) {
      const user=editor(request,env); if(!user) return json({error:'Organizer access required'},403);
      if(!writeAllowed(request)) return json({error:'Invalid request origin or content type'},403);
      if(Number(request.headers.get('content-length')||0)>12000) return json({error:'Request too large'},413);
      const raw=await request.text(); if(raw.length>12000) return json({error:'Request too large'},413);
      let body;try{body=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400);}
      const now=new Date().toISOString();
      if(route[2]==='bio') {
        const valid=validateBio(body); if(!valid) return json({error:'Bio must be at most 2,000 characters and include the current version.'},400);
        const result=await env.DB.prepare('INSERT INTO player_profiles(player_id,bio,version,updated_at,updated_by) SELECT ?,?,1,?,? WHERE ?=0 ON CONFLICT(player_id) DO UPDATE SET bio=excluded.bio,version=player_profiles.version+1,updated_at=excluded.updated_at,updated_by=excluded.updated_by WHERE player_profiles.version=?').bind(p.id,valid.bio,now,user,valid.version,valid.version).run();
        // Existing rows with version > 0 require a direct conditional UPDATE.
        let changes=result.meta.changes;
        if(!changes && valid.version>0) changes=(await env.DB.prepare('UPDATE player_profiles SET bio=?,version=version+1,updated_at=?,updated_by=? WHERE player_id=? AND version=?').bind(valid.bio,now,user,p.id,valid.version).run()).meta.changes;
        if(!changes) return json({error:'This bio changed in another session. Reload the profile before saving.'},409);
        return json({bio:valid.bio,version:valid.version+1,updatedAt:now});
      }
      const data=await directory(env);
      const candidate=exactIdentity({duprCode:body.code,profileId:body.profileId},data.players);
      if(!candidate) return json({error:'Select a verified BracketMesh directory record.'},400);
      const duplicate=await env.DB.prepare('SELECT player_id FROM player_identities WHERE dupr_code=? AND player_id<>?').bind(body.code,p.id).first();
      const seedDuplicate=identities.some(x=>x.playerId!==p.id&&x.duprCode===body.code);
      if(duplicate||seedDuplicate) return json({error:'That DUPR account is already linked to another roster player.'},409);
      await env.DB.prepare('INSERT INTO player_identities(player_id,dupr_code,profile_id,updated_at,updated_by) VALUES(?,?,?,?,?) ON CONFLICT(player_id) DO UPDATE SET dupr_code=excluded.dupr_code,profile_id=excluded.profile_id,updated_at=excluded.updated_at,updated_by=excluded.updated_by').bind(p.id,body.code,String(body.profileId),now,user).run();
      return json({saved:true});
    }
    if(request.method!=='GET'||route[2]) return json({error:'Method not allowed'},405);
    const [data,map,bio]=await Promise.all([directory(env),links(env),env.DB.prepare('SELECT bio,version,updated_at FROM player_profiles WHERE player_id=?').bind(p.id).first()]);
    const match=exactIdentity(map.get(p.id),data.players);
    let history:any[]=[],historyUnavailable=false,profile:any=null;
    if(match){
      const results=await Promise.allSettled([
        source(env,`profile-${match.duprCode}`,`/api/players/${encodeURIComponent(match.duprCode)}/profile`,3600000),
        (async()=>{
          const feed=await source(env,'elite-feed','/api/tournaments?organization=elite');
          const events=(feed.tournaments||[]).filter((e:any)=>e.released&&!e.practice&&e.publicUrl?.startsWith('/elitepickleball/')&&Date.parse(e.date||e.startDate||'')<=Date.now());
          // Public Elite history is separate from the inaugural EPL season.
          const snapshots=await Promise.allSettled(events.map(async(event:any)=>({event,snapshot:await source(env,`elite-${event.publicId}`,`/api/organizations/elite/tournaments/${event.publicId}?bootstrap=1`)})));
          historyUnavailable=snapshots.some(r=>r.status==='rejected')||feed.stale;
          const successful=snapshots.filter(r=>r.status==='fulfilled').map(r=>(r as PromiseFulfilledResult<any>).value);
          historyUnavailable ||= successful.some(r=>r.snapshot.stale);
          return historyFor(match.duprCode,successful);
        })()
      ]);
      if(results[0].status==='fulfilled') {
        const v=results[0].value;
        if(v.player?.duprCode===match.duprCode&&String(v.player?.profileId)===String(match.profileId)) profile=v;
      }
      if(results[1].status==='fulfilled') history=results[1].value;else historyUnavailable=true;
    }
    return json({...publicPlayer(p,match),bio:bio||{bio:'',version:0},history,historyUnavailable,duprSnapshot:profile?{singles:profile.player.singlesRating,stats:profile.stats,updatedAt:profile.updatedAt,stale:profile.stale}:null,fetchedAt:data.fetchedAt,stale:data.stale});
  } catch(error) { return json({error:error instanceof Error?error.message:'Player data unavailable'},503); }
}
