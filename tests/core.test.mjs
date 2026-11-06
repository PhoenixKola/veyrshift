import test from 'node:test';
import assert from 'node:assert/strict';
import { SeededRandom } from '../dist-preview/src/game/core/random.js';
import { inArc, normalize } from '../dist-preview/src/game/core/math.js';
import { FORMS } from '../dist-preview/src/game/data/forms.js';
import { HEROES } from '../dist-preview/src/game/data/heroes.js';
import { initialSave, parseSave } from '../dist-preview/src/game/storage/save.js';
import { CombatSession } from '../dist-preview/src/game/runtime/CombatSession.js';
import { radialDeadzone, StandardGamepadMapper } from '../dist-preview/src/game/runtime/gamepadMapping.js';
import { transitionScreen } from '../dist-preview/src/app/screenState.js';
import { facingFromAngle, facingFromVector } from '../dist-preview/src/game/core/direction.js';
import { resolveAtlasSource, resolveHeroAnimation } from '../dist-preview/src/game/animation/animationResolver.js';
import { KAIRO_COMBO_HITS } from '../dist-preview/src/game/data/kairoAbilities.js';
import { existsSync, readFileSync } from 'node:fs';

const action=(pressed=[], held=[], movement={x:0,y:0}, aim={x:1,y:0})=>({pressed:new Set(pressed),held:new Set(held),movement,aim});
const advance=(session,frames,input=action())=>{for(let i=0;i<frames;i++)session.update(1/60,input);};

test('seeded gameplay random is reproducible across runs',()=>{
 const a=new SeededRandom(117);const b=new SeededRandom(117);
 assert.deepEqual(Array.from({length:20},()=>a.int(0,9999)),Array.from({length:20},()=>b.int(0,9999)));
});
test('vector and facing geometry respects an arc rather than arbitrary auto targeting',()=>{
 assert.deepEqual(normalize({x:0,y:0}),{x:0,y:0});
 assert.equal(inArc({x:0,y:0},0,{x:60,y:0},90,Math.PI/2),true);
 assert.equal(inArc({x:0,y:0},0,{x:-60,y:0},90,Math.PI/2),false);
});
test('four-direction selection covers cardinal and diagonal vectors without mirroring authored views',()=>{
 assert.equal(facingFromVector({x:0,y:1}),'front');assert.equal(facingFromVector({x:0,y:-1}),'back');
 assert.equal(facingFromVector({x:1,y:0}),'right');assert.equal(facingFromVector({x:-1,y:0}),'left');
 assert.equal(facingFromVector({x:1,y:1}),'front');assert.equal(facingFromVector({x:-1,y:-1}),'back');
 assert.equal(facingFromVector({x:1,y:.4}),'right');assert.equal(facingFromAngle(Math.PI),'left');
 const s=new CombatSession(initialSave());s.newRun(404);s.hero.vx=100;s.hero.moveFacing='left';
 for(const d of ['front','right','back','left']){s.hero.moveFacing=d;const pose=resolveHeroAnimation(s.hero,0);assert.equal(pose.direction,d);assert.equal(pose.mirrorX,false);}
});
test('animation resolver respects state priority, combo contact timing, and recovery',()=>{
 const s=new CombatSession(initialSave());s.newRun(405);const h=s.hero;
 assert.equal(resolveHeroAnimation(h,0).state,'idle');
 h.vx=120;h.moveFacing='back';assert.equal(resolveHeroAnimation(h,.1).state,'run');assert.equal(resolveHeroAnimation(h,.1).direction,'back');
 h.vx=0;h.attackTime=.36;h.attackDuration=.36;h.attackStartup=.075;h.combo=2;h.attackAnimTime=.06;
 assert.equal(resolveHeroAnimation(h,.2).frame,5);h.attackAnimTime=.1;const contact=resolveHeroAnimation(h,.2);assert.equal(contact.frame,6);assert.equal(contact.state,'combo');
 h.dashTime=.1;h.vx=-300;h.attackTime=0;const dodge=resolveHeroAnimation(h,.2);assert.equal(dodge.state,'dodge');assert.equal(dodge.direction,'left');
 h.dashTime=0;h.guardTime=.1;h.parryWindow=.1;assert.equal(resolveHeroAnimation(h,.2).state,'parry');
 h.hurtTime=.2;h.hurtFacing='front';assert.equal(resolveHeroAnimation(h,.2).state,'hurt');assert.equal(resolveHeroAnimation(h,.2).direction,'front');
 h.ko=true;assert.equal(resolveHeroAnimation(h,.2).state,'ko');
 h.ko=false;h.hurtTime=0;h.guardTime=0;h.transformVisualTime=.3;h.transformVisualDuration=.72;assert.equal(resolveHeroAnimation(h,.2).state,'ember');
});
test('finisher animation advances four phases while holding its selected facing row',()=>{
 const s=new CombatSession(initialSave());s.newRun(406);const h=s.hero;h.currentAbility='finisher';h.abilityAnimDuration=.8;
 for(const [direction,row] of [['right',1],['left',3],['front',0],['back',2]]){
  h.attackFacing=direction;
  for(const [time,frame] of [[0,0],[.21,1],[.41,2],[.61,3]]){
   h.abilityAnimTime=time;const pose=resolveHeroAnimation(h,0);
   assert.equal(pose.direction,direction);assert.equal(pose.directionRow,row);assert.equal(pose.frame,frame);
  }
 }
 const manifest=JSON.parse(readFileSync('docs/art/b04-asset-manifest.json','utf8'));
 assert.deepEqual(manifest.clips.finisher.runtimeGrid.rowOrder,['front','right','back','left']);
 assert.equal(manifest.clips.finisher.directionOverrides.right,'kairo-finisher-right-strip.png');
 assert.ok(existsSync('public/assets/characters/kairo/b04/finisher.webp'));
});
test('directional atlas fallback is safe and B03 manifest references real runtime assets',()=>{
 assert.equal(resolveAtlasSource(true,true),'b03');assert.equal(resolveAtlasSource(false,true),'b02');assert.equal(resolveAtlasSource(false,false),'vector');
 const manifest=JSON.parse(readFileSync('docs/art/b03-animation-manifest.json','utf8'));
 assert.deepEqual(manifest.directions,['front','right','back','left']);
 for(const clip of Object.values(manifest.clips)){assert.equal(clip.frameWidth,192);assert.equal(clip.frameHeight,256);for(const path of Array.isArray(clip.runtime)?clip.runtime:[clip.runtime])assert.ok(existsSync(path),`missing ${path}`);}
 for(const name of ['idle','run','dodge','combo','states'])assert.ok(existsSync(`dist-preview/assets/characters/kairo/b03/${name}.png`),`offline preview missing B03 ${name} atlas`);
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
test('version 1 and 2 saves migrate into version 3 forms/settings without losing records',()=>{
 const migrated=parseSave(JSON.stringify({version:1,shards:41,bestRoom:2,runs:7,totalDefeats:3,unlockedHeroes:['kairo'],unlockedForms:[]}));
 assert.equal(migrated.version,3);assert.equal(migrated.shards,41);assert.equal(migrated.runs,7);assert.equal(migrated.equippedForm,'ember-drive');assert.deepEqual(migrated.unlockedForms,['ember-drive']);assert.equal(migrated.settings.masterVolume,.75);assert.equal(migrated.settings.reducedMotion,false);
 const v2=parseSave(JSON.stringify({version:2,shards:84,bestRoom:3,runs:9,totalDefeats:2,unlockedHeroes:['kairo'],unlockedForms:['kairo-1'],settings:initialSave().settings}));
 assert.equal(v2.version,3);assert.equal(v2.shards,84);assert.equal(v2.runs,9);assert.equal(v2.equippedForm,'ember-drive');assert.equal(v2.unlockedForms.includes('glass-current'),false);
});
test('Glass Current unlock progress and equipped form survive v3 save round-trip',()=>{
 const save=initialSave();save.precisionTrials=5;save.unlockedForms.push('glass-current');save.equippedForm='glass-current';
 const loaded=parseSave(JSON.stringify(save));assert.equal(loaded.precisionTrials,5);assert.equal(loaded.equippedForm,'glass-current');assert.ok(loaded.unlockedForms.includes('glass-current'));
 const unsafe=parseSave(JSON.stringify({...save,equippedForm:'not-a-form'}));assert.equal(unsafe.equippedForm,'ember-drive');
});
test('player navigation transitions guard title, hub, run, back, and locked pages',()=>{
 assert.equal(transitionScreen('title',{type:'start-run'}),'title');assert.equal(transitionScreen('title',{type:'new-run'}),'hub');
 assert.equal(transitionScreen('hub',{type:'start-run'}),'game');assert.equal(transitionScreen('game',{type:'back'}),'hub');
 assert.equal(transitionScreen('settings',{type:'back'}),'hub');assert.equal(transitionScreen('hub',{type:'back'}),'title');
});
test('gamepad radial deadzone rejects drift and rescales a useful analog vector',()=>{
 assert.deepEqual(radialDeadzone(.1,.1),{x:0,y:0});const moved=radialDeadzone(0,-1);assert.ok(moved.y<-.99);assert.equal(moved.x,0);
});
test('standard gamepad actions are edge-triggered, preserve aim at rest, and reset on disconnect',()=>{
 const mapper=new StandardGamepadMapper();const pad=(buttons=[],axes=[0,0,0,0])=>({id:'Xbox Controller',axes,buttons:Array.from({length:16},(_,i)=>({pressed:buttons.includes(i),value:buttons.includes(i)?1:0}))});
 const first=mapper.sample(pad([0]),100);assert.equal(first.actions.pressed.has('attack'),true);assert.equal(first.deviceLabel,'Xbox');
 const held=mapper.sample(pad([0]),116);assert.equal(held.actions.pressed.has('attack'),false);assert.equal(held.actions.held.has('attack'),true);
 const aimed=mapper.sample(pad([], [0,0,.8,-.2]),132);const resting=mapper.sample(pad(),148);assert.ok(aimed.actions.aim.x>.75);assert.deepEqual(resting.actions.aim,aimed.actions.aim);
 mapper.sample(null,164);const reconnected=mapper.sample(pad([0]),180);assert.equal(reconnected.actions.pressed.has('attack'),true);
});
test('Xbox-style shoulder/trigger/start and d-pad baseline maps to distinct actions',()=>{
 const mapper=new StandardGamepadMapper();const pressed=[1,2,3,4,5,6,7,9,13];const pad={id:'Xbox Wireless Controller',axes:[0,0,0,0],buttons:Array.from({length:16},(_,i)=>({pressed:pressed.includes(i),value:pressed.includes(i)?1:0}))};
 const sample=mapper.sample(pad,1000);for(const actionName of ['dash','shockwave','interact','guard','bolt','finisher','transform','pause'])assert.ok(sample.actions.pressed.has(actionName),actionName);
 assert.ok(sample.menuPressed.has('down'));assert.ok(sample.menuPressed.has('back'));assert.equal(sample.deviceLabel,'Xbox');
});
test('new run has seeded encounter, manual attack and successful enemy damage',()=>{
 const a=new CombatSession(initialSave());a.newRun(51);
 const b=new CombatSession(initialSave());b.newRun(51);
 assert.deepEqual(a.enemies.map(e=>[e.kind,e.x,e.y]),b.enemies.map(e=>[e.kind,e.x,e.y]));
 assert.equal(a.mode,'playing');assert.equal(a.room,1);
 const enemy=a.enemies[0];enemy.x=a.hero.x+45;enemy.y=a.hero.y;enemy.attackCooldown=10;
 const before=enemy.hp;
 a.update(.016,action(['attack']));advance(a,6);
 assert.ok(enemy.hp<before,`expected damage: hp now ${enemy.hp} from ${before}`);
 assert.ok(a.hero.pulse>0);
});
test('manual melee hitbox damages only enemies inside the facing arc',()=>{
 const s=new CombatSession(initialSave());s.newRun(512);s.hero.face=0;s.hero.attackCooldown=0;
 const front=s.enemies[0],behind=s.enemies[1];front.x=s.hero.x+55;front.y=s.hero.y;front.attackCooldown=9;const frontHp=front.hp;
 behind.x=s.hero.x-55;behind.y=s.hero.y;behind.attackCooldown=9;const behindHp=behind.hp;
 s.update(.016,action(['attack']));advance(s,6);assert.ok(front.hp<frontHp);assert.equal(behind.hp,behindHp);
});
test('Kairo chains three distinct buffered combo hits with delayed active frames and hitstop',()=>{
 const s=new CombatSession(initialSave());s.newRun(888);s.hero.face=0;
 const target=s.enemies[0];target.x=s.hero.x+45;target.y=s.hero.y;target.hp=1000;target.maxHp=1000;target.attackCooldown=20;
 for(const other of s.enemies.slice(1))other.hp=0;
 const starting=target.hp;
 s.update(1/60,action(['attack']));assert.equal(target.hp,starting);advance(s,5);assert.equal(s.hero.combo,1);assert.ok(target.hp<starting);assert.ok(s.hitstop>0);
 advance(s,12);s.update(1/60,action(['attack']));advance(s,7);assert.equal(s.hero.combo,2);
 advance(s,12);s.update(1/60,action(['attack']));advance(s,18);assert.equal(s.hero.combo,3);
 assert.ok(target.hp<=starting-60);assert.ok(s.hero.attackDuration>=.48);
});
test('one attack press plus a held input produces exactly one strike; one bolt press produces one projectile',()=>{
 const melee=new CombatSession(initialSave());melee.newRun(891);const target=melee.enemies[0];
 target.x=melee.hero.x+50;target.y=melee.hero.y;target.hp=1000;target.maxHp=1000;target.attackCooldown=20;
 for(const other of melee.enemies.slice(1))other.hp=0;
 melee.update(1/60,action(['attack'],['attack']));advance(melee,40,action([],['attack']));
 const contacts=melee.events.filter(event=>event.id==='combo-contact');
 assert.equal(contacts.length,1);assert.equal(contacts[0].comboIndex,1);assert.equal(melee.hero.combo,1);

 const ranged=new CombatSession(initialSave());ranged.newRun(892);const foe=ranged.enemies[0];
 foe.x=ranged.hero.x+240;foe.y=ranged.hero.y;foe.hp=1000;foe.maxHp=1000;foe.attackCooldown=20;
 for(const other of ranged.enemies.slice(1))other.hp=0;
 ranged.update(1/60,action(['bolt'],['bolt']));advance(ranged,50,action([],['bolt']));
 assert.equal(ranged.events.filter(event=>event.id==='bolt-cast').length,1);
 assert.equal(ranged.events.filter(event=>event.id==='bolt-hit').length,1);
 assert.equal(ranged.events.filter(event=>event.id==='combo-contact').length,0);
});
test('finisher affordability and shockwave cooldown are independent',()=>{
 const s=new CombatSession(initialSave());s.newRun(893);s.hero.pulse=74;
 assert.equal(s.getAbilityReason('finisher'),'insufficient-pulse');
 s.update(1/60,action(['finisher']));assert.equal(s.hero.currentAbility,null);assert.equal(s.hero.abilityCooldowns.finisher,0);
 s.hero.pulse=100;s.update(1/60,action(['shockwave']));assert.equal(s.hero.currentAbility,'shockwave');
 advance(s,55);assert.ok(s.hero.abilityCooldowns.shockwave>3);assert.equal(s.getAbilityReason('finisher'),'ready');
 s.update(1/60,action(['finisher']));assert.equal(s.hero.currentAbility,'finisher');assert.equal(s.hero.pulse,25);
 assert.equal(s.getAbilityReason('shockwave'),'cooldown');assert.ok(s.hero.abilityCooldowns.shockwave>0);
});
test('attack input buffers briefly through recovery and stays directional',()=>{
 const s=new CombatSession(initialSave());s.newRun(889);s.hero.face=0;
 const target=s.enemies[0];target.x=s.hero.x+45;target.y=s.hero.y;target.hp=1000;target.maxHp=1000;target.attackCooldown=20;
 for(const other of s.enemies.slice(1))other.hp=0;
 s.update(1/60,action(['attack']));advance(s,5);const once=target.hp;
 advance(s,13);s.update(1/60,action(['attack']));advance(s,14);assert.equal(s.hero.combo,2);assert.ok(target.hp<once);
});
test('dash grants short invulnerability, ends safely inside arena',()=>{
 const s=new CombatSession(initialSave());s.newRun(71);
 s.update(.016,action(['dash'],[],{x:1,y:0}));
 assert.ok(s.hero.dashTime>0);assert.ok(s.hero.invuln>0);
 for(let i=0;i<90;i++)s.update(.016,action());
 assert.ok(s.hero.x<=1110&&s.hero.x>=70);
});
test('enemy telegraph cannot hit through dash iframes, then damages after the window',()=>{
 const s=new CombatSession(initialSave());s.newRun(717);const e=s.enemies[0];s.hero.invuln=0;e.x=s.hero.x+e.radius+20;e.y=s.hero.y;e.telegraph=.01;e.attackCooldown=3;
 s.update(.02,action(['dash'],[],{x:-1,y:0}));assert.equal(s.hero.hp,100);
 s.hero.dashTime=0;s.hero.invuln=0;e.telegraph=.01;s.update(.02,action());assert.equal(s.hero.hp,88);
 s.hero.hp=100;s.hero.invuln=.4;e.telegraph=.01;s.update(.02,action());assert.equal(s.hero.hp,100);
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
test('equipped form loads for a new run and its finisher remains affordable after activation',()=>{
 const save=initialSave();save.shards=13;save.unlockedForms.push('glass-current');save.equippedForm='ember-drive';
 const s=new CombatSession(save);s.newRun(1111);assert.equal(s.hero.formId,'ember-drive');s.hero.pulse=100;
 s.update(.016,action(['transform']));assert.equal(s.hero.transformed,true);assert.equal(s.hero.pulse,60);
 assert.equal(s.snapshot.abilities.finisher.pulseCost,50);assert.equal(s.getAbilityReason('finisher'),'ready');
 s.update(.016,action(['finisher']));assert.ok(s.hero.pulse<15);assert.equal(s.save.shards,13);
});
test('Glass Current perfect dodge and earned counter use a bounded one-shot window',()=>{
 const s=new CombatSession(initialSave());s.newRun(112);s.save.unlockedForms.push('glass-current');s.save.equippedForm='glass-current';s.hero.formId='glass-current';s.hero.transformed=true;s.hero.formTime=5;
 const foe=s.enemies[0];foe.x=s.hero.x+45;foe.y=s.hero.y;const before=foe.hp;
 s.hero.invuln=.2;s.hero.glassCounterTime=.2;s.damageHero(12,foe);
 assert.ok(foe.hp<before);assert.equal(s.hero.glassCounterTime,0);const after=foe.hp;
 s.hero.invuln=.2;s.damageHero(12,foe);assert.equal(foe.hp,after);
});
test('five earned perfect parries unlock Glass Current without resetting run records',()=>{
 const s=new CombatSession(initialSave());s.newRun(113);const foe=s.enemies[0];foe.x=s.hero.x+35;foe.y=s.hero.y;
 for(let i=0;i<5;i++){s.hero.invuln=0;s.hero.guardTime=.1;s.hero.parryWindow=.2;s.damageHero(12,foe);}
 assert.equal(s.save.precisionTrials,5);assert.ok(s.save.unlockedForms.includes('glass-current'));assert.equal(s.save.shards,0);
});
test('Ember combo marks detonate only on the third contact',()=>{
 const s=new CombatSession(initialSave());s.newRun(114);s.hero.formId='ember-drive';s.hero.transformed=true;
 const foe=s.enemies[0];foe.x=s.hero.x+40;foe.y=s.hero.y;foe.hp=1000;foe.maxHp=1000;
 s.hitArc(0,'combo',KAIRO_COMBO_HITS[0],'combo-contact',1);assert.equal(foe.emberMarks,1);
 s.hitArc(0,'combo',KAIRO_COMBO_HITS[1],'combo-contact',2);assert.equal(foe.emberMarks,2);
 s.hitArc(0,'combo',KAIRO_COMBO_HITS[2],'combo-contact',3);assert.equal(foe.emberMarks,0);assert.equal(foe.hp,915);
});
test('Glass special is unavailable without a counter window and consumes a valid window once',()=>{
 const s=new CombatSession(initialSave());s.newRun(115);s.save.unlockedForms.push('glass-current');s.hero.formId='glass-current';s.hero.transformed=true;s.hero.pulse=20;s.hero.formTime=5;
 const foe=s.enemies[0];foe.x=s.hero.x+50;foe.y=s.hero.y;foe.hp=300;foe.maxHp=300;
 assert.equal(s.getAbilityReason('shockwave'),'recovery');s.hero.glassCounterTime=.4;
 s.update(.016,action(['shockwave']));assert.equal(foe.hp,264);assert.equal(s.hero.glassCounterTime,0);
});
test('defeat records KO animation state after real incoming damage',()=>{
 const s=new CombatSession(initialSave());s.newRun(333);const e=s.enemies[0];
 s.hero.hp=10;s.hero.invuln=0;s.hero.dashTime=0;e.x=s.hero.x+e.radius+10;e.y=s.hero.y;e.telegraph=.01;e.attackCooldown=2;
 s.update(.02,action());assert.equal(s.mode,'defeat');assert.equal(s.hero.ko,true);assert.ok(s.hero.hurtTime>0);
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
