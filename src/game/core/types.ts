export type Vec2 = { x: number; y: number };
export type GameMode = 'hub' | 'playing' | 'reward' | 'victory' | 'defeat' | 'paused';
export type EnemyKind = 'wisp' | 'striker' | 'sentinel';
export type FormDiscipline = 'fury' | 'precision' | 'anomaly' | 'mythic';
export type KeyAction = 'up'|'down'|'left'|'right'|'attack'|'heavy'|'special'|'guard'|'dash'|'transform'|'ultimate'|'interact'|'pause';
export type SaveData = {
  version: 1;
  shards: number;
  bestRoom: number;
  runs: number;
  totalDefeats: number;
  unlockedHeroes: string[];
  unlockedForms: string[];
  settings: { screenshake: boolean; particles: boolean; reducedFlash: boolean };
};
export interface Enemy {
  id: number; kind: EnemyKind; x: number; y: number; hp: number; maxHp: number;
  radius: number; speed: number; flash: number; phase: number;
  attackCooldown: number; telegraph: number; stagger: number; vx: number; vy: number;
}
export interface Projectile { x: number; y: number; vx: number; vy: number; life: number; radius: number; power: number; source: 'hero'|'enemy'; color: string; }
export interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; color: string; }
export interface Hero {
  x: number; y: number; vx: number; vy: number; face: number;
  hp: number; maxHp: number; pulse: number; maxPulse: number;
  dashTime: number; dashCooldown: number; invuln: number;
  attackTime: number; attackCooldown: number; combo: number; comboWindow: number;
  guardTime: number; parryWindow: number; specialCooldown: number; ultimateCooldown: number;
  formTime: number; formMaxTime: number; formCooldown: number; transformed: boolean;
  hitFlash: number; step: number;
}
export interface GameSnapshot {
  mode: GameMode; room: number; roomsTotal: number; enemyCount: number;
  hp: number; maxHp: number; pulse: number; maxPulse: number; combo: number;
  transformed: boolean; formTime: number; shards: number; bankedShards: number;
  bestRoom: number; runs: number; message: string; upgrades: string[]; pauseFrom?: GameMode;
}
export interface ActionInput {
  movement: Vec2;
  aim: Vec2;
  pressed: Set<KeyAction>;
  held: Set<KeyAction>;
}
export type UpgradeId = 'momentum'|'capacity'|'sparks'|'vitality'|'echo'|'focus';
export type UpgradeDefinition = { id: UpgradeId; name: string; description: string; icon: string; };
