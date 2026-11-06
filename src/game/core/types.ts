export type Vec2 = { x: number; y: number };
export type GameMode = 'hub' | 'playing' | 'reward' | 'victory' | 'defeat' | 'paused';
export type EnemyKind = 'wisp' | 'striker' | 'sentinel';
export type FormDiscipline = 'fury' | 'precision' | 'anomaly' | 'mythic';
export type KairoFormId = 'base' | 'ember-drive' | 'glass-current';
export type PlayableFormId = Exclude<KairoFormId,'base'>;
export type KeyAction = 'up'|'down'|'left'|'right'|'attack'|'bolt'|'shockwave'|'guard'|'dash'|'transform'|'finisher'|'interact'|'pause';
export type AbilityId = 'combo'|'bolt'|'shockwave'|'guard'|'dodge'|'finisher'|'emberPreview';
export type AbilityReadyReason = 'ready'|'cooldown'|'recovery'|'insufficient-pulse'|'staggered'|'locked';
export type AbilityRuntimeSnapshot = {
  cooldownRemaining: number;
  cooldownDuration: number;
  pulseCost: number;
  ready: boolean;
  reason: AbilityReadyReason;
};
export type LocomotionState = 'idle'|'start'|'run'|'stop';
export type CombatEventId = 'combo-start'|'combo-contact'|'bolt-cast'|'bolt-hit'|'bolt-dissipate'|'shockwave-charge'|'shockwave-release'|'shockwave-hit'|'guard-start'|'guard-end'|'parry'|'block'|'dash-start'|'dash-land'|'pulse-ready'|'pulse-gain'|'action-unavailable'|'finisher-build'|'finisher-hit'|'finisher-fade'|'hurt'|'kill'|'ember-start'|'ember-end'|'glass-start'|'glass-end'|'glass-counter'|'room-clear'|'reward'|'victory'|'defeat'|'swing';
export type CombatEvent = {
  id: CombatEventId;
  x: number;
  y: number;
  angle?: number;
  intensity?: number;
  ability?: AbilityId;
  comboIndex?: number;
};
export type GameSettings = {
  masterVolume: number;
  musicVolume: number;
  effectsVolume: number;
  screenshake: boolean;
  particles: boolean;
  reducedFlash: boolean;
  reducedMotion: boolean;
};
export type SaveData = {
  version: 3;
  shards: number;
  bestRoom: number;
  runs: number;
  totalDefeats: number;
  unlockedHeroes: string[];
  unlockedForms: string[];
  equippedForm: PlayableFormId;
  precisionTrials: number;
  settings: GameSettings;
};
export interface Enemy {
  id: number; kind: EnemyKind; x: number; y: number; hp: number; maxHp: number;
  radius: number; speed: number; flash: number; phase: number;
  attackCooldown: number; telegraph: number; stagger: number; vx: number; vy: number;
  emberMarks?: number;
}
export interface Projectile { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; age: number; radius: number; power: number; source: 'hero'|'enemy'; color: string; ability?: AbilityId; hitsRemaining?: number; piercedEnemyIds?: number[]; }
export interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string; }
export interface Hero {
  x: number; y: number; vx: number; vy: number; face: number;
  moveFacing: import('./direction.js').FacingDirection; hurtFacing: import('./direction.js').FacingDirection; attackFacing: import('./direction.js').FacingDirection; actionAngle: number;
  hp: number; maxHp: number; pulse: number; maxPulse: number;
  dashTime: number; invuln: number;
  attackTime: number; attackAnimTime: number; attackDuration: number; attackStartup: number;
  attackHitFired: boolean; attackCooldown: number; attackBuffer: number; combo: number; comboWindow: number;
  abilityCooldowns: Record<AbilityId, number>;
  currentAbility: AbilityId|null; abilityAnimTime: number; abilityAnimDuration: number; abilityContactFired: boolean;
  guardTime: number; parryWindow: number;
  formTime: number; formMaxTime: number; transformVisualTime: number; transformVisualDuration: number; transformed: boolean;
  formId: KairoFormId; emberMarks: number; glassCounterTime: number;
  locomotion: LocomotionState; locomotionTime: number; movingInput: boolean;
  hurtTime: number; ko: boolean; hitFlash: number; step: number;
}
export interface GameSnapshot {
  mode: GameMode; room: number; roomsTotal: number; enemyCount: number;
  hp: number; maxHp: number; pulse: number; maxPulse: number; combo: number; guarding: boolean; parryWindow: number;
  transformed: boolean; formTime: number; formId: KairoFormId; shards: number; bankedShards: number;
  bestRoom: number; runs: number; message: string; upgrades: string[]; pauseFrom?: GameMode;
  abilities: Record<AbilityId, AbilityRuntimeSnapshot>;
}
export interface ActionInput {
  movement: Vec2;
  aim: Vec2;
  pressed: Set<KeyAction>;
  held: Set<KeyAction>;
}
export type UpgradeId = 'momentum'|'capacity'|'sparks'|'vitality'|'echo'|'focus';
export type UpgradeDefinition = { id: UpgradeId; name: string; description: string; icon: string; };
