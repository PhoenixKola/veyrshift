import type { SaveData } from '../core/types.js';
export const SAVE_KEY = 'veyrshift-save-v1';
export const initialSave = (): SaveData => ({version:1,shards:0,bestRoom:0,runs:0,totalDefeats:0,
 unlockedHeroes:['kairo'],unlockedForms:[],settings:{screenshake:true,particles:true,reducedFlash:false}});
export function parseSave(raw: string | null): SaveData {
 if (!raw) return initialSave();
 try {
  const x: unknown = JSON.parse(raw);
  if (!x || typeof x !== 'object') return initialSave();
  const v = x as Partial<SaveData>;
  if (v.version !== 1 || !Number.isFinite(v.shards) || !Number.isFinite(v.runs)) return initialSave();
  if (!Array.isArray(v.unlockedHeroes) || !Array.isArray(v.unlockedForms) || !v.settings) return initialSave();
  return {
   version:1,shards:Math.max(0,Math.floor(v.shards!)),runs:Math.max(0,Math.floor(v.runs!)),
   bestRoom:Math.max(0,Math.floor(v.bestRoom || 0)),totalDefeats:Math.max(0,Math.floor(v.totalDefeats || 0)),
   unlockedHeroes:v.unlockedHeroes.filter((q):q is string=>typeof q==='string'),
   unlockedForms:v.unlockedForms.filter((q):q is string=>typeof q==='string'),
   settings:{screenshake:v.settings.screenshake!==false,particles:v.settings.particles!==false,reducedFlash:v.settings.reducedFlash===true}
  };
 } catch { return initialSave(); }
}
export function loadSave(): SaveData { try { return parseSave(localStorage.getItem(SAVE_KEY)); } catch { return initialSave(); } }
export function writeSave(save: SaveData): boolean { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); return true; } catch { return false; } }
