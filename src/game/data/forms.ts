import type { FormDiscipline } from '../core/types.js';
// 42 form *design records*, NOT implementations/unlocks. See the V2 design bible.
export type FormRecord = { id: string; heroId: string; name: string; discipline: FormDiscipline; stage: number; implementation: 'prototype'|'planned'; };
const records: readonly [string, string, string, string, string, string, string, string][] = [
 ['kairo','Ember Drive','Comet Regalia','Glass Current','Horizon Still','Gravity Break','Nova Undertow','Split-Sun Sovereign'],
 ['lyra','Orbitstorm','Meteor Loom','Silent Meridian','Zero Arc','Twin Singularity','Celestial Tether','Astral Polarity'],
 ['bram','Fault Pulse','Titan Mantle','Bedrock Heart','Still Quarry','Ironquake','World Hammer','Mountain Unmade'],
 ['noxi','Echo Rush','Night Cascade','Ghost Interval','Hollow Step','Ink Reversal','Shade Swarm','Ten Thousand Steps'],
 ['pip','Sparkstorm','Thunder Architect','Deadlock','Clockwork Grace','Overcharge','Event Horizon','One-Second Universe'],
 ['nyvelle','Prism Drive','Hundred Edge','Crystal Poise','Zero Reflection','Fracture Waltz','Glass Tempest','Luminous Divide']
];
const specs: readonly {discipline: FormDiscipline; stage: number}[] = [
 {discipline:'fury',stage:1},{discipline:'fury',stage:2},
 {discipline:'precision',stage:1},{discipline:'precision',stage:2},
 {discipline:'anomaly',stage:1},{discipline:'anomaly',stage:2},
 {discipline:'mythic',stage:1}
];
export const FORMS: readonly FormRecord[] = records.flatMap(([heroId,...names]) => names.map((name,i)=>({
 id:`${heroId}-${i+1}`,heroId,name,discipline:specs[i].discipline,stage:specs[i].stage,
 implementation: heroId==='kairo' && i===0 ? 'prototype' : 'planned'
})));
