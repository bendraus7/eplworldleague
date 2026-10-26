(() => {
  'use strict';
  const { teams } = window.EPL_DATA;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const byId = id => teams.find(t => t.id === id);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const flag = team => `<img class="country-flag" src="assets/flags/${team.code.toLowerCase()}.svg" alt="${escape(team.name)} flag" width="32" height="24">`;
  let teamFilter = 'All';
  let standingsDivision = 'Atlantic';
  let rosterReturnFocus = null;
  let currentPage = 'home';
  let rosterPage = 'teams';
  const teamDialog = $('#team-dialog');
  const artDialog = $('#art-dialog');
  const rounds = [
    { time:'1:00 PM', session:'SESSION 1', label:'Match 1', matches:[['vatican-city','usa','1–2'],['colombia','vietnam','3–4'],['venezuela','ireland','5–6'],['fiji','ukraine','7–8'],['cape-verde','greece','9–10'],['argentina','spain','11–12']] },
    { time:'2:15 PM', session:'SESSION 1', label:'Match 2', matches:[['vatican-city','vietnam','1–2'],['colombia','usa','3–4'],['venezuela','ukraine','5–6'],['fiji','greece','7–8'],['cape-verde','spain','9–10'],['argentina','ireland','11–12']] },
    { time:'3:30 PM', session:'SESSION 2', label:'Match 1', matches:[['italy','germany','1–2'],['korea','brazil','3–4']] },
    { time:'4:45 PM', session:'SESSION 2', label:'Match 2', matches:[['italy','korea','1–2'],['germany','brazil','3–4']] }
  ];
  const teamButton = team => `<button data-open-team="${team.id}" aria-label="View Team ${escape(team.name)} roster">${flag(team)}<span>${escape(team.name)}</span></button>`;

  function showPage(page, scroll = true) {
    if (!['home','schedule','standings','teams','players','stats'].includes(page)) page = 'home';
    currentPage = page;
    $$('[data-page]').forEach(panel => { panel.hidden = panel.dataset.page !== page; });
    $$('#main-nav [data-route]').forEach(link => { if (link.dataset.route === page) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
    document.title = page === 'home' ? 'EPL World League | Elite Pickleball' : `${page[0].toUpperCase()+page.slice(1)} | EPL World League`;
    if (scroll) window.scrollTo({top:0,behavior:'instant'});
    updateRotation();
  }

  function renderPlayers() {
    const query = $('#player-search').value.trim().toLocaleLowerCase();
    const country = $('#player-country').value;
    const division = $('#player-division').value;
    const players = teams.filter(t => (country === 'All' || country === t.id) && (division === 'All' || division === t.division)).flatMap(t => t.players.map(p => ({...p,team:t}))).filter(p => `${p.name} ${p.team.name}`.toLocaleLowerCase().includes(query)).sort((a,b) => a.name.localeCompare(b.name));
    $('#player-directory').innerHTML = players.map(p => `<article class="directory-card"><button class="directory-art" data-player-art="${p.image}" data-player-name="${escape(p.name)}" aria-label="View ${escape(p.name)} player card"><img loading="lazy" src="${p.image}" alt="${escape(p.name)}, Team ${escape(p.team.name)} player reveal" width="800" height="1050"></button><div class="directory-info"><h2>${escape(p.name)}</h2><button class="player-country-link" data-open-team="${p.team.id}">${flag(p.team)}<span>${escape(p.team.name)}</span><span aria-hidden="true">↗</span></button><p>${p.team.division} Division</p></div></article>`).join('');
    $('#player-count').textContent = `${players.length} ${players.length === 1 ? 'player' : 'players'}`;
    $('#no-players').hidden = players.length !== 0;
  }

  function renderStats(category = 'Teams') {
    setSegment('data-stats',category);
    const metrics = category === 'Teams' ? ['Matches played','Match win rate','Point differential'] : ['Games played','Game win rate','Point differential'];
    $('#stat-metrics').innerHTML = metrics.map(label => `<div><span>${label}</span><strong aria-label="Not yet available">—</strong><small>Awaiting results</small></div>`).join('');
    $('#stats-empty-title').textContent = `${category === 'Teams' ? 'Team' : 'Player'} stats`;
    $('#stats-empty-description').textContent = `${category === 'Teams' ? 'Team' : 'Player'} statistics will be available after match results are recorded.`;
  }

  const heroPlayers = [0,1,2,3].flatMap(slot => teams.map(team => ({...team.players[slot],team:team.name})));
  let heroIndex = 0;
  let heroTimer;
  let rotationPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  async function rotatePlayers(direction = 1) {
    heroIndex = (heroIndex + direction*2 + heroPlayers.length) % heroPlayers.length;
    const selected = [heroPlayers[heroIndex],heroPlayers[(heroIndex+1)%heroPlayers.length]];
    await Promise.all(selected.map(p => new Promise(resolve => { const preload = new Image(); preload.onload = preload.onerror = resolve; preload.src = p.image; })));
    $$('.hero-player').forEach((img,i) => {
      img.src = selected[i].image;
      img.alt = `${selected[i].name}, Team ${selected[i].team} player reveal`;
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) img.animate([{opacity:.2},{opacity:1}],{duration:500,easing:'ease-out'});
    });
  }
  function updateRotation() {
    clearInterval(heroTimer);
    $('#hero-pause').textContent = rotationPaused ? 'Play' : 'Pause';
    $('#hero-pause').setAttribute('aria-label',rotationPaused ? 'Play player rotation' : 'Pause player rotation');
    if (!rotationPaused && currentPage === 'home' && !document.hidden) heroTimer = setInterval(() => rotatePlayers(),6500);
  }

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
    if (location.hash.startsWith('#team/')) history.replaceState(null, '', `#${rosterPage}`);
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
  $('#player-country').insertAdjacentHTML('beforeend',teams.map(t => `<option value="${t.id}">${escape(t.name)}</option>`).join(''));
  $('#year').textContent = new Date().getFullYear();
  $('#team-search').addEventListener('input', renderTeams);
  $('#schedule-team').addEventListener('change', renderSchedule);
  $('#player-search').addEventListener('input',renderPlayers);
  $('#player-country').addEventListener('change',renderPlayers);
  $('#player-division').addEventListener('change',renderPlayers);
  $('#reset-players').addEventListener('click',() => { $('#player-search').value=''; $('#player-country').value='All'; $('#player-division').value='All'; renderPlayers(); $('#player-search').focus(); });
  $('#hero-pause').addEventListener('click',() => { rotationPaused = !rotationPaused; updateRotation(); });
  $('#hero-next').addEventListener('click',() => { rotatePlayers(); updateRotation(); });
  $('#hero-previous').addEventListener('click',() => { rotatePlayers(-1); updateRotation(); });
  document.addEventListener('visibilitychange',updateRotation);
  $('#reset-search').addEventListener('click', () => { $('#team-search').value = ''; teamFilter = 'All'; setSegment('data-team-filter','All'); renderTeams(); $('#team-search').focus(); });
  document.addEventListener('click', event => {
    const team = event.target.closest('[data-open-team]');
    if (team) { event.preventDefault(); rosterPage=currentPage; history.replaceState(null,'',`#team/${team.dataset.openTeam}`); openRoster(team.dataset.openTeam, team); return; }
    const route = event.target.closest('[data-route]');
    if (route) { event.preventDefault(); if (teamDialog.open) closeRoster(); history.pushState(null,'',`#${route.dataset.route}`); showPage(route.dataset.route); return; }
    const stats = event.target.closest('[data-stats]');
    if (stats) { renderStats(stats.dataset.stats); return; }
    const division = event.target.closest('[data-team-filter]');
    if (division) { teamFilter = division.dataset.teamFilter; setSegment('data-team-filter',teamFilter); renderTeams(); return; }
    const standings = event.target.closest('[data-standings]');
    if (standings) { standingsDivision = standings.dataset.standings; setSegment('data-standings',standingsDivision); renderStandings(); return; }
    const tab = event.target.closest('[data-event-tab]');
    if (tab) { const details = tab.dataset.eventTab === 'details'; setSegment('data-event-tab',tab.dataset.eventTab); $('#fixtures').hidden = details; $('#event-details').hidden = !details; $('#schedule-team').parentElement.hidden = details; return; }
    const schedule = event.target.closest('[data-team-schedule]');
    if (schedule) { event.preventDefault(); $('#schedule-team').value = schedule.dataset.teamSchedule; renderSchedule(); setSegment('data-event-tab','matches'); $('#fixtures').hidden = false; $('#event-details').hidden = true; $('#schedule-team').parentElement.hidden = false; closeRoster(); history.pushState(null,'','#schedule'); showPage('schedule'); $('#schedule-team').focus({preventScroll:true}); return; }
    const art = event.target.closest('[data-poster]');
    if (art) { openArt(`assets/league-${art.dataset.poster}.webp`, ['EPL World League season poster','EPL World League inaugural season artwork','EPL World League Atlantic and Pacific divisions','EPL World League Event 1 official schedule'][Number(art.dataset.poster)]); return; }
    const player = event.target.closest('[data-player-art]');
    if (player) { openArt(player.dataset.playerArt, `${player.dataset.playerName}, official player reveal artwork`); }
  });
  teamDialog.querySelector('.close-dialog').addEventListener('click',closeRoster);
  teamDialog.querySelector('.brand').addEventListener('click',event => { event.preventDefault(); closeRoster(); history.pushState(null,'','#teams'); showPage('teams'); });
  teamDialog.addEventListener('cancel', event => { event.preventDefault(); closeRoster(); });
  artDialog.querySelector('.close-dialog').addEventListener('click',() => artDialog.close());
  [teamDialog,artDialog].forEach(dialog => dialog.addEventListener('click',event => { if(event.target === dialog) { const bounds=dialog.getBoundingClientRect(); if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom) { if(dialog===teamDialog)closeRoster(); else dialog.close(); } } }));
  function resolveHash() {
    const hash=location.hash.slice(1);
    if (hash.startsWith('team/')) { rosterPage='teams'; showPage('teams'); openRoster(decodeURIComponent(hash.slice(5))); return; }
    if (teamDialog.open) teamDialog.close();
    if (hash === 'format') { showPage('home',false); $('#format').scrollIntoView({behavior:'instant'}); return; }
    showPage(hash || 'home');
  }
  window.addEventListener('hashchange',resolveHash);
  window.addEventListener('popstate',resolveHash);
  renderTeams(); renderSchedule(); renderStandings(); renderPlayers(); renderStats(); resolveHash();
})();
