(() => {
  'use strict';
  const { teams, bracketmeshUrl } = window.EPL_DATA;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const byId = id => teams.find(t => t.id === id);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Country codes stay legible on Windows, where flag emoji support varies.
  const flag = team => `<span class="flag-code" aria-label="${escape(team.name)} country code">${team.code}</span>`;
  let teamFilter = 'All';
  let standingsDivision = 'Atlantic';
  let rosterReturnFocus = null;
  const teamDialog = $('#team-dialog');
  const artDialog = $('#art-dialog');
  const rounds = [
    { time:'1:00 PM', session:'SESSION 1', label:'Match 1', matches:[['vatican-city','usa','1–2'],['colombia','vietnam','3–4'],['venezuela','ireland','5–6'],['fiji','ukraine','7–8'],['cape-verde','greece','9–10'],['argentina','spain','11–12']] },
    { time:'2:15 PM', session:'SESSION 1', label:'Match 2', matches:[['vatican-city','vietnam','1–2'],['colombia','usa','3–4'],['venezuela','ukraine','5–6'],['fiji','greece','7–8'],['cape-verde','spain','9–10'],['argentina','ireland','11–12']] },
    { time:'3:30 PM', session:'SESSION 2', label:'Match 1', matches:[['italy','germany','1–2'],['korea','brazil','3–4']] },
    { time:'4:45 PM', session:'SESSION 2', label:'Match 2', matches:[['italy','korea','1–2'],['germany','brazil','3–4']] }
  ];
  const teamButton = team => `<button data-open-team="${team.id}" aria-label="View Team ${escape(team.name)} roster">${flag(team)}<span>${escape(team.name)}</span></button>`;

  function renderTeams() {
    const query = $('#team-search').value.trim().toLocaleLowerCase();
    const filtered = teams.filter(t => (teamFilter === 'All' || t.division === teamFilter) && `${t.name} ${t.code} ${t.players.map(p => p.name).join(' ')}`.toLocaleLowerCase().includes(query));
    $('#team-grid').innerHTML = filtered.map(t => `<button class="team-card" data-open-team="${t.id}" aria-label="View Team ${escape(t.name)}: ${escape(t.players.map(p => p.name).join(', '))}"><div class="team-card-image"><img loading="lazy" src="${t.art}" alt="Team ${escape(t.name)} country reveal artwork" width="800" height="1050"><span class="division-tag">${t.division.toUpperCase()} DIVISION</span></div><div class="team-card-body"><div class="team-card-title">${flag(t)}<h3>${escape(t.name)}</h3><span aria-hidden="true">↗</span></div><p class="team-card-players">${t.players.map(p => escape(p.name)).join(' · ')}</p><div class="team-card-bottom">VIEW THE ROSTER <span>4 players</span></div></div></button>`).join('');
    $('#team-count').textContent = `${filtered.length} ${filtered.length === 1 ? 'team' : 'teams'} / ${filtered.reduce((n,t) => n+t.players.length,0)} players${query ? ' · matching your search' : ''}`;
    $('#no-teams').hidden = filtered.length !== 0;
  }
  function setSegment(attribute, value) {
    $$(`[${attribute}]`).forEach(button => {
      const active = button.getAttribute(attribute) === value;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  function renderSchedule() {
    const selected = $('#schedule-team').value;
    $('#fixtures').innerHTML = rounds.map(round => {
      const matches = round.matches.filter(([a,b]) => selected === 'All' || a === selected || b === selected);
      if (!matches.length) return '';
      return `<div class="round"><div class="round-heading"><h3>${round.time} <span aria-hidden="true">/</span> ${round.label}</h3><span>${round.session} · NOV 21</span></div>${matches.map(([a,b,court]) => `<div class="fixture">${teamButton(byId(a))}<span class="versus">VS</span>${teamButton(byId(b))}<span class="court">Courts ${court}</span></div>`).join('')}</div>`;
    }).join('');
  }
  function renderStandings() {
    $('#standings-body').innerHTML = teams.filter(t => t.division === standingsDivision).map(t => `<tr><td>${teamButton(t)}</td><td aria-label="Not yet played">—</td><td aria-label="No result">—</td><td aria-label="No result">—</td><td aria-label="No result">—</td></tr>`).join('');
    $('table caption').textContent = `${standingsDivision} division teams. Season not started; match statistics pending.`;
  }
  function openRoster(id, trigger) {
    const team = byId(id);
    if (!team) return;
    if (!teamDialog.open) rosterReturnFocus = trigger || document.activeElement;
    $('#team-dialog-content').innerHTML = `<div class="roster-header">${flag(team)}<div><p class="eyebrow">${team.division.toUpperCase()} DIVISION / 2026–2027</p><h2 id="team-dialog-title">Team ${escape(team.name)}</h2></div><a class="text-link" href="#schedule" data-team-schedule="${team.id}">See team matchups ↗</a></div><div class="roster-grid">${team.players.map(p => `<article class="player-card"><button data-player-art="${p.image}" data-player-name="${escape(p.name)}" aria-label="Enlarge ${escape(p.name)} player artwork"><img src="${p.image}" alt="${escape(p.name)}, Team ${escape(team.name)} player reveal" width="800" height="1050"></button><div><h3>${escape(p.name)}</h3><p>TEAM ${team.name.toUpperCase()} <span aria-hidden="true">/</span> ${team.division}</p></div></article>`).join('')}</div><p class="roster-footer">Roster names transcribed from the supplied player reveal cards. Select a card to view the complete artwork.</p>`;
    if (!teamDialog.open) teamDialog.showModal();
    teamDialog.scrollTop = 0;
  }
  function closeRoster() {
    teamDialog.close();
    if (location.hash.startsWith('#team/')) history.replaceState(null, '', '#teams');
    rosterReturnFocus?.focus({preventScroll:true});
  }
  function openArt(src, alt) {
    $('#art-image').src = src;
    $('#art-image').alt = alt;
    artDialog.showModal();
    artDialog.scrollTop = 0;
  }
  $('#flag-ribbon').innerHTML = teams.map(t => `<a href="#team/${t.id}" data-open-team="${t.id}" aria-label="View Team ${escape(t.name)}">${flag(t)} ${escape(t.name.toUpperCase())}</a>`).join('');
  $('#schedule-team').insertAdjacentHTML('beforeend', teams.map(t => `<option value="${t.id}">${escape(t.name)}</option>`).join(''));
  $$('.bm-link').forEach(link => link.href = bracketmeshUrl);
  $('#year').textContent = new Date().getFullYear();
  $('#team-search').addEventListener('input', renderTeams);
  $('#schedule-team').addEventListener('change', renderSchedule);
  $('#reset-search').addEventListener('click', () => { $('#team-search').value = ''; teamFilter = 'All'; setSegment('data-team-filter','All'); renderTeams(); $('#team-search').focus(); });
  $('.menu-toggle').addEventListener('click', () => {
    const open = $('#main-nav').classList.toggle('open');
    $('.menu-toggle').setAttribute('aria-expanded',String(open));
  });
  $$('#main-nav a').forEach(a => a.addEventListener('click',() => { $('#main-nav').classList.remove('open'); $('.menu-toggle').setAttribute('aria-expanded','false'); }));
  document.addEventListener('click', event => {
    const team = event.target.closest('[data-open-team]');
    if (team) { event.preventDefault(); history.replaceState(null,'',`#team/${team.dataset.openTeam}`); openRoster(team.dataset.openTeam, team); return; }
    const division = event.target.closest('[data-team-filter]');
    if (division) { teamFilter = division.dataset.teamFilter; setSegment('data-team-filter',teamFilter); renderTeams(); return; }
    const standings = event.target.closest('[data-standings]');
    if (standings) { standingsDivision = standings.dataset.standings; setSegment('data-standings',standingsDivision); renderStandings(); return; }
    const tab = event.target.closest('[data-event-tab]');
    if (tab) { const details = tab.dataset.eventTab === 'details'; setSegment('data-event-tab',tab.dataset.eventTab); $('#fixtures').hidden = details; $('#event-details').hidden = !details; $('#schedule-team').parentElement.hidden = details; return; }
    const schedule = event.target.closest('[data-team-schedule]');
    if (schedule) { event.preventDefault(); $('#schedule-team').value = schedule.dataset.teamSchedule; renderSchedule(); setSegment('data-event-tab','matches'); $('#fixtures').hidden = false; $('#event-details').hidden = true; $('#schedule-team').parentElement.hidden = false; closeRoster(); history.replaceState(null,'','#schedule'); $('#schedule').scrollIntoView({behavior:'smooth'}); $('#schedule-team').focus({preventScroll:true}); return; }
    const art = event.target.closest('[data-poster]');
    if (art) { openArt(`assets/league-${art.dataset.poster}.webp`, ['EPL World League season poster','EPL World League inaugural season artwork','EPL World League Atlantic and Pacific divisions','EPL World League Event 1 official schedule'][Number(art.dataset.poster)]); return; }
    const player = event.target.closest('[data-player-art]');
    if (player) { openArt(player.dataset.playerArt, `${player.dataset.playerName}, official player reveal artwork`); }
  });
  teamDialog.querySelector('.close-dialog').addEventListener('click',closeRoster);
  teamDialog.querySelector('.brand').addEventListener('click',event => { event.preventDefault(); closeRoster(); $('#teams').scrollIntoView({behavior:'smooth'}); });
  teamDialog.addEventListener('cancel', event => { event.preventDefault(); closeRoster(); });
  artDialog.querySelector('.close-dialog').addEventListener('click',() => artDialog.close());
  [teamDialog,artDialog].forEach(dialog => dialog.addEventListener('click',event => { if(event.target === dialog) { const bounds=dialog.getBoundingClientRect(); if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom) { if(dialog===teamDialog)closeRoster(); else dialog.close(); } } }));
  function resolveHash() { if(location.hash.startsWith('#team/'))openRoster(decodeURIComponent(location.hash.slice(6))); }
  window.addEventListener('hashchange',resolveHash);
  renderTeams(); renderSchedule(); renderStandings(); resolveHash();
})();
