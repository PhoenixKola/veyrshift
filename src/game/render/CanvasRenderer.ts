import { ARENA } from '../data/encounters.js';
import type { CombatEvent, Enemy, GameSettings, Hero, KairoFormId } from '../core/types.js';
import type { CombatSession } from '../runtime/CombatSession.js';
import { resolveAtlasSource, resolveFormAnimationAtlas, resolveHeroAnimation, type ResolvedAnimation } from '../animation/animationResolver.js';
import { clamp } from '../core/math.js';
import { visualProofFrameIndex, type VisualProofForm } from '../animation/visualBreakthrough.js';
type FormVfxKey = 'activation'|'contact'|'bolt'|'special'|'finisher'|'transition';
export class CanvasRenderer {
 private ctx:CanvasRenderingContext2D;
 private reducedMotion=false;
 private reducedFlash=false;
 private forceB02:boolean;
 private proofAtlases:Partial<Record<VisualProofForm,HTMLImageElement>>={};
 private visualProof:{form:VisualProofForm;elapsed:number}|null=null;
 private idle=this.load('/assets/characters/kairo/b02/idle.png');
 private run=this.load('/assets/characters/kairo/b02/run.png');
 private combo=this.load('/assets/characters/kairo/b02/combo.png');
 private dodge=this.load('/assets/characters/kairo/b02/dodge.png');
 private states=this.load('/assets/characters/kairo/b02/states.png');
 private directional={
  idle:this.load('/assets/characters/kairo/b03/idle.png'),
  run:this.load('/assets/characters/kairo/b03/run.png'),
  dodge:this.load('/assets/characters/kairo/b03/dodge.png'),
  combo:this.load('/assets/characters/kairo/b03/combo.png'),
  states:this.load('/assets/characters/kairo/b03/states.png'),
 };
 private authored={
  combo:this.load('/assets/characters/kairo/b04/combo.webp'),
  transitions:this.load('/assets/characters/kairo/b04/locomotion-transitions.webp'),
  bolt:this.load('/assets/characters/kairo/b04/bolt-cast.webp'),
  shockwave:this.load('/assets/characters/kairo/b04/shockwave.webp'),
  guardParry:this.load('/assets/characters/kairo/b04/guard-parry.webp'),
  finisher:this.load('/assets/characters/kairo/b04/finisher.webp'),
 };
 private formCombos:Record<Exclude<KairoFormId,'base'>,HTMLImageElement>={
  'ember-drive':this.load('/assets/characters/kairo/forms/ember-drive/combo.webp'),
  'glass-current':this.load('/assets/characters/kairo/forms/glass-current/combo.webp'),
 };
 private formRuns:Record<Exclude<KairoFormId,'base'>,HTMLImageElement>={
  'ember-drive':this.load('/assets/characters/kairo/forms/ember-drive/run.webp'),
  'glass-current':this.load('/assets/characters/kairo/forms/glass-current/run.webp'),
 };
 private formIdles:Record<Exclude<KairoFormId,'base'>,HTMLImageElement>={
  'ember-drive':this.load('/assets/characters/kairo/forms/ember-drive/idle.webp'),
  'glass-current':this.load('/assets/characters/kairo/forms/glass-current/idle.webp'),
 };
 private formDodges:Partial<Record<Exclude<KairoFormId,'base'>,HTMLImageElement>>={
  'ember-drive':this.load('/assets/characters/kairo/forms/ember-drive/dodge.webp'),
  'glass-current':this.load('/assets/characters/kairo/forms/glass-current/dodge.webp'),
 };
 private formGuards:Record<Exclude<KairoFormId,'base'>,HTMLImageElement>={
  'ember-drive':this.load('/assets/characters/kairo/forms/ember-drive/guardParry.webp'),
  'glass-current':this.load('/assets/characters/kairo/forms/glass-current/guardParry.webp'),
 };
 private formBolts:Record<Exclude<KairoFormId,'base'>,HTMLImageElement>={
  'ember-drive':this.load('/assets/characters/kairo/forms/ember-drive/bolt.webp'),
  'glass-current':this.load('/assets/characters/kairo/forms/glass-current/bolt.webp'),
 };
 private formVfx:Record<Exclude<KairoFormId,'base'>,Record<FormVfxKey,HTMLImageElement>>={
  'ember-drive':{
   activation:this.load('/assets/vfx/b05/ember-drive/activation.webp'),contact:this.load('/assets/vfx/b05/ember-drive/contact.webp'),
   bolt:this.load('/assets/vfx/b05/ember-drive/bolt.webp'),special:this.load('/assets/vfx/b05/ember-drive/special.webp'),
   finisher:this.load('/assets/vfx/b05/ember-drive/finisher.webp'),transition:this.load('/assets/vfx/b05/ember-drive/transition.webp'),
  },
  'glass-current':{
   activation:this.load('/assets/vfx/b05/glass-current/activation.webp'),contact:this.load('/assets/vfx/b05/glass-current/contact.webp'),
   bolt:this.load('/assets/vfx/b05/glass-current/bolt.webp'),special:this.load('/assets/vfx/b05/glass-current/special.webp'),
   finisher:this.load('/assets/vfx/b05/glass-current/finisher.webp'),transition:this.load('/assets/vfx/b05/glass-current/transition.webp'),
  },
 };
 private vfx={
  bolt:this.load('/assets/vfx/b04/boltFlight.webp'), combo:this.load('/assets/vfx/b04/comboImpact.webp'),
  shockwave:this.load('/assets/vfx/b04/shockwave.webp'), parry:this.load('/assets/vfx/b04/parry.webp'),
  dodge:this.load('/assets/vfx/b04/dodge.webp'), finisher:this.load('/assets/vfx/b04/finisher.webp'),
 };
 private effects:{event:CombatEvent;start:number;duration:number}[]=[];
 readonly assetsReady:Promise<void>;
 private lastAnimation:ResolvedAnimation|null=null;
 private previousAnimation:ResolvedAnimation|null=null;
 private lastAnimationForm:KairoFormId='base';
 private previousAnimationForm:KairoFormId='base';
 private transitionRemaining=0;
 private previousRenderAt=0;
 private wisp=this.load('/assets/enemies/prototype/rift-wisp.png');
 constructor(canvas:HTMLCanvasElement,forceB02=false,enableVisualProof=false){
  this.forceB02=forceB02;
  canvas.width=ARENA.width;canvas.height=ARENA.height;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D support is required');this.ctx=ctx;
  if(enableVisualProof){this.proofAtlases={
   'ember-drive':this.load('/art-source/b05/visual-breakthrough/runtime/ember-proof.webp'),
   'glass-current':this.load('/art-source/b05/visual-breakthrough/runtime/glass-proof.webp'),
  };}
  this.assetsReady=Promise.all([...Object.values(this.directional),...Object.values(this.authored),...Object.values(this.formCombos),...Object.values(this.formRuns),...Object.values(this.formIdles),...Object.values(this.formDodges),...Object.values(this.formGuards),...Object.values(this.formBolts),...Object.values(this.formVfx).flatMap(form=>Object.values(form)),...Object.values(this.vfx),...Object.values(this.proofAtlases),this.idle,this.run,this.combo,this.dodge,this.states,this.wisp].map(image=>image.decode().catch(()=>undefined))).then(()=>undefined);
 }
 setVisualProof(form:VisualProofForm|null,elapsed=0):void {this.visualProof=form?{form,elapsed}:null;}
 emit(events:CombatEvent[],clock:number):void {
  const durations:Partial<Record<CombatEvent['id'],number>>={'bolt-cast':.22,'bolt-hit':.23,'bolt-dissipate':.2,'combo-contact':.23,swing:.19,
   'shockwave-charge':.24,'shockwave-release':.48,'shockwave-hit':.22,parry:.23,block:.17,'dash-start':.24,'dash-land':.22,
   'finisher-build':.3,'finisher-hit':.38,'finisher-fade':.32,'ember-start':.5,'ember-end':.28,'ember-detonate':.36,'glass-start':.5,'glass-end':.28,'glass-counter':.3};
  for(const event of events){const duration=durations[event.id];if(duration)this.effects.push({event,start:clock,duration});}
  if(this.effects.length>80)this.effects.splice(0,this.effects.length-80);
 }
 private load(src:string):HTMLImageElement {const image=new Image();image.decoding='async';image.src=location.protocol==='file:'?new URL(`.${src}`,location.href).href:src;return image;}
 render(game:CombatSession):void {
  const c=this.ctx,w=ARENA.width,h=ARENA.height;
  this.reducedMotion=game.save.settings.reducedMotion;this.reducedFlash=game.save.settings.reducedFlash;
  c.clearRect(0,0,w,h);this.drawEnvironment(game.clock);
  if(game.mode==='hub'){
   this.drawHero(game.hero,0,false);this.decorativeTitle('THE WEAVE AWAITS','Activate a run from the control panel',w*.5,100);
   return;
  }
  c.save();
  const s=game.save.settings.screenshake?game.shake:0;
  if(s>.2)c.translate(Math.sin(game.clock*79)*s*.55,Math.cos(game.clock*97)*s*.55);
  if(game.hero.transformed)this.drawFormAura(game.hero,game.clock);
  for(const p of game.particles){if(!game.save.settings.particles)continue;const a=clamp(p.life/p.maxLife,0,1);c.globalAlpha=game.save.settings.reducedFlash?Math.min(.55,a):a;
   c.fillStyle=p.color;c.beginPath();c.arc(p.x,p.y,p.size*(1.2-a*.45),0,Math.PI*2);c.fill();}
  c.globalAlpha=1;
  this.drawVfx(game.clock,true,game.save.settings);
  for(const p of game.projectiles){if(p.source==='hero'){const angle=Math.atan2(p.vy,p.vx);const id=p.formId;if(id&&id!=='base'&&this.ready(this.formVfx[id].bolt))this.drawFormVfx(this.formVfx[id].bolt,id,p.x,p.y,angle,72,34,1,game.save.settings);else this.drawSprite(this.vfx.bolt,p.x,p.y,angle,57,35,1,game.save.settings);}}
  const actors:[number,()=>void][]=[...game.enemies.map(e=>[e.y,()=>this.drawEnemy(e,game.clock,game.save.settings)] as [number,()=>void]),
   [game.hero.y,()=>this.drawHero(game.hero,game.clock,true)]];
  actors.sort((a,b)=>a[0]-b[0]);for(const [,draw] of actors)draw();
  this.drawVfx(game.clock,false,game.save.settings);c.restore();
  if(game.mode==='reward'||game.mode==='victory'||game.mode==='defeat'||game.mode==='paused'){
   c.fillStyle='rgba(2,7,17,.48)';c.fillRect(0,0,w,h);
  }
 }
 private drawEnvironment(t:number):void {
  const c=this.ctx,w=ARENA.width,h=ARENA.height;
  const gradient=c.createLinearGradient(0,0,w,h);gradient.addColorStop(0,'#102030');gradient.addColorStop(.52,'#101a2a');gradient.addColorStop(1,'#07111e');
  c.fillStyle=gradient;c.fillRect(0,0,w,h);
  // Projected 2.5D stage with layered, original floor pattern and parallax fragments.
  const f=c.createLinearGradient(0,70,0,h);f.addColorStop(0,'#203349');f.addColorStop(1,'#142337');
  c.beginPath();c.moveTo(0,90);c.lineTo(w,90);c.lineTo(w,h);c.lineTo(0,h);c.closePath();c.fillStyle=f;c.fill();
  c.strokeStyle='rgba(115,161,185,.105)';c.lineWidth=1;
  for(let i=-12;i<21;i++){c.beginPath();c.moveTo(i*92,-10);c.lineTo(i*92+210,h);c.stroke();}
  for(let j=0;j<12;j++){const y=94+j*j*5.0;c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
  c.strokeStyle='rgba(122,218,212,.15)';c.lineWidth=2;
  for(const [x,y,r] of [[190,178,81],[1010,510,130],[622,440,200]]){
   c.beginPath();c.ellipse(x,y,r,r*.48,-.17,0,Math.PI*2);c.stroke();
  }
  c.save();c.translate(604,342);c.rotate(Math.PI*.25);
  c.strokeStyle='rgba(108,218,209,.19)';c.lineWidth=3;c.strokeRect(-300,-223,600,446);
  c.strokeStyle='rgba(108,218,209,.11)';c.strokeRect(-311,-234,622,468);
  c.restore();
  for(const [x,y] of [[35,45],[1130,102],[59,610],[1100,593]]){
   c.save();c.translate(x,y);c.rotate(.1);
   c.fillStyle='#304458';c.fillRect(-18,-30,37,68);
   c.fillStyle='#152e3c';c.fillRect(-14,-26,29,60);
   c.fillStyle='#75d4d5';c.shadowColor='#75d4d5';c.shadowBlur=23;
   c.fillRect(-2,-17,5,34);c.restore();
  }
  for(let i=0;i<38;i++){
   const x=((i*239+71)%w),y=((i*131+49)%h),offset=Math.sin(t*.5+i)*3;
   c.fillStyle=`rgba(142,201,224,${.06+(i%4)*.022})`;
   c.fillRect(x,y+offset,i%3===0?2:1,i%3===0?2:1);
  }
  const vignette=c.createRadialGradient(w/2,h/2,150,w/2,h/2,740);
  vignette.addColorStop(0,'rgba(0,0,0,0)');vignette.addColorStop(1,'rgba(0,4,13,.49)');c.fillStyle=vignette;c.fillRect(0,0,w,h);
 }
 private drawShadow(x:number,y:number,scale=1):void {const c=this.ctx;c.save();c.fillStyle='rgba(1,8,17,.55)';
  c.beginPath();c.ellipse(x,y+21,23*scale,9*scale,0,0,Math.PI*2);c.fill();c.restore();}
 private drawEnemy(e:Enemy,t:number,settings:GameSettings):void {
  const c=this.ctx;c.save();this.drawShadow(e.x,e.y,e.radius/18);
  c.translate(e.x,e.y);const bob=this.reducedMotion?0:Math.sin(t*3+e.phase)*3;c.translate(clamp(e.vx*.018,-5,5),bob-10+clamp(e.vy*.012,-3,3));
  if(e.flash>0){c.translate(-e.vx*.022,-e.vy*.014);c.scale(1.12,.88);}
  else if(e.stagger>0)c.scale(.96,1.04);
  if(e.telegraph>0){const strength=this.reducedFlash?.38:.3+.3*Math.sin(e.telegraph*34);
   c.strokeStyle=`rgba(255,88,136,${strength+.3})`;c.lineWidth=3;c.beginPath();c.arc(0,0,e.radius+18,0,Math.PI*2);c.stroke();
   c.fillStyle='rgba(240,65,112,.12)';c.beginPath();c.arc(0,0,e.radius+32,0,Math.PI*2);c.fill();}
  if(e.kind==='wisp'&&this.wisp.complete&&this.wisp.naturalWidth>0){c.globalAlpha=e.flash>0?.72:1;c.drawImage(this.wisp,-e.radius*1.25,-e.radius*1.35,e.radius*2.5,e.radius*2.3);c.globalAlpha=1;
  }else if(e.kind==='wisp'){
   c.fillStyle=e.flash>0?'#ffffff':'#6ea5c9';c.strokeStyle='#b0e7f1';c.lineWidth=2;
   c.beginPath();c.moveTo(0,-21);c.lineTo(18,-7);c.lineTo(10,16);c.lineTo(-14,16);c.lineTo(-18,-4);c.closePath();c.fill();c.stroke();
   c.fillStyle='#e0ffff';c.fillRect(-8,-5,5,4);c.fillRect(3,-5,5,4);
  }else if(e.kind==='striker'){
   c.fillStyle=e.flash>0?'#ffffff':'#b66d8b';c.strokeStyle='#f4b4c8';c.lineWidth=3;
   c.beginPath();c.moveTo(0,-27);c.lineTo(21,-10);c.lineTo(16,16);c.lineTo(-16,16);c.lineTo(-21,-10);c.closePath();c.fill();c.stroke();
   c.fillStyle='#fff0f2';c.fillRect(-10,-7,7,3);c.fillRect(3,-7,7,3);
  }else{
   c.fillStyle=e.flash>0?'#ffffff':'#ab879a';c.strokeStyle='#e9b5c3';c.lineWidth=3;
   c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4;c.lineTo(Math.cos(a)*(i%2===0?33:27),Math.sin(a)*(i%2===0?33:27));}c.closePath();c.fill();c.stroke();
   c.fillStyle='#fff3d7';c.fillRect(-12,-6,8,6);c.fillRect(4,-6,8,6);
  }
  c.restore();
  const ratio=clamp(e.hp/e.maxHp,0,1);c.fillStyle='#101824';c.fillRect(e.x-25,e.y-e.radius-34,50,5);
  c.fillStyle=e.kind==='sentinel'?'#f7b989':'#dc8fb7';c.fillRect(e.x-25,e.y-e.radius-34,50*ratio,5);
  if((e.emberMarks??0)>0){const mark=this.formVfx['ember-drive'].contact;for(let i=0;i<(e.emberMarks??0);i++)this.drawFormVfx(mark,'ember-drive',e.x+(i-((e.emberMarks??0)-1)/2)*15,e.y-e.radius-54,0,16,16,.86,settings);}
 }
 private drawHero(h:Hero,t:number,inBattle:boolean):void {
  const c=this.ctx;this.drawShadow(h.x,h.y,1.05);c.save();c.translate(h.x,h.y);
  if(this.visualProof){const atlas=this.proofAtlases[this.visualProof.form];if(atlas&&this.ready(atlas)){
   const frame=this.reducedMotion?3:visualProofFrameIndex(this.visualProof.form,this.visualProof.elapsed);
   c.translate(0,-17);c.globalAlpha=!this.reducedFlash&&h.invuln>0&&Math.sin(t*32)>0?.62:1;
   c.drawImage(atlas,frame*192,0,192,256,-50,-103,100,140);c.restore();return;
  }}
  const resolved=resolveHeroAnimation(h,t);
  const committedAbility=resolved.state==='bolt'||resolved.state==='shockwave'||resolved.state==='finisher';
  const currentForm=committedAbility?h.abilityFormId:h.transformed?h.formId:'base';
  const key=`${resolved.state}:${resolved.direction}:${currentForm}`;
  if(!this.lastAnimation){this.lastAnimation=resolved;this.lastAnimationForm=currentForm;}
  else if(`${this.lastAnimation.state}:${this.lastAnimation.direction}:${this.lastAnimationForm}`!==key){
   this.previousAnimation=this.lastAnimation;
   this.previousAnimationForm=this.lastAnimationForm;
   this.transitionRemaining=this.reducedMotion?0:.07;
  }
  const now=performance.now();
  const renderDelta=this.previousRenderAt?Math.min(.05,Math.max(0,(now-this.previousRenderAt)/1000)):0;
  this.previousRenderAt=now;
  const blend=this.transitionRemaining>0?1-this.transitionRemaining/.07:1;
  const heroAlpha=h.invuln>0&&Math.sin(t*32)>0?.62:1;
  const sprite=this.fallbackAtlas(resolved.atlas);
  const authored=this.authoredAtlas(resolved.atlas);
  const legacy=this.legacyAtlas(resolved.atlas);
  const formAtlasImages:Partial<Record<Exclude<KairoFormId,'base'>,HTMLImageElement>>|null=resolved.state==='combo'?this.formCombos:resolved.state==='run'?this.formRuns:resolved.state==='idle'?this.formIdles:resolved.state==='dodge'?this.formDodges:resolved.state==='guard'||resolved.state==='parry'?this.formGuards:resolved.state==='bolt'?this.formBolts:null;
  const candidate=currentForm!=='base'?formAtlasImages?.[currentForm]:undefined;
  const formAtlasId=resolveFormAnimationAtlas(currentForm,currentForm!=='base',!!candidate&&this.ready(candidate));
  const formAtlas=formAtlasId?candidate:null;
  const atlasSource=this.forceB02?resolveAtlasSource(false,this.ready(legacy)):formAtlas?'b05':authored!==null&&this.ready(authored)?'b04':resolveAtlasSource(this.ready(sprite),this.ready(legacy));
  const bob=this.reducedMotion?0:(resolved.state==='idle'?Math.sin(h.step*.018)*.7:0);
  c.translate(0,bob-17);
  if(atlasSource==='b05'){
   if(h.transformVisualTime>0)this.drawIgnition(h);
   const animationDelta=this.transitionRemaining>0?blend:1;
   if(this.previousAnimation&&this.transitionRemaining>0){
    const oldImage=this.animationImage(this.previousAnimation,this.previousAnimationForm);
    if(this.ready(oldImage))this.drawDirectionalFrame(oldImage,this.previousAnimation,heroAlpha*(1-animationDelta));
   }
   this.drawDirectionalFrame(formAtlas!,resolved,heroAlpha*animationDelta);
   this.transitionRemaining=Math.max(0,this.transitionRemaining-renderDelta);
   this.lastAnimation=resolved;this.lastAnimationForm=currentForm;
   if(this.transitionRemaining===0)this.previousAnimation=null;
   c.restore();return;
  }
  if(atlasSource==='b04'||atlasSource==='b03'){
   if(h.transformVisualTime>0)this.drawIgnition(h);
   const animationDelta=this.transitionRemaining>0?blend:1;
   if(this.previousAnimation&&this.transitionRemaining>0){
    const oldImage=this.animationImage(this.previousAnimation,this.previousAnimationForm);
    if(this.ready(oldImage))this.drawDirectionalFrame(oldImage,this.previousAnimation,heroAlpha*(1-animationDelta));
   }
   this.drawDirectionalFrame(atlasSource==='b04'?authored!:sprite,resolved,heroAlpha*animationDelta);
   this.transitionRemaining=Math.max(0,this.transitionRemaining-renderDelta);
   this.lastAnimation=resolved;this.lastAnimationForm=currentForm;
   if(this.transitionRemaining===0)this.previousAnimation=null;
   c.restore();return;
  }
  // If B03 atlases fail to load, use the B02 strip where available, then the vector fallback below.
  if(atlasSource==='b02'){
   if(Math.cos(h.face)<0)c.scale(-1,1);
   if(h.transformVisualTime>0)this.drawIgnition(h);
   const frames=resolved.atlas==='idle'||resolved.atlas==='run'?8:resolved.atlas==='combo'?12:resolved.atlas==='dodge'?6:8;
   const fw=legacy.naturalWidth/frames;
   c.globalAlpha=heroAlpha;
   c.drawImage(legacy,resolved.frame%frames*fw,0,fw,legacy.naturalHeight,-50,-103,100,140);
   c.globalAlpha=1;
   c.restore();return;
  }
  c.rotate(h.dashTime>0?-.27*Math.sin(h.face):0);
  c.strokeStyle=h.transformed?'#ffd5a6':'#324455';c.lineWidth=6;c.lineCap='round';
  c.beginPath();c.moveTo(-8,13);c.lineTo(-12,31);c.moveTo(7,13);c.lineTo(11,31);c.stroke();
  // Cropped, split charcoal jacket and bronze cuff details: concept-only vector proxy.
  c.fillStyle=h.hitFlash>0?'#ffffff':'#29374c';c.beginPath();c.moveTo(-15,-23);c.lineTo(15,-23);c.lineTo(15,14);c.lineTo(0,7);c.lineTo(-15,17);c.closePath();c.fill();
  c.fillStyle=h.transformed?'#f9ce98':'#ca916c';c.fillRect(-3,-20,7,25);
  c.strokeStyle='#d5a982';c.lineWidth=7;c.beginPath();c.moveTo(-12,-14);c.lineTo(-21,2);c.moveTo(13,-14);c.lineTo(22,1);c.stroke();
  c.fillStyle='#9e684b';c.beginPath();c.arc(0,-32,15,0,Math.PI*2);c.fill();
  // Asymmetric plum hair / no borrowed gold-spiky shonen silhouette.
  c.fillStyle=h.transformed?'#ffcca0':'#59415c';c.beginPath();c.moveTo(-16,-36);c.lineTo(-14,-52);c.lineTo(-2,-46);
  c.lineTo(8,-51);c.lineTo(14,-39);c.lineTo(13,-28);c.lineTo(-13,-29);c.closePath();c.fill();
  c.fillStyle='#f3c5af';c.fillRect(-8,-31,6,2);c.fillRect(3,-31,6,2);
  c.save();c.rotate(h.face);c.fillStyle=h.transformed?'#ffe1a9':'#b89573';c.fillRect(10,-6,23,9);
  c.fillStyle='#f2d4a6';c.fillRect(29,-7,8,10);c.restore();
  if(inBattle&&h.guardTime>0){c.strokeStyle='#b3f5e7';c.lineWidth=4;c.globalAlpha=.8;
   c.beginPath();c.arc(0,-12,43,h.face-.95,h.face+.95);c.stroke();}
  c.restore();
 }
 private ready(image:HTMLImageElement):boolean {return image.complete&&image.naturalWidth>0;}
 private fallbackAtlas(atlas:ResolvedAnimation['atlas']):HTMLImageElement {if(atlas==='idle')return this.directional.idle;if(atlas==='run')return this.directional.run;if(atlas==='dodge')return this.directional.dodge;if(atlas==='combo')return this.directional.combo;return this.directional.states;}
 private authoredAtlas(atlas:ResolvedAnimation['atlas']):HTMLImageElement|null {if(atlas==='combo')return this.authored.combo;if(atlas==='locomotionTransitions')return this.authored.transitions;if(atlas==='bolt')return this.authored.bolt;if(atlas==='shockwave')return this.authored.shockwave;if(atlas==='guardParry')return this.authored.guardParry;if(atlas==='finisher')return this.authored.finisher;return null;}
 private animationImage(animation:ResolvedAnimation,formId:KairoFormId):HTMLImageElement {
  if(formId!=='base') {const candidate=animation.atlas==='combo'?this.formCombos[formId]:animation.atlas==='run'?this.formRuns[formId]:animation.atlas==='idle'?this.formIdles[formId]:animation.atlas==='dodge'?this.formDodges[formId]:animation.atlas==='guardParry'?this.formGuards[formId]:animation.atlas==='bolt'?this.formBolts[formId]:null;if(candidate&&this.ready(candidate))return candidate;}
  const authored=this.authoredAtlas(animation.atlas);return authored&&this.ready(authored)?authored:this.fallbackAtlas(animation.atlas);
 }
 private legacyAtlas(atlas:ResolvedAnimation['atlas']):HTMLImageElement {
  if(atlas==='idle')return this.idle;if(atlas==='run')return this.run;if(atlas==='dodge')return this.dodge;
  if(atlas==='combo')return this.combo;return this.states;
 }
 private drawDirectionalFrame(image:HTMLImageElement,animation:ResolvedAnimation,alpha:number):void {
  if(alpha<=0)return;
  const c=this.ctx,frameWidth=192,frameHeight=256;
  c.save();c.globalAlpha=alpha;
  if(this.reducedFlash&&this.directional.states===image&&animation.state==='hurt')c.globalAlpha*=.72;
  c.drawImage(image,animation.frame*frameWidth,animation.directionRow*frameHeight,frameWidth,frameHeight,-50,-103,100,140);
  c.restore();
 }
 private drawIgnition(h:Hero):void {
  if(h.formId==='base')return;const image=this.formVfx[h.formId].activation;if(!this.ready(image))return;
  const c=this.ctx,progress=clamp(1-h.transformVisualTime/h.transformVisualDuration,0,1);const size=this.reducedMotion?110:95+progress*45;
  c.save();c.globalAlpha=(this.reducedFlash?.3:.55)*(1-progress*.55);c.drawImage(image,-size/2,-size*.55,size,size);c.restore();
 }
 private drawFormAura(h:Hero,t:number):void {
  if(h.formId==='base')return;const images=this.formVfx[h.formId],c=this.ctx;
  const image=h.formId==='glass-current'?images.transition:images.activation;if(!this.ready(image))return;
  c.save();c.translate(h.x,h.y-24);c.globalAlpha=this.reducedFlash?.14:.23;
  const pulse=this.reducedMotion?0:Math.sin(t*(h.formId==='glass-current'?2:4))*3;
  c.drawImage(image,-66-pulse,-67-pulse,132+pulse*2,124+pulse*2);c.restore();
 }
 private drawSprite(image:HTMLImageElement,x:number,y:number,angle:number,width:number,height:number,alpha:number,settings:GameSettings):void {
  if(!this.ready(image)||alpha<=.01)return;const c=this.ctx;c.save();c.translate(x,y);c.rotate(angle);
  c.globalAlpha=alpha*(settings.reducedFlash ? .58 : 1);c.shadowColor='#79dce4';c.shadowBlur=settings.reducedFlash?0:12;
  c.drawImage(image,-width/2,-height/2,width,height);c.restore();
 }
 private formVfxFor(event:CombatEvent):{key:FormVfxKey;image:HTMLImageElement}|null {
  if(!event.formId||event.formId==='base')return null;
  const id=event.id;
  const key:FormVfxKey|undefined=id==='ember-start'||id==='glass-start'?'activation':id==='ember-end'||id==='glass-end'?'transition':
   id==='combo-contact'?'contact':id==='bolt-cast'||id==='bolt-hit'||id==='bolt-dissipate'?'bolt':
   id==='shockwave-release'||id==='glass-counter'||id==='parry'||id==='ember-detonate'?'special':
   id==='finisher-build'||id==='finisher-hit'||id==='finisher-fade'?'finisher':
   id==='dash-start'||id==='dash-land'?'transition':undefined;
  if(!key)return null;const image=this.formVfx[event.formId][key];return this.ready(image)?{key,image}:null;
 }
 private drawFormVfx(image:HTMLImageElement,formId:Exclude<KairoFormId,'base'>,x:number,y:number,angle:number,width:number,height:number,alpha:number,settings:GameSettings):void {
  if(!this.ready(image)||alpha<=.01)return;const c=this.ctx;c.save();c.translate(x,y);c.rotate(angle);
  c.globalAlpha=alpha*(settings.reducedFlash ? .58 : 1);c.shadowColor=formId==='ember-drive'?'#ff995d':'#80dcf0';c.shadowBlur=settings.reducedFlash?0:5;
  c.drawImage(image,-width/2,-height/2,width,height);c.restore();
 }
 private drawVfx(clock:number,behind:boolean,settings:GameSettings):void {
  this.effects=this.effects.filter(effect=>clock-effect.start<=effect.duration);
  for(const effect of this.effects){
   const id=effect.event.id;const isBehind=['shockwave-charge','shockwave-release','dash-start','dash-land'].includes(id);
   const custom=this.formVfxFor(effect.event);
   const customBehind=custom&&(custom.key==='activation'||custom.key==='transition'||custom.key==='special');
   const p=clamp((clock-effect.start)/effect.duration,0,1),motion=settings.reducedMotion ? .48 : p;
   let angle=effect.event.angle??0;let x=effect.event.x;let y=effect.event.y;
   if(custom&&effect.event.formId&&effect.event.formId!=='base'){
    if(behind!==customBehind){
     if(settings.particles&&!settings.reducedMotion){
      const formId=effect.event.formId,layer=custom.key==='contact'?this.formVfx[formId].transition:this.formVfx[formId].contact;
      const travel=(formId==='glass-current'?-1:1)*p*18,layerAlpha=Math.sin(Math.PI*p)*.38;
      this.drawFormVfx(layer,formId,x+Math.cos(angle)*travel,y+Math.sin(angle)*travel,angle+(formId==='glass-current'?-.2:.2),74+motion*28,64+motion*24,layerAlpha,settings);
     }
     continue;
    }
    let width=150,height=120,alpha=.8*(1-p*.65);
    if(custom.key==='activation'){width=190+motion*90;height=190+motion*90;alpha=.82*(1-p*.72);}
    else if(custom.key==='transition'){width=150+motion*100;height=120+motion*80;alpha=.68*(1-p);}
    else if(custom.key==='contact'){width=100+motion*44;height=90+motion*40;alpha=.96*(1-p*.65);}
    else if(custom.key==='bolt'){width=id==='bolt-cast'?178:118;height=id==='bolt-cast'?58:112;alpha=(id==='bolt-cast'?.92:.84)*(1-p);}
    else if(custom.key==='special'){width=212+motion*70;height=170+motion*45;alpha=.9*(1-p*.76);}
    else if(custom.key==='finisher'){width=(id==='finisher-hit'?270:220)+motion*60;height=width*.72;alpha=(id==='finisher-hit'?1:.78)*(1-p*.78);if(effect.event.formId==='ember-drive')angle+=Math.PI/4;}
    this.drawFormVfx(custom.image,effect.event.formId,x,y,angle,width,height,alpha,settings);continue;
   }
   if(isBehind!==behind)continue;
   let image:HTMLImageElement;let width:number;let height:number;let alpha=1;
   if(id==='shockwave-charge'||id==='shockwave-release'){
    image=this.vfx.shockwave;width=95+motion*300;height=47+motion*106;alpha=id==='shockwave-charge'?.74*(1-p*.3):.9*(1-p);
    y+=8;
   }else if(id==='dash-start'||id==='dash-land'){
    image=this.vfx.dodge;width=id==='dash-start'?118+motion*44:130;height=54;alpha=id==='dash-start'?.76*(1-p):.62*(1-p);
    angle+=Math.PI/4;x-=Math.cos(angle)*7;y-=Math.sin(angle)*5;
   }else if(id==='parry'||id==='block'){
    image=this.vfx.parry;width=id==='parry'?118:78;height=id==='parry'?105:70;alpha=(id==='parry'?.98:.58)*(1-p);
   }else if(id==='finisher-build'||id==='finisher-hit'||id==='finisher-fade'){
    image=this.vfx.finisher;width=(id==='finisher-hit'?210:155)+motion*(id==='finisher-hit'?80:25);height=width*.66;
    alpha=(id==='finisher-build'?.72:id==='finisher-hit'?1:.7)*(1-p*.78);angle+=Math.PI/4;
   }else if(id==='bolt-cast'){
    image=this.vfx.bolt;width=74;height=43;alpha=.9*(1-p);angle+=Math.PI/4;
   }else{
    image=this.vfx.combo;const hit=effect.event.comboIndex??1;
    width=(id==='combo-contact'?72+hit*22:60)*(1+motion*.22);height=width*.72;alpha=(id==='combo-contact'?1:.5)*(1-p);
    angle+=Math.PI/4;
   }
   this.drawSprite(image,x,y,angle,width,height,alpha,settings);
  }
 }
 private decorativeTitle(title:string,sub:string,x:number,y:number):void {
  const c=this.ctx;c.save();c.textAlign='center';c.fillStyle='#a4c8cf';c.font='600 12px sans-serif';c.letterSpacing='6px';c.fillText(title,x,y);
  c.fillStyle='#58788c';c.font='15px sans-serif';c.letterSpacing='1px';c.fillText(sub,x,y+33);c.restore();
 }
}
