const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isLeague = match => match.competition === 'world-league';
export function filterMatches(matches, {scope = 'all', event = 'All'} = {}) {
  return matches.filter(match => (scope === 'all' || (scope === 'world-league' ? isLeague(match) : !isLeague(match))) && (event === 'All' || match.event === event));
}
export function matchLogMarkup(matches) {
  return matches.map(match => {
    const league = isLeague(match), result = match.result === 'W' ? 'W' : 'L';
    const date = new Date(match.date).toLocaleString('en-US', {dateStyle:'medium', timeStyle:'short'});
    const badge = league
      ? '<span class="match-competition world-league-badge"><img src="assets/epl-logo.png" alt="" width="24" height="21">World League</span>'
      : '<span class="match-competition regular-event-badge">Elite tournament</span>';
    // URLs come from BracketMesh, but allow only its HTTPS origin in rendered links.
    let eventUrl = 'https://bracketmesh.com/';
    try { const url = new URL(match.eventUrl); if(url.origin === 'https://bracketmesh.com') eventUrl = url.href; } catch {}
    return `<article class="player-match${league ? ' league-match' : ''}"><div><span class="result-${result.toLowerCase()}">${result}</span><strong>${escape(match.forPoints)}–${escape(match.against)}</strong><small>${escape(match.phase)}</small></div><div>${badge}<p><strong>vs ${escape(match.opponents)}</strong></p><p>Partner: ${escape(match.partner)}</p><a href="${escape(eventUrl)}" target="_blank" rel="noopener">${escape(match.event)} ↗</a><small>${escape(date)}</small></div></article>`;
  }).join('');
}
