import {bracketMeshEventUrl,eventsByRange} from './season-model.mjs';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateLabel=(date,options)=>new Intl.DateTimeFormat('en-US',{...options,timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`));
const flag=team=>`<img class="country-flag" src="assets/flags/${team.code.toLowerCase()}.svg" alt="" width="28" height="21">`;
export const normalizeSearch=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim().replace(/\s+/g,' ');
export function leagueEntries(teams){
  return teams.flatMap(team=>[
    {id:team.id,name:team.name,kind:'Team',team,href:`#team/${team.id}`,image:team.art},
    ...team.players.map(player=>({...player,kind:'Player',team,href:`#player/${player.id}`}))
  ]);
}
export function searchLeague(entries,query){
  const q=normalizeSearch(query),tokens=q.split(' ').filter(Boolean);
  if(!tokens.length)return [];
  return entries.filter(entry=>tokens.every(token=>normalizeSearch(`${entry.name} ${entry.team.name} ${entry.team.code}`).includes(token)))
    .sort((a,b)=>Number(normalizeSearch(b.name)===q)-Number(normalizeSearch(a.name)===q)||Number(normalizeSearch(b.name).startsWith(q))-Number(normalizeSearch(a.name).startsWith(q))||a.name.localeCompare(b.name));
}
export function sortPlayers(players,sort='name',getRating=()=>null){
  const rating=player=>{const value=getRating(player.id);return typeof value==='number'&&Number.isFinite(value)?value:-Infinity;};
  return [...players].sort((a,b)=>(sort==='rating'?(rating(b)-rating(a)||0):sort==='country'?a.team.name.localeCompare(b.team.name):0)||a.name.localeCompare(b.name));
}
export function teamDuprSummary(players,getRating=()=>null){
  const ratings=players.map(player=>getRating(player.id)).filter(value=>typeof value==='number'&&Number.isFinite(value)&&value>0);
  const complete=players.length>0&&ratings.length===players.length;
  const total=complete?ratings.reduce((sum,value)=>sum+Math.round(value*1000),0)/1000:null;
  return {rated:ratings.length,players:players.length,total,average:complete?total/players.length:null};
}
export function seasonStripMarkup(events,{now=Date.now(),currentId=null}={}){
  const sorted=eventsByRange(events,'all',now),next=eventsByRange(events,'upcoming',now).find(event=>event.status!=='cancelled');
  return `<nav class="season-strip" aria-label="2026–2027 season events">${sorted.map((event,i)=>{
    const url=bracketMeshEventUrl(event.bracketMeshUrl),current=event.id===(currentId||next?.id);
    return `<a class="season-stop${event.phase==='championship'?' season-final':''}${current?' is-next':''}" href="${esc(url||`#schedule/${event.id}`)}"${url?' target="_blank" rel="noopener"':''}><span>${event.phase==='championship'?'WORLD CHAMPIONSHIP':`EVENT ${String(i+1).padStart(2,'0')}`}<b aria-hidden="true">${url?'↗':'→'}</b></span><time datetime="${event.date}">${dateLabel(event.date,{month:'short',day:'numeric'})}<small>${event.date.slice(0,4)}</small></time><span class="season-stop-note">${current?'Next up · ':''}${event.status==='cancelled'?'Cancelled':event.phase==='championship'?'The title decider':'Regular season'}</span></a>`;
  }).join('')}</nav>`;
}
export function fixtureBoardMarkup(season,teams,eventId){
  const rounds=season.rounds.filter(round=>round.eventId===eventId),event=season.events.find(event=>event.id===eventId);
  if(!rounds.length||!event)return '';
  return rounds.map(round=>`<section class="fixture-board-round"><div class="fixture-board-heading"><h5>${esc(round.time)} <span>CT</span></h5><span>${esc(round.session)} · ${esc(round.label)}</span></div><div class="match-card-grid">${round.matches.map(([a,b,courts])=>{
    const first=teams.find(t=>t.id===a),second=teams.find(t=>t.id===b);if(!first||!second)return '';
    return `<article class="match-card"><div class="match-card-meta"><span>COURTS ${esc(courts)}</span><span>Team matchup</span></div><a href="#team/${first.id}">${flag(first)}<strong>${esc(first.name)}</strong><span aria-hidden="true">↗</span></a><a href="#team/${second.id}">${flag(second)}<strong>${esc(second.name)}</strong><span aria-hidden="true">↗</span></a></article>`;
  }).join('')}</div></section>`).join('');
}
export function bindLeagueSearch({teams}){
  const entries=leagueEntries(teams),dialog=document.querySelector('#league-search-dialog'),globalInput=document.querySelector('#league-search'),globalResults=document.querySelector('#league-search-results');
  const shortcuts=`<div class="finder-shortcuts"><a href="#teams">All 16 countries ↗</a><a href="#players">All 64 players ↗</a></div>`;
  function renderResults(field,target){
    const matches=searchLeague(entries,field.value);
    if(!field.value.trim()){target.innerHTML=shortcuts;return;}
    target.innerHTML=`<p class="finder-count" role="status">${matches.length} ${matches.length===1?'match':'matches'}${matches.length>8?' · showing the first 8':''}</p>${matches.length?`<div class="finder-result-list">${matches.slice(0,8).map(entry=>`<a href="${entry.href}">${flag(entry.team)}<span><strong>${esc(entry.name)}</strong><small>${entry.kind==='Team'?`${esc(entry.team.division)} Conference · 4 players`:`Team ${esc(entry.team.name)}`}</small></span><span class="finder-kind">${entry.kind} ↗</span></a>`).join('')}</div>`:'<p class="finder-empty">No matching player or country. Try a different name.</p>'}`;
  }
  function open(){dialog.showModal();globalInput.focus();renderResults(globalInput,globalResults);}
  document.querySelectorAll('[data-league-search]').forEach(button=>button.addEventListener('click',open));
  document.querySelector('[data-close-search]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();dialog.close();}});
  dialog.addEventListener('click',event=>{if(event.target.closest('a'))dialog.close();if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  [[globalInput,globalResults]].forEach(([field,target])=>{
    field.addEventListener('input',()=>renderResults(field,target));
    field.addEventListener('keydown',event=>{if(event.key==='Enter'&&field.value.trim()){const first=target.querySelector('.finder-result-list a');if(first){event.preventDefault();first.click();}}});
    renderResults(field,target);
  });
  document.addEventListener('keydown',event=>{if(event.key==='/'&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.target.closest('input,textarea,select,[contenteditable="true"]')&&!document.querySelector('dialog[open]')){event.preventDefault();open();}});
}
