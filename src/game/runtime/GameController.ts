import { CombatSession } from './CombatSession.js';
import { InputController } from './InputController.js';
import { CanvasRenderer } from '../render/CanvasRenderer.js';
import { SoundBus } from '../audio/synth.js';
import type { GameSnapshot } from '../core/types.js';
import type { InputDevice } from './InputController.js';
/** Runtime binding: Canvas implementation can be replaced without replacing game rules. */
export class GameController {
 readonly session = new CombatSession();
 readonly input: InputController;
 readonly renderer: CanvasRenderer;
 readonly sound = new SoundBus();
 private raf = 0;
 private previous = 0;
 private lastPublish = 0;
 private publishedMode = '';
 private destroyed = false;
 constructor(canvas: HTMLCanvasElement, private onSnapshot: (value:GameSnapshot)=>void, onDeviceChange:(device:InputDevice)=>void=()=>undefined){
  this.renderer = new CanvasRenderer(canvas);
  this.input = new InputController(canvas,this.session.width,this.session.height,onDeviceChange,()=>{
   if(this.session.mode==='playing')this.session.pause();
   this.publish();
  });
  this.sound.setVolumes(this.session.save.settings.masterVolume,this.session.save.settings.effectsVolume);
  this.renderer.render(this.session);
  this.publish();
 }
 start():void {if(this.destroyed)throw new Error('Cannot restart a disposed controller');this.input.start();this.previous=performance.now();this.raf=requestAnimationFrame(this.frame);}
 dispose():void {this.destroyed=true;cancelAnimationFrame(this.raf);this.input.stop();}
 newRun(seed?:number):void {this.session.newRun(seed);this.publish();}
 reward(choice:number):void {this.session.chooseReward(choice);this.publish();}
 togglePause():void {this.session.pause();this.publish();}
 hub():void {this.session.returnToHub();this.publish();}
 private publish():void {this.onSnapshot(this.session.snapshot);this.publishedMode=this.session.mode;this.lastPublish=performance.now();}
 private frame = (now:number):void => {
  if(this.destroyed)return;
  const dt=Math.min((now-this.previous)/1000,.05);this.previous=now;
  const input=this.input.sample(this.session.hero);
  if(input.pressed.has('pause'))this.session.pause();
  this.session.update(dt,input);
  this.renderer.render(this.session);
  for(const event of this.session.consumeEvents()){
   if(event==='hit')this.sound.beep(125,.07,'triangle');
   if(event==='kill')this.sound.beep(440,.09,'sine');
   if(event==='dash')this.sound.beep(200,.1,'sawtooth',.009);
   if(event==='parry')this.sound.beep(800,.15,'sine',.035);
   if(event==='transform')this.sound.beep(180,.46,'sawtooth',.045);
   if(event==='ultimate')this.sound.beep(76,.45,'sawtooth',.05);
  }
  if(now-this.lastPublish>90 || this.publishedMode!==this.session.mode)this.publish();
  this.raf=requestAnimationFrame(this.frame);
 };
}
