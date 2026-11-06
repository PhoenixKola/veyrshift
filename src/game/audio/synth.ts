export type SoundBusGroup = 'combat'|'ui';
type VoiceSpec = { wave?: OscillatorType; frequency: number; endFrequency?: number; duration: number; volume: number; delay?: number; noise?: boolean; filter?: number };
type SfxSpec = { group: SoundBusGroup; maxVoices: number; minimumGap: number; voices: VoiceSpec[] };
export type PlayedSound = { id: string; gameTime: number; browserTime: number; audioTime: number|null; audioState: string };

const SFX: Readonly<Record<string, SfxSpec>> = {
  'punch-one': { group: 'combat', maxVoices: 3, minimumGap: .035, voices: [
    { noise: true, frequency: 260, filter: 1900, duration: .065, volume: .12 }, { wave: 'triangle', frequency: 112, endFrequency: 67, duration: .105, volume: .19 },
  ] },
  'punch-two': { group: 'combat', maxVoices: 3, minimumGap: .04, voices: [
    { noise: true, frequency: 340, filter: 2600, duration: .075, volume: .13 }, { wave: 'triangle', frequency: 158, endFrequency: 81, duration: .12, volume: .2 },
  ] },
  'punch-three': { group: 'combat', maxVoices: 2, minimumGap: .12, voices: [
    { noise: true, frequency: 180, filter: 1450, duration: .12, volume: .22 }, { wave: 'sawtooth', frequency: 94, endFrequency: 42, duration: .23, volume: .24 }, { wave: 'sine', frequency: 255, endFrequency: 75, duration: .18, volume: .13, delay: .012 },
  ] },
  swing: { group: 'combat', maxVoices: 3, minimumGap: .045, voices: [
    { noise: true, frequency: 800, filter: 4200, duration: .085, volume: .075 }, { wave: 'sine', frequency: 480, endFrequency: 190, duration: .095, volume: .055 },
  ] },
  'bolt-cast': { group: 'combat', maxVoices: 2, minimumGap: .12, voices: [
    { wave: 'sine', frequency: 370, endFrequency: 780, duration: .14, volume: .09 }, { wave: 'triangle', frequency: 148, endFrequency: 250, duration: .13, volume: .1, delay: .025 },
  ] },
  'bolt-hit': { group: 'combat', maxVoices: 3, minimumGap: .04, voices: [
    { noise: true, frequency: 500, filter: 3200, duration: .09, volume: .13 }, { wave: 'sine', frequency: 640, endFrequency: 174, duration: .16, volume: .13 },
  ] },
  'bolt-dissipate': { group: 'combat', maxVoices: 2, minimumGap: .08, voices: [
    { wave: 'sine', frequency: 560, endFrequency: 290, duration: .11, volume: .055 },
  ] },
  'shockwave-charge': { group: 'combat', maxVoices: 1, minimumGap: .2, voices: [
    { wave: 'sine', frequency: 115, endFrequency: 235, duration: .24, volume: .12 }, { wave: 'triangle', frequency: 290, endFrequency: 420, duration: .21, volume: .055, delay: .05 },
  ] },
  'shockwave-release': { group: 'combat', maxVoices: 1, minimumGap: .2, voices: [
    { noise: true, frequency: 180, filter: 880, duration: .24, volume: .19 }, { wave: 'sine', frequency: 92, endFrequency: 43, duration: .32, volume: .22 }, { wave: 'triangle', frequency: 310, endFrequency: 88, duration: .25, volume: .1, delay: .025 },
  ] },
  'guard-start': { group: 'combat', maxVoices: 1, minimumGap: .18, voices: [
    { wave: 'sine', frequency: 490, endFrequency: 405, duration: .075, volume: .045 }, { wave: 'triangle', frequency: 125, endFrequency: 145, duration: .09, volume: .05, delay: .012 },
  ] },
  'guard-end': { group: 'combat', maxVoices: 1, minimumGap: .18, voices: [
    { wave: 'sine', frequency: 400, endFrequency: 290, duration: .08, volume: .035 },
  ] },
  block: { group: 'combat', maxVoices: 2, minimumGap: .08, voices: [
    { noise: true, frequency: 440, filter: 2600, duration: .07, volume: .11 }, { wave: 'triangle', frequency: 175, endFrequency: 105, duration: .1, volume: .09 },
  ] },
  parry: { group: 'combat', maxVoices: 1, minimumGap: .12, voices: [
    { wave: 'sine', frequency: 820, endFrequency: 530, duration: .16, volume: .18 }, { wave: 'triangle', frequency: 380, endFrequency: 700, duration: .11, volume: .1, delay: .018 },
  ] },
  'dash-start': { group: 'combat', maxVoices: 2, minimumGap: .07, voices: [
    { noise: true, frequency: 950, filter: 5600, duration: .105, volume: .1 }, { wave: 'sine', frequency: 210, endFrequency: 330, duration: .12, volume: .08 },
  ] },
  'dash-land': { group: 'combat', maxVoices: 2, minimumGap: .07, voices: [
    { noise: true, frequency: 280, filter: 1100, duration: .1, volume: .095 }, { wave: 'triangle', frequency: 105, endFrequency: 58, duration: .11, volume: .08 },
  ] },
  'pulse-gain': { group: 'combat', maxVoices: 2, minimumGap: .09, voices: [
    { wave: 'sine', frequency: 720, endFrequency: 910, duration: .08, volume: .045 },
  ] },
  'pulse-ready': { group: 'combat', maxVoices: 1, minimumGap: .3, voices: [
    { wave: 'sine', frequency: 523, endFrequency: 784, duration: .18, volume: .1 }, { wave: 'triangle', frequency: 659, endFrequency: 988, duration: .22, volume: .07, delay: .11 },
  ] },
  'action-unavailable': { group: 'combat', maxVoices: 1, minimumGap: .22, voices: [
    { wave: 'triangle', frequency: 170, endFrequency: 132, duration: .09, volume: .055 },
  ] },
  'finisher-build': { group: 'combat', maxVoices: 1, minimumGap: .3, voices: [
    { wave: 'sine', frequency: 78, endFrequency: 175, duration: .28, volume: .13 }, { wave: 'triangle', frequency: 180, endFrequency: 340, duration: .22, volume: .085, delay: .07 },
  ] },
  'finisher-hit': { group: 'combat', maxVoices: 1, minimumGap: .3, voices: [
    { noise: true, frequency: 170, filter: 1000, duration: .2, volume: .22 }, { wave: 'sawtooth', frequency: 63, endFrequency: 38, duration: .32, volume: .2 }, { wave: 'sine', frequency: 440, endFrequency: 95, duration: .28, volume: .14, delay: .015 },
  ] },
  'finisher-fade': { group: 'combat', maxVoices: 1, minimumGap: .3, voices: [
    { wave: 'sine', frequency: 560, endFrequency: 210, duration: .25, volume: .07 }, { noise: true, frequency: 700, filter: 2400, duration: .22, volume: .04, delay: .025 },
  ] },
  hurt: { group: 'combat', maxVoices: 1, minimumGap: .12, voices: [
    { noise: true, frequency: 210, filter: 1200, duration: .1, volume: .11 }, { wave: 'triangle', frequency: 150, endFrequency: 79, duration: .12, volume: .08 },
  ] },
  kill: { group: 'combat', maxVoices: 2, minimumGap: .08, voices: [
    { wave: 'sine', frequency: 330, endFrequency: 660, duration: .16, volume: .075 }, { wave: 'triangle', frequency: 210, endFrequency: 430, duration: .12, volume: .055, delay: .035 },
  ] },
  'ember-start': { group: 'combat', maxVoices: 1, minimumGap: .3, voices: [
    { wave: 'sawtooth', frequency: 92, endFrequency: 205, duration: .42, volume: .08 }, { wave: 'sine', frequency: 230, endFrequency: 420, duration: .35, volume: .06, delay: .07 },
  ] },
  'ember-end': { group: 'combat', maxVoices: 1, minimumGap: .3, voices: [
    { wave: 'sine', frequency: 390, endFrequency: 130, duration: .2, volume: .055 },
  ] },
  'ui-confirm': { group: 'ui', maxVoices: 2, minimumGap: .05, voices: [{ wave: 'sine', frequency: 520, endFrequency: 760, duration: .075, volume: .055 }] },
  'ui-pause': { group: 'ui', maxVoices: 1, minimumGap: .1, voices: [{ wave: 'sine', frequency: 410, endFrequency: 260, duration: .12, volume: .06 }] },
};

/** Deterministic Web Audio synthesis with explicit per-event limits and separate mix controls. */
export class SoundBus {
  private ctx?: AudioContext;
  private masterGain?: GainNode;
  private lastPlayed = new Map<string, number>();
  private voiceEnds = new Map<string, number[]>();
  private noiseSeed = 0x2468ace;
  enabled = true;
  masterVolume = .75;
  effectsVolume = .8;
  uiVolume = .52;
  eventLog: PlayedSound[] = [];

  setVolumes(master: number, effects: number): void {
    this.masterVolume = Math.max(0, Math.min(1, master));
    this.effectsVolume = Math.max(0, Math.min(1, effects));
    this.uiVolume = this.effectsVolume * .65;
    if (this.masterGain && this.ctx) this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, .025);
  }

  unlock(): void {
    if (typeof window === 'undefined' || typeof AudioContext === 'undefined') return;
    try {
      this.ctx ??= new AudioContext();
      if (!this.masterGain) {
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.masterVolume;
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume();
    } catch { /* Audio is optional on unsupported browsers. */ }
  }

  suspend(): void { if (this.ctx?.state === 'running') void this.ctx.suspend(); }
  resume(): void { if (this.enabled) this.unlock(); }

  play(id: string, gameTime = 0, intensity = 1): void {
    if (typeof window === 'undefined') return;
    const spec = SFX[id];
    this.eventLog.push({ id, gameTime, browserTime: performance.now(), audioTime: this.ctx?.currentTime ?? null, audioState: this.ctx?.state ?? 'locked' });
    if (this.eventLog.length > 500) this.eventLog.splice(0, this.eventLog.length - 500);
    if (!this.enabled || !spec) return;
    const now = performance.now() / 1000;
    const previous = this.lastPlayed.get(id) ?? -Infinity;
    if (now - previous < spec.minimumGap) return;
    this.unlock();
    const context = this.ctx, master = this.masterGain;
    if (!context || !master || context.state !== 'running') return;
    const active = (this.voiceEnds.get(id) ?? []).filter(end => end > context.currentTime);
    if (active.length >= spec.maxVoices) return;
    this.lastPlayed.set(id, now);
    this.voiceEnds.set(id, [...active, context.currentTime + Math.max(...spec.voices.map(voice => voice.duration + (voice.delay ?? 0)))]);
    const busGain = spec.group === 'combat' ? this.effectsVolume : this.uiVolume;
    for (const voice of spec.voices) this.playVoice(context, master, voice, Math.max(.25, Math.min(1.6, intensity)), busGain);
  }

  private playVoice(context: AudioContext, destination: AudioNode, voice: VoiceSpec, intensity: number, busGain: number): void {
    const at = context.currentTime + (voice.delay ?? 0);
    const level = Math.max(.0001, voice.volume * busGain * intensity);
    const envelope = context.createGain();
    envelope.gain.setValueAtTime(.0001, at);
    envelope.gain.linearRampToValueAtTime(level, at + Math.min(.012, voice.duration * .22));
    envelope.gain.exponentialRampToValueAtTime(.0001, at + voice.duration);
    if (voice.noise) {
      const source = context.createBufferSource();
      const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * Math.min(voice.duration, .35)), context.sampleRate);
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < channel.length; i++) {
        this.noiseSeed = (this.noiseSeed * 1664525 + 1013904223) >>> 0;
        channel[i] = ((this.noiseSeed / 0xffffffff) * 2 - 1) * (1 - i / channel.length);
      }
      source.buffer = buffer;
      const filter = context.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.setValueAtTime(voice.filter ?? 900, at);
      source.connect(filter).connect(envelope); envelope.connect(destination); source.start(at); source.stop(at + voice.duration);
    } else {
      const oscillator = context.createOscillator(); oscillator.type = voice.wave ?? 'sine';
      oscillator.frequency.setValueAtTime(voice.frequency, at);
      if (voice.endFrequency) oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, voice.endFrequency), at + voice.duration);
      oscillator.connect(envelope); envelope.connect(destination); oscillator.start(at); oscillator.stop(at + voice.duration);
    }
  }
}

export const sharedSoundBus = new SoundBus();
