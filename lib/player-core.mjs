export function editor(request, env) {
  const id = request.headers.get('oai-authenticated-user-id');
  const email = request.headers.get('oai-authenticated-user-email')?.toLowerCase();
  const allowed = String(env.EPL_EDITOR_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  return id && email && allowed.includes(email) ? id : null;
}
export function writeAllowed(request) {
  return request.headers.get('origin') === new URL(request.url).origin && request.headers.get('content-type')?.split(';')[0] === 'application/json';
}
export function validateBio(data) {
  if (typeof data.bio !== 'string' || data.bio.length > 2000 || !Number.isInteger(data.version) || data.version < 0) return null;
  return { bio: data.bio.trim(), version: data.version };
}
export function exactIdentity(identity, directory) {
  if (!identity) return null;
  const hits = directory.filter(p => p.duprCode === identity.duprCode && String(p.profileId) === String(identity.profileId));
  return hits.length === 1 ? hits[0] : null;
}
export function historyFor(code, events) {
  if (!code) return [];
  const results = [];
  for (const { event, snapshot } of events) {
    const state = snapshot?.state;
    if (!state?.teams) continue;
    const teams = new Map(state.teams.map(t => [String(t.id), t]));
    const matches = [
      ...(state.matches || []).filter(m => m.status === 'completed').map(m => ({...m, phase:'Pool', scoreA:m.sa, scoreB:m.sb, teamA:m.a, teamB:m.b})),
      ...Object.entries(state.bracketScores || {}).flatMap(([id,m]) => m.bestOfThree
        ? (m.games || []).map((game,i)=>({...m,id:`${id}-G${i+1}`,phase:`Bracket · Game ${i+1}`,scoreA:game.a,scoreB:game.b,teamA:m.teamAId,teamB:m.teamBId}))
        : [{...m,id,phase:'Bracket',scoreA:m.a,scoreB:m.b,teamA:m.teamAId,teamB:m.teamBId}]),
    ];
    const seen = new Set();
    for (const m of matches) {
      if ((!m.acceptedAt && !m.completedAt) || seen.has(m.id) || m.teamA === m.teamB || !Number.isFinite(m.scoreA) || !Number.isFinite(m.scoreB) || m.scoreA === m.scoreB || m.scoreA < 0 || m.scoreB < 0) continue;
      const a=teams.get(String(m.teamA)), b=teams.get(String(m.teamB));
      if (!a || !b) continue;
      const inA=[a.p1DuprId,a.p2DuprId].includes(code), inB=[b.p1DuprId,b.p2DuprId].includes(code);
      if (inA === inB) continue;
      seen.add(m.id);
      const own=inA?a:b, other=inA?b:a, forPoints=inA?m.scoreA:m.scoreB, against=inA?m.scoreB:m.scoreA;
      results.push({id:`${event.publicId}-${m.id}`,event:event.name,eventUrl:`https://bracketmesh.com${event.publicUrl}`,date:m.completedAt||m.acceptedAt,phase:m.phase,partner:own.p1DuprId===code?own.p2:own.p1,opponents:[other.p1,other.p2].join(' / '),forPoints,against,result:forPoints>against?'W':'L'});
    }
  }
  return results.sort((a,b)=>b.date.localeCompare(a.date));
}
