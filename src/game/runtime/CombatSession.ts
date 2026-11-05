import { ARENA, ENCOUNTERS, ROOM_COUNT, UPGRADES } from '../data/encounters.js';
import { clamp, distance, inArc, normalize } from '../core/math.js';
import { SeededRandom, stableRunSeed } from '../core/random.js';
import { loadSave, writeSave } from '../storage/save.js';
import type { ActionInput, Enemy, EnemyKind, GameMode, GameSnapshot, Hero, Particle, Projectile, SaveData, UpgradeId, Vec2 } from '../core/types.js';

const EMPTY_INPUT: ActionInput = {movement:{x:0,y:0},aim:{x:1,y:0},pressed:new Set(),held:new Set()};
const P = (x:number,y:number): Vec2 => ({x,y});
export class CombatSession {
 readonly width = ARENA.width;
 readonly height = ARENA.height;
 mode: GameMode = 'hub';
 hero: Hero = CombatSession.makeHero();
 enemies: Enemy[] = [];
 projectiles: Projectile[] = [];
 particles: Particle[] = [];
 save: SaveData;
 room = 0;
 seed = 1;
 runShards = 0;
 upgrades: UpgradeId[] = [];
 rewardChoices: UpgradeId[] = [];
 events: string[] = [];
 message = 'The Weave is unstable. Enter the combat laboratory.';
 shake = 0;
 hitstop = 0;
 clock = 0;
 private idCounter = 0;
 private rng = new SeededRandom(1);
 private rewardDelay = -1;
 private previousMode: GameMode = 'playing';

 constructor(save: SaveData = loadSave()) { this.save = save; }
 static makeHero(): Hero {return {
  x:590,y:360,vx:0,vy:0,face:0,hp:100,maxHp:100,pulse:0,maxPulse:100,
  dashTime:0,dashCooldown:0,invuln:0,attackTime:0,attackCooldown:0,combo:0,comboWindow:0,
  guardTime:0,parryWindow:0,specialCooldown:0,ultimateCooldown:0,
  formTime:0,formMaxTime:8,formCooldown:0,transformed:false,hitFlash:0,step:0
 };}
 get snapshot(): GameSnapshot {return {mode:this.mode,room:this.room,roomsTotal:ROOM_COUNT,enemyCount:this.enemies.length,
  hp:Math.ceil(this.hero.hp),maxHp:this.hero.maxHp,pulse:Math.floor(this.hero.pulse),maxPulse:this.hero.maxPulse,
  combo:this.hero.combo,transformed:this.hero.transformed,formTime:this.hero.formTime,
  shards:this.runShards,bankedShards:this.save.shards,bestRoom:this.save.bestRoom,runs:this.save.runs,
  message:this.message,upgrades:[...this.upgrades],pauseFrom:this.mode==='paused'?this.previousMode:undefined}; }
 notify(type:string): void { this.events.push(type); }
 consumeEvents(): string[] { return this.events.splice(0); }
 newRun(seed = stableRunSeed()): void {
  this.seed=seed;this.rng=new SeededRandom(seed);this.mode='playing';this.room=1;
  this.hero=CombatSession.makeHero();this.enemies=[];this.projectiles=[];this.particles=[];
  this.runShards=0;this.upgrades=[];this.rewardChoices=[];this.rewardDelay=-1;this.clock=0;
  this.message='CHAMBER 01 • Broken Atrium';this.spawnRoom();this.notify('start');
 }
 private spawnRoom(): void {
  this.enemies=[];this.projectiles=[];
  this.hero.x=590;this.hero.y=340;this.hero.invuln=.65;
  const encounter = ENCOUNTERS[this.room-1] ?? [];
  encounter.forEach((kind,i)=>{
   const angle=(i/encounter.length)*Math.PI*2+.35;
   const range=220+this.rng.range(-30,45);
   const stats: Record<EnemyKind,[number,number,number]> = {wisp:[32,68,18],striker:[53,104,21],sentinel:[125,43,34]};
   const [hp,speed,radius]=stats[kind];
   this.enemies.push({id:++this.idCounter,kind,x:clamp(590+Math.cos(angle)*range,110,1070),
    y:clamp(340+Math.sin(angle)*range,115,570),hp,maxHp:hp,radius,speed,
    flash:0,phase:this.rng.range(0,Math.PI*2),attackCooldown:.65+this.rng.range(0,.6),
    telegraph:0,stagger:0,vx:0,vy:0});
  });
  this.notify('room');
 }
 chooseReward(index:number): void {
  if (this.mode!=='reward') return;
  const id=this.rewardChoices[index];if(!id)return;
  this.upgrades.push(id);
  if(id==='capacity'){this.hero.maxPulse+=25;this.hero.pulse=Math.min(this.hero.maxPulse,this.hero.pulse+20);}
  if(id==='vitality'){this.hero.maxHp+=10;this.hero.hp=clamp(this.hero.hp+25,0,this.hero.maxHp);}
  this.mode='playing';this.room++;this.message=`CHAMBER ${String(this.room).padStart(2,'0')} • ${this.room===2?'Resonance Court':'Sentinel Threshold'}`;
  this.spawnRoom();this.notify('reward');
 }
 pause():void {if(this.mode==='playing'){this.previousMode='playing';this.mode='paused';}else if(this.mode==='paused'){this.mode=this.previousMode;}}
 returnToHub():void {if(this.mode==='playing'||this.mode==='paused')this.finish('defeat',true);this.mode='hub';this.message='The Weave remembers every attempt.';}
 private finish(result:'victory'|'defeat',abandoned=false):void {
  const earned=this.runShards;
  this.save.shards+=earned;this.save.runs++;this.save.bestRoom=Math.max(this.save.bestRoom,this.room);
  if(result==='victory') this.save.totalDefeats++;
  writeSave(this.save);this.mode=result;
  this.message=result==='victory'?'THE THREAD HOLDS • Prototype route cleared':abandoned?'Run abandoned • discoveries retained':'THE THREAD COLLAPSES • Return stronger';
  this.notify(result);
 }
 private pulse(amount:number):void {this.hero.pulse=clamp(this.hero.pulse+amount,0,this.hero.maxPulse);}
 private burst(x:number,y:number,color:string,count:number,force=125):void {
  const n=this.save.settings.particles?count:Math.min(4,count);
  for(let i=0;i<n;i++){
   const a=this.rng.range(0,Math.PI*2),s=this.rng.range(force*.25,force);
   this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:this.rng.range(.2,.55),maxLife:.55,size:this.rng.range(1.5,4),color});
  }
  if(this.particles.length>260)this.particles.splice(0,this.particles.length-260);
 }
 private damageEnemy(enemy:Enemy,amount:number,dx:number,dy:number):void {
  if(enemy.hp<=0)return;
  enemy.hp-=amount;enemy.flash=.17;enemy.stagger=.25;
  const v=normalize({x:dx,y:dy});enemy.vx+=v.x*145;enemy.vy+=v.y*145;
  this.burst(enemy.x,enemy.y,enemy.kind==='sentinel'?'#e9a6c8':'#8ddfef',10,175);
  this.pulse(this.hero.transformed?3:7);
  this.shake=Math.min(12,this.shake+2.3);
  this.hitstop=Math.min(.07,this.hitstop+.025);
  this.notify('hit');
  if(enemy.hp<=0){this.runShards+=enemy.kind==='sentinel'?9:enemy.kind==='striker'?4:2;
   this.pulse(9);this.burst(enemy.x,enemy.y,'#f6cc83',18,220);this.notify('kill');}
 }
 private melee(heavy=false):void {
  const h=this.hero;
  if(h.attackCooldown>0||h.dashTime>0)return;
  h.combo=h.comboWindow>0&&!heavy?(h.combo%3)+1:1;
  if(heavy)h.combo=3;
  h.comboWindow=.56;h.attackTime=heavy?.31:.18;
  h.attackCooldown=heavy?.5:h.combo===3?.36:.22;
  const reach=(heavy?112:83)+(h.transformed?18:0), arc=heavy?1.65:1.4;
  const multiplier=this.upgrades.includes('momentum')?1.3:1;
  const damage=(heavy?33: h.combo===3?25:15)*multiplier*(h.transformed?1.48:1);
  let hits=0;
  for(const e of this.enemies){if(e.hp>0&&inArc(P(h.x,h.y),h.face,e,reach+e.radius,arc)){
   this.damageEnemy(e,damage,Math.cos(h.face),Math.sin(h.face));hits++;}}
  this.burst(h.x+Math.cos(h.face)*52,h.y+Math.sin(h.face)*52,h.transformed?'#ffd5a7':'#f9aa92',heavy?14:7,160);
  if(hits===0)h.comboWindow=Math.min(h.comboWindow,.38);
  this.notify(heavy?'heavy':'swing');
 }
 private fireProjectile():void {
  const h=this.hero;if(h.specialCooldown>0||h.dashTime>0)return;
  h.specialCooldown=h.transformed?.37:.58;
  const speed=h.transformed?710:590;
  const power=(this.upgrades.includes('sparks')?1.4:1)*(h.transformed?1.35:1);
  this.projectiles.push({x:h.x+Math.cos(h.face)*32,y:h.y+Math.sin(h.face)*32,
   vx:Math.cos(h.face)*speed,vy:Math.sin(h.face)*speed,life:.95,radius:h.transformed?12:9,power:23*power,
   source:'hero',color:h.transformed?'#ffddac':'#90e6f0'});
  this.burst(h.x,h.y,'#a9e8f7',7,85);this.notify('shot');
 }
 private triggerSpecial():void {
  const h=this.hero;if(h.ultimateCooldown>0||h.dashTime>0)return;
  h.ultimateCooldown=h.transformed?3.0:5.0;
  this.shake+=6;this.burst(h.x,h.y,'#f8c39b',32,300);
  for(const e of this.enemies){if(distance(h,e)<(h.transformed?215:155)){
   this.damageEnemy(e,h.transformed?40:28,e.x-h.x,e.y-h.y);}}
  this.notify('special');
 }
 private triggerUltimate():void {
  const h=this.hero;if(h.pulse<75||h.ultimateCooldown>0)return;
  this.pulse(-75);h.ultimateCooldown=5;this.shake=12;
  this.burst(h.x,h.y,h.transformed?'#ffd299':'#8fe2ed',65,370);
  for(const e of this.enemies)if(distance(h,e)<265)this.damageEnemy(e,h.transformed?110:80,e.x-h.x,e.y-h.y);
  this.notify('ultimate');
 }
 private transform():void {
  const h=this.hero;
  // PROTOTYPE ONLY: Ember Drive visualization and damage modifier, NOT a complete form-quality-contract implementation.
  if(h.pulse<40||h.transformed||h.formCooldown>0)return;
  h.pulse-=40;h.formTime=h.formMaxTime;h.transformed=true;h.invuln=.45;h.formCooldown=11;
  this.burst(h.x,h.y,'#ffba79',55,340);this.shake=11;this.message='EMBER DRIVE • Experimental form preview';
  this.notify('transform');
 }
 private damageHero(amount:number,origin:Vec2):void {
  const h=this.hero;if(h.invuln>0||h.dashTime>0)return;
  if(h.guardTime>0){
   if(h.parryWindow>0){this.pulse(this.upgrades.includes('focus')?30:21);
    this.burst(h.x,h.y,'#9fffee',23,210);this.notify('parry');this.shake+=3;return;}
   amount*=.3;
  }
  h.hp=Math.max(0,h.hp-amount);h.hitFlash=.28;h.invuln=.65;
  const push=normalize({x:h.x-origin.x,y:h.y-origin.y});h.vx+=push.x*185;h.vy+=push.y*185;
  this.burst(h.x,h.y,'#ff8697',18,160);this.notify('hurt');this.shake+=4;
  if(h.hp<=0)this.finish('defeat');
 }
 update(dt:number,input:ActionInput=EMPTY_INPUT):void {
  if(this.mode!=='playing')return;
  dt=clamp(dt,0,.05);this.clock+=dt;
  if(this.hitstop>0){this.hitstop-=dt;this.tickParticles(dt);return;}
  const h=this.hero;
  const dec=(v:number)=>Math.max(0,v-dt);
  h.dashCooldown=dec(h.dashCooldown);h.invuln=dec(h.invuln);h.attackTime=dec(h.attackTime);
  h.attackCooldown=dec(h.attackCooldown);h.comboWindow=dec(h.comboWindow);
  h.specialCooldown=dec(h.specialCooldown);h.ultimateCooldown=dec(h.ultimateCooldown);
  h.formCooldown=dec(h.formCooldown);h.hitFlash=dec(h.hitFlash);
  if(h.comboWindow===0)h.combo=0;
  if(h.transformed){h.formTime=dec(h.formTime);h.pulse=clamp(h.pulse-dt*2,0,h.maxPulse);
   if(h.formTime===0||h.pulse===0){h.transformed=false;this.burst(h.x,h.y,'#e8b19b',14,160);this.notify('deform');}}
  const aim=normalize(input.aim);
  if(Math.hypot(aim.x,aim.y)>.001)h.face=Math.atan2(aim.y,aim.x);
  const move=normalize(input.movement);
  if(input.pressed.has('dash')&&h.dashCooldown===0){h.dashTime=.19;h.dashCooldown=this.upgrades.includes('echo')?.69:.92;
   h.invuln=.26;const d=Math.hypot(move.x,move.y)>.1?move:{x:Math.cos(h.face),y:Math.sin(h.face)};
   h.vx=d.x*870;h.vy=d.y*870;this.burst(h.x,h.y,'#92d7ff',13,120);this.notify('dash');}
  if(h.dashTime>0){h.dashTime=dec(h.dashTime);}
  else {
   const speed=h.transformed?322:277;
   h.vx=h.vx*.23+move.x*speed*.77;h.vy=h.vy*.23+move.y*speed*.77;
   if(input.held.has('guard')){h.guardTime+=dt;h.parryWindow=Math.max(0,.22-h.guardTime);}else{h.guardTime=0;h.parryWindow=0;}
   if(input.pressed.has('attack'))this.melee();
   if(input.pressed.has('heavy'))this.fireProjectile();
   if(input.pressed.has('special'))this.triggerSpecial();
   if(input.pressed.has('transform'))this.transform();
   if(input.pressed.has('ultimate'))this.triggerUltimate();
  }
  h.x=clamp(h.x+h.vx*dt,ARENA.inset,ARENA.width-ARENA.inset);
  h.y=clamp(h.y+h.vy*dt,ARENA.inset,ARENA.height-ARENA.inset);
  h.step+=Math.hypot(h.vx,h.vy)*dt;
  this.updateEnemies(dt);this.updateProjectiles(dt);this.tickParticles(dt);
  this.shake=Math.max(0,this.shake-dt*26);
  if(this.enemies.length===0 && this.rewardDelay<0){this.rewardDelay=.88;this.notify('clear');}
  if(this.rewardDelay>=0){this.rewardDelay-=dt;if(this.rewardDelay<0)this.roomComplete();}
 }
 private updateEnemies(dt:number):void {
  for(const e of this.enemies){
   e.flash=Math.max(0,e.flash-dt);e.stagger=Math.max(0,e.stagger-dt);e.phase+=dt*1.3;
   e.attackCooldown=Math.max(0,e.attackCooldown-dt);
   const dir=normalize({x:this.hero.x-e.x,y:this.hero.y-e.y});const d=distance(e,this.hero);
   if(e.stagger>0){e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=.85;e.vy*=.85;continue;}
   if(e.telegraph>0){e.telegraph-=dt;if(e.telegraph<=0){
    if(distance(e,this.hero)<e.radius+54)this.damageHero(e.kind==='sentinel'?19:12,e);
    this.burst(e.x+dir.x*25,e.y+dir.y*25,'#ef668e',8,75);
    e.attackCooldown=e.kind==='striker'?.85:e.kind==='sentinel'?1.65:1.2;
    e.telegraph=0;
   }} else if(d<e.radius+54&&e.attackCooldown===0){e.telegraph=e.kind==='sentinel'?.78:.47;}
   else if(d>e.radius+37){const s=e.kind==='wisp'?1+Math.sin(e.phase)*.1:1;
    e.x+=dir.x*e.speed*s*dt;e.y+=dir.y*e.speed*s*dt;}
   e.x=clamp(e.x,ARENA.inset,ARENA.width-ARENA.inset);
   e.y=clamp(e.y,ARENA.inset,ARENA.height-ARENA.inset);
  }
  this.enemies=this.enemies.filter(e=>e.hp>0);
 }
 private updateProjectiles(dt:number):void {
  for(const p of this.projectiles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
   if(p.source==='hero')for(const e of this.enemies){if(e.hp>0&&distance(p,e)<p.radius+e.radius){
    this.damageEnemy(e,p.power,p.vx,p.vy);p.life=0;break;}}
   else if(p.source==='enemy'&&distance(p,this.hero)<p.radius+18){this.damageHero(p.power,p);p.life=0;}
  }
  this.projectiles=this.projectiles.filter(p=>p.life>0&&p.x>-30&&p.x<this.width+30&&p.y>-30&&p.y<this.height+30);
 }
 private tickParticles(dt:number):void {
  for(const p of this.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.94;p.vy*=.94;}
  this.particles=this.particles.filter(p=>p.life>0);
 }
 private roomComplete():void {
  this.runShards+=6;
  if(this.room>=ROOM_COUNT){this.finish('victory');return;}
  this.mode='reward';this.rewardChoices=[];
  const available=UPGRADES.filter(v=>!this.upgrades.includes(v.id));
  while(this.rewardChoices.length<Math.min(3,available.length)){
   const id=this.rng.pick(available).id;if(!this.rewardChoices.includes(id))this.rewardChoices.push(id);
  }
  this.message='CHAMBER CLEARED • Choose one technique';this.notify('clear');
 }
}
