export const TIME_ZONE = 'America/Chicago';
export function bracketMeshEventUrl(value) {
  if(typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.origin === 'https://bracketmesh.com' && /^\/elitepickleball\/tournaments\/\d+\/?$/.test(url.pathname) ? url.href : null;
  } catch { return null; }
}
export function linkedEventPaths(events) {
  return events.flatMap(event => {const url=bracketMeshEventUrl(event.bracketMeshUrl);return url?[new URL(url).pathname]:[];});
}
export function eventDateKey(event) {
  return /^\d{4}-\d{2}-\d{2}$/.test(event.date||'') ? event.date : null;
}
export function eventsByRange(events, range='upcoming', now=Date.now()) {
  const valid=events.filter(event=>eventDateKey(event)&&Number.isFinite(Date.parse(event.endAt)));
  return valid.filter(event=>range==='all'||(range==='past'?Date.parse(event.endAt)<now:Date.parse(event.endAt)>=now))
    .sort((a,b)=>range==='past'?Date.parse(b.startAt)-Date.parse(a.startAt):Date.parse(a.startAt)-Date.parse(b.startAt));
}
export function centralDateKey(now=Date.now()) {
  const parts=new Intl.DateTimeFormat('en-US',{timeZone:TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(now));
  return ['year','month','day'].map(type=>parts.find(p=>p.type===type).value).join('-');
}
export function calendarDays(year,month) {
  const first=new Date(Date.UTC(year,month,1));
  return Array.from({length:42},(_,i)=>{
    const date=new Date(Date.UTC(year,month,1-first.getUTCDay()+i));
    return {key:date.toISOString().slice(0,10),day:date.getUTCDate(),inMonth:date.getUTCMonth()===month};
  });
}
export function fixturesForTeam(season,teamId) {
  return (season.rounds||[]).flatMap(round=>{
    const event=(season.events||[]).find(e=>e.id===round.eventId);
    if(!event) return [];
    return round.matches.filter(([a,b])=>a===teamId||b===teamId).map(([a,b,courts])=>({event,time:round.time,label:round.label,session:round.session,courts,opponentId:a===teamId?b:a}));
  });
}
export function completedTeamResults(season,teamId) {
  const seen=new Set();
  return (season.results||[]).filter(result=>{
    if(result.status!=='completed'||!result.id||seen.has(result.id)||result.teamAId===result.teamBId||![result.teamAId,result.teamBId].includes(teamId))return false;
    if(!(season.events||[]).some(e=>e.id===result.eventId)||!Number.isInteger(result.gamesA)||!Number.isInteger(result.gamesB)||result.gamesA<0||result.gamesB<0||result.gamesA+result.gamesB!==4)return false;
    if(result.gamesA===result.gamesB&&![result.teamAId,result.teamBId].includes(result.pointBreakWinnerId))return false;
    seen.add(result.id);return true;
  }).map(result=>{
    const ownA=result.teamAId===teamId;
    const winner=result.gamesA>result.gamesB?result.teamAId:result.gamesB>result.gamesA?result.teamBId:result.pointBreakWinnerId;
    return {...result,event:season.events.find(e=>e.id===result.eventId),opponentId:ownA?result.teamBId:result.teamAId,won:winner===teamId,gamesFor:ownA?result.gamesA:result.gamesB,gamesAgainst:ownA?result.gamesB:result.gamesA,pointsFor:ownA?result.pointsA:result.pointsB,pointsAgainst:ownA?result.pointsB:result.pointsA,pointBreak:result.gamesA===result.gamesB};
  }).sort((a,b)=>b.event.date.localeCompare(a.event.date));
}
export function teamStats(results) {
  const wins=results.filter(r=>r.won).length;
  const allPoints=results.length>0&&results.every(r=>Number.isFinite(r.pointsFor)&&Number.isFinite(r.pointsAgainst));
  return {played:results.length,wins,losses:results.length-wins,winRate:results.length?Math.round(wins/results.length*100):null,gamesWon:results.reduce((n,r)=>n+r.gamesFor,0),gamesLost:results.reduce((n,r)=>n+r.gamesAgainst,0),pointDifferential:allPoints?results.reduce((n,r)=>n+r.pointsFor-r.pointsAgainst,0):null};
}
