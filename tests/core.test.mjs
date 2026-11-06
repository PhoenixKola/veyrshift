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
import { facingFromAngle, facingFromVector, movementFacingFromVector } from '../dist-preview/src/game/core/direction.js';
import { visualProofCuesBetween, visualProofDuration, visualProofFrameIndex, visualRigCutoutPose, VISUAL_PROOF_PHASES } from '../dist-preview/src/game/animation/visualBreakthrough.js';
import { resolveAtlasSource, resolveFormComboAtlas, resolveFormRunAtlas, resolveHeroAnimation } from '../dist-preview/src/game/animation/animationResolver.js';
import { KAIRO_BASE_ABILITIES, KAIRO_COMBO_HITS } from '../dist-preview/src/game/data/kairoAbilities.js';
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
 for(const [angle,side] of [[-Math.PI/4,'right'],[-3*Math.PI/4,'left'],[Math.PI/4,'right'],[3*Math.PI/4,'left']])
  assert.equal(facingFromAngle(angle),side);
 const s=new CombatSession(initialSave());s.newRun(404);s.hero.vx=100;s.hero.moveFacing='left';
 for(const d of ['front','right','back','left']){s.hero.moveFacing=d;const pose=resolveHeroAnimation(s.hero,0);assert.equal(pose.direction,d);assert.equal(pose.mirrorX,false);}
});
test('diagonal travel favors the side view, stays stable near the boundary, and returns to cardinal views',()=>{
 for(const [x,y,side,vertical] of [[1,1,'right','front'],[-1,1,'left','front'],[1,-1,'right','back'],[-1,-1,'left','back']]){
  assert.equal(movementFacingFromVector({x,y},vertical),side);
  assert.equal(movementFacingFromVector({x:x*.7,y},side),side);
  assert.equal(movementFacingFromVector({x:0,y},side),vertical);
  assert.equal(movementFacingFromVector({x,y:0},vertical),side);
 }
 const s=new CombatSession(initialSave());s.newRun(409);
 s.update(1/60,action([],[],{x:1,y:-1}));
 assert.equal(s.hero.moveFacing,'right');
 assert.ok(s.hero.vx>0&&s.hero.vy<0);
});
test('animation resolver respects state priority, combo contact timing, and recovery',()=>{
 const s=new CombatSession(initialSave());s.newRun(405);const h=s.hero;
 assert.equal(resolveHeroAnimation(h,0).state,'idle');
 h.vx=120;h.moveFacing='back';assert.equal(resolveHeroAnimation(h,.1).state,'run');assert.equal(resolveHeroAnimation(h,.1).direction,'back');
 h.vx=0;h.attackTime=.36;h.attackDuration=.36;h.attackStartup=.075;h.combo=2;h.attackAnimTime=.06;
 assert.equal(resolveHeroAnimation(h,.2).frame,4);h.attackAnimTime=.1;const contact=resolveHeroAnimation(h,.2);assert.equal(contact.frame,5);assert.equal(contact.state,'combo');
 h.dashTime=.1;h.vx=-300;h.attackTime=0;const dodge=resolveHeroAnimation(h,.2);assert.equal(dodge.state,'dodge');assert.equal(dodge.direction,'left');
 h.dashTime=0;h.guardTime=.1;h.parryWindow=.1;assert.equal(resolveHeroAnimation(h,.2).state,'parry');
 h.hurtTime=.2;h.hurtFacing='front';assert.equal(resolveHeroAnimation(h,.2).state,'hurt');assert.equal(resolveHeroAnimation(h,.2).direction,'front');
 h.ko=true;assert.equal(resolveHeroAnimation(h,.2).state,'ko');
 h.ko=false;h.hurtTime=0;h.guardTime=0;h.transformVisualTime=.3;h.transformVisualDuration=.72;assert.equal(resolveHeroAnimation(h,.2).state,'ember');
});
test('combo contact frame follows each hit’s real active window',()=>{
 const s=new CombatSession(initialSave());s.newRun(408);const h=s.hero;h.attackTime=1;
 for(const formId of ['base','ember-drive','glass-current'])for(let i=0;i<KAIRO_COMBO_HITS.length;i++){
  const timing=KAIRO_COMBO_HITS[i].timing;h.combo=i+1;h.formId=formId;h.attackFormId=formId;h.transformed=formId!=='base';
  const contactPhase=formId!=='base'&&i===0||formId==='base'&&i===1?1:2;
  h.attackAnimTime=timing.windup+.001;assert.equal(resolveHeroAnimation(h,0).frame,i*4+contactPhase);
  h.attackAnimTime=timing.windup+timing.active+.001;assert.equal(resolveHeroAnimation(h,0).frame,i*4+(contactPhase===1?2:3));
 }
});
test('form-specific run animation advances at each form movement speed',()=>{
 const s=new CombatSession(initialSave());s.newRun(407);const h=s.hero;
 h.transformed=true;h.formId='ember-drive';h.vx=322;h.step=322*.07*2.2;
 let pose=resolveHeroAnimation(h,.2);assert.equal(pose.state,'run');assert.equal(pose.frame,2);
 h.formId='glass-current';h.vx=260;h.step=260*.07*3.2;
 pose=resolveHeroAnimation(h,.3);assert.equal(pose.state,'run');assert.equal(pose.frame,3);
});
test('visual-breakthrough preview uses eight authored frames and exactly timed phase holds',()=>{
 for(const form of ['ember-drive','glass-current']){
  assert.equal(VISUAL_PROOF_PHASES[form].length,8);
  assert.equal(visualProofFrameIndex(form,0),0);
  assert.equal(visualProofFrameIndex(form,visualProofDuration(form)),7);
  assert.equal(visualProofFrameIndex(form,visualProofDuration(form)+.2),7);
 }
 assert.equal(visualProofDuration('ember-drive'),5.02);assert.equal(visualProofDuration('glass-current'),5.06);
 assert.deepEqual(visualProofCuesBetween('glass-current',2.62,2.64).map(cue=>cue.action),['dash']);
 assert.equal(visualProofCuesBetween('glass-current',2.38,2.40)[0].cue,'enemy-telegraph');
});
test('cutout rig feasibility uses deterministic smooth in-betweens and returns to its fixed-scale rest pose',()=>{
 const start=visualRigCutoutPose(0),anticipation=visualRigCutoutPose(.34),impact=visualRigCutoutPose(1.156),end=visualRigCutoutPose(1.7);
 assert.deepEqual(start,{x:0,y:0,rotation:0});assert.ok(anticipation.x<0);assert.ok(impact.x>16);
 assert.deepEqual(end,{x:0,y:0,rotation:0});assert.deepEqual(visualRigCutoutPose(.8),visualRigCutoutPose(.8));
});
test('actual combat rules resolve Ember contact and Glass dodge-counter-special in visual-proof timing',()=>{
 for(const form of ['ember-drive','glass-current']){
  const session=new CombatSession(initialSave());session.newRun(form==='ember-drive'?50805:50806);
  session.save.unlockedForms=[...new Set([...session.save.unlockedForms,form])];
  session.hero.formId=form;session.hero.x=520;session.hero.y=360;session.hero.face=0;session.hero.pulse=100;session.hero.invuln=0;
  session.enemies=[{id:9501,kind:'wisp',x:form==='ember-drive'?580:690,y:360,hp:1000,maxHp:1000,radius:18,speed:0,flash:0,phase:0,attackCooldown:99,telegraph:0,stagger:0,vx:0,vy:0}];
  let elapsed=0;
  for(let frame=0;frame<Math.ceil(visualProofDuration(form)*60);frame++){
   const next=Math.min(visualProofDuration(form),elapsed+1/60),pressed=new Set(),movement={x:0,y:0};
   for(const cue of visualProofCuesBetween(form,elapsed,next)){
    if(cue.action){pressed.add(cue.action);if(cue.action==='dash')movement.x=1;if(cue.action==='shockwave')session.enemies[0].attackCooldown=99;}
    if(cue.cue==='enemy-telegraph')session.enemies[0].telegraph=.47;
   }
   session.update(1/60,{movement,aim:{x:1,y:0},pressed,held:new Set()});elapsed=next;
  }
  const events=session.consumeEvents();
  if(form==='ember-drive'){
   assert.ok(events.some(event=>event.id==='ember-start'));assert.ok(events.some(event=>event.id==='combo-contact'));
   assert.ok(events.some(event=>event.id==='ember-end'));assert.ok(session.enemies[0].hp<1000);
  }else{
   assert.ok(events.some(event=>event.id==='glass-start'));assert.ok(events.some(event=>event.id==='glass-counter'&&event.ability==='dodge'));
   assert.ok(events.some(event=>event.id==='shockwave-hit'));assert.ok(events.some(event=>event.id==='glass-end'));
   assert.ok(session.enemies[0].hp<1000);assert.equal(session.hero.hp,session.hero.maxHp);
  }
 }
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
test('B05 selects form combo atlases only when active and loaded, and exports clean four-direction candidates',()=>{
 assert.equal(resolveFormComboAtlas('ember-drive',true,true),'ember-drive');
 assert.equal(resolveFormComboAtlas('glass-current',true,true),'glass-current');
 assert.equal(resolveFormRunAtlas('ember-drive',true,true),'ember-drive');
 assert.equal(resolveFormRunAtlas('glass-current',true,true),'glass-current');
 assert.equal(resolveFormComboAtlas('ember-drive',false,true),null);
 assert.equal(resolveFormComboAtlas('glass-current',true,false),null,'missing form art falls back to the authored base combo');
 assert.equal(resolveFormRunAtlas('glass-current',true,false),null,'missing form locomotion falls back to B03');
 assert.equal(resolveFormComboAtlas('base',true,true),null);
 const manifest=JSON.parse(readFileSync('docs/art/b05-animation-manifest.json','utf8'));
 assert.equal(manifest.runtimeAssetsExported,true);
 assert.deepEqual(manifest.directions,['front','right','back','left']);
 assert.ok(existsSync(manifest.scaleComparison),`missing ${manifest.scaleComparison}`);
 for(const formId of ['ember-drive','glass-current']){
  const form=manifest.forms[formId];
  assert.equal(form.status,'PRODUCTION_CANDIDATE_OWNER_APPROVAL_PENDING');
  assert.equal(form.runtimeGrid.columns,12);assert.equal(form.runtimeGrid.rows,4);
  assert.deepEqual(form.runtimePivot,[96,248]);
  assert.equal(form.frames.length,48);
  assert.ok(existsSync(form.runtime),`missing ${form.runtime}`);
  assert.ok(existsSync(form.contactSheet),`missing ${form.contactSheet}`);
  assert.deepEqual(form.phaseDurationsMs,{hit1:[65,55,114,76],hit2:[38,52,65,200],hit3:[57,78,85,300]});
  assert.deepEqual(form.frames.slice(0,4).map(frame=>frame.durationMs),form.phaseDurationsMs.hit1);
  assert.deepEqual(form.frames.slice(16,20).map(frame=>frame.durationMs),form.phaseDurationsMs.hit2);
  assert.deepEqual(form.frames.slice(32,36).map(frame=>frame.durationMs),form.phaseDurationsMs.hit3);
  assert.ok(existsSync(form.atSpeedPreview),`missing ${form.atSpeedPreview}`);
  assert.ok(existsSync(form.run.runtime),`missing ${form.run.runtime}`);
  assert.ok(existsSync(form.run.contactSheet),`missing ${form.run.contactSheet}`);
  assert.equal(form.coverage.idle,true);
  assert.ok(existsSync(form.idle.runtime),`missing ${form.idle.runtime}`);
  assert.ok(existsSync(form.idle.contactSheet),`missing ${form.idle.contactSheet}`);
  assert.equal(form.idle.frames.length,16);
  for(const frame of form.idle.frames){assert.equal(frame.componentsDeleted,0);assert.equal(frame.cellBorderPixelsAboveAlphaFloor,0);assert.ok(frame.minimumCellMargin>=6);assert.deepEqual(frame.runtimePivot,[96,248]);}
  assert.equal(form.coverage.dodge,true);
  if(form.coverage.dodge){assert.ok(existsSync(form.dodge.runtime));assert.equal(form.dodge.frames.length,16);for(const frame of form.dodge.frames){assert.equal(frame.cellBorderPixelsAboveAlphaFloor,0);assert.ok(frame.minimumCellMargin>=6);assert.deepEqual(frame.runtimePivot,[96,248]);}}
  assert.equal(form.coverage.guardParry,true);assert.ok(existsSync(form.guardParry.runtime));assert.equal(form.guardParry.frames.length,16);
  for(const frame of form.guardParry.frames){assert.equal(frame.cellBorderPixelsAboveAlphaFloor,0);assert.ok(frame.minimumCellMargin>=6);assert.deepEqual(frame.runtimePivot,[96,248]);}
  assert.equal(form.run.frames.length,16);
  assert.deepEqual(form.run.runtimePivot,[96,248]);
  for(const frame of form.run.frames){assert.equal(frame.componentsDeleted,0);assert.equal(frame.cellBorderPixelsAboveAlphaFloor,0);}
  assert.equal(form.coverage.dedicatedIcons,true);
  assert.equal(form.icons.icons.length,6);
  for(const icon of form.icons.icons){assert.ok(existsSync(icon.runtime),`missing ${icon.runtime}`);assert.equal(icon.componentsDeleted,0);assert.equal(icon.cellBorderPixelsAboveAlphaFloor,0);}
  assert.ok(existsSync(form.icons.contactSheet),`missing ${form.icons.contactSheet}`);
  assert.equal(form.coverage.authoredVfx,true);
  assert.equal(form.vfx.textures.length,6);
  for(const texture of form.vfx.textures){assert.ok(existsSync(texture.runtime),`missing ${texture.runtime}`);assert.equal(texture.componentsDeleted,0);assert.equal(texture.cellBorderPixelsAboveAlphaFloor,0);}
  assert.ok(existsSync(form.vfx.contactSheet),`missing ${form.vfx.contactSheet}`);
  for(const sheet of form.sourceGrids)assert.ok(existsSync(sheet.source),`missing ${sheet.source}`);
  for(const frame of form.frames){
   assert.equal(frame.componentsDeleted,0);
   assert.equal(frame.cellBorderPixelsAboveAlphaFloor,0);
   assert.deepEqual(frame.runtimePivot,[96,248]);
  }
  assert.equal(form.coverage.run,true);
  assert.equal(form.coverage.bolt,true);assert.ok(existsSync(form.bolt.runtime));assert.equal(form.bolt.frames.length,16);
  for(const frame of form.bolt.frames){assert.equal(frame.cellBorderPixelsAboveAlphaFloor,0);assert.ok(frame.minimumCellMargin>=6);assert.deepEqual(frame.runtimePivot,[96,248]);}
  for(const state of ['hurtKo','special','finisher','activation','deactivation'])assert.equal(form.coverage[state],false);
 }
});
test('combo offline previews keep four directions together and use the simulation phase durations',()=>{
 const manifest=JSON.parse(readFileSync('docs/art/b05-animation-manifest.json','utf8'));
 for(const formId of ['ember-drive','glass-current']){
  const form=manifest.forms[formId];assert.equal(form.frames.length,48);
  const image=readFileSync(form.atSpeedPreview);assert.ok(image.length>1000);
  assert.match(form.timingBasis,/simulation windup\/active\/recovery/);
 }
});
test('form bolt animation changes to release at the exact cast windup',()=>{
 const timing=KAIRO_BASE_ABILITIES.bolt.timing;
 for(const formId of ['base','ember-drive','glass-current']){
  const s=new CombatSession(initialSave());s.newRun(909);s.enemies=[];s.hero.formId=formId;s.hero.transformed=formId!=='base';s.hero.formTime=5;
  s.update(1/60,action(['bolt']));advance(s,5);s.hero.abilityAnimTime=timing.windup-.001;
  assert.equal(resolveHeroAnimation(s.hero,0).frame,1);
  s.hero.abilityAnimTime=timing.windup;
  assert.equal(resolveHeroAnimation(s.hero,0).frame,2);
 }
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
 assert.equal(s.events.find(event=>event.id==='ember-start')?.formId,'ember-drive');
 assert.ok(s.hero.pulse<55);
 // Simulate form timeout without enemy interference.
 s.enemies=[];s.hero.formTime=.025;
 s.update(.034,action());
 assert.equal(s.hero.transformed,false);
 assert.equal(s.events.find(event=>event.id==='ember-end')?.formId,'ember-drive');
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
 s.startDodge(action([],[],{x:1,y:0}));assert.equal(s.hero.dashDuration,.24);assert.equal(s.hero.dashTime,.24);
 assert.equal(s.hero.glassCounterTime,0);assert.equal(s.getAbilityReason('shockwave'),'recovery');
 s.hero.dashTime=.12;assert.equal(resolveHeroAnimation(s.hero,0).frame,2);
 s.damageHero(12,foe);assert.equal(foe.hp,before);assert.equal(s.hero.glassDodgeWindow,0);assert.equal(s.hero.glassCounterTime,.55);
 s.damageHero(12,foe);assert.equal(s.hero.glassCounterTime,.55);assert.equal(s.events.filter(event=>event.id==='glass-counter').length,1);
});
test('five earned perfect parries unlock Glass Current without resetting run records',()=>{
 const s=new CombatSession(initialSave());s.newRun(113);const foe=s.enemies[0];foe.x=s.hero.x+35;foe.y=s.hero.y;
 foe.attackCooldown=99;
 for(let i=0;i<5;i++){s.hero.invuln=0;s.update(.016,action([],['guard']));s.damageHero(12,foe);s.update(.016,action());}
 assert.equal(s.save.precisionTrials,5);assert.ok(s.save.unlockedForms.includes('glass-current'));assert.equal(s.save.shards,0);
});
test('a held guard cannot award repeated perfect parries without release',()=>{
 const s=new CombatSession(initialSave());s.newRun(118);const foe=s.enemies[0];foe.x=s.hero.x+35;foe.y=s.hero.y;foe.attackCooldown=99;s.hero.invuln=0;
 s.update(.016,action([],['guard']));s.damageHero(12,foe);assert.equal(s.save.precisionTrials,1);
 s.update(.016,action([],['guard']));assert.equal(s.hero.parryWindow,0);s.damageHero(12,foe);
 assert.equal(s.save.precisionTrials,1);assert.ok(s.hero.hp<100,'second hit is a block, not another perfect parry');
});
test('form parry pose follows a successful parry rather than an unused window',()=>{
 for(const formId of ['ember-drive','glass-current']){
  const s=new CombatSession(initialSave());s.newRun(119);s.hero.formId=formId;s.hero.transformed=true;s.hero.formTime=5;s.hero.pulse=100;s.hero.invuln=0;
  for(const e of s.enemies)e.attackCooldown=99;const foe=s.enemies[0];foe.x=s.hero.x+35;foe.y=s.hero.y;
  s.update(.016,action([],['guard']));assert.equal(resolveHeroAnimation(s.hero,0).state,'guard');
  s.damageHero(12,foe);const pose=resolveHeroAnimation(s.hero,0);assert.equal(pose.state,'parry');assert.equal(pose.frame,2);
  advance(s,10,action([],['guard']));assert.equal(resolveHeroAnimation(s.hero,0).state,'guard');
 }
});
test('Ember combo marks detonate only on the third contact',()=>{
 const s=new CombatSession(initialSave());s.newRun(114);s.hero.formId='ember-drive';s.hero.transformed=true;
 const foe=s.enemies[0];foe.x=s.hero.x+40;foe.y=s.hero.y;foe.hp=1000;foe.maxHp=1000;
 s.hitArc(0,'combo',KAIRO_COMBO_HITS[0],'combo-contact',1);assert.equal(foe.emberMarks,1);
 assert.equal(s.snapshot.formMarks,1);
 s.hitArc(0,'combo',KAIRO_COMBO_HITS[1],'combo-contact',2);assert.equal(foe.emberMarks,2);
 assert.equal(s.snapshot.formMarks,2);
 s.hitArc(0,'combo',KAIRO_COMBO_HITS[2],'combo-contact',3);assert.equal(foe.emberMarks,0);assert.equal(foe.hp,915);
 assert.equal(s.snapshot.formMarks,0);
 assert.equal(s.events.filter(event=>event.id==='combo-contact').length,3);
 assert.equal(s.events.filter(event=>event.id==='ember-detonate').length,1);
});
test('bolt keeps the form it was fired with through a form transition',()=>{
 const setup=(form)=>{const s=new CombatSession(initialSave());s.newRun(116);s.enemies=s.enemies.slice(0,2);s.hero.formId='ember-drive';s.hero.transformed=form==='ember-drive';s.hero.abilityFormId=form;s.hero.actionAngle=0;
  for(const [i,e] of s.enemies.entries()){e.x=s.hero.x+(i?75:45);e.y=s.hero.y;e.hp=300;e.maxHp=300;e.attackCooldown=99;}s.fireBolt();return s;};
 const ember=setup('ember-drive');ember.hero.transformed=false;ember.updateProjectiles(.01);
 assert.ok(ember.enemies[1].hp<300,'Ember splash stays on a projectile after reversion');
 assert.equal(ember.events.find(event=>event.id==='bolt-hit')?.formId,'ember-drive');
 const base=setup('base');base.hero.transformed=true;base.updateProjectiles(.01);
 assert.equal(base.enemies[1].hp,300,'base projectile does not acquire Ember splash after activation');
 assert.equal(base.events.find(event=>event.id==='bolt-hit')?.formId,'base');
});
test('Ember detonates on a target’s third confirmed contact, not merely combo step three',()=>{
 const s=new CombatSession(initialSave());s.newRun(117);s.hero.formId='ember-drive';s.hero.transformed=true;
 const foe=s.enemies[0];foe.x=s.hero.x+40;foe.y=s.hero.y;foe.hp=1000;foe.maxHp=1000;
 s.hitArc(0,'combo',KAIRO_COMBO_HITS[2],'combo-contact',3);
 assert.equal(foe.emberMarks,1);assert.equal(s.events.filter(event=>event.id==='ember-detonate').length,0);
 s.hitArc(0,'combo',KAIRO_COMBO_HITS[0],'combo-contact',1);assert.equal(foe.emberMarks,2);
 s.hitArc(0,'combo',KAIRO_COMBO_HITS[1],'combo-contact',2);assert.equal(foe.emberMarks,0);
 assert.equal(s.events.filter(event=>event.id==='ember-detonate').length,1);
});
test('Glass special is unavailable without a counter window and consumes a valid window once',()=>{
 const s=new CombatSession(initialSave());s.newRun(115);s.save.unlockedForms.push('glass-current');s.hero.formId='glass-current';s.hero.transformed=true;s.hero.pulse=20;s.hero.formTime=5;
 const foe=s.enemies[0];foe.x=s.hero.x+50;foe.y=s.hero.y;foe.hp=300;foe.maxHp=300;
 assert.equal(s.getAbilityReason('shockwave'),'recovery');s.hero.glassCounterTime=.4;
 assert.equal(s.snapshot.counterWindow,.4);
 s.update(.016,action(['shockwave']));assert.equal(foe.hp,300,'counter damage waits for its windup');assert.equal(s.hero.glassCounterTime,0);
 assert.equal(s.snapshot.counterWindow,0);
 s.hero.formTime=.03;foe.attackCooldown=99;advance(s,14);
 assert.equal(s.hero.transformed,false);assert.equal(foe.hp,264,'a committed counter keeps its cast form through expiry');
 assert.equal(s.events.find(event=>event.id==='shockwave-hit')?.formId,'glass-current');
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
