import { normalize } from '../core/math.js';
import type { ActionInput, KeyAction, Vec2 } from '../core/types.js';
const BINDINGS: Readonly<Record<string,KeyAction>> = {
 KeyW:'up',ArrowUp:'up',KeyS:'down',ArrowDown:'down',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right',
 Space:'attack',KeyJ:'attack',KeyK:'heavy',KeyQ:'special',KeyE:'guard',ShiftLeft:'dash',ShiftRight:'dash',
 KeyR:'transform',KeyF:'ultimate',Escape:'pause',Enter:'interact'
};
export class InputController {
 private held = new Set<KeyAction>();
 private pressed = new Set<KeyAction>();
 private pointer={x:820,y:350};
 private active = false;
 private suppressContextMenu=(e:MouseEvent)=>e.preventDefault();
 constructor(private canvas: HTMLCanvasElement,private width:number,private height:number){}
 private keydown=(event:KeyboardEvent):void=>{
  const action=BINDINGS[event.code];if(!action)return;
  if(this.active)event.preventDefault();
  if(!this.held.has(action))this.pressed.add(action);
  this.held.add(action);
 };
 private keyup=(event:KeyboardEvent):void=>{const action=BINDINGS[event.code];if(action){this.held.delete(action);}};
 private move=(event:PointerEvent):void=>{const rect=this.canvas.getBoundingClientRect();
  this.pointer.x=(event.clientX-rect.left)/rect.width*this.width;
  this.pointer.y=(event.clientY-rect.top)/rect.height*this.height;
 };
 private pointerDown=(event:PointerEvent):void=>{
  if(event.button!==0&&event.button!==2)return;
  this.move(event);const key=event.button===0?'attack':'heavy';
  this.pressed.add(key);this.held.add(key);this.canvas.focus();
 };
 private pointerUp=(event:PointerEvent):void=>{this.held.delete(event.button===0?'attack':'heavy');};
 private blur=():void=>{this.held.clear();this.pressed.clear();};
 start():void {if(this.active)return;this.active=true;this.canvas.addEventListener('pointermove',this.move);
  this.canvas.addEventListener('pointerdown',this.pointerDown);window.addEventListener('pointerup',this.pointerUp);
  this.canvas.addEventListener('contextmenu',this.suppressContextMenu);
  window.addEventListener('keydown',this.keydown);window.addEventListener('keyup',this.keyup);window.addEventListener('blur',this.blur);
 }
 stop():void {this.active=false;this.canvas.removeEventListener('pointermove',this.move);
  this.canvas.removeEventListener('pointerdown',this.pointerDown);window.removeEventListener('pointerup',this.pointerUp);
  this.canvas.removeEventListener('contextmenu',this.suppressContextMenu);
  window.removeEventListener('keydown',this.keydown);window.removeEventListener('keyup',this.keyup);window.removeEventListener('blur',this.blur);
  this.held.clear();this.pressed.clear();}
 sample(hero: Vec2):ActionInput {
  const movement=normalize({x:Number(this.held.has('right'))-Number(this.held.has('left')),
   y:Number(this.held.has('down'))-Number(this.held.has('up'))});
  const result={movement,aim:normalize({x:this.pointer.x-hero.x,y:this.pointer.y-hero.y}),
   pressed:new Set(this.pressed),held:new Set(this.held)};
  this.pressed.clear();return result;
 }
}
