window.EPL_READY = (async () => {
  'use strict';
  const {createSeasonView}=await import('./season-view.mjs');
  const {conferenceStandings,championshipSeeds,regularSeasonResults,teamStats,REGULATION_GAMES}=await import('./season-model.mjs');
  const {createScheduleNav}=await import('./schedule-nav.mjs');
  const {createStandingsNav}=await import('./standings-nav.mjs');
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
  let standingsEvent = '';
  let currentPage = 'home';
  const artDialog = $('#art-dialog');
  const seasonView=createSeasonView({season,teams,error:seasonError});
  const scheduleNav=createScheduleNav({events:season.events,error:seasonError});
  const standingsNav=createStandingsNav({season,teams,error:seasonError});
  const teamButton = team => `<button data-open-team="${team.id}" aria-label="View Team ${escape(team.name)} roster">${flag(team)}<span>${escape(team.name)}</span></button>`;

  function showPage(page, scroll = true) {
    if (!['home','schedule','standings','teams','players','stats','team','player'].includes(page)) page = 'home';
    currentPage = page;
    document.body.dataset.view = page;
    scheduleNav.close();
    standingsNav.close();
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
    const rows=teams.map(team=>({team,...teamStats(regularSeasonResults(season,team.id))}));
    const results=new Map(teams.flatMap(team=>regularSeasonResults(season,team.id)).map(result=>[result.id,result]));
    const events=new Set([...results.values()].map(result=>result.eventId)).size;
    const teamView=category==='Teams',started=results.size>0;
    const metrics=teamView?[
      ['Country matchups',seasonError?'—':results.size,'Recorded this regular season'],
      ['Regulation games',seasonError?'—':results.size*REGULATION_GAMES,'PointBreak scores excluded'],
      ['Events with results',seasonError?'—':`${events} / ${season.events.filter(event=>event.phase!=='championship').length}`,'Four events build the season record']
    ]:[['Games played','—','Awaiting player results'],['Game win rate','—','Awaiting player results'],['Point differential','—','Awaiting player results']];
    $('#stat-metrics').innerHTML=metrics.map(([label,value,note])=>`<div><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`).join('');
    $('#stats .status-pill').textContent=seasonError?'RESULTS UNAVAILABLE':started?'REGULAR SEASON':'SEASON NOT STARTED';
    $('#season-team-comparison').hidden=!teamView||!started;
    $('#season-team-comparison').innerHTML=teamView&&started?`<div class="section-heading"><div><p class="eyebrow">REGULAR-SEASON PERFORMANCE</p><h2>Compare the countries</h2></div><a class="text-link" href="#standings" data-route="standings">Championship seeding ↗</a></div><div class="season-country-stats">${rows.sort((a,b)=>a.team.name.localeCompare(b.team.name)).map(row=>{
      const games=row.gamesWon+row.gamesLost,rate=games?Math.round(row.gamesWon/games*100):null;
      return `<a class="country-stat-card" href="#team/${row.team.id}"><div class="country-stat-title">${flag(row.team)}<h3>${escape(row.team.name)}</h3><span aria-hidden="true">↗</span></div><p>${escape(row.team.division)} Conference</p><dl><div><dt>Match record</dt><dd>${row.played?`${row.wins}–${row.losses}`:'—'}</dd></div><div><dt>Regulation game win rate</dt><dd>${rate===null?'—':`${rate}%`}</dd></div><div><dt>Point differential</dt><dd>${row.pointDifferential===null?'—':`${row.pointDifferential>0?'+':''}${row.pointDifferential}`}</dd></div></dl><div class="country-stat-bar" aria-hidden="true"><span style="width:${rate??0}%"></span></div><span class="country-stat-link">Team stats &amp; results ↗</span></a>`;
    }).join('')}</div>`:'';
    $('#stats .stats-empty').hidden=teamView&&started;
    $('#stats-empty-title').textContent=seasonError?'Season stats unavailable':teamView?'The season starts November 21.':'Player season stats';
    $('#stats-empty-description').textContent=seasonError?'Please reload the page to load league results.':teamView?'Compare country records, regulation game win rates, and point differential as results are recorded.':'Player performance will appear once individual EPL game results are connected.';
    let journey=$('#stats .season-journey');
    if(!journey){journey=document.createElement('nav');journey.className='season-journey';journey.setAttribute('aria-label','Season events');$('#stats .stats-empty').after(journey);}
    journey.innerHTML=season.events.map((event,i)=>`<a href="#schedule/${escape(event.id)}"><span>${event.phase==='championship'?'CHAMPIONSHIP':`EVENT 0${i+1}`}</span><strong>${new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',timeZone:'UTC'}).format(new Date(event.date+'T12:00:00Z'))}</strong><span aria-hidden="true">↗</span></a>`).join('');
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
    const selected=season.events.find(event=>event.id===standingsEvent);
    const rows=conferenceStandings(season,teams,standingsDivision,{eventId:standingsEvent||null}),started=rows.some(row=>row.played);
    const seeds=new Map(championshipSeeds(season,teams,standingsDivision).map(row=>[row.team.id,row]));
    const number=value=>value===null?'—':value;
    $('#standings-scope').innerHTML=`<option value="">Overall season</option>${season.events.filter(event=>event.phase!=='championship').map(event=>`<option value="${escape(event.id)}">${escape(event.title)} · ${escape(event.date)}</option>`).join('')}`;
    $('#standings-scope').value=standingsEvent;
    $('#standings-heading').textContent=selected?`${selected.title} results`:'Overall season results';
    $('#standings table thead').innerHTML=`<tr><th scope="col">RANK</th><th scope="col">COUNTRY</th><th scope="col">W</th><th scope="col">L</th><th scope="col" title="Standings points">PTS</th><th scope="col" title="Regulation points scored">FOR</th><th scope="col" title="Regulation points allowed">AGAINST</th><th scope="col" title="Regulation points scored minus points allowed">DIFF.</th>${selected?'':'<th scope="col" title="Projected championship seed">SEED</th>'}</tr>`;
    $('#standings-body').innerHTML=rows.map(row=>{
      const tied=row.rank!==null&&rows.filter(other=>other.rank===row.rank).length>1;
      const seed=seeds.get(row.team.id);
      return `<tr><td>${row.rank===null?'—':`${tied?'T':''}${row.rank}`}</td><td>${teamButton(row.team)}</td><td>${row.played?row.wins:'—'}</td><td>${row.played?row.losses:'—'}</td><td>${row.played?row.standingsPoints:'—'}</td><td>${number(row.pointsFor)}</td><td>${number(row.pointsAgainst)}</td><td>${row.pointDifferential===null?'—':`${row.pointDifferential>0?'+':''}${row.pointDifferential}`}</td>${selected?'':`<td>${seed.seed??(seed.rank===null?'—':'TBD')}</td>`}</tr>`;
    }).join('');
    $('#standings table caption').textContent=`${standingsDivision} Conference — ${selected?`${selected.title}, ${selected.date}`:'cumulative regular season'}. For and against count regulation points only.`;
    $('#standings .status-pill').textContent=started?(selected?'EVENT RESULTS':'REGULAR SEASON'):(selected?'NO EVENT RESULTS':'SEASON NOT STARTED');
    $('#standings-note').textContent=seasonError?'Standings unavailable. Please reload the page.':selected?'This event only. Totals start fresh at each event; overall season results carry forward.':'Results across all four regular-season events determine conference seeds for the February 27 World Championship. The championship bracket decides the league winner.';
    $('#standings-seed-note').hidden=Boolean(selected);
    $('#standings-points-note').textContent=`Win = 1 point · Loss = 0 · Up to ${selected?'2 points per event':'8 regular-season points'}. Tiebreakers: wins, head-to-head among tied countries, then regulation point differential. PointBreak points are excluded.`;
  }
  $('#standings-scope').addEventListener('change',event=>{standingsEvent=event.target.value;renderStandings();});
  function openRoster(id) {
    const team = byId(id);
    if (!team) return;
    $('#team-page-content').innerHTML = `<a class="text-link team-back-link" href="#teams" data-route="teams">← All teams</a><div class="roster-header"><span class="team-identity-art" style="background-image:url('${team.art}')" aria-hidden="true"></span>${flag(team)}<div><p class="eyebrow">${team.division.toUpperCase()} CONFERENCE / 2026–2027</p><h1 id="team-page-title" tabindex="-1">Team ${escape(team.name)}</h1></div><button class="text-link team-results-jump" data-team-results>Team stats &amp; results ↓</button></div><div class="roster-grid">${team.players.map(p => `<article class="player-card"><button data-open-player="${p.id}" aria-label="View ${escape(p.name)} profile"><img src="${p.image}" alt="${escape(p.name)}, Team ${escape(team.name)} player reveal" width="800" height="1050"></button><div><h3><a href="#player/${p.id}">${escape(p.name)}</a></h3><p>TEAM ${team.name.toUpperCase()} <span aria-hidden="true">/</span> ${team.division}</p></div></article>`).join('')}</div><p class="roster-footer">Select a player to view their profile, DUPR rating, stats, and match log.</p><div id="team-season-content"></div>`;
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
    if (/^standings\/(atlantic|pacific)$/.test(hash)) { standingsDivision=hash.endsWith('pacific')?'Pacific':'Atlantic';standingsEvent='';setSegment('data-standings',standingsDivision);renderStandings();showPage('standings');return; }
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
