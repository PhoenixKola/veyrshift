import test from 'node:test';
import assert from 'node:assert/strict';
import { SeededRandom } from '../dist-preview/src/game/core/random.js';
import { inArc, normalize } from '../dist-preview/src/game/core/math.js';
import { FORMS } from '../dist-preview/src/game/data/forms.js';
import { HEROES } from '../dist-preview/src/game/data/heroes.js';
import { initialSave, parseSave } from '../dist-preview/src/game/storage/save.js';
import { CombatSession } from '../dist-preview/src/game/runtime/CombatSession.js';

const action=(pressed=[], held=[], movement={x:0,y:0}, aim={x:1,y:0})=>({pressed:new Set(pressed),held:new Set(held),movement,aim});

test('seeded gameplay random is reproducible across runs',()=>{
 const a=new SeededRandom(117);const b=new SeededRandom(117);
 assert.deepEqual(Array.from({length:20},()=>a.int(0,9999)),Array.from({length:20},()=>b.int(0,9999)));
});
test('vector and facing geometry respects an arc rather than arbitrary auto targeting',()=>{
 assert.deepEqual(normalize({x:0,y:0}),{x:0,y:0});
 assert.equal(inArc({x:0,y:0},0,{x:60,y:0},90,Math.PI/2),true);
 assert.equal(inArc({x:0,y:0},0,{x:-60,y:0},90,Math.PI/2),false);
});
test('planned forms are catalog records, not claimed implemented assets',()=>{
 assert.equal(HEROES.length,6);
 assert.equal(FORMS.length,42);
 assert.equal(FORMS.filter(form=>form.implementation==='prototype').length,1);
 assert.equal(FORMS.filter(form=>form.implementation==='planned').length,41);
 assert.equal(FORMS.some(form=>form.name==='Ember Drive'),true);
 assert.equal(FORMS.some(form=>form.name==='Split-Sun Sovereign'),true);
});
test('invalid save data fails closed and safe schema v1 round-trips',()=>{
 assert.deepEqual(parseSave('{malformed'),initialSave());
 assert.deepEqual(parseSave(JSON.stringify({version:900,shards:55,runs:99})),initialSave());
 const save=initialSave();save.shards=84;save.runs=3;
 assert.deepEqual(parseSave(JSON.stringify(save)),save);
});
test('new run has seeded encounter, manual attack and successful enemy damage',()=>{
 const a=new CombatSession(initialSave());a.newRun(51);
 const b=new CombatSession(initialSave());b.newRun(51);
 assert.deepEqual(a.enemies.map(e=>[e.kind,e.x,e.y]),b.enemies.map(e=>[e.kind,e.x,e.y]));
 assert.equal(a.mode,'playing');assert.equal(a.room,1);
 const enemy=a.enemies[0];enemy.x=a.hero.x+45;enemy.y=a.hero.y;enemy.attackCooldown=10;
 const before=enemy.hp;
 a.update(.016,action(['attack']));
 assert.ok(enemy.hp<before,`expected damage: hp now ${enemy.hp} from ${before}`);
 assert.ok(a.hero.pulse>0);
});
test('dash grants short invulnerability, ends safely inside arena',()=>{
 const s=new CombatSession(initialSave());s.newRun(71);
 s.update(.016,action(['dash'],[],{x:1,y:0}));
 assert.ok(s.hero.dashTime>0);assert.ok(s.hero.invuln>0);
 for(let i=0;i<90;i++)s.update(.016,action());
 assert.ok(s.hero.x<=1110&&s.hero.x>=70);
});
test('form prototype consumes Pulse, is time-limited and expires',()=>{
 const s=new CombatSession(initialSave());s.newRun(111);
 s.hero.pulse=55;
 s.update(.016,action(['transform']));
 assert.equal(s.hero.transformed,true);
 assert.ok(s.hero.pulse<55);
 // Simulate form timeout without enemy interference.
 s.enemies=[];s.hero.formTime=.025;
 s.update(.034,action());
 assert.equal(s.hero.transformed,false);
});
test('room clear displays seeded reward and selecting a reward advances a chamber',()=>{
 const s=new CombatSession(initialSave());s.newRun(444);
 s.enemies=[];
 for(let i=0;i<75;i++)s.update(.02,action());
 assert.equal(s.mode,'reward');assert.equal(s.rewardChoices.length,3);
 const reward=s.rewardChoices[0];s.chooseReward(0);
 assert.equal(s.mode,'playing');assert.equal(s.room,2);
 assert.ok(s.upgrades.includes(reward));
});
test('last chamber clears and banks earned shards',()=>{
 const s=new CombatSession(initialSave());s.newRun(444);
 for(let room=1;room<=3;room++){
  s.enemies=[];
  for(let i=0;i<75;i++)s.update(.02,action());
  if(room<3)s.chooseReward(0);
 }
 assert.equal(s.mode,'victory');assert.equal(s.save.runs,1);assert.ok(s.save.shards>0);
});
