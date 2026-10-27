import test from 'node:test';
import assert from 'node:assert/strict';
import {bracketMeshEventUrl,linkedEventPaths,eventsByRange,calendarDays,centralDateKey,fixturesForTeam,completedTeamResults,regularSeasonResults,teamStats,conferenceStandings,championshipSeeds} from '../public/season-model.mjs';
const event={id:'event-1',title:'Event 1',date:'2026-11-21',startAt:'2026-11-21T13:00:00-06:00',endAt:'2026-11-21T18:00:00-06:00',bracketMeshUrl:null};
test('date-only events remain upcoming through the Central event day without invented start times',()=>{
  const dateOnly={id:'e2',date:'2026-12-05',dateOnly:true,startAt:null,endAt:null};
  assert.equal(eventsByRange([dateOnly],'upcoming',Date.parse('2026-12-06T05:59:59Z')).length,1);
  assert.equal(eventsByRange([dateOnly],'past',Date.parse('2026-12-06T06:00:00Z')).length,1);
});
test('standings use regular-season wins and head-to-head before regulation differential',()=>{
  const teams=['spain','korea','italy'].map(id=>({id,name:id,division:'Atlantic'}));
  const championship={...event,id:'finals',phase:'championship'};
  const match=(id,a,b,ga,gb,pa,pb)=>({id,eventId:event.id,teamAId:a,teamBId:b,status:'completed',gamesA:ga,gamesB:gb,pointsA:pa,pointsB:pb});
  const season={events:[event,championship],results:[match('a','spain','korea',4,2,60,59),match('b','korea','italy',6,0,66,1),{...match('c','italy','spain',6,0,66,0),eventId:'finals'}]};
  const rows=conferenceStandings(season,teams,'Atlantic');
  assert.deepEqual(rows.map(r=>r.team.id),['spain','korea','italy']);
  assert.equal(rows[0].standingsPoints,1);assert.equal(rows[0].played,1);
  assert.ok(rows[1].pointDifferential>rows[0].pointDifferential);
});
test('three-way ties compare tied-country wins then regulation differential and retain unresolved ties',()=>{
  const teams=['a','b','c'].map(id=>({id,name:id,division:'Atlantic'}));
  const results=[['a','b',60,50],['b','c',60,55],['c','a',60,59]].map(([a,b,pa,pb],i)=>({id:String(i),eventId:event.id,teamAId:a,teamBId:b,status:'completed',gamesA:4,gamesB:2,pointsA:pa,pointsB:pb}));
  const rows=conferenceStandings({events:[event],results},teams,'Atlantic');
  assert.deepEqual(rows.map(r=>r.team.id),['a','c','b']);
  assert.ok(rows.every(r=>r.headToHeadWins===1));
  const missing=conferenceStandings({events:[event],results:results.map(r=>({...r,pointsA:undefined,pointsB:undefined}))},teams,'Atlantic');
  assert.deepEqual(missing.map(r=>r.rank),[1,1,1]);
});
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
  const match={id:'one',eventId:event.id,teamAId:'brazil',teamBId:'korea',status:'completed',gamesA:3,gamesB:3,pointBreakWinnerId:'brazil',pointsA:60,pointsB:58,pointBreakPointsA:11,pointBreakPointsB:9};
  const season={events:[event],results:[match,match,{...match,id:'pending',status:'active'},{...match,id:'unresolved',pointBreakWinnerId:null},{...match,id:'invalid',gamesB:1}]};
  const results=completedTeamResults(season,'brazil');assert.equal(results.length,1);assert.equal(results[0].won,true);assert.equal(results[0].pointBreak,true);
  assert.deepEqual(teamStats(results),{played:1,wins:1,losses:0,winRate:100,gamesWon:3,gamesLost:3,pointsFor:60,pointsAgainst:58,pointDifferential:2});
  assert.equal(teamStats(completedTeamResults(season,'korea')).pointDifferential,-2);
  assert.equal(teamStats([]).winRate,null);
  assert.equal(teamStats([{...results[0],pointsFor:undefined}]).pointDifferential,null);
});

test('event totals reset while season totals accumulate and championship matches stay separate',()=>{
  const teams=['a','b'].map(id=>({id,name:id,division:'Atlantic'}));
  const second={...event,id:'event-2',date:'2026-12-05'};
  const final={...event,id:'final',phase:'championship'};
  const base={teamAId:'a',teamBId:'b',status:'completed'};
  const season={events:[event,second,final],results:[
    {...base,id:'one',eventId:event.id,gamesA:4,gamesB:2,pointsA:60,pointsB:50},
    {...base,id:'two',eventId:second.id,gamesA:3,gamesB:3,pointBreakWinnerId:'b',pointsA:55,pointsB:60,pointBreakPointsA:9,pointBreakPointsB:11},
    {...base,id:'three',eventId:final.id,gamesA:6,gamesB:0,pointsA:66,pointsB:0}
  ]};
  const row=scope=>conferenceStandings(season,teams,'Atlantic',scope).find(r=>r.team.id==='a');
  assert.deepEqual([row().played,row().wins,row().losses,row().pointsFor,row().pointsAgainst,row().pointDifferential],[2,1,1,115,110,5]);
  assert.deepEqual([row({eventId:second.id}).played,row({eventId:second.id}).wins,row({eventId:second.id}).losses,row({eventId:second.id}).pointsFor,row({eventId:second.id}).pointsAgainst,row({eventId:second.id}).pointDifferential],[1,0,1,55,60,-5]);
  assert.equal(regularSeasonResults(season,'a').length,2);
  assert.equal(row({eventId:final.id}).played,0);
  assert.equal(row({eventId:'unplayed'}).pointsFor,null);
});

test('championship seeds use points scored only after wins, tied-country head-to-head and differential',()=>{
  const teams=['a','b','c'].map(id=>({id,name:id,division:'Atlantic'}));
  const results=[['a','b',60,50],['b','c',70,60],['c','a',80,70]].map(([a,b,pa,pb],i)=>({id:String(i),eventId:event.id,teamAId:a,teamBId:b,status:'completed',gamesA:4,gamesB:2,pointsA:pa,pointsB:pb}));
  const season={events:[event],results};
  const rows=conferenceStandings(season,teams,'Atlantic');
  assert.deepEqual(rows.map(r=>r.rank),[1,1,1]);
  const seeded=championshipSeeds(season,teams,'Atlantic');
  assert.deepEqual(seeded.map(r=>[r.team.id,r.seed,r.pointsFor]),[['c',1,140],['a',2,130],['b',3,120]]);
  assert.ok(seeded.every(r=>r.pointDifferential===0&&r.headToHeadWins===1));
  const incomplete=championshipSeeds({...season,results:results.map((r,i)=>i===0?{...r,pointsA:undefined}:r)},teams,'Atlantic');
  assert.ok(incomplete.every(r=>r.seed===null));
});

test('exact seed ties and a season without results never receive invented seeds',()=>{
  const teams=['a','b','c'].map(id=>({id,name:id,division:'Atlantic'}));
  const results=[['a','b'],['b','c'],['c','a']].map(([a,b],i)=>({id:String(i),eventId:event.id,teamAId:a,teamBId:b,status:'completed',gamesA:4,gamesB:2,pointsA:60,pointsB:50}));
  assert.ok(championshipSeeds({events:[event],results},teams,'Atlantic').every(r=>r.rank===1&&r.seed===null));
  assert.ok(championshipSeeds({events:[event],results:[]},teams,'Atlantic').every(r=>r.rank===null&&r.seed===null));
});
