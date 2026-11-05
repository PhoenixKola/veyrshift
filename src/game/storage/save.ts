import type { SaveData } from '../core/types.js';
export const SAVE_KEY = 'veyrshift-save-v1';
export const DEFAULT_SETTINGS = {masterVolume:.75,musicVolume:.35,effectsVolume:.8,screenshake:true,particles:true,reducedFlash:false,reducedMotion:false} as const;
export const initialSave = (): SaveData => ({version:2,shards:0,bestRoom:0,runs:0,totalDefeats:0,
 unlockedHeroes:['kairo'],unlockedForms:[],settings:{...DEFAULT_SETTINGS}});
export function parseSave(raw: string | null): SaveData {
 if (!raw) return initialSave();
 try {
  const x: unknown = JSON.parse(raw);
  if (!x || typeof x !== 'object') return initialSave();
  const v = x as Omit<Partial<SaveData>, 'version'> & { version?: number };
  if ((v.version !== 1 && v.version !== 2) || !Number.isFinite(v.shards) || !Number.isFinite(v.runs)) return initialSave();
  if (!Array.isArray(v.unlockedHeroes) || !Array.isArray(v.unlockedForms) || (!v.settings && v.version !== 1)) return initialSave();
  const settings = (v.settings ?? {}) as Partial<SaveData['settings']>;
  const volume = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? Math.max(0,Math.min(1,value)) : fallback;
  return {
   version:2,shards:Math.max(0,Math.floor(v.shards!)),runs:Math.max(0,Math.floor(v.runs!)),
   bestRoom:Math.max(0,Math.floor(v.bestRoom || 0)),totalDefeats:Math.max(0,Math.floor(v.totalDefeats || 0)),
   unlockedHeroes:v.unlockedHeroes.filter((q):q is string=>typeof q==='string'),
   unlockedForms:v.unlockedForms.filter((q):q is string=>typeof q==='string'),
   settings:{
    masterVolume:volume(settings.masterVolume,DEFAULT_SETTINGS.masterVolume),
    musicVolume:volume(settings.musicVolume,DEFAULT_SETTINGS.musicVolume),
    effectsVolume:volume(settings.effectsVolume,DEFAULT_SETTINGS.effectsVolume),
    screenshake:settings.screenshake!==false,particles:settings.particles!==false,
    reducedFlash:settings.reducedFlash===true,reducedMotion:settings.reducedMotion===true
   }
  };
 } catch { return initialSave(); }
}
export function loadSave(): SaveData { try { return parseSave(localStorage.getItem(SAVE_KEY)); } catch { return initialSave(); } }
export function writeSave(save: SaveData): boolean { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); return true; } catch { return false; } }
