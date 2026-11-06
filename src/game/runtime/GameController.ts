import { CombatSession } from './CombatSession.js';
import { InputController } from './InputController.js';
import { CanvasRenderer } from '../render/CanvasRenderer.js';
import { sharedSoundBus } from '../audio/synth.js';
import type { GameSnapshot, KeyAction, CombatEvent } from '../core/types.js';
import type { InputDevice } from './InputController.js';

const SOUND_BY_EVENT: Partial<Record<CombatEvent['id'], string>> = {
  'combo-start': 'swing', swing: 'swing', 'bolt-cast': 'bolt-cast', 'bolt-hit': 'bolt-hit', 'bolt-dissipate': 'bolt-dissipate',
  'shockwave-charge': 'shockwave-charge', 'shockwave-release': 'shockwave-release', 'guard-start': 'guard-start', 'guard-end': 'guard-end',
  parry: 'parry', block: 'block', 'dash-start': 'dash-start', 'dash-land': 'dash-land', 'pulse-gain': 'pulse-gain',
  'pulse-ready': 'pulse-ready', 'action-unavailable': 'action-unavailable', 'finisher-build': 'finisher-build',
  'finisher-hit': 'finisher-hit', 'finisher-fade': 'finisher-fade', hurt: 'hurt', kill: 'kill',
  'ember-start': 'ember-start', 'ember-end': 'ember-end', 'glass-start': 'glass-start', 'glass-end': 'glass-end', reward: 'ui-confirm', 'room-clear': 'ui-confirm',
};

/** Runtime binding: Canvas implementation can be replaced without replacing game rules. */
export class GameController {
  readonly session = new CombatSession();
  readonly input: InputController;
  readonly renderer: CanvasRenderer;
  readonly sound = sharedSoundBus;
  private raf = 0;
  private previous = 0;
  private lastPublish = 0;
  private accumulator = 0;
  private pendingPressed = new Set<KeyAction>();
  private readonly fixedStep = 1/60;
  private publishedMode = '';
  private destroyed = false;

  constructor(canvas: HTMLCanvasElement, private onSnapshot: (value: GameSnapshot) => void,
    onDeviceChange: (device: InputDevice) => void = () => undefined, forceB02 = false) {
    this.renderer = new CanvasRenderer(canvas, forceB02);
    this.input = new InputController(canvas, this.session.width, this.session.height, onDeviceChange, () => {
      if (this.session.mode === 'playing') this.session.pause();
      this.clearInputs(); this.sound.suspend(); this.publish();
    }, () => this.sound.unlock());
    this.sound.setVolumes(this.session.save.settings.masterVolume, this.session.save.settings.effectsVolume);
    this.publish();
  }

  start(): void {
    if (this.destroyed) throw new Error('Cannot restart a disposed controller');
    this.input.start(); this.previous = performance.now();
    void this.renderer.assetsReady.then(() => { if (!this.destroyed) this.raf = requestAnimationFrame(this.frame); });
  }
  dispose(): void { this.destroyed = true; cancelAnimationFrame(this.raf); this.input.stop(); }
  newRun(seed?: number): void { this.clearInputs(); this.session.newRun(seed); this.sound.resume(); this.publish(); }
  reward(choice: number): void { this.clearInputs(); this.session.chooseReward(choice); this.publish(); }
  togglePause(): void {
    const before = this.session.mode;
    this.session.pause(); this.clearInputs();
    if (before === 'playing' && this.session.mode === 'paused') this.sound.suspend();
    else if (this.session.mode === 'playing') this.sound.resume();
    this.publish();
  }
  hub(): void { this.clearInputs(); this.session.returnToHub(); this.publish(); }

  private clearInputs(): void { this.pendingPressed.clear(); this.input.clearCombatInput(); }
  private publish(): void { this.onSnapshot(this.session.snapshot); this.publishedMode = this.session.mode; this.lastPublish = performance.now(); }

  private playEvent(event: CombatEvent): void {
    let soundId = SOUND_BY_EVENT[event.id];
    if (event.id === 'combo-contact') soundId = event.intensity && event.intensity >= 3 ? 'punch-three' : event.intensity && event.intensity >= 2 ? 'punch-two' : 'punch-one';
    if(event.formId==='ember-drive'){
      if(event.id==='combo-contact')soundId=`ember-hit${Math.max(1,Math.min(3,event.comboIndex??1))}`;
      else if(event.id==='bolt-cast')soundId='ember-bolt-cast';else if(event.id==='bolt-hit')soundId='ember-bolt-hit';
      else if(event.id==='shockwave-release'||event.id==='glass-counter')soundId='ember-special';
      else if(event.id==='finisher-build')soundId='ember-finisher-build';else if(event.id==='finisher-hit')soundId='ember-finisher-hit';
    }else if(event.formId==='glass-current'){
      if(event.id==='combo-contact')soundId='glass-contact';
      else if(event.id==='bolt-cast')soundId='glass-bolt-cast';else if(event.id==='bolt-hit')soundId='glass-bolt-hit';
      else if(event.id==='shockwave-release'||event.id==='glass-counter'||event.id==='parry')soundId=event.id==='shockwave-release'?'glass-special':'glass-counter';
      else if(event.id==='finisher-build')soundId='glass-finisher-build';else if(event.id==='finisher-hit')soundId='glass-finisher-hit';else if(event.id==='finisher-fade')soundId='glass-finisher-fade';
      else if(event.id==='dash-start'||event.id==='dash-land')soundId='glass-dodge';
    }
    if (soundId) this.sound.play(soundId, this.session.clock, event.intensity ?? 1);
  }

  private frame = (now: number): void => {
    if (this.destroyed) return;
    const elapsed = Math.min(Math.max(0, (now - this.previous) / 1000), .1); this.previous = now;
    this.accumulator = Math.min(this.accumulator + elapsed, this.fixedStep * 6);
    const sampled = this.input.sample(this.session.hero);
    if (sampled.pressed.has('pause') && ['playing', 'paused'].includes(this.session.mode)) this.togglePause();
    if (this.session.mode === 'playing') for (const action of sampled.pressed) this.pendingPressed.add(action);
    else this.pendingPressed.clear();

    let steps = 0;
    while (this.accumulator >= this.fixedStep && steps < 6) {
      if (this.session.mode === 'playing') {
        const input = { ...sampled, pressed: this.pendingPressed };
        this.pendingPressed = new Set<KeyAction>();
        this.session.update(this.fixedStep, input);
      }
      this.accumulator -= this.fixedStep; steps++;
    }

    const events = this.session.consumeEvents();
    this.renderer.emit(events, this.session.clock);
    for (const event of events) this.playEvent(event);
    this.renderer.render(this.session);
    if (now - this.lastPublish > 70 || this.publishedMode !== this.session.mode) this.publish();
    this.raf = requestAnimationFrame(this.frame);
  };
}
