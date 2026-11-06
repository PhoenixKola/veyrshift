import type { KairoFormId } from '../core/types.js';

export type KairoForm = {
  id: Exclude<KairoFormId, 'base'>;
  name: string;
  discipline: 'fury'|'precision';
  playstyle: string;
  tradeoff: string;
  duration: number;
  upkeepPerSecond: number;
  activationCost: number;
  cooldown: number;
  unlock: string;
  appearance: string;
  combat: {moveSpeed:number;dodgeDuration:number;dodgeIframes:number;markCap:number;markDetonationDamage:number;boltPierceTargets:number;boltSplashRadius:number;boltSplashDamage:number;specialRadius:number;specialDamage:number;specialTargetCap:number;finisherDamage:number;finisherRange:number;finisherTargetCap:number;counterDamage:number;};
  moves: readonly {name:string; input:string; description:string}[];
};

export const KAIRO_FORMS: readonly KairoForm[] = [
  { id:'ember-drive', name:'Ember Drive', discipline:'fury', playstyle:'Close-range pressure; detonate a target after three confirmed contacts.',
    tradeoff:'Faster pursuit and stronger contact, but drains Pulse and grants less dodge invulnerability.', duration:8, upkeepPerSecond:2, activationCost:40, cooldown:11, unlock:'Available at the start of the prototype.',
    appearance:'Kairo’s proposed copper-seamed cuff lattice and ember-lit plum coat.',
    combat:{moveSpeed:322,dodgeDuration:.19,dodgeIframes:.20,markCap:3,markDetonationDamage:7,boltPierceTargets:1,boltSplashRadius:68,boltSplashDamage:9,specialRadius:172,specialDamage:24,specialTargetCap:8,finisherDamage:84,finisherRange:244,finisherTargetCap:3,counterDamage:0},
    moves:[{name:'Ember String',input:'LMB',description:'Each confirmed hit marks its target; the third contact detonates those marks.'},{name:'Blazing Volley',input:'RMB',description:'A fast copper projectile with a small secondary burst on contact.'},{name:'Inferno Break',input:'Q',description:'A forward ignition arc with reduced crowd reach.'},{name:'Comet Finisher',input:'F',description:'A Pulse-consuming step-through impact; transformed cost is 50 Pulse.'}] },
  { id:'glass-current', name:'Glass Current', discipline:'precision', playstyle:'Win single-target exchanges with perfect dodges and clean counter windows.',
    tradeoff:'Longer mobility window and counter reward, but lower broad-area pressure and slower pursuit.', duration:8, upkeepPerSecond:1.5, activationCost:40, cooldown:11, unlock:'Land five perfect parries across runs.',
    appearance:'Kairo’s proposed prismatic cuff insets and precise glass echo disc.',
    combat:{moveSpeed:260,dodgeDuration:.24,dodgeIframes:.30,markCap:0,markDetonationDamage:0,boltPierceTargets:3,boltSplashRadius:0,boltSplashDamage:0,specialRadius:136,specialDamage:36,specialTargetCap:1,finisherDamage:96,finisherRange:300,finisherTargetCap:1,counterDamage:22},
    moves:[{name:'Glass Thread',input:'LMB',description:'Three manually timed precision contacts.'},{name:'Piercing Refraction',input:'RMB',description:'A narrow, high-speed line projectile that pierces up to three distinct targets.'},{name:'Echo Counter',input:'Q',description:'A short-range intercept. It activates only after a perfect parry or a hit avoided during a dodge.'},{name:'Prism Sequence',input:'F',description:'A focused single-target Pulse finisher; transformed cost is 50 Pulse.'}] },
];

export const formById = (id: KairoFormId): KairoForm | undefined => KAIRO_FORMS.find(form=>form.id===id);
