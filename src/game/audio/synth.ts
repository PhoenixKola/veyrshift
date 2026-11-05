/** Optional procedural feedback; no unlicensed sound packs shipped. */
export class SoundBus {
 private ctx?: AudioContext;
 enabled = true;
 masterVolume = .75;
 effectsVolume = .8;
 setVolumes(master:number,effects:number):void {
  this.masterVolume=Math.max(0,Math.min(1,master));
  this.effectsVolume=Math.max(0,Math.min(1,effects));
 }
 beep(freq: number, duration: number, type: OscillatorType='sine', volume=0.028): void {
  if (!this.enabled || typeof window === 'undefined') return;
  try {
   this.ctx ??= new AudioContext();
   if (this.ctx.state === 'suspended') void this.ctx.resume();
   const at = this.ctx.currentTime, osc = this.ctx.createOscillator(), gain = this.ctx.createGain();
   osc.type = type; osc.frequency.setValueAtTime(freq,at); osc.frequency.exponentialRampToValueAtTime(Math.max(35,freq*.65),at+duration);
   gain.gain.setValueAtTime(volume*this.masterVolume*this.effectsVolume,at); gain.gain.exponentialRampToValueAtTime(0.0001,at+duration);
   osc.connect(gain).connect(this.ctx.destination); osc.start(at); osc.stop(at+duration);
  } catch { /* Audio support optional */ }
 }
}
