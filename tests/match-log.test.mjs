import test from 'node:test';
import assert from 'node:assert/strict';
import {filterMatches,matchLogMarkup} from '../public/match-log.mjs';
const regular={event:'Elite tournament',competition:'elite',eventUrl:'https://bracketmesh.com/elitepickleball/tournaments/7',date:'2026-10-25T12:00:00Z',phase:'Pool',partner:'Partner',opponents:'Opponents',forPoints:11,against:7,result:'W'};
const league={...regular,event:'League fixture',competition:'world-league'};
test('competition and event filters intersect without relabeling old records',()=>{
  const legacy={...regular,competition:undefined};
  assert.deepEqual(filterMatches([regular,league,legacy],{scope:'world-league'}),[league]);
  assert.deepEqual(filterMatches([regular,league,legacy],{scope:'elite'}),[regular,legacy]);
  assert.deepEqual(filterMatches([regular,league],{scope:'world-league',event:'Elite tournament'}),[]);
  assert.deepEqual(filterMatches([regular,league],{event:'League fixture'}),[league]);
});
test('only league matches receive green-card markup and the EPL badge',()=>{
  const leagueHtml=matchLogMarkup([league]),regularHtml=matchLogMarkup([regular]);
  assert.match(leagueHtml,/player-match league-match/);assert.match(leagueHtml,/world-league-badge/);assert.match(leagueHtml,/epl-logo.png/);
  assert.doesNotMatch(regularHtml,/player-match league-match/);assert.match(regularHtml,/Elite tournament/);
});
test('match markup escapes player/event names and rejects non-BracketMesh links',()=>{
  const html=matchLogMarkup([{...league,event:'<script>alert(1)</script>',partner:'<img onerror=bad>',eventUrl:'javascript:alert(1)'}]);
  assert.doesNotMatch(html,/<script>|<img onerror|javascript:/);assert.match(html,/&lt;script&gt;/);assert.match(html,/href="https:\/\/bracketmesh.com\/"/);
});
