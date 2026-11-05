import { GameController } from '../game/runtime/GameController.js';
import { UPGRADES } from '../game/data/encounters.js';
import type { GameSnapshot } from '../game/core/types.js';
/** Dependency-free preview of the SAME engine/renderer. React/Vite is the intended application shell. */
const canvas=document.querySelector<HTMLCanvasElement>('#stage');
const overlay=document.querySelector<HTMLDivElement>('#overlay');
const hp=document.querySelector<HTMLDivElement>('#hp');
const pulse=document.querySelector<HTMLDivElement>('#pulse');
const hud=document.querySelector<HTMLDivElement>('#hud');
const status=document.querySelector<HTMLSpanElement>('#status');
const stats=document.querySelector<HTMLDivElement>('#stats');
if(!canvas||!overlay||!hp||!pulse||!hud||!status||!stats)throw new Error('Preview HTML is incomplete');
const o=overlay,h=hp,p=pulse,hd=hud,st=status,m=stats;
let previous='';
const controller=new GameController(canvas, (s:GameSnapshot)=>{
 h.style.width=`${Math.max(0,s.hp/s.maxHp*100)}%`;
 p.style.width=`${s.pulse/s.maxPulse*100}%`;
 st.textContent=s.message;
 m.textContent=`ROOM ${String(s.room).padStart(2,'0')} / ${s.roomsTotal}  •  HOSTILES ${s.enemyCount}  •  SHARDS ${s.shards}`;
 hd.style.display=s.mode==='playing'?'block':'none';
 if(s.mode===previous)return;previous=s.mode;
 if(s.mode==='playing'){o.hidden=true;return;}
 o.hidden=false;
 if(s.mode==='hub')o.innerHTML=`<span class="overline">TRANSMISSION // 001</span><h1>THE WEAVE<br/><em>AWAITS.</em></h1><p>One fighter. Three playable chambers. An unfinished universe to explore.</p><button class="primary" data-action="start">ENTER THE SHATTERFIELDS ↗</button><small>Playable prototype · Kairo Venn</small>`;
 else if(s.mode==='reward')o.innerHTML=`<span class="overline">RESONANCE SECURED</span><h2>CHOOSE YOUR THREAD</h2><p>One decision shifts this run.</p><div class="reward-grid">${controller.session.rewardChoices.map((id,i)=>{const u=UPGRADES.find(z=>z.id===id)!;return `<button class="reward-card" data-reward="${i}"><span class="reward-icon">${u.icon}</span><b>${u.name}</b><small>${u.description}</small><span class="pick">SELECT / 0${i+1} ↗</span></button>`;}).join('')}</div>`;
 else if(s.mode==='paused')o.innerHTML=`<span class="overline">SYSTEM STATE / PAUSED</span><h2>STAY IN THE THREAD</h2><button class="primary" data-action="resume">RESUME COMBAT ↗</button><button class="secondary" data-action="hub">ABANDON TO HUB</button>`;
 else o.innerHTML=`<span class="overline">THE WEAVE REMEMBERS</span><h2>${s.mode==='victory'?'THREAD STABILIZED':'THREAD COLLAPSED'}</h2><p>${s.mode==='victory'?'Prototype route cleared. The real journey is yet to come.':'Failure still leaves a trace. Learn the rhythm and try again.'}</p><div class="results"><span>SHARDS EARNED <b>+${s.shards}</b></span><span>DEEPEST CHAMBER <b>${s.room}</b></span></div><button class="primary" data-action="start">RUN AGAIN ↗</button><button class="secondary" data-action="hub">BACK TO HUB</button>`;
});
const buttons=(event:MouseEvent):void=>{
 const target=(event.target as HTMLElement).closest<HTMLButtonElement>('button');if(!target)return;
 if(target.dataset.action==='start')controller.newRun();
 else if(target.dataset.action==='resume')controller.togglePause();
 else if(target.dataset.action==='hub')controller.hub();
 else if(target.dataset.reward)controller.reward(Number(target.dataset.reward));
};
o.addEventListener('click',buttons);
controller.start();
// Used by automated smoke tests to inspect the real renderer/session without adding cheat controls.
if(import.meta.url.includes('preview'))(window as Window & {__VEYRSHIFT_DEBUG__?:GameController}).__VEYRSHIFT_DEBUG__=controller;
