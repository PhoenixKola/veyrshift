import { ARENA } from '../data/encounters.js';
import type { CombatEvent, Enemy, GameSettings, Hero, KairoFormId } from '../core/types.js';
import type { CombatSession } from '../runtime/CombatSession.js';
import { resolveAtlasSource, resolveFormAnimationAtlas, resolveHeroAnimation, type ResolvedAnimation } from '../animation/animationResolver.js';
import { clamp } from '../core/math.js';
import { visualProofFrameIndex, visualRigCutoutPose, type VisualProofForm } from '../animation/visualBreakthrough.js';
type FormVfxKey = 'activation'|'contact'|'bolt'|'special'|'finisher'|'transition';
type FormShift = { formId: Exclude<KairoFormId,'base'>; phase: 'activate'|'deactivate'; start: number; duration: number };
type FormParticle = { formId: Exclude<KairoFormId,'base'>; start: number; duration: number; x: number; y: number; vx: number; vy: number; size: number; angle: number; spin: number; source: 'contact'|'transition'; behind: boolean };
const heroAlphaFor = (hero:Hero,time:number):number => hero.invuln>0&&Math.sin(time*32)>0?.62:1;
export class CanvasRenderer {
 private ctx:CanvasRenderingContext2D;
 private reducedMotion=false;
 private reducedFlash=false;
 private particlesEnabled=true;
 private forceB02:boolean;
 private proofAtlases:Partial<Record<VisualProofForm,HTMLImageElement>>={};
 private visualProof:{form:VisualProofForm;elapsed:number}|null=null;
 private rigCutout:HTMLImageElement|null=null;
 private rigCutoutProof:{elapsed:number;duration:number;scale:number}|null=null;
 private formShift:FormShift|null=null;
 private formParticles:FormParticle[]=[];
 private proofScale=1;
 private proofBackground:'dark'|'midtone'='dark';
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
 private production={
  base:{idle:this.load('/assets/characters/kairo/b05-ember-production/base/idle.webp'),run:this.load('/assets/characters/kairo/b05-ember-production/base/run.webp'),combo:this.load('/assets/characters/kairo/b05-ember-production/base/combo.webp')},
  'ember-drive':{idle:this.load('/assets/characters/kairo/b05-ember-production/ember/idle.webp'),run:this.load('/assets/characters/kairo/b05-ember-production/ember/run.webp'),combo:this.load('/assets/characters/kairo/b05-ember-production/ember/combo.webp'),shockwave:this.load('/assets/characters/kairo/b05-ember-production/ember/special.webp'),finisher:this.load('/assets/characters/kairo/b05-ember-production/ember/finisher.webp'),activation:this.load('/assets/characters/kairo/b05-ember-production/ember/activation.webp')},
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
  };
   this.rigCutout=this.load('/art-source/b05/visual-breakthrough/ember-reinterpretation-from-glass-b-reference-v1.png');
  }
  this.assetsReady=Promise.all([...Object.values(this.directional),...Object.values(this.authored),...Object.values(this.production).flatMap(form=>Object.values(form)),...Object.values(this.formCombos),...Object.values(this.formRuns),...Object.values(this.formIdles),...Object.values(this.formDodges),...Object.values(this.formGuards),...Object.values(this.formBolts),...Object.values(this.formVfx).flatMap(form=>Object.values(form)),...Object.values(this.vfx),...Object.values(this.proofAtlases),this.rigCutout??this.idle,this.idle,this.run,this.combo,this.dodge,this.states,this.wisp].map(image=>image.decode().catch(()=>undefined))).then(()=>undefined);
 }
 setVisualProof(form:VisualProofForm|null,elapsed=0):void {this.visualProof=form?{form,elapsed}:null;}
 setRigCutoutProof(elapsed:number|null,duration=1.7,scale=1):void {this.rigCutoutProof=elapsed===null?null:{elapsed,duration,scale};}
 setProofDisplay(scale:1|.75,background:'dark'|'midtone'='dark'):void {this.proofScale=scale;this.proofBackground=background;}
 emit(events:CombatEvent[],clock:number):void {
  const durations:Partial<Record<CombatEvent['id'],number>>={'bolt-cast':.22,'bolt-hit':.23,'bolt-dissipate':.2,'combo-contact':.23,swing:.19,
   'shockwave-charge':.24,'shockwave-release':.48,'shockwave-hit':.22,parry:.23,block:.17,'dash-start':.24,'dash-land':.22,
   'finisher-build':.3,'finisher-hit':.38,'finisher-fade':.32,'ember-start':.5,'ember-end':.28,'ember-detonate':.36,'glass-start':.5,'glass-end':.28,'glass-counter':.3};
  for(const event of events){
   const duration=durations[event.id];if(duration)this.effects.push({event,start:clock,duration});
   if((event.id==='ember-start'||event.id==='glass-start')&&event.formId&&event.formId!=='base')this.formShift={formId:event.formId,phase:'activate',start:clock,duration:.52};
   if((event.id==='ember-end'||event.id==='glass-end')&&event.formId&&event.formId!=='base')this.formShift={formId:event.formId,phase:'deactivate',start:clock,duration:.42};
   if(event.formId&&event.formId!=='base')this.spawnFormParticles(event,clock);
  }
  if(this.effects.length>80)this.effects.splice(0,this.effects.length-80);
  if(this.formParticles.length>140)this.formParticles.splice(0,this.formParticles.length-140);
 }
 private spawnFormParticles(event:CombatEvent,clock:number):void {
  const formId=event.formId;if(!formId||formId==='base')return;
  const activation=event.id==='ember-start'||event.id==='glass-start';
  const impact=event.id==='combo-contact'||event.id==='ember-detonate'||event.id==='bolt-hit'||event.id==='shockwave-hit'||event.id==='glass-counter'||event.id==='finisher-hit'||event.id==='parry';
  const count=activation?16:event.id==='finisher-hit'?22:event.id==='ember-detonate'?18:impact?9:event.id==='dash-start'?7:0;
  if(!count)return;
  let seed=(Math.floor(event.x*17+event.y*31+clock*997+(event.comboIndex??0)*211+event.id.length*73)>>>0)||1;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const direction=event.angle??0,behind=activation||event.id==='dash-start'||event.id==='finisher-build';
  for(let i=0;i<count;i++){
   const spread=(random()-.5)*(formId==='ember-drive'?1.35:1.8),angle=direction+spread;
   const speed=(formId==='ember-drive'?42:28)+random()*(formId==='ember-drive'?154:104);
   this.formParticles.push({formId,start:clock,duration:.34+random()*.42,x:event.x,y:event.y,
    vx:Math.cos(angle)*speed+(formId==='glass-current'?-Math.sin(angle)*24:0),
    vy:Math.sin(angle)*speed-(formId==='glass-current'?Math.cos(angle)*18:0),size:10+random()*13,
    angle,spin:(random()-.5)*(formId==='ember-drive'?7:4),source:formId==='ember-drive'?'contact':'transition',behind});
  }
 }
 private drawFormParticles(clock:number,behind:boolean,settings:GameSettings):void {
  this.formParticles=this.formParticles.filter(particle=>clock-particle.start<particle.duration);
  if(!settings.particles)return;
  for(const particle of this.formParticles){
   if(particle.behind!==behind)continue;
   const progress=clamp((clock-particle.start)/particle.duration,0,1);
   if(settings.reducedMotion&&progress>.18)continue;
   const age=settings.reducedMotion?0:Math.max(0,clock-particle.start);
   const gravity=particle.formId==='ember-drive'?135:8;
   const driftX=particle.formId==='glass-current'?Math.sin(age*9+particle.angle)*8:0;
   const image=this.formVfx[particle.formId][particle.source];
   this.drawFormVfx(image,particle.formId,particle.x+particle.vx*age+driftX,
    particle.y+particle.vy*age+gravity*age*age*.5,particle.angle+particle.spin*age,
    particle.size*(1-progress*.45),particle.size*(.7+progress*.3),Math.sin(Math.PI*progress)*.58,settings);
  }
 }
 private drawHeroProjectile(projectile:import('../core/types.js').Projectile,settings:GameSettings):void {
  const angle=Math.atan2(projectile.vy,projectile.vx),formId=projectile.formId;
  if(!formId||formId==='base'||!this.ready(this.formVfx[formId].bolt)){
   this.drawSprite(this.vfx.bolt,projectile.x,projectile.y,angle,57,35,1,settings);return;
  }
  const image=this.formVfx[formId].bolt,travel=projectile.age;
  if(settings.particles&&!settings.reducedMotion){
   const layers=formId==='glass-current'?4:3;
   for(let i=layers;i>0;i--){
    const lag=.013*i,decay=1-i/(layers+1);
    this.drawFormVfx(this.formVfx[formId].transition,formId,projectile.x-projectile.vx*lag,projectile.y-projectile.vy*lag,
     angle+(formId==='glass-current'?-.03:.06),formId==='ember-drive'?86:70,formId==='ember-drive'?30:20,.13+decay*.16,settings);
   }
  }
  const width=(formId==='ember-drive'?72:88)*(1+Math.min(.12,travel*.3));
  this.drawFormVfx(image,formId,projectile.x,projectile.y,angle,width,formId==='ember-drive'?32:22,.94,settings);
 }
 private load(src:string):HTMLImageElement {const image=new Image();image.decoding='async';image.src=location.protocol==='file:'?new URL(`.${src}`,location.href).href:src;return image;}
 render(game:CombatSession):void {
  const c=this.ctx,w=ARENA.width,h=ARENA.height;
  this.reducedMotion=game.save.settings.reducedMotion;this.reducedFlash=game.save.settings.reducedFlash;this.particlesEnabled=game.save.settings.particles;
  c.clearRect(0,0,w,h);this.drawEnvironment(game.clock);
  if(game.mode==='hub'){
   this.drawHero(game.hero,0,false);this.decorativeTitle('THE WEAVE AWAITS','Activate a run from the control panel',w*.5,100);
   return;
  }
  c.save();
  if(this.proofScale!==1){c.translate(w*(1-this.proofScale)*.5,h*(1-this.proofScale));c.scale(this.proofScale,this.proofScale);}
  const s=game.save.settings.screenshake?game.shake:0;
  if(s>.2)c.translate(Math.sin(game.clock*79)*s*.55,Math.cos(game.clock*97)*s*.55);
  if(game.hero.transformed)this.drawFormAura(game.hero,game.clock,game.save.settings);
  for(const p of game.particles){if(!game.save.settings.particles)continue;const a=clamp(p.life/p.maxLife,0,1);c.globalAlpha=game.save.settings.reducedFlash?Math.min(.55,a):a;
   c.fillStyle=p.color;c.beginPath();c.arc(p.x,p.y,p.size*(1.2-a*.45),0,Math.PI*2);c.fill();}
  c.globalAlpha=1;
  this.drawVfx(game.clock,true,game.save.settings);
  for(const p of game.projectiles){if(p.source==='hero')this.drawHeroProjectile(p,game.save.settings);}
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
  const midtone=this.proofBackground==='midtone';
  const gradient=c.createLinearGradient(0,0,w,h);gradient.addColorStop(0,midtone?'#56535b':'#102030');gradient.addColorStop(.52,midtone?'#45444f':'#101a2a');gradient.addColorStop(1,midtone?'#343744':'#07111e');
  c.fillStyle=gradient;c.fillRect(0,0,w,h);
  // Projected 2.5D stage with layered, original floor pattern and parallax fragments.
  const f=c.createLinearGradient(0,70,0,h);f.addColorStop(0,midtone?'#686572':'#203349');f.addColorStop(1,midtone?'#494956':'#142337');
  c.beginPath();c.moveTo(0,90);c.lineTo(w,90);c.lineTo(w,h);c.lineTo(0,h);c.closePath();c.fillStyle=f;c.fill();
  c.strokeStyle=midtone?'rgba(24,27,38,.17)':'rgba(115,161,185,.105)';c.lineWidth=1;
  for(let i=-12;i<21;i++){c.beginPath();c.moveTo(i*92,-10);c.lineTo(i*92+210,h);c.stroke();}
  for(let j=0;j<12;j++){const y=94+j*j*5.0;c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
  c.strokeStyle=midtone?'rgba(30,35,48,.20)':'rgba(122,218,212,.15)';c.lineWidth=2;
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
  const c=this.ctx;if(!this.rigCutoutProof)this.drawShadow(h.x,h.y,1.05);c.save();c.translate(h.x,h.y);
  if(this.visualProof){const atlas=this.proofAtlases[this.visualProof.form];if(atlas&&this.ready(atlas)){
   const frame=this.reducedMotion?3:visualProofFrameIndex(this.visualProof.form,this.visualProof.elapsed);
   c.translate(0,-17);c.globalAlpha=!this.reducedFlash&&h.invuln>0&&Math.sin(t*32)>0?.62:1;
   c.drawImage(atlas,frame*192,0,192,256,-50,-103,100,140);c.restore();return;
  }}
  if(this.rigCutoutProof&&this.rigCutout&&this.ready(this.rigCutout)){
   const pose=visualRigCutoutPose(this.rigCutoutProof.elapsed,this.rigCutoutProof.duration),scale=this.rigCutoutProof.scale;
   c.restore();this.drawShadow(h.x+pose.x*scale,h.y+pose.y*scale,1.05*scale);c.save();
   c.translate(h.x+pose.x*scale,h.y-17+pose.y*scale);c.rotate(pose.rotation);c.scale(scale,scale);
   c.globalAlpha=h.invuln>0&&Math.sin(t*32)>0?.62:1;
   c.drawImage(this.rigCutout,1040,0,372,887,-29.35,-103,58.7,140);c.restore();return;
  }
  const heroAlpha=heroAlphaFor(h,t);
  if(this.formShift&&this.drawFormShift(h,t,heroAlpha)){c.restore();return;}
  const resolved=resolveHeroAnimation(h,t);
  const committedAbility=resolved.state==='bolt'||resolved.state==='shockwave'||resolved.state==='finisher';
  const currentForm=committedAbility?h.abilityFormId:resolved.state==='combo'&&h.attackTime>0?h.attackFormId:h.transformed?h.formId:'base';
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
  const sprite=this.fallbackAtlas(resolved.atlas);
  const authored=this.authoredAtlas(resolved.atlas);
  const legacy=this.legacyAtlas(resolved.atlas);
  const formAtlasImages:Partial<Record<Exclude<KairoFormId,'base'>,HTMLImageElement>>|null=resolved.atlas==='combo'?this.formCombos:resolved.atlas==='run'?this.formRuns:resolved.atlas==='idle'?this.formIdles:resolved.atlas==='dodge'?this.formDodges:resolved.atlas==='guardParry'||resolved.atlas==='states'?resolved.state==='ember'?this.formIdles:this.formGuards:resolved.atlas==='bolt'?this.formBolts:null;
  const productionAtlas=this.productionImage(resolved,currentForm);
  const candidate=currentForm!=='base'?formAtlasImages?.[currentForm]:undefined;
  const formAtlasId=resolveFormAnimationAtlas(currentForm,currentForm!=='base',!!candidate&&this.ready(candidate));
  const formAtlas=productionAtlas??(formAtlasId?candidate:null);
  const atlasSource=this.forceB02?resolveAtlasSource(false,this.ready(legacy)):formAtlas?'b05':authored!==null&&this.ready(authored)?'b04':resolveAtlasSource(this.ready(sprite),this.ready(legacy));
  const bob=this.reducedMotion?0:(resolved.state==='idle'?Math.sin(h.step*.018)*.7:0);
  c.translate(0,bob-17);
  // A short body drive carries each authored strike into its actual active window.
  // The body returns during recovery; collision timing stays in CombatSession.
  if(resolved.state==='combo'&&h.attackTime>0&&!this.reducedMotion){
   const contact=clamp(h.attackAnimTime/Math.max(.001,h.attackStartup),0,1);
   const settle=clamp(h.attackTime/Math.max(.001,h.attackDuration-h.attackStartup),0,1);
   const drive=Math.sin(Math.PI*.5*contact)*Math.min(1,settle*2);
   const distance=(h.combo===3?6:4)*(currentForm==='ember-drive'?1.18:1);
   c.translate(Math.cos(h.actionAngle)*distance*drive,Math.sin(h.actionAngle)*distance*.55*drive);
  }
  if(atlasSource==='b05'){
   if(h.transformVisualTime>0)this.drawIgnition(h);
   const animationDelta=this.transitionRemaining>0?blend:1;
   if(this.previousAnimation&&this.transitionRemaining>0){
    const oldImage=this.animationImage(this.previousAnimation,this.previousAnimationForm);
    if(this.ready(oldImage))this.drawDirectionalFrame(oldImage,this.previousAnimation,heroAlpha*(1-animationDelta));
   }
   if(resolved.state==='dodge'&&currentForm==='glass-current')this.drawGlassAfterimages(formAtlas!,resolved,h,heroAlpha);
   this.drawDirectionalFrame(formAtlas!,resolved,heroAlpha*animationDelta);
   if(currentForm==='ember-drive')this.drawEmberBodyEnergy(resolved,h,t,heroAlpha*animationDelta);
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
 private drawFormShift(h:Hero,t:number,alpha:number):boolean {
  const shift=this.formShift;if(!shift)return false;
  const state=resolveHeroAnimation(h,t).state;
  const committed=state==='combo'&&h.attackTime>0||['bolt','shockwave','finisher'].includes(h.currentAbility??'');
  if(shift.phase==='deactivate'&&committed){shift.start=t;return false;}
  const raw=clamp((t-shift.start)/shift.duration,0,1);
  if(raw>=1){this.formShift=null;return false;}
  const activation=this.production['ember-drive'].activation;
  if(shift.formId==='ember-drive'&&this.ready(activation)&&resolveHeroAnimation({...h,transformVisualTime:0},t).direction==='right'){
   const frame=Math.min(3,Math.floor(raw*4));
   const source=shift.phase==='activate'?frame:3-frame;
   const c=this.ctx;c.translate(0,-17);c.globalAlpha=alpha;
   c.drawImage(activation,source*192,0,192,256,-50,-103,100,140);
   return true;
  }
  const blend=raw*raw*(3-2*raw);
  const clean={...h,transformVisualTime:0};
  const baseHero={...clean,transformed:false};
  const formHero={...clean,transformed:true,formId:shift.formId};
  const baseAnimation=resolveHeroAnimation(baseHero,t),formAnimation=resolveHeroAnimation(formHero,t);
  const fromAnimation=shift.phase==='activate'?baseAnimation:formAnimation;
  const toAnimation=shift.phase==='activate'?formAnimation:baseAnimation;
  const fromForm=shift.phase==='activate'?'base':shift.formId;
  const toForm=shift.phase==='activate'?shift.formId:'base';
  const c=this.ctx;c.translate(0,-17);
  const fromImage=this.animationImage(fromAnimation,fromForm),toImage=this.animationImage(toAnimation,toForm);
  if(this.ready(fromImage))this.drawDirectionalFrame(fromImage,fromAnimation,alpha*(1-blend));
  if(this.ready(toImage))this.drawDirectionalFrame(toImage,toAnimation,alpha*blend);
  this.lastAnimation=toAnimation;this.lastAnimationForm=toForm;this.previousAnimation=null;this.previousAnimationForm=toForm;this.transitionRemaining=0;
  return true;
 }
 private drawGlassAfterimages(image:HTMLImageElement,animation:ResolvedAnimation,h:Hero,alpha:number):void {
  if(!this.particlesEnabled||this.reducedMotion||h.dashTime<=0)return;
  const c=this.ctx;
  for(let index=2;index>=1;index--){
   const lag=.014*index;
   c.save();c.globalCompositeOperation='screen';
   c.translate(-h.vx*lag,-h.vy*lag);
   this.drawDirectionalFrame(image,animation,alpha*(index===1?.17:.10));
   c.restore();
  }
 }
 private ready(image:HTMLImageElement):boolean {return image.complete&&image.naturalWidth>0;}
 private productionImage(animation:ResolvedAnimation,formId:KairoFormId):HTMLImageElement|null {
  if(formId==='glass-current')return null;
  const form=this.production[formId];
  const candidate=animation.atlas==='idle'?form.idle:animation.atlas==='run'?form.run:animation.atlas==='combo'?form.combo:formId==='ember-drive'&&animation.direction==='right'&&animation.atlas==='shockwave'?this.production['ember-drive'].shockwave:formId==='ember-drive'&&animation.direction==='right'&&animation.atlas==='finisher'?this.production['ember-drive'].finisher:null;
  return candidate&&this.ready(candidate)?candidate:null;
 }
 private fallbackAtlas(atlas:ResolvedAnimation['atlas']):HTMLImageElement {if(atlas==='idle')return this.directional.idle;if(atlas==='run')return this.directional.run;if(atlas==='dodge')return this.directional.dodge;if(atlas==='combo')return this.directional.combo;return this.directional.states;}
 private authoredAtlas(atlas:ResolvedAnimation['atlas']):HTMLImageElement|null {if(atlas==='combo')return this.authored.combo;if(atlas==='locomotionTransitions')return this.authored.transitions;if(atlas==='bolt')return this.authored.bolt;if(atlas==='shockwave')return this.authored.shockwave;if(atlas==='guardParry')return this.authored.guardParry;if(atlas==='finisher')return this.authored.finisher;return null;}
 private animationImage(animation:ResolvedAnimation,formId:KairoFormId):HTMLImageElement {
  const production=this.productionImage(animation,formId);if(production)return production;
  if(formId!=='base') {
   const candidate=animation.atlas==='combo'?this.formCombos[formId]:animation.atlas==='run'?this.formRuns[formId]:animation.atlas==='idle'?this.formIdles[formId]:animation.atlas==='dodge'?this.formDodges[formId]:animation.atlas==='guardParry'?this.formGuards[formId]:animation.atlas==='states'?animation.state==='ember'?this.formIdles[formId]:this.formGuards[formId]:animation.atlas==='bolt'?this.formBolts[formId]:null;
   if(candidate&&this.ready(candidate))return candidate;
  }
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
 private drawEmberBodyEnergy(animation:ResolvedAnimation,h:Hero,t:number,alpha:number):void {
  if(!this.particlesEnabled||alpha<=.01)return;
  const image=this.formVfx['ember-drive'].contact;if(!this.ready(image))return;
  const activity=animation.state==='combo'&&h.attackTime>0
   ? .28+.48*Math.sin(Math.PI*clamp(h.attackAnimTime/Math.max(.001,h.attackDuration),0,1))
   : animation.state==='finisher'?.7:animation.state==='run'?.32:.2;
  const pulse=this.reducedMotion?0:Math.sin(t*9)*.045;
  const side=animation.direction==='left'?-1:1;
  const anchors=animation.direction==='front'?[[-19,-35],[18,-35]]:animation.direction==='back'?[[-18,-30],[17,-30]]:[[side*23,-35]];
  const c=this.ctx;c.save();c.globalCompositeOperation='screen';
  c.globalAlpha=alpha*(this.reducedFlash?.45:1)*(activity+pulse);
  for(const [x,y] of anchors)c.drawImage(image,x-17,y-13,34,26);
  c.restore();
 }
 private drawFormAura(h:Hero,t:number,settings:GameSettings):void {
  if(h.formId==='base')return;
  const images=this.formVfx[h.formId],c=this.ctx;
  if(!this.ready(images.activation)||!this.ready(images.transition))return;
  const moving=settings.particles&&!settings.reducedMotion,phase=moving?t*(h.formId==='ember-drive'?1.9:-1.35):0;
  const pulse=moving?Math.sin(t*(h.formId==='ember-drive'?3.2:1.6)):0;
  c.save();c.translate(h.x,h.y-29);
  if(h.formId==='ember-drive'){
   this.drawFormVfx(images.transition,h.formId,Math.cos(phase)*8,-4+Math.sin(phase)*6,phase*.32,142+pulse*7,84+pulse*5,this.reducedFlash?.10:.16,settings);
   this.drawFormVfx(images.activation,h.formId,0,-5,phase*.12,110+pulse*5,116+pulse*5,this.reducedFlash?.08:.12,settings);
   if(moving)this.drawFormVfx(images.contact,h.formId,30+Math.cos(phase*1.4)*5,-31+Math.sin(phase*1.4)*5,phase*.55,46,40,.26,settings);
  }else{
   this.drawFormVfx(images.transition,h.formId,Math.cos(phase)*8,-2,phase*.18,134+pulse*4,120+pulse*4,this.reducedFlash?.12:.19,settings);
   this.drawFormVfx(images.activation,h.formId,0,-7,-phase*.12,93,102,this.reducedFlash?.08:.13,settings);
   if(moving)this.drawFormVfx(images.contact,h.formId,-24+Math.cos(phase*1.3)*7,-29+Math.sin(phase*1.3)*7,-phase*.42,42,36,.18,settings);
  }
  c.restore();
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
  c.globalCompositeOperation='screen';c.globalAlpha=alpha*(settings.reducedFlash ? .58 : 1);c.shadowColor=formId==='ember-drive'?'#ff995d':'#80dcf0';c.shadowBlur=settings.reducedFlash?0:5;
  c.drawImage(image,-width/2,-height/2,width,height);c.restore();
 }
 private drawLayeredFormEffect(event:CombatEvent,key:FormVfxKey,image:HTMLImageElement,progress:number,settings:GameSettings,behind:boolean):void {
  if(!event.formId||event.formId==='base')return;
  const formId=event.formId,images=this.formVfx[formId],moving=!settings.reducedMotion;
  const beat=moving?Math.sin(progress*Math.PI):0,angle=event.angle??0,x=event.x,y=event.y;
  const drift=moving?progress:0;
  if(key==='activation'){
   if(behind){
    this.drawFormVfx(images.transition,formId,x,y,angle+(formId==='ember-drive'?.12:-.08),198+beat*32,154+beat*22,(formId==='ember-drive'?.68:.54)*(1-progress*.55),settings);
    this.drawFormVfx(image,formId,x,y,angle+(formId==='ember-drive'?-.18:.12),150+beat*22,156+beat*22,(formId==='ember-drive'?.78:.66)*(1-progress*.55),settings);
   }else if(settings.particles){
    const orbit=moving?drift*5.5:0;
    this.drawFormVfx(images.contact,formId,x+Math.cos(orbit)*30,y+Math.sin(orbit)*26,angle+orbit,58,48,.34*(1-progress),settings);
    if(formId==='glass-current')this.drawFormVfx(images.bolt,formId,x-Math.cos(orbit)*28,y-Math.sin(orbit)*28,angle-orbit,48,24,.30*(1-progress),settings);
   }
   return;
  }
  if(key==='transition'){
   if(behind){
    this.drawFormVfx(image,formId,x,y,angle+(formId==='ember-drive'?.25:-.2),170+drift*70,84+drift*42,.54*(1-progress),settings);
    this.drawFormVfx(images.activation,formId,x,y,angle+(formId==='ember-drive'?-.28:.2),104+beat*20,112+beat*20,.40*(1-progress),settings);
   }else if(settings.particles){
    this.drawFormVfx(images.contact,formId,x+Math.cos(angle+drift*2)*26,y+Math.sin(angle+drift*2)*26,angle+drift,42,36,.33*(1-progress),settings);
   }
   return;
  }
  if(key==='contact'){
   if(behind&&settings.particles&&!settings.reducedMotion){
    const trail=images.transition;
    this.drawFormVfx(trail,formId,x-Math.cos(angle)*17,y-Math.sin(angle)*17,angle+(formId==='ember-drive'?.10:-.08),132+beat*34,42+beat*12,.46*(1-progress*.72),settings);
    this.drawFormVfx(trail,formId,x-Math.cos(angle)*31,y-Math.sin(angle)*31,angle-(formId==='ember-drive'?.08:-.12),98+beat*25,30+beat*9,.27*(1-progress),settings);
   }else if(!behind){
    this.drawFormVfx(image,formId,x,y,angle+(formId==='ember-drive'?.08:-.06),104+beat*44,86+beat*30,.94*(1-progress*.6),settings);
    if(settings.particles){
     this.drawFormVfx(images.activation,formId,x+Math.cos(angle)*12,y+Math.sin(angle)*12,angle-.18,54+beat*18,50+beat*16,.48*(1-progress),settings);
     if(event.comboIndex===3||event.id==='ember-detonate')this.drawFormVfx(images.special,formId,x,y,angle,156+beat*46,120+beat*36,.62*(1-progress),settings);
    }
   }
   return;
  }
  if(key==='bolt'){
   if(behind&&settings.particles&&!settings.reducedMotion){
    this.drawFormVfx(images.transition,formId,x-Math.cos(angle)*12,y-Math.sin(angle)*12,angle+(formId==='ember-drive'?.04:-.03),128,34,.42*(1-progress*.45),settings);
    this.drawFormVfx(images.bolt,formId,x-Math.cos(angle)*27,y-Math.sin(angle)*27,angle,88,24,.28*(1-progress),settings);
   }else if(!behind){
    this.drawFormVfx(image,formId,x,y,angle,event.id==='bolt-hit'?112:92,event.id==='bolt-hit'?92:34,.88*(1-progress*.5),settings);
    if(event.id==='bolt-hit')this.drawFormVfx(images.contact,formId,x,y,angle,92,76,.52*(1-progress),settings);
   }
   return;
  }
  if(key==='special'){
   if(behind){
    this.drawFormVfx(images.transition,formId,x,y,angle+(formId==='ember-drive'?.2:-.12),236+drift*70,182+drift*55,.62*(1-progress*.5),settings);
    this.drawFormVfx(image,formId,x,y,angle+(formId==='ember-drive'?Math.PI/4:0),202+drift*62,166+drift*48,.92*(1-progress*.62),settings);
    this.drawFormVfx(images.activation,formId,x,y,angle-.22,142+beat*40,136+beat*30,.50*(1-progress),settings);
   }else if(settings.particles){
    this.drawFormVfx(images.contact,formId,x+Math.cos(angle)*18,y+Math.sin(angle)*18,angle,78+beat*30,65+beat*24,.46*(1-progress),settings);
   }
   return;
  }
  if(key==='finisher'){
   if(behind&&settings.particles&&!settings.reducedMotion){
    this.drawFormVfx(images.transition,formId,x-Math.cos(angle)*28,y-Math.sin(angle)*28,angle+(formId==='ember-drive'?.18:-.06),190+drift*55,68+drift*22,.48*(1-progress*.5),settings);
    this.drawFormVfx(images.activation,formId,x-Math.cos(angle)*12,y-Math.sin(angle)*12,angle-.18,142+beat*34,126+beat*28,.32*(1-progress),settings);
   }else if(!behind){
    const width=event.id==='finisher-hit'?286:206,height=event.id==='finisher-hit'?202:146;
    // The Ember texture points down-right in its source cell; rotate it back
    // onto the actual strike vector rather than projecting it toward the floor.
    this.drawFormVfx(image,formId,x,y,angle+(formId==='ember-drive'?-Math.PI/4:0),width+beat*40,height+beat*30,(event.id==='finisher-hit'?.96:.72)*(1-progress*.68),settings);
    if(event.id==='finisher-hit'&&settings.particles){
     this.drawFormVfx(images.contact,formId,x,y,angle,138+beat*40,108+beat*32,.66*(1-progress),settings);
     if(formId==='ember-drive')this.drawFormVfx(images.special,formId,x+Math.cos(angle)*24,y+Math.sin(angle)*24,angle,155+beat*45,112+beat*28,.64*(1-progress),settings);
    }
   }
  }
 }
 private drawVfx(clock:number,behind:boolean,settings:GameSettings):void {
  this.drawFormParticles(clock,behind,settings);
  this.effects=this.effects.filter(effect=>clock-effect.start<=effect.duration);
  for(const effect of this.effects){
   const id=effect.event.id;const isBehind=['shockwave-charge','shockwave-release','dash-start','dash-land'].includes(id);
   const custom=this.formVfxFor(effect.event);
   const customBehind=custom&&(custom.key==='activation'||custom.key==='transition'||custom.key==='special'||custom.key==='finisher'&&id==='finisher-build');
   const p=clamp((clock-effect.start)/effect.duration,0,1),motion=settings.reducedMotion ? .48 : p;
   let angle=effect.event.angle??0;let x=effect.event.x;let y=effect.event.y;
   if(custom&&effect.event.formId&&effect.event.formId!=='base'){
    if(behind!==customBehind){this.drawLayeredFormEffect(effect.event,custom.key,custom.image,p,settings,behind);continue;}
    this.drawLayeredFormEffect(effect.event,custom.key,custom.image,p,settings,behind);continue;
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
