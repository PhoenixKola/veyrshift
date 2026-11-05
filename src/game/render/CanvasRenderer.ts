import { ARENA } from '../data/encounters.js';
import type { Enemy, Hero } from '../core/types.js';
import type { CombatSession } from '../runtime/CombatSession.js';
import { clamp } from '../core/math.js';
export class CanvasRenderer {
 private ctx:CanvasRenderingContext2D;
 private reducedMotion=false;
 private reducedFlash=false;
 private idle=this.load('/assets/characters/kairo/prototype/idle.png');
 private punch=this.load('/assets/characters/kairo/prototype/punch-right.png');
 private dodge=this.load('/assets/characters/kairo/prototype/dodge-right.png');
 private ember=this.load('/assets/characters/kairo/prototype/ember-visual-only.png');
 private wisp=this.load('/assets/enemies/prototype/rift-wisp.png');
 constructor(canvas:HTMLCanvasElement){
  canvas.width=ARENA.width;canvas.height=ARENA.height;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas 2D support is required');this.ctx=ctx;
 }
 private load(src:string):HTMLImageElement {const image=new Image();image.src=src;return image;}
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
  c.translate(e.x,e.y);const bob=this.reducedMotion?0:Math.sin(t*3+e.phase)*3;c.translate(0,bob-10);
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
  const move=Math.hypot(h.vx,h.vy)>70;const bob=this.reducedMotion?0:Math.sin(h.step*.05)*2.6*(move?1:.25);
  c.translate(0,bob-17);
  if(h.invuln>0&&Math.sin(t*32)>0)c.globalAlpha=.62;
  const pose=h.transformed&&h.transformVisualTime>0?this.ember:h.dashTime>0?this.dodge:h.attackTime>0?this.punch:this.idle;
  if(pose.complete&&pose.naturalWidth>0){
   const width=pose===this.punch?118:pose===this.dodge?112:74;const height=pose===this.punch?80:pose===this.dodge?66:112;
   if(h.transformed){c.shadowColor='#ffb773';c.shadowBlur=14;}
   c.drawImage(pose,-width/2,-height+32,width,height);c.restore();return;
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
 private drawFormAura(h:Hero,t:number):void {
  const c=this.ctx;c.save();c.translate(h.x,h.y-15);
  for(let i=0;i<3;i++){const r=44+i*12+(this.reducedMotion?0:Math.sin(t*7+i)*4);
   c.strokeStyle=`rgba(255,${165+i*20},${104+i*26},${.26-i*.045})`;c.lineWidth=3-i*.4;
   c.beginPath();c.ellipse(0,0,r,r*.75,(this.reducedMotion?0:t*.65)+i,0,Math.PI*2);c.stroke();}
  c.shadowColor='#ffb378';c.shadowBlur=32;c.fillStyle='rgba(255,169,108,.14)';
  c.beginPath();c.ellipse(0,0,46,58,0,0,Math.PI*2);c.fill();
  c.restore();
 }
 private drawAttackArc(h:Hero):void {
  if(h.attackTime<=0)return;
  const c=this.ctx;c.save();c.translate(h.x,h.y-14);c.rotate(h.face);
  c.strokeStyle=h.transformed?'rgba(255,214,159,.85)':'rgba(155,241,250,.8)';
  c.lineWidth=11;c.lineCap='round';c.shadowBlur=20;c.shadowColor=c.strokeStyle;
  c.beginPath();c.arc(0,0,h.combo===3?86:64,-.75,.75);c.stroke();c.restore();
 }
 private decorativeTitle(title:string,sub:string,x:number,y:number):void {
  const c=this.ctx;c.save();c.textAlign='center';c.fillStyle='#a4c8cf';c.font='600 12px sans-serif';c.letterSpacing='6px';c.fillText(title,x,y);
  c.fillStyle='#58788c';c.font='15px sans-serif';c.letterSpacing='1px';c.fillText(sub,x,y+33);c.restore();
 }
}
