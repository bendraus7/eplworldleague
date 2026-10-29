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
  function setOpen(open){panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Hide event schedule':'Show event schedule');}
  function close(){setOpen(false);}
  toggle.addEventListener('click',()=>setOpen(panel.hidden));
  // Hover the schedule link to preview; the arrow remains a true click toggle.
  root.addEventListener('pointerover',event=>{if(event.pointerType==='mouse'&&!event.target.closest('.schedule-menu-toggle'))setOpen(true);});
  root.addEventListener('pointerleave',()=>{if(!root.contains(document.activeElement))close();});
  root.addEventListener('focusout',event=>{if(!root.contains(event.relatedTarget))close();});
  root.addEventListener('keydown',event=>{
    if(event.key==='Escape'){event.preventDefault();toggle.focus();close();}
    else if(event.key==='ArrowDown'&&event.target!==panel&& !panel.contains(event.target)){event.preventDefault();setOpen(true);panel.querySelector('a')?.focus();}
  });
  panel.addEventListener('click',event=>{if(event.target.closest('a'))close();});
  document.addEventListener('click',event=>{if(!root.contains(event.target))close();});
  window.addEventListener('hashchange',close);
  return {close};
}
