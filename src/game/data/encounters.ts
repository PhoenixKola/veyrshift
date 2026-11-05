import type { EnemyKind, UpgradeDefinition } from '../core/types.js';
export const ROOM_COUNT = 3; // Playground only, NOT the 10-14 room MVP route.
export const ARENA = { width: 1180, height: 680, inset: 70 } as const;
export const ENCOUNTERS: ReadonlyArray<readonly EnemyKind[]> = [
 ['wisp','wisp','wisp'],
 ['wisp','striker','wisp','striker'],
 ['sentinel','wisp','striker','wisp']
];
export const UPGRADES: readonly UpgradeDefinition[] = [
 {id:'momentum',name:'Surge Knuckles',description:'Basic strikes deal +30% damage.',icon:'◈'},
 {id:'capacity',name:'Pulse Capacitor',description:'Maximum Pulse increases by 25.',icon:'✧'},
 {id:'sparks',name:'Arc Ammunition',description:'Projectiles gain +40% power.',icon:'⌁'},
 {id:'vitality',name:'Patchwork Heart',description:'Heal 25 HP and increase maximum HP by 10.',icon:'♥'},
 {id:'echo',name:'Moving Echo',description:'Dashes cool down 25% faster.',icon:'❖'},
 {id:'focus',name:'Clear Meridian',description:'Guard counters generate extra Pulse.',icon:'◎'}
] as const;
