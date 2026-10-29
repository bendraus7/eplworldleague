import {bindNavDisclosure} from './nav-disclosure.mjs';
import {bracketMeshEventUrl,eventsByRange} from './season-model.mjs';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createScheduleNav({events,error=false}) {
  const root=document.querySelector('.schedule-nav'),panel=root.querySelector('.schedule-dropdown'),toggle=root.querySelector('button');
  const sorted=eventsByRange(events,'all');
  const date=event=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${event.date}T12:00:00Z`));
  panel.innerHTML=`<div class="schedule-menu-heading"><span>2026–2027 season</span><a href="#schedule">Full schedule ↗</a></div>${error?'<p class="schedule-menu-note">Event dates could not be loaded. Open the schedule to retry.</p>':sorted.length?`<ul class="schedule-menu-events${sorted.length>4?' schedule-menu-columns':''}">${sorted.map(event=>{
    const url=bracketMeshEventUrl(event.bracketMeshUrl),past=eventsByRange([event],'past').length>0;
    return `<li><a href="${esc(url||`#schedule/${event.id}`)}"${url?' target="_blank" rel="noopener"':''}><time datetime="${esc(event.date)}">${date(event)}</time><span class="schedule-menu-title">${esc(event.title)} <span aria-hidden="true">${url?'↗':'→'}</span></span><span class="schedule-menu-venue">${esc(event.venue)}</span><span class="schedule-menu-status">${event.status==='cancelled'?'Cancelled':past?'Past event':'Upcoming'}${url?' · BracketMesh':' · Event details'}</span></a></li>`;
  }).join('')}</ul>`:'<p class="schedule-menu-note">Event dates will be announced soon.</p>'}`;
  return bindNavDisclosure({root,panel,toggle,label:'event schedule'});
}
