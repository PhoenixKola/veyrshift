import { ARENA } from '../data/encounters.js';
import type { Enemy, Hero } from '../core/types.js';
import type { CombatSession } from '../runtime/CombatSession.js';
import { resolveAtlasSource, resolveHeroAnimation, type ResolvedAnimation } from '../animation/animationResolver.js';
import { clamp } from '../core/math.js';
export class CanvasRenderer {
 private ctx:CanvasRenderingContext2D;
 private reducedMotion=false;
 private reducedFlash=false;
 private forceB02:boolean;
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
 readonly assetsReady:Promise<void>;
 private lastAnimation:ResolvedAnimation|null=null;
 private previousAnimation:ResolvedAnimation|null=null;
 private transitionRemaining=0;
 private previousRenderAt=0;
 private wisp=this.load('/assets/enemies/prototype/rift-wisp.png');
 constructor(canvas:HTMLCanvasElement,forceB02=false){
  this.forceB02=forceB02;
  canvas.width=ARENA.width;canvas.height=ARENA.height;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D support is required');this.ctx=ctx;
  this.assetsReady=Promise.all([...Object.values(this.directional),this.idle,this.run,this.combo,this.dodge,this.states,this.wisp].map(image=>image.decode().catch(()=>undefined))).then(()=>undefined);
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
  for(const p of game.projectiles){c.save();c.shadowBlur=22;c.shadowColor=p.color;c.fillStyle=p.color;
   c.beginPath();c.arc(p.x,p.y,p.radius,0,Math.PI*2);c.fill();c.restore();}
  const actors:[number,()=>void][]=[...game.enemies.map(e=>[e.y,()=>this.drawEnemy(e,game.clock)] as [number,()=>void]),
   [game.hero.y,()=>this.drawHero(game.hero,game.clock,true)]];
  actors.sort((a,b)=>a[0]-b[0]);for(const [,draw] of actors)draw();
  this.drawAttackArc(game.hero);c.restore();
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
 private drawEnemy(e:Enemy,t:number):void {
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
 }
 private drawHero(h:Hero,t:number,inBattle:boolean):void {
  const c=this.ctx;this.drawShadow(h.x,h.y,1.05);c.save();c.translate(h.x,h.y);
  const resolved=resolveHeroAnimation(h,t);
  const key=`${resolved.state}:${resolved.direction}`;
  if(!this.lastAnimation)this.lastAnimation=resolved;
  else if(`${this.lastAnimation.state}:${this.lastAnimation.direction}`!==key){
   this.previousAnimation=this.lastAnimation;
   this.transitionRemaining=this.reducedMotion?0:.07;
  }
  const now=performance.now();
  const renderDelta=this.previousRenderAt?Math.min(.05,Math.max(0,(now-this.previousRenderAt)/1000)):0;
  this.previousRenderAt=now;
  const blend=this.transitionRemaining>0?1-this.transitionRemaining/.07:1;
  const heroAlpha=h.invuln>0&&Math.sin(t*32)>0?.62:1;
  const sprite=this.directional[resolved.atlas];
  const legacy=this.legacyAtlas(resolved.atlas);
  const atlasSource=this.forceB02?resolveAtlasSource(false,this.ready(legacy)):resolveAtlasSource(this.ready(sprite),this.ready(legacy));
  const bob=this.reducedMotion?0:(resolved.state==='idle'?Math.sin(h.step*.018)*.7:0);
  c.translate(0,bob-17);
  if(atlasSource==='b03'){
   if(h.transformVisualTime>0)this.drawIgnition(h,t);
   if(h.dashTime>0)this.drawDashStreak(h);
   const animationDelta=this.transitionRemaining>0?blend:1;
   if(this.previousAnimation&&this.transitionRemaining>0){
    const oldImage=this.directional[this.previousAnimation.atlas];
    if(this.ready(oldImage))this.drawDirectionalFrame(oldImage,this.previousAnimation,heroAlpha*(1-animationDelta));
   }
   this.drawDirectionalFrame(sprite,resolved,heroAlpha*animationDelta);
   this.transitionRemaining=Math.max(0,this.transitionRemaining-renderDelta);
   this.lastAnimation=resolved;
   if(this.transitionRemaining===0)this.previousAnimation=null;
   c.restore();return;
  }
  // If B03 atlases fail to load, use the B02 strip where available, then the vector fallback below.
  if(atlasSource==='b02'){
   if(Math.cos(h.face)<0)c.scale(-1,1);
   if(h.transformVisualTime>0)this.drawIgnition(h,t);
   if(h.dashTime>0)this.drawDashStreak(h);
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
 private drawDashStreak(h:Hero):void {
  const c=this.ctx;c.save();c.globalAlpha=this.reducedFlash?.3:.45;c.strokeStyle='#a1e8f2';c.lineWidth=3;
  const dx=-Math.cos(h.face),dy=-Math.sin(h.face);
  for(let i=1;i<=3;i++){c.beginPath();c.ellipse(dx*i*9,dy*i*7,24+i*4,8+i*1.5,h.face,0,Math.PI*2);c.stroke();}
  c.restore();
 }
 private drawIgnition(h:Hero,t:number):void {
  const c=this.ctx,progress=clamp(1-h.transformVisualTime/h.transformVisualDuration,0,1);
  const radius=28+progress*82;c.save();c.globalAlpha=this.reducedFlash?.36:(1-progress)*.84;
  c.strokeStyle='#ffc47f';c.lineWidth=this.reducedFlash?3:4;c.shadowColor='#ffad65';c.shadowBlur=this.reducedFlash?0:15;
  c.beginPath();c.ellipse(0,5,radius,radius*.44,this.reducedMotion?0:t*1.1,0,Math.PI*2);c.stroke();
  if(!this.reducedMotion&&!this.reducedFlash){for(let i=0;i<4;i++){const a=t*1.8+i*Math.PI/2;const x=Math.cos(a)*(radius+6),y=Math.sin(a)*(radius*.42+6);c.save();c.translate(x,y);c.rotate(a);c.fillStyle='#ffe0a4';c.fillRect(-2,-5,4,10);c.restore();}}
  c.restore();
 }
 private drawFormAura(h:Hero,t:number):void {
  const c=this.ctx;c.save();c.translate(h.x,h.y-15);
  for(let i=0;i<3;i++){const r=44+i*12+(this.reducedMotion?0:Math.sin(t*7+i)*4);
   c.strokeStyle=`rgba(255,${165+i*20},${104+i*26},${.26-i*.045})`;c.lineWidth=3-i*.4;
   c.beginPath();c.ellipse(0,0,r,r*.75,(this.reducedMotion?0:t*.65)+i,0,Math.PI*2);c.stroke();}
  c.shadowColor='#ffb378';c.shadowBlur=32;c.fillStyle='rgba(255,169,108,.14)';
  c.beginPath();c.ellipse(0,0,46,58,0,0,Math.PI*2);c.fill();
  c.globalAlpha=this.reducedFlash?.35:.72;c.fillStyle='#ffd49a';
  for(let i=0;i<3;i++){const a=(this.reducedMotion?0:t*.9)+i*Math.PI*2/3;const x=Math.cos(a)*(51+i*4),y=Math.sin(a)*(31+i*3);c.save();c.translate(x,y);c.rotate(a);c.beginPath();c.moveTo(0,-6);c.lineTo(4,0);c.lineTo(0,6);c.lineTo(-4,0);c.closePath();c.fill();c.restore();}
  c.restore();
 }
 private drawAttackArc(h:Hero):void {
  const progress=h.attackDuration>0?h.attackAnimTime/h.attackDuration:0;
  const activeStart=h.attackDuration>0?h.attackStartup/h.attackDuration:0;
  if(h.attackTime<=0||progress<activeStart||progress>.66)return;
  const c=this.ctx;c.save();c.translate(h.x,h.y-14);c.rotate(h.face);
  const age=clamp((progress-activeStart)/Math.max(.01,.66-activeStart),0,1);c.globalAlpha=1-age*.45;
  c.strokeStyle=h.transformed?'rgba(255,214,159,.92)':h.combo===2?'rgba(156,231,238,.92)':h.combo===3?'rgba(255,187,117,.95)':'rgba(206,225,240,.9)';
  c.lineWidth=h.combo===3?13:9;c.lineCap='round';c.shadowBlur=20;c.shadowColor=c.strokeStyle;
  const radius=h.combo===3?88:h.combo===2?72:62;
  c.beginPath();c.arc(0,0,radius,h.combo===3?-.15:-.8,h.combo===3?1.1:.8);c.stroke();
  if(h.combo===3){c.strokeStyle='rgba(255,226,169,.8)';c.lineWidth=3;c.beginPath();c.arc(0,0,radius+10,-.2,.8);c.stroke();}
  c.restore();
 }
 private decorativeTitle(title:string,sub:string,x:number,y:number):void {
  const c=this.ctx;c.save();c.textAlign='center';c.fillStyle='#a4c8cf';c.font='600 12px sans-serif';c.letterSpacing='6px';c.fillText(title,x,y);
  c.fillStyle='#58788c';c.font='15px sans-serif';c.letterSpacing='1px';c.fillText(sub,x,y+33);c.restore();
 }
}
