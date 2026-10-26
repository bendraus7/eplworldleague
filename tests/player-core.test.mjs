import test from 'node:test';
import assert from 'node:assert/strict';
import {editor,writeAllowed,validateBio,exactIdentity,historyFor} from '../lib/player-core.mjs';
test('only trusted identified allowlisted organizers can edit',()=>{
  const env={EPL_EDITOR_EMAILS:'owner@example.test'};
  assert.equal(editor(new Request('https://epl.test'),env),null);
  assert.equal(editor(new Request('https://epl.test',{headers:{'oai-authenticated-user-id':'a','oai-authenticated-user-email':'viewer@example.test'}}),env),null);
  assert.equal(editor(new Request('https://epl.test',{headers:{'oai-authenticated-user-id':'a','oai-authenticated-user-email':'OWNER@example.test'}}),env),'a');
  assert.equal(editor(new Request('https://epl.test',{headers:{'oai-authenticated-user-id':'a','oai-authenticated-user-email':'owner@example.test'}}),{}),null);
});
test('writes require same origin and JSON; bios have bounded text and versions',()=>{
  assert.equal(writeAllowed(new Request('https://epl.test/api',{headers:{origin:'https://evil.test','content-type':'application/json'}})),false);
  assert.equal(writeAllowed(new Request('https://epl.test/api',{headers:{origin:'https://epl.test','content-type':'text/plain'}})),false);
  assert.equal(writeAllowed(new Request('https://epl.test/api',{headers:{origin:'https://epl.test','content-type':'application/json; charset=UTF-8'}})),true);
  assert.equal(validateBio({bio:'x'.repeat(2001),version:0}),null);
  assert.equal(validateBio({bio:'valid',version:-1}),null);
  assert.deepEqual(validateBio({bio:' text <tag> ',version:2}),{bio:'text <tag>',version:2});
});
test('DUPR code and numeric profile identity must both agree unambiguously',()=>{
  const identity={duprCode:'ABC123',profileId:'123'}, player={...identity,name:'Adam Long'};
  assert.equal(exactIdentity(identity,[{...player,profileId:'456'}]),null);
  assert.equal(exactIdentity(identity,[{...player,duprCode:'OTHER1'}]),null);
  assert.equal(exactIdentity(identity,[player,player]),null);
  assert.equal(exactIdentity(identity,[player]),player);
});
test('history counts completed games and expands series without counting aggregate scores',()=>{
  const teams=[{id:1,p1:'A',p2:'Partner',p1DuprId:'ABC123',p2DuprId:'DEF456'},{id:2,p1:'B',p2:'C',p1DuprId:'GHI789',p2DuprId:'JKL012'}];
  const completed={id:'M1',a:1,b:2,sa:11,sb:7,status:'completed',completedAt:'2026-10-25T12:00:00Z'};
  const events=[{event:{publicId:7,name:'Elite event',publicUrl:'/elitepickleball/tournaments/7'},snapshot:{state:{teams,matches:[completed,completed,{...completed,id:'pending',status:'active'},{...completed,id:'tie',sa:0,sb:0},{...completed,id:'bye',b:1}],bracketScores:{F:{teamAId:1,teamBId:2,a:2,b:1,bestOfThree:true,games:[{a:11,b:9},{a:8,b:11},{a:11,b:3}],completedAt:'2026-10-25T13:00:00Z'}}}}}];
  const history=historyFor('ABC123',events);
  assert.equal(history.length,4);assert.equal(history.filter(m=>m.result==='W').length,3);
  assert.equal(history[0].phase,'Bracket · Game 1');
  assert.equal(history[0].partner,'Partner');assert.equal(history[0].opponents,'B / C');
  assert.equal(historyFor('MISSING',events).length,0);
});
