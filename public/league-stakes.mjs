// Championship payouts and the Event 4 CrossFire format supplied by Elite Pickleball.
export const CHAMPIONSHIP_PAYOUTS = [
  {place:'1st',team:4000,player:1000,metal:'gold'},
  {place:'2nd',team:2000,player:500,metal:'silver'},
  {place:'3rd',team:1000,player:250,metal:'bronze'}
];
export const CROSSFIRE_EVENT_ID = 'epl-event-4';
const money=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(value);
const dateLabel=date=>new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${date}T12:00:00Z`));
export const championshipPrizeTotal=()=>CHAMPIONSHIP_PAYOUTS.reduce((total,payout)=>total+payout.team,0);
export function payoutCardsMarkup(){
  return `<div class="championship-payouts">${CHAMPIONSHIP_PAYOUTS.map(payout=>`<article class="championship-prize prize-${payout.metal}"><h3><span>${payout.place}</span> place</h3><p class="prize-team">${money(payout.team)}<span>per team</span></p><p class="prize-player">${money(payout.player)} <span>per player</span></p></article>`).join('')}</div>`;
}
export function championshipEventPrizesMarkup(){
  return `<section class="event-stakes" aria-label="Championship prize payouts"><h4>${money(championshipPrizeTotal())} championship prize money</h4>${payoutCardsMarkup()}</section>`;
}
export function crossFireEventMarkup(){
  return '<section class="event-crossfire"><p class="eyebrow">EVENT 04 / THE REGULAR-SEASON FINALE</p><h4>CrossFire: Atlantic × Pacific.</h4><p>The final matchup at Event 4 is <strong>CrossFire</strong>. Each country faces a team from the other conference for its <strong>eighth regular-season matchup</strong>, after seven matchups within its own conference. The result counts toward season standings and championship seeding.</p></section>';
}
export function renderLeagueStakes(season){
  const root=document.querySelector('#league-stakes');
  const championship=season.events.find(event=>event.phase==='championship');
  const crossFire=season.events.find(event=>event.id===CROSSFIRE_EVENT_ID);
  root.innerHTML=`<section id="prize-money" class="championship-prizes" aria-labelledby="prize-money-title"><div class="prize-section-heading"><div><p class="eyebrow">THE WORLD CHAMPIONSHIP${championship?` / ${dateLabel(championship.date).toUpperCase()}`:''}</p><h2 id="prize-money-title">The title. The pride.<br>The prize money.</h2></div><div class="prize-total"><strong>${money(championshipPrizeTotal())}</strong><span>CHAMPIONSHIP PRIZE POOL</span></div></div>${payoutCardsMarkup()}<div class="prize-section-footer"><p>All 16 countries advance. The championship decides the league winner—and the payouts.</p><a class="text-link" href="${championship?`#schedule/${encodeURIComponent(championship.id)}`:'#schedule'}">View championship event <span aria-hidden="true">↗</span></a></div></section><section id="crossfire" class="crossfire-feature" aria-labelledby="crossfire-title"><div class="crossfire-identity"><p class="eyebrow">EVENT 04${crossFire?` / ${dateLabel(crossFire.date).toUpperCase()}`:''}</p><h2 id="crossfire-title">Cross<span>Fire.</span></h2><p class="crossfire-conferences">ATLANTIC <span aria-hidden="true">×</span><span class="sr-only">versus</span> PACIFIC</p></div><div class="crossfire-copy"><h3>Matchup eight. Across the divide.</h3><p>Seven matchups within your conference. One against the other side. At Event 4, each country closes its regular season with <strong>CrossFire</strong>—its eighth matchup, against a team from the other conference.</p><p>This final matchup counts toward the season standings and championship seeding.</p><a class="text-link" href="#schedule/${CROSSFIRE_EVENT_ID}">Explore Event 4 <span aria-hidden="true">↗</span></a></div></section>`;
}
