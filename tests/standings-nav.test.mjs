import test from 'node:test';
import assert from 'node:assert/strict';
import {standingsPreviewMarkup} from '../public/standings-nav.mjs';
const teams=[
  {id:'a',name:'Argentina',code:'AR',division:'Atlantic'},
  {id:'b',name:'Brazil',code:'BR',division:'Atlantic'},
  {id:'c',name:'Cape Verde',code:'CV',division:'Pacific'}
];

test('preview uses season records, excluding championship and incomplete results',()=>{
  const match={teamAId:'a',teamBId:'b',status:'completed',gamesA:4,gamesB:2,pointsA:60,pointsB:50};
  const season={events:[{id:'e',phase:'regular',date:'2026-11-21'},{id:'final',phase:'championship',date:'2027-02-27'}],results:[
    {...match,id:'regular',eventId:'e'},
    {...match,id:'final',eventId:'final',gamesA:0,gamesB:6},
    {...match,id:'unfinished',eventId:'e',status:'active'}
  ]};
  const html=standingsPreviewMarkup({season,teams});
  const row=id=>html.match(new RegExp(`<tr data-preview-team="${id}">[\\s\\S]*?<\\/tr>`))[0];
  assert.match(row('a'),/<td>1<\/td><td>0<\/td><td>1<\/td>/);
  assert.match(row('b'),/<td>0<\/td><td>1<\/td><td>0<\/td>/);
  assert.match(row('c'),/<td>—<\/td><td>—<\/td><td>—<\/td>/);
  assert.match(html,/href="#standings\/pacific"/);
});

test('preseason shows pending records and escapes country content; error does not imply results',()=>{
  const season={events:[],results:[]};
  const html=standingsPreviewMarkup({season,teams:[{...teams[0],name:'A <script> & B'}]});
  assert.match(html,/A &lt;script&gt; &amp; B/);
  assert.match(html,/Records pending/);
  assert.doesNotMatch(html,/<td>0<\/td>/);
  const unavailable=standingsPreviewMarkup({season,teams,error:true});
  assert.match(unavailable,/temporarily unavailable/);
  assert.doesNotMatch(unavailable,/<table>/);
});
