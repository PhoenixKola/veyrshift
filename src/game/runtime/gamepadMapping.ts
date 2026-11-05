import type { ActionInput, KeyAction, Vec2 } from '../core/types.js';

export type GamepadButtonLike = { pressed: boolean; value: number };
export type GamepadLike = {
  id?: string;
  buttons: readonly GamepadButtonLike[];
  axes: readonly number[];
} | null;

export type MenuCommand = 'up' | 'down' | 'left' | 'right' | 'confirm' | 'back';
export type GamepadSample = {
  actions: ActionInput;
  menuPressed: Set<MenuCommand>;
  deviceLabel: string | null;
  active: boolean;
};

const EMPTY = (): ActionInput => ({ movement: { x: 0, y: 0 }, aim: { x: 0, y: -1 }, pressed: new Set(), held: new Set() });
export const GAMEPAD_DEADZONE = 0.18;
export const AIM_DEADZONE = 0.22;

export function radialDeadzone(x: number, y: number, threshold = GAMEPAD_DEADZONE): Vec2 {
  const magnitude = Math.min(1, Math.hypot(x, y));
  if (magnitude <= threshold) return { x: 0, y: 0 };
  const scaled = (magnitude - threshold) / (1 - threshold);
  return { x: (x / magnitude) * scaled, y: (y / magnitude) * scaled };
}

export class StandardGamepadMapper {
  private previous = new Set<number>();
  private lastAim: Vec2 = { x: 0, y: -1 };
  private menuCooldownUntil = 0;

  reset(): void {
    this.previous.clear();
    this.menuCooldownUntil = 0;
  }

  sample(pad: GamepadLike, now = 0): GamepadSample {
    if (!pad) {
      this.reset();
      const actions = EMPTY();
      return { actions, menuPressed: new Set(), deviceLabel: null, active: false };
    }

    const down = new Set<number>();
    pad.buttons.forEach((button, index) => {
      if (button.pressed || button.value >= 0.55) down.add(index);
    });
    const pressedButton = (index: number) => down.has(index) && !this.previous.has(index);
    const heldButton = (index: number) => down.has(index);

    const move = radialDeadzone(pad.axes[0] ?? 0, pad.axes[1] ?? 0);
    const aimStick = radialDeadzone(pad.axes[2] ?? 0, pad.axes[3] ?? 0, AIM_DEADZONE);
    if (Math.hypot(aimStick.x, aimStick.y) > 0.001) this.lastAim = aimStick;

    const pressed = new Set<KeyAction>();
    const held = new Set<KeyAction>();
    const actionButtons: [number, KeyAction][] = [
      [0, 'attack'], [1, 'dash'], [2, 'special'], [3, 'interact'],
      [5, 'heavy'], [6, 'ultimate'], [7, 'transform'], [9, 'pause'],
    ];
    for (const [index, action] of actionButtons) {
      if (pressedButton(index)) pressed.add(action);
      if (heldButton(index)) held.add(action);
    }
    if (heldButton(4)) held.add('guard');
    if (pressedButton(4)) pressed.add('guard');

    const menuPressed = new Set<MenuCommand>();
    const dpad: [number, MenuCommand][] = [[12, 'up'], [13, 'down'], [14, 'left'], [15, 'right']];
    for (const [index, command] of dpad) if (pressedButton(index)) menuPressed.add(command);
    if (pressedButton(0)) menuPressed.add('confirm');
    if (pressedButton(1) || pressedButton(9)) menuPressed.add('back');
    if (now >= this.menuCooldownUntil) {
      const lx = move.x;
      const ly = move.y;
      let stickCommand: MenuCommand | undefined;
      if (Math.abs(ly) > 0.72) stickCommand = ly < 0 ? 'up' : 'down';
      else if (Math.abs(lx) > 0.72) stickCommand = lx < 0 ? 'left' : 'right';
      if (stickCommand) {
        menuPressed.add(stickCommand);
        this.menuCooldownUntil = now + 190;
      }
    }

    const meaningful = Math.hypot(move.x, move.y) > 0.08 || Math.hypot(aimStick.x, aimStick.y) > 0.08 || down.size > 0;
    this.previous = down;
    return {
      actions: { movement: move, aim: this.lastAim, pressed, held },
      menuPressed,
      deviceLabel: this.platformLabel(pad.id ?? ''),
      active: meaningful,
    };
  }

  private platformLabel(id: string): string {
    const name = id.toLowerCase();
    if (name.includes('playstation') || name.includes('dualsense') || name.includes('dualshock')) return 'PlayStation';
    if (name.includes('xbox') || name.includes('xinput')) return 'Xbox';
    return 'Gamepad';
  }
}

export function mergeActions(keyboard: ActionInput, gamepad: ActionInput, useGamepadMovement: boolean): ActionInput {
  const pressed = new Set<KeyAction>([...keyboard.pressed, ...gamepad.pressed]);
  const held = new Set<KeyAction>([...keyboard.held, ...gamepad.held]);
  const move = useGamepadMovement && Math.hypot(gamepad.movement.x, gamepad.movement.y) > 0
    ? gamepad.movement : keyboard.movement;
  return { movement: move, aim: gamepad.aim, pressed, held };
}
