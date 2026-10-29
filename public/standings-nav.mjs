import {conferenceStandings} from './season-model.mjs';
import {bindNavDisclosure} from './nav-disclosure.mjs';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function standingsPreviewMarkup({season,teams,error=false}) {
  const conferences=['Atlantic','Pacific'].map(name=>({name,rows:conferenceStandings(season,teams,name)}));
  const started=conferences.some(conference=>conference.rows.some(row=>row.played));
  return `<div class="standings-menu-heading"><div><span class="eyebrow">2026–2027 / OVERALL SEASON</span><h2>League standings</h2></div><a href="#standings">Full standings ↗</a></div>${error?'<p class="standings-menu-note" role="status">Standings are temporarily unavailable. Open the full standings page to retry.</p>':`<div class="standings-preview-columns">${conferences.map(({name,rows})=>`<section class="standings-preview-conference" aria-label="${name} conference standings"><h3><a href="#standings/${name.toLowerCase()}">${name} conference <span aria-hidden="true">↗</span></a></h3><table><caption class="sr-only">${name} regular-season country records</caption><thead><tr><th scope="col">COUNTRY</th><th scope="col">W</th><th scope="col">L</th><th scope="col">PTS</th></tr></thead><tbody>${rows.map(row=>`<tr data-preview-team="${esc(row.team.id)}"><th scope="row"><a href="#team/${esc(row.team.id)}"><img class="country-flag" src="assets/flags/${esc(row.team.code.toLowerCase())}.svg" alt="" width="22" height="16"><span>${esc(row.team.name)}</span></a></th><td>${row.played?row.wins:'—'}</td><td>${row.played?row.losses:'—'}</td><td>${row.played?row.standingsPoints:'—'}</td></tr>`).join('')}</tbody></table></section>`).join('')}</div><p class="standings-menu-note">${started?'Regular-season results · Championship seeding':'Season starts November 21 · Records pending'}</p>`}`;
}

export function createStandingsNav(options) {
  const root=document.querySelector('.standings-nav');
  const panel=root.querySelector('.standings-dropdown');
  panel.innerHTML=standingsPreviewMarkup(options);
  return bindNavDisclosure({root,panel,toggle:root.querySelector('button'),label:'standings preview'});
}
