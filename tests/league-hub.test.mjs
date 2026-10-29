import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {leagueEntries,searchLeague,sortPlayers,teamDuprSummary,seasonStripMarkup,fixtureBoardMarkup} from '../public/league-hub.mjs';
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../public/data.js',import.meta.url),'utf8'),context);
const teams=JSON.parse(JSON.stringify(context.window.EPL_DATA.teams));
const season=JSON.parse(fs.readFileSync(new URL('../public/league-data.json',import.meta.url),'utf8'));

test('team DUPR totals all rostered doubles ratings and never treats a missing rating as zero',()=>{
  const players=[{id:'a'},{id:'b'},{id:'c'},{id:'d'}];
  const ratings={a:4.593,b:4.2,c:3.8,d:4.001};
  assert.deepEqual(teamDuprSummary(players,id=>ratings[id]),{rated:4,players:4,total:16.594,average:4.149});
  for(const missing of [null,undefined,NaN,Infinity,0,'4.001']){
    assert.deepEqual(teamDuprSummary(players,id=>id==='d'?missing:ratings[id]),{rated:3,players:4,total:null,average:null});
  }
  assert.deepEqual(teamDuprSummary([]),{rated:0,players:0,total:null,average:null});
});

test('league search reaches every real player and country and ranks exact country first',()=>{
  const entries=leagueEntries(teams);
  assert.equal(entries.length,80);
  for(const entry of entries)assert(searchLeague(entries,entry.name).some(match=>match.href===entry.href));
  assert.equal(searchLeague(entries,'Spain')[0].href,'#team/spain');
  assert.equal(searchLeague(entries,'  ADI   SPAIN  ')[0].id,'adi-vijayan');
  assert.deepEqual(searchLeague(entries,'a player who is not here'),[]);
  assert.deepEqual(searchLeague(entries,''),[]);
});
test('rating sorting puts unknown values last, breaks ties by name and preserves the input',()=>{
  const players=[{id:'a',name:'Zoe',team:{name:'Fiji'}},{id:'b',name:'Adam',team:{name:'USA'}},{id:'c',name:'Adi',team:{name:'Spain'}},{id:'d',name:'Bella',team:{name:'Colombia'}}];
  const ratings={a:null,b:4.8,c:4.8,d:NaN};
  assert.deepEqual(sortPlayers(players,'rating',id=>ratings[id]).map(p=>p.id),['b','c','d','a']);
  assert.deepEqual(players.map(p=>p.id),['a','b','c','d']);
  assert.deepEqual(sortPlayers(players,'country').map(p=>p.id),['d','a','c','b']);
});
test('season strip has all five source dates, no invented event destination and one next event',()=>{
  const html=seasonStripMarkup(season.events,{now:Date.parse('2026-10-28T12:00:00Z')});
  assert.equal((html.match(/<a class="season-stop/g)||[]).length,5);
  assert.equal((html.match(/is-next/g)||[]).length,1);
  for(const event of season.events)assert(html.includes(`datetime="${event.date}"`));
  assert(!html.includes('href="https://bracketmesh.com'));
  assert.match(html,/WORLD CHAMPIONSHIP/);
  const linked=seasonStripMarkup([{...season.events[0],bracketMeshUrl:'https://bracketmesh.com/elitepickleball/tournaments/1006'}]);
  assert.match(linked,/href="https:\/\/bracketmesh.com\/elitepickleball\/tournaments\/1006"/);
});
test('matchup cards retain every supplied court, time and country; other events stay unassigned',()=>{
  const html=fixtureBoardMarkup(season,teams,'epl-event-1');
  assert.equal((html.match(/class="match-card"/g)||[]).length,16);
  for(const round of season.rounds){
    assert(html.includes(round.time));
    for(const [a,b,courts] of round.matches){assert(html.includes(`#team/${a}`));assert(html.includes(`#team/${b}`));assert(html.includes(`COURTS ${courts}`));}
  }
  assert.equal(fixtureBoardMarkup(season,teams,'epl-event-2'),'');
});
