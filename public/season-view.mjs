import {bracketMeshEventUrl,eventsByRange,centralDateKey,calendarDays,fixturesForTeam,completedTeamResults,teamStats} from './season-model.mjs';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateLabel=(key,options={month:'long',day:'numeric',year:'numeric'})=>new Intl.DateTimeFormat('en-US',{...options,timeZone:'UTC'}).format(new Date(`${key}T12:00:00Z`));
const metric=(label,value)=>`<div><dt>${label}</dt><dd>${value}</dd></div>`;
export function createSeasonView({season,teams,error=false}) {
  const root=document.querySelector('#schedule');
  let range='upcoming',view='list';
  const next=eventsByRange(season.events)[0]||season.events[0];
  let selectedDate=next?.date||centralDateKey();
  let [year,month]=selectedDate.split('-').map(Number);month--;
  const teamById=id=>teams.find(t=>t.id===id);
  const flag=team=>`<img class="country-flag" src="assets/flags/${team.code.toLowerCase()}.svg" alt="" width="28" height="21">`;
  function eventCard(event) {
    const url=bracketMeshEventUrl(event.bracketMeshUrl),past=eventsByRange([event],'past').length>0;
    const date=`<div class="season-event-date"><span>${dateLabel(event.date,{month:'short'})}</span><strong>${dateLabel(event.date,{day:'numeric'})}</strong><span>${dateLabel(event.date,{weekday:'short'})} · ${event.date.slice(0,4)}</span></div>`;
    const main=`${date}<div class="season-event-main"><span class="event-state">${event.status==='cancelled'?'Cancelled':past?'Past event':'Upcoming'}</span><h3>${esc(event.title)}</h3><p>${esc(event.venue)} · ${esc(event.location)}</p><p>${esc(event.timeLabel)}</p></div><span class="event-open">${url?'Open event ↗':'BracketMesh event coming soon'}</span>`;
    return `<article class="season-event" data-season-event="${esc(event.id)}">${url?`<a class="season-event-primary" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(event.title)} — ${dateLabel(event.date)} — open in BracketMesh">${main}</a>`:`<div class="season-event-primary">${main}</div>`}<details class="season-event-details"><summary>Event details</summary><div><p>${esc(event.address)}</p><p>${esc(event.timeLabel)} · All times Central</p><div class="event-detail-actions">${event.calendar?`<a class="text-link" href="${esc(event.calendar)}" download>Add to calendar ↓</a>`:''}${event.poster?'<button class="text-link" data-poster="3">View event poster ↗</button>':''}<a class="text-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}" target="_blank" rel="noopener">Directions ↗</a></div>${!url?'<p class="event-pending-note">The date is confirmed. The BracketMesh event page will be linked here when it is created.</p>':''}</div></details></article>`;
  }
  function calendarMarkup(events) {
    const today=centralDateKey(),days=calendarDays(year,month);
    const monthName=new Intl.DateTimeFormat('en-US',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,month,1)));
    const inMonth=events.filter(event=>event.date.startsWith(`${year}-${String(month+1).padStart(2,'0')}`));
    const selected=events.filter(event=>event.date===selectedDate);
    return `<div class="season-calendar"><div class="calendar-heading"><h2 id="calendar-month" tabindex="-1">${monthName}</h2><div class="calendar-nav"><button data-month-step="-1" aria-label="Previous month">←</button><button data-month-today>Today</button><button data-month-step="1" aria-label="Next month">→</button></div></div><div class="calendar-weekdays" aria-hidden="true">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(day=>`<span>${day}</span>`).join('')}</div><div class="calendar-grid" aria-label="${monthName} event calendar">${days.map(day=>{
      const dayEvents=events.filter(event=>event.date===day.key);
      return `<div class="calendar-day${day.inMonth?'':' outside-month'}${day.key===today?' is-today':''}${day.key===selectedDate?' is-selected':''}${dayEvents.length?' has-events':''}">${dayEvents.length?`<button class="calendar-date" data-select-date="${day.key}" aria-pressed="${day.key===selectedDate}" aria-label="${dateLabel(day.key)} — ${dayEvents.length} ${dayEvents.length===1?'event':'events'}">${day.day}</button>`:`<time datetime="${day.key}">${day.day}</time>`}${dayEvents.map(event=>{const url=bracketMeshEventUrl(event.bracketMeshUrl);return url?`<a class="calendar-event" href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(event.title)} — ${dateLabel(event.date)} — open in BracketMesh">${esc(event.title)} ↗</a>`:`<button class="calendar-event" data-select-date="${event.date}" aria-label="View ${esc(event.title)} details for ${dateLabel(event.date)}">${esc(event.title)}</button>`;}).join('')}</div>`;
    }).join('')}</div>${!inMonth.length?`<p class="calendar-empty">No ${range==='past'?'past':'upcoming'} events this month.${eventsByRange(season.events)[0]?'<button class="text-link" data-next-event>Jump to next event →</button>':''}</p>`:''}<div class="calendar-selected" aria-live="polite"><h3>${selected.length?dateLabel(selectedDate):'Select an event date'}</h3>${selected.map(eventCard).join('')}${!selected.length?'<p>Choose a date with an event to see its details.</p>':''}</div></div>`;
  }
  function renderSchedule() {
    const upcoming=eventsByRange(season.events,'upcoming'),past=eventsByRange(season.events,'past');
    const events=range==='past'?past:upcoming;
    root.innerHTML=`<div class="section-heading"><div><p class="eyebrow">2026–2027 / INAUGURAL SEASON</p><h1 class="view-title" tabindex="-1">Schedule</h1></div><p>League events and dates.<br>All times Central.</p></div><div class="season-toolbar"><div class="segmented" role="group" aria-label="Event dates"><button data-event-range="upcoming" class="${range==='upcoming'?'active':''}" aria-pressed="${range==='upcoming'}">Upcoming <span>${upcoming.length}</span></button><button data-event-range="past" class="${range==='past'?'active':''}" aria-pressed="${range==='past'}">Past <span>${past.length}</span></button></div><div class="segmented season-view-toggle" role="group" aria-label="Schedule view"><button data-season-view="list" class="${view==='list'?'active':''}" aria-pressed="${view==='list'}">List</button><button data-season-view="calendar" class="${view==='calendar'?'active':''}" aria-pressed="${view==='calendar'}">Calendar</button></div></div>${error?'<div class="season-empty"><h2>Schedule unavailable</h2><p>The event list could not be loaded. Please reload the page.</p></div>':view==='calendar'?calendarMarkup(events):`<div class="season-list-heading"><h2>${range==='past'?'Past events':'Upcoming events'}</h2><span>${events.length} ${events.length===1?'event':'events'}</span></div><div class="season-event-list">${events.length?events.map(eventCard).join(''):`<div class="season-empty"><h3>${range==='past'?'No past league events yet.':'More events will be announced.'}</h3><p>${range==='past'?'Completed EPL World League events will appear here.':'Check back for the next league date.'}</p></div>`}</div>`}`;
  }
  root.addEventListener('click',event=>{
    const target=event.target.closest('button');if(!target)return;
    let focus=null;
    if(target.dataset.eventRange){range=target.dataset.eventRange;const first=eventsByRange(season.events,range)[0];if(first){selectedDate=first.date;[year,month]=selectedDate.split('-').map(Number);month--;}focus=`[data-event-range="${range}"]`;}
    else if(target.dataset.seasonView){view=target.dataset.seasonView;focus=`[data-season-view="${view}"]`;}
    else if(target.dataset.monthStep){const date=new Date(Date.UTC(year,month+Number(target.dataset.monthStep),1));year=date.getUTCFullYear();month=date.getUTCMonth();focus=`[data-month-step="${target.dataset.monthStep}"]`;}
    else if(target.hasAttribute('data-month-today')){selectedDate=centralDateKey();[year,month]=selectedDate.split('-').map(Number);month--;focus='[data-month-today]';}
    else if(target.dataset.selectDate){selectedDate=target.dataset.selectDate;[year,month]=selectedDate.split('-').map(Number);month--;focus=`.calendar-date[data-select-date="${selectedDate}"]`;}
    else if(target.hasAttribute('data-next-event')){const first=eventsByRange(season.events)[0];if(!first)return;range='upcoming';selectedDate=first.date;[year,month]=selectedDate.split('-').map(Number);month--;focus='#calendar-month';}
    else return;
    renderSchedule();root.querySelector(focus)?.focus({preventScroll:true});
  });
  function renderTeamDetails(teamId) {
    const container=document.querySelector('#team-season-content');if(!container)return;
    const team=teamById(teamId),results=completedTeamResults(season,teamId),stats=teamStats(results);
    const fixtures=fixturesForTeam(season,teamId).filter(f=>eventsByRange([f.event]).length);
    const record=stats.played?`${stats.wins}–${stats.losses}`:'—';
    const differential=stats.pointDifferential===null?'—':`${stats.pointDifferential>0?'+':''}${stats.pointDifferential}`;
    container.innerHTML=`<section class="team-season-section" id="team-results"><p class="eyebrow">${esc(team.division.toUpperCase())} DIVISION / 2026–2027</p><h2>Team stats</h2><p class="team-season-note">EPL World League country matches only.</p><dl class="team-stat-grid">${metric('Matches played',stats.played)}${metric('Match record',record)}${metric('Match win rate',stats.winRate===null?'—':`${stats.winRate}%`)}${metric('Games won',stats.played?stats.gamesWon:'—')}${metric('Games lost',stats.played?stats.gamesLost:'—')}${metric('Point differential',differential)}</dl></section><section class="team-season-section"><div class="team-results-heading"><h2>Results</h2><span>${results.length} ${results.length===1?'match':'matches'}</span></div>${error?'<div class="season-empty"><p>Team results could not be loaded. Please reload the page.</p></div>':results.length?`<div class="team-result-list">${results.map(result=>{
      const opponent=teamById(result.opponentId),url=bracketMeshEventUrl(result.event.bracketMeshUrl);
      return `<article class="team-result-row"><span class="team-result-outcome result-${result.won?'w':'l'}">${result.won?'W':'L'}</span><div><a class="team-opponent" href="#team/${opponent.id}">${flag(opponent)}vs ${esc(opponent.name)} ↗</a><p>${dateLabel(result.event.date)} · ${url?`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(result.event.title)} ↗</a>`:esc(result.event.title)}</p></div><strong class="team-result-score">${result.gamesFor}–${result.gamesAgainst}${result.pointBreak?'<small>EPL Point Break</small>':''}</strong></article>`;
    }).join('')}</div>`:'<div class="season-empty"><h3>No league results yet.</h3><p>Team records and results will appear here after EPL World League matches are recorded.</p></div>'}</section><section class="team-season-section"><div class="team-results-heading"><h2>Upcoming matchups</h2><a class="text-link" href="#schedule" data-route="schedule">All events ↗</a></div>${fixtures.length?fixtures.map(fixture=>{const opponent=teamById(fixture.opponentId);return `<div class="team-fixture-row"><time datetime="${fixture.event.date}">${dateLabel(fixture.event.date,{month:'short',day:'numeric'})}<span>${esc(fixture.time)} CT</span></time><a class="team-opponent" href="#team/${opponent.id}">${flag(opponent)}vs ${esc(opponent.name)} ↗</a><span>Courts ${esc(fixture.courts)}</span></div>`;}).join(''):'<p class="team-season-note">No upcoming matchups announced.</p>'}</section>`;
  }
  return {renderSchedule,renderTeamDetails};
}
