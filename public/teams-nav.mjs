import {bindNavDisclosure} from './nav-disclosure.mjs';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function createTeamsNav({teams}) {
  const root=document.querySelector('.teams-nav'),panel=root.querySelector('.teams-dropdown');
  panel.innerHTML=`<div class="teams-menu-heading"><div><span class="eyebrow">16 COUNTRIES / ONE WORLD LEAGUE</span><h2>Find your team</h2></div><a href="#teams">All teams ↗</a></div><div class="teams-preview-columns">${['Atlantic','Pacific'].map(conference=>`<section aria-label="${conference} conference teams"><h3>${conference} conference</h3><ul>${teams.filter(team=>team.division===conference).sort((a,b)=>a.name.localeCompare(b.name)).map(team=>`<li><a href="#team/${esc(team.id)}"><img class="country-flag" src="assets/flags/${esc(team.code.toLowerCase())}.svg" alt="" width="24" height="18"><span>${esc(team.name)}</span><span aria-hidden="true">↗</span></a></li>`).join('')}</ul></section>`).join('')}</div>`;
  return bindNavDisclosure({root,panel,toggle:root.querySelector('button'),label:'teams preview'});
}
