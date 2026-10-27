window.EPL_READY = (async () => {
  'use strict';
  const {createSeasonView}=await import('./season-view.mjs');
  const {conferenceStandings}=await import('./season-model.mjs');
  const {createScheduleNav}=await import('./schedule-nav.mjs');
  let seasonError=false;
  let season;
  try{const response=await fetch('league-data.json');if(!response.ok)throw new Error('Schedule unavailable');season=await response.json();}catch{seasonError=true;season={events:[],rounds:[],results:[]};}
  window.EPL_SEASON=season;
  const { teams } = window.EPL_DATA;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const byId = id => teams.find(t => t.id === id);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const flag = team => `<img class="country-flag" src="assets/flags/${team.code.toLowerCase()}.svg" alt="${escape(team.name)} flag" width="32" height="24">`;
  let teamFilter = 'All';
  let standingsDivision = 'Atlantic';
  let currentPage = 'home';
  const artDialog = $('#art-dialog');
  const seasonView=createSeasonView({season,teams,error:seasonError});
  const scheduleNav=createScheduleNav({events:season.events,error:seasonError});
  const teamButton = team => `<button data-open-team="${team.id}" aria-label="View Team ${escape(team.name)} roster">${flag(team)}<span>${escape(team.name)}</span></button>`;

  function showPage(page, scroll = true) {
    if (!['home','schedule','standings','teams','players','stats','team','player'].includes(page)) page = 'home';
    currentPage = page;
    scheduleNav.close();
    $$('[data-page]').forEach(panel => { panel.hidden = panel.dataset.page !== page; });
    $$('#main-nav [data-route]').forEach(link => { if (link.dataset.route === (page === 'team' ? 'teams' : page === 'player' ? 'players' : page)) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
    document.title = page === 'home' ? 'EPL World League | Elite Pickleball' : `${page[0].toUpperCase()+page.slice(1)} | EPL World League`;
    if (scroll) window.scrollTo({top:0,behavior:'instant'});
    updateRotation();
  }

  function renderPlayers() {
    const query = $('#player-search').value.trim().toLocaleLowerCase();
    const country = $('#player-country').value;
    const division = $('#player-division').value;
    const players = teams.filter(t => (country === 'All' || country === t.id) && (division === 'All' || division === t.division)).flatMap(t => t.players.map(p => ({...p,team:t}))).filter(p => `${p.name} ${p.team.name}`.toLocaleLowerCase().includes(query)).sort((a,b) => a.name.localeCompare(b.name));
    $('#player-directory').innerHTML = players.map(p => `<article class="directory-card"><button class="directory-art" data-open-player="${p.id}" aria-label="View ${escape(p.name)} profile"><img loading="lazy" src="${p.image}" alt="${escape(p.name)}, Team ${escape(p.team.name)} player reveal" width="800" height="1050"></button><div class="directory-info"><h2><a href="#player/${p.id}">${escape(p.name)}</a></h2>${window.EPLRating ? window.EPLRating(p.id) : '<p class="rating-loading">Loading DUPR…</p>'}<button class="player-country-link" data-open-team="${p.team.id}">${flag(p.team)}<span>${escape(p.team.name)}</span><span aria-hidden="true">↗</span></button><p>${p.team.division} Conference</p></div></article>`).join('');
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
    $('#team-grid').innerHTML = filtered.map(t => `<button class="team-card" data-open-team="${t.id}" aria-label="View Team ${escape(t.name)}: ${escape(t.players.map(p => p.name).join(', '))}"><div class="team-card-image"><img loading="lazy" src="${t.art}" alt="Team ${escape(t.name)} country reveal artwork" width="800" height="1050"><span class="division-tag">${t.division.toUpperCase()} CONFERENCE</span></div><div class="team-card-body"><div class="team-card-title">${flag(t)}<h3>${escape(t.name)}</h3><span aria-hidden="true">↗</span></div><p class="team-card-players">${t.players.map(p => escape(p.name)).join(' · ')}</p><div class="team-card-bottom">VIEW THE ROSTER <span>4 players</span></div></div></button>`).join('');
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
  function renderSchedule() {seasonView.renderSchedule();}
  function renderStandings() {
    const rows=conferenceStandings(season,teams,standingsDivision),started=rows.some(row=>row.played);
    $('#standings-body').innerHTML=rows.map(row=>`<tr><td>${teamButton(row.team)}</td><td>${row.played||'—'}</td><td>${row.played?row.wins:'—'}</td><td>${row.played?row.losses:'—'}</td><td>${row.played?row.standingsPoints:'—'}</td><td>${row.pointDifferential===null?'—':`${row.pointDifferential>0?'+':''}${row.pointDifferential}`}</td></tr>`).join('');
    $('#standings table caption').textContent=`${standingsDivision} Conference regular-season standings.`;
    $('#standings .status-pill').textContent=started?'REGULAR SEASON':'SEASON NOT STARTED';
    $('#standings-note').textContent=started?'Ordered by matchup wins, head-to-head, then regulation point differential. Championship results are separate.':'Teams shown alphabetically. No league results recorded yet.';
  }
  function openRoster(id) {
    const team = byId(id);
    if (!team) return;
    $('#team-page-content').innerHTML = `<a class="text-link team-back-link" href="#teams" data-route="teams">← All teams</a><div class="roster-header">${flag(team)}<div><p class="eyebrow">${team.division.toUpperCase()} CONFERENCE / 2026–2027</p><h1 id="team-page-title" tabindex="-1">Team ${escape(team.name)}</h1></div><button class="text-link team-results-jump" data-team-results>Team stats &amp; results ↓</button></div><div class="roster-grid">${team.players.map(p => `<article class="player-card"><button data-open-player="${p.id}" aria-label="View ${escape(p.name)} profile"><img src="${p.image}" alt="${escape(p.name)}, Team ${escape(team.name)} player reveal" width="800" height="1050"></button><div><h3><a href="#player/${p.id}">${escape(p.name)}</a></h3><p>TEAM ${team.name.toUpperCase()} <span aria-hidden="true">/</span> ${team.division}</p></div></article>`).join('')}</div><p class="roster-footer">Select a player to view their profile, DUPR rating, stats, and match log.</p><div id="team-season-content"></div>`;
    seasonView.renderTeamDetails(id);
    showPage('team');
    document.title = `Team ${team.name} | EPL World League`;
    $('#team-page-title').focus({preventScroll:true});
  }
  function openArt(src, alt) {
    $('#art-image').src = src;
    $('#art-image').alt = alt;
    artDialog.showModal();
    artDialog.scrollTop = 0;
  }
  $('#flag-ribbon').innerHTML = teams.map(t => `<a href="#team/${t.id}" data-open-team="${t.id}" aria-label="View Team ${escape(t.name)}">${flag(t)}<span>${escape(t.name.toUpperCase())}</span></a>`).join('');
  $('#player-country').insertAdjacentHTML('beforeend',teams.map(t => `<option value="${t.id}">${escape(t.name)}</option>`).join(''));
  $('#year').textContent = new Date().getFullYear();
  $('#team-search').addEventListener('input', renderTeams);
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
    const profile = event.target.closest('[data-open-player]');
    if(profile) { location.hash=`player/${profile.dataset.openPlayer}`; return; }
    const team = event.target.closest('[data-open-team]');
    if (team) { event.preventDefault(); history.pushState(null,'',`#team/${team.dataset.openTeam}`); openRoster(team.dataset.openTeam); return; }
    const route = event.target.closest('[data-route]');
    if (route) { event.preventDefault(); history.pushState(null,'',`#${route.dataset.route}`); showPage(route.dataset.route); return; }
    const stats = event.target.closest('[data-stats]');
    if (stats) { renderStats(stats.dataset.stats); return; }
    const division = event.target.closest('[data-team-filter]');
    if (division) { teamFilter = division.dataset.teamFilter; setSegment('data-team-filter',teamFilter); renderTeams(); return; }
    const standings = event.target.closest('[data-standings]');
    if (standings) { standingsDivision = standings.dataset.standings; setSegment('data-standings',standingsDivision); renderStandings(); return; }
    const teamResults=event.target.closest('[data-team-results]');
    if(teamResults){$('#team-results')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});return;}
    const art = event.target.closest('[data-poster]');
    if (art) { openArt(`assets/league-${art.dataset.poster}.webp`, ['EPL World League season poster','EPL World League inaugural season artwork','EPL World League Atlantic and Pacific divisions','EPL World League Event 1 official schedule'][Number(art.dataset.poster)]); return; }
    const player = event.target.closest('[data-player-art]');
    if (player) { openArt(player.dataset.playerArt, `${player.dataset.playerName}, official player reveal artwork`); }
  });
  artDialog.querySelector('.close-dialog').addEventListener('click',() => artDialog.close());
  artDialog.addEventListener('click',event => { if(event.target === artDialog) { const bounds=artDialog.getBoundingClientRect(); if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom) artDialog.close(); } });
  function resolveHash() {
    const hash=location.hash.slice(1);
    if (hash.startsWith('schedule/')) { showPage('schedule'); seasonView.openEvent(hash.slice(9)); return; }
    if (hash.startsWith('player/')) { showPage('player'); window.EPLopenProfile?.(hash.slice(7)); return; }
    if (hash.startsWith('team/')) { openRoster(decodeURIComponent(hash.slice(5))); return; }
    if (hash === 'format' || hash === 'point-break') { showPage('home',false); $(`#${hash}`).scrollIntoView({behavior:'instant'}); return; }
    showPage(hash || 'home');
  }
  window.addEventListener('hashchange',resolveHash);
  window.addEventListener('popstate',resolveHash);
  window.EPLrefreshPlayers=renderPlayers;
  renderTeams(); renderSchedule(); renderStandings(); renderPlayers(); renderStats(); resolveHash();
})();
