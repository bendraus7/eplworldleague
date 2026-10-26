import test from 'node:test';
import assert from 'node:assert/strict';
import {bracketMeshEventUrl,linkedEventPaths,eventsByRange,calendarDays,centralDateKey,fixturesForTeam,completedTeamResults,teamStats} from '../public/season-model.mjs';
const event={id:'event-1',title:'Event 1',date:'2026-11-21',startAt:'2026-11-21T13:00:00-06:00',endAt:'2026-11-21T18:00:00-06:00',bracketMeshUrl:null};
test('upcoming/past switches at the event end, including on the same Central day',()=>{
  assert.equal(eventsByRange([event],'upcoming',Date.parse('2026-11-21T17:59:59-06:00')).length,1);
  assert.equal(eventsByRange([event],'past',Date.parse('2026-11-21T18:00:01-06:00')).length,1);
  assert.equal(centralDateKey(Date.parse('2026-11-22T02:00:00Z')),'2026-11-21');
});
test('calendar uses real dates across month/year and leap-year boundaries',()=>{
  const november=calendarDays(2026,10);assert.equal(november.length,42);assert.equal(november[0].key,'2026-11-01');assert.equal(november.find(d=>d.key==='2026-11-21').day,21);
  assert.ok(calendarDays(2028,1).some(d=>d.key==='2028-02-29'&&d.inMonth));
  assert.ok(calendarDays(2026,11).some(d=>d.key.startsWith('2027-01')));
});
test('only actual Elite BracketMesh event links are enabled or classified as league paths',()=>{
  assert.equal(bracketMeshEventUrl(null),null);assert.equal(bracketMeshEventUrl('javascript:alert(1)'),null);
  assert.equal(bracketMeshEventUrl('https://other.test/elitepickleball/tournaments/123'),null);
  assert.deepEqual(linkedEventPaths([event]),[]);
  assert.deepEqual(linkedEventPaths([{...event,bracketMeshUrl:'https://bracketmesh.com/elitepickleball/tournaments/123'}]),['/elitepickleball/tournaments/123']);
});
test('team fixtures preserve country opponents and court assignments',()=>{
  const season={events:[event],rounds:[{eventId:event.id,time:'3:30 PM',matches:[['italy','germany','1–2'],['korea','brazil','3–4']]}]};
  const fixtures=fixturesForTeam(season,'brazil');assert.equal(fixtures.length,1);assert.equal(fixtures[0].opponentId,'korea');assert.equal(fixtures[0].courts,'3–4');
});
test('team stats count only completed country matches and resolve EPL Point Breaks',()=>{
  const match={id:'one',eventId:event.id,teamAId:'brazil',teamBId:'korea',status:'completed',gamesA:2,gamesB:2,pointBreakWinnerId:'brazil',pointsA:40,pointsB:38};
  const season={events:[event],results:[match,match,{...match,id:'pending',status:'active'},{...match,id:'unresolved',pointBreakWinnerId:null},{...match,id:'invalid',gamesB:1}]};
  const results=completedTeamResults(season,'brazil');assert.equal(results.length,1);assert.equal(results[0].won,true);assert.equal(results[0].pointBreak,true);
  assert.deepEqual(teamStats(results),{played:1,wins:1,losses:0,winRate:100,gamesWon:2,gamesLost:2,pointDifferential:2});
  assert.equal(teamStats(completedTeamResults(season,'korea')).pointDifferential,-2);
  assert.equal(teamStats([]).winRate,null);
  assert.equal(teamStats([{...results[0],pointsFor:undefined}]).pointDifferential,null);
});
