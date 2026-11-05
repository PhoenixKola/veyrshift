import { normalize } from '../core/math.js';
import type { ActionInput, KeyAction, Vec2 } from '../core/types.js';
import { mergeActions, StandardGamepadMapper } from './gamepadMapping.js';

export type InputDevice = 'Keyboard + Mouse' | 'Xbox' | 'PlayStation' | 'Gamepad';
const BINDINGS: Readonly<Record<string, KeyAction>> = {
  KeyW: 'up', ArrowUp: 'up', KeyS: 'down', ArrowDown: 'down', KeyA: 'left', ArrowLeft: 'left', KeyD: 'right', ArrowRight: 'right',
  Space: 'attack', KeyJ: 'attack', KeyK: 'heavy', KeyQ: 'special', KeyE: 'guard', ShiftLeft: 'dash', ShiftRight: 'dash',
  KeyR: 'transform', KeyF: 'ultimate', Escape: 'pause', Enter: 'interact',
};

export class InputController {
  private held = new Set<KeyAction>();
  private pressed = new Set<KeyAction>();
  private pointer = { x: 0, y: 0 };
  private pointerValid = false;
  private pointerDirty = false;
  private active = false;
  private lastAim: Vec2 | null = null;
  private latestInputAt = 0;
  private device: InputDevice = 'Keyboard + Mouse';
  private mapper = new StandardGamepadMapper();
  private connectedPads = new Set<number>();
  private suppressContextMenu = (event: MouseEvent) => event.preventDefault();

  constructor(
    private canvas: HTMLCanvasElement,
    private width: number,
    private height: number,
    private onDeviceChange: (device: InputDevice) => void = () => undefined,
    private onFocusLost: () => void = () => undefined,
  ) {}

  private isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;
    return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
  }

  private keydown = (event: KeyboardEvent): void => {
    if (this.isEditableTarget(event.target)) return;
    const action = BINDINGS[event.code];
    if (!action) return;
    if (this.active) event.preventDefault();
    if (!this.held.has(action)) this.pressed.add(action);
    this.held.add(action);
    this.setDevice('Keyboard + Mouse');
  };

  private keyup = (event: KeyboardEvent): void => {
    const action = BINDINGS[event.code];
    if (action) this.held.delete(action);
  };

  private move = (event: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * this.width;
    this.pointer.y = ((event.clientY - rect.top) / rect.height) * this.height;
    this.pointerValid = true;
    this.pointerDirty = true;
    this.latestInputAt = performance.now();
  };

  private pointerDown = (event: PointerEvent): void => {
    if (event.button !== 0 && event.button !== 2) return;
    event.preventDefault();
    this.move(event);
    const action = event.button === 0 ? 'attack' : 'heavy';
    this.pressed.add(action);
    this.held.add(action);
    this.canvas.focus({ preventScroll: true });
    this.setDevice('Keyboard + Mouse');
  };

  private pointerUp = (event: PointerEvent): void => {
    this.held.delete(event.button === 0 ? 'attack' : 'heavy');
  };

  private blur = (): void => {
    this.held.clear();
    this.pressed.clear();
    this.mapper.reset();
    this.onFocusLost();
  };

  private gamepadConnection = (event: GamepadEvent): void => {
    if (event.type === 'gamepadconnected') this.connectedPads.add(event.gamepad.index);
    else this.connectedPads.delete(event.gamepad.index);
    this.held.clear();
    this.pressed.clear();
    this.mapper.reset();
  };

  private setDevice(device: InputDevice): void {
    if(device===this.device)return;
    if (performance.now() - this.latestInputAt < 180 && this.latestInputAt > 0) return;
    this.latestInputAt = performance.now();
    this.device=device;
    this.onDeviceChange(device);
  }

  start(): void {
    if (this.active) return;
    this.active = true;
    this.canvas.addEventListener('pointermove', this.move);
    this.canvas.addEventListener('pointerdown', this.pointerDown);
    window.addEventListener('pointerup', this.pointerUp);
    this.canvas.addEventListener('contextmenu', this.suppressContextMenu);
    window.addEventListener('keydown', this.keydown);
    window.addEventListener('keyup', this.keyup);
    window.addEventListener('blur', this.blur);
    window.addEventListener('gamepadconnected', this.gamepadConnection);
    window.addEventListener('gamepaddisconnected', this.gamepadConnection);
    this.canvas.focus({ preventScroll: true });
  }

  stop(): void {
    this.active = false;
    this.canvas.removeEventListener('pointermove', this.move);
    this.canvas.removeEventListener('pointerdown', this.pointerDown);
    window.removeEventListener('pointerup', this.pointerUp);
    this.canvas.removeEventListener('contextmenu', this.suppressContextMenu);
    window.removeEventListener('keydown', this.keydown);
    window.removeEventListener('keyup', this.keyup);
    window.removeEventListener('blur', this.blur);
    window.removeEventListener('gamepadconnected', this.gamepadConnection);
    window.removeEventListener('gamepaddisconnected', this.gamepadConnection);
    this.held.clear();
    this.pressed.clear();
    this.mapper.reset();
  }

  sample(hero: Vec2): ActionInput {
    const keyboardMove = normalize({
      x: Number(this.held.has('right')) - Number(this.held.has('left')),
      y: Number(this.held.has('down')) - Number(this.held.has('up')),
    });
    const keyboard: ActionInput = { movement: keyboardMove, aim: this.lastAim ?? { x: 0, y: -1 }, pressed: new Set(this.pressed), held: new Set(this.held) };
    this.pressed.clear();

    let pad: Gamepad | null = null;
    if (typeof navigator !== 'undefined' && navigator.getGamepads) {
      const pads = navigator.getGamepads();
      for (const index of this.connectedPads) {
        const candidate = pads[index];
        if (candidate?.connected) { pad = candidate; break; }
      }
      if (!pad) pad = Array.from(pads).find(candidate => candidate?.connected) ?? null;
    }
    const mapped = this.mapper.sample(pad, performance.now());
    const mouseAim = this.pointerValid ? normalize({ x: this.pointer.x - hero.x, y: this.pointer.y - hero.y }) : { x: 0, y: 0 };
    if (this.pointerDirty && Math.hypot(mouseAim.x, mouseAim.y) > 0.001) {
      this.lastAim = mouseAim;
      this.latestInputAt = performance.now();
      if(this.device!=='Keyboard + Mouse'){this.device='Keyboard + Mouse';this.onDeviceChange(this.device);}
      this.pointerDirty = false;
    }
    if (mapped.active && mapped.deviceLabel) {
      this.setDevice(mapped.deviceLabel as InputDevice);
    }

    const useGamepadMovement = !!pad && (mapped.active || mapped.actions.movement.x !== 0 || mapped.actions.movement.y !== 0);
    const combined = mergeActions(keyboard, mapped.actions, useGamepadMovement);
    if (useGamepadMovement && Math.hypot(mapped.actions.aim.x, mapped.actions.aim.y) > 0.001 && (Math.abs(pad?.axes[2] ?? 0) > 0.22 || Math.abs(pad?.axes[3] ?? 0) > 0.22)) this.lastAim = mapped.actions.aim;

    if (!this.lastAim && Math.hypot(combined.movement.x, combined.movement.y) > 0.001) this.lastAim = normalize(combined.movement);
    combined.aim = this.lastAim ?? { x: 0, y: -1 };
    return combined;
  }
}
