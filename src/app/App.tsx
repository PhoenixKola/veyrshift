import { useEffect, useRef, useState } from 'react';
import { GameController } from '../game/runtime/GameController.js';
import { UPGRADES } from '../game/data/encounters.js';
import type { GameSnapshot } from '../game/core/types.js';
const BOOT: GameSnapshot={mode:'hub',room:0,roomsTotal:3,enemyCount:0,hp:100,maxHp:100,pulse:0,maxPulse:100,combo:0,
 transformed:false,formTime:0,shards:0,bankedShards:0,bestRoom:0,runs:0,message:'Loading Weave...',upgrades:[]};
export function App(){
 const canvas=useRef<HTMLCanvasElement>(null);
 const controller=useRef<GameController|null>(null);
 const [s,setSnapshot]=useState<GameSnapshot>(BOOT);
 const [muted,setMuted]=useState(false);
 useEffect(()=>{
  if(!canvas.current)return;
  const c=new GameController(canvas.current,setSnapshot);controller.current=c;c.start();
  return()=>{c.dispose();controller.current=null;};
 },[]);
 useEffect(()=>{if(controller.current)controller.current.sound.enabled=!muted;},[muted]);
 const fmt=(n:number)=>String(n).padStart(2,'0');
 return <div className="shell">
  <header className="topbar"><div className="brand"><span className="brand-symbol">◈</span><div><strong>VEY<span>R</span>SHIFT</strong><small>THE FORMWEAVING PROJECT</small></div></div>
   <div className="topright"><span className="pill warning">PREPRODUCTION • COMBAT LAB</span><span className="pill">BUILD 0.0.1</span>
   <button className="iconbutton" title={muted?'Enable sound':'Mute sound'} onClick={()=>setMuted(!muted)}>{muted?'◌':'♫'}</button></div></header>
  <main className="main-layout"><section className="stage-column">
   <div className="stage-head"><span className="eyebrow">THE SHATTERFIELDS <b>/</b> TEST REALM</span><span className="stage-live"><i/> {s.mode==='playing'?'LIVE COMBAT':s.mode==='reward'?'ROOM CLEAR':'COMBAT LABORATORY'}</span></div>
   <div className="stage-frame">
    <canvas ref={canvas} tabIndex={0} aria-label="Playable combat arena; use WASD, mouse, Shift, Q, E, R and F"/>
    <div className="corner top-left">SCENE / 001 <span>•</span> VIRTUAL WEAVE</div>
    {s.mode==='playing'&&<>
     <div className="ingame-top"><span>CHAMBER {fmt(s.room)} / {fmt(s.roomsTotal)}</span><span>HOSTILES {fmt(s.enemyCount)}</span></div>
     <div className="hud-left"><div className="statrow"><span>VITALITY</span><b>{s.hp} / {s.maxHp}</b></div><div className="bar health"><div style={{width:`${Math.max(0,s.hp/s.maxHp*100)}%`}}/></div>
      <div className="statrow pulse-label"><span>PULSE CAPACITY</span><b>{s.pulse} / {s.maxPulse}</b></div><div className="bar pulse"><div style={{width:`${s.pulse/s.maxPulse*100}%`}}/></div></div>
     {s.transformed&&<div className="transformed-label">◈ EMBER DRIVE <span>{s.formTime.toFixed(1)}s</span></div>}
     <div className="stage-bottom"><span>SPACE / J <b>STRIKE</b></span><span>RMB / K <b>BOLT</b></span><span>SHIFT <b>DASH</b></span><span>Q <b>BLAST</b></span><span>E <b>GUARD</b></span><span>R <b>FORM</b></span><span>F <b>FINISHER</b></span></div>
    </>}
    {s.mode==='hub'&&<div className="game-overlay hub-overlay"><span className="overline">TRANSMISSION // 001</span><h1>THE WEAVE<br/><em>AWAITS.</em></h1><p>A new world, unfinished. An original fighter. The first thread is yours to pull.</p>
      <button className="primary" onClick={()=>controller.current?.newRun()}>ENTER THE SHATTERFIELDS <span>↗</span></button>
      <small>Playable prototype • 3 chambers • Kairo only</small></div>}
    {s.mode==='reward'&&<div className="game-overlay reward-overlay"><span className="overline">RESONANCE SECURED</span><h2>CHOOSE YOUR THREAD</h2><p>One decision shifts this run.</p><div className="reward-grid">{controller.current?.session.rewardChoices.map((id,i)=>{const item=UPGRADES.find(u=>u.id===id);return <button key={id} onClick={()=>controller.current?.reward(i)} className="reward-card"><span className="reward-icon">{item?.icon}</span><b>{item?.name}</b><small>{item?.description}</small><span className="pick">SELECT / 0{i+1} ↗</span></button>})}</div></div>}
    {s.mode==='paused'&&<div className="game-overlay centered-overlay"><span className="overline">SYSTEM STATE / PAUSED</span><h2>STAY IN THE THREAD</h2><button className="primary" onClick={()=>controller.current?.togglePause()}>RESUME COMBAT ↗</button><button className="secondary" onClick={()=>controller.current?.hub()}>ABANDON TO HUB</button></div>}
    {(s.mode==='victory'||s.mode==='defeat')&&<div className="game-overlay centered-overlay"><span className="overline">THE WEAVE REMEMBERS</span><h2>{s.mode==='victory'?'THREAD STABILIZED':'THREAD COLLAPSED'}</h2><p>{s.mode==='victory'?'Prototype route completed. The real journey is yet to come.':'Failure still leaves a trace. Learn the rhythm and try again.'}</p>
      <div className="results"><span>SHARDS EARNED <b>+{s.shards}</b></span><span>DEEPEST CHAMBER <b>{fmt(s.room)}</b></span></div>
      <button className="primary" onClick={()=>controller.current?.newRun()}>RUN AGAIN ↗</button><button className="secondary" onClick={()=>controller.current?.hub()}>BACK TO HUB</button></div>}
    <div className="corner bottom-right">ORIGINAL IP IN DEVELOPMENT <span>⊙</span></div>
   </div><div className="stage-footer"><span className="live-dot">●</span><b>{s.message}</b><span>LOCAL SAVE · NO ACCOUNT</span></div>
   <div className="controls"><div><span className="eyebrow">DESKTOP CONTROL MAP</span><p><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> Move <i>·</i> Mouse aim <i>·</i> <kbd>LMB</kbd> Combo <i>·</i> <kbd>RMB</kbd> Energy <i>·</i> <kbd>Shift</kbd> Dash</p><p><kbd>E</kbd> Guard/parry <i>·</i> <kbd>Q</kbd> Blast <i>·</i> <kbd>R</kbd> Experimental form (40 Pulse) <i>·</i> <kbd>F</kbd> Finisher (75 Pulse) <i>·</i> <kbd>Esc</kbd> Pause</p></div></div>
  </section><aside className="sidebar">
   <div className="side-head"><span className="eyebrow">OPERATIVE RECORD</span><span className="tiny-line"/></div>
   <div className="hero-head"><div className="avatar">KV<span>✦</span></div><div><span className="eyebrow">01 / STARTER HERO</span><h2>KAIRO VENN</h2><p>Kinetic Brawler</p></div></div>
   <div className="note">A movement-first melee fighter with an unstable connection to possible futures.</div>
   <div className="side-section"><span className="eyebrow">EQUIPPED DISCIPLINE</span><div className="form-tile"><span className="form-symbol">◈</span><div><strong>EMBER DRIVE</strong><small>FURY I · EXPERIMENTAL</small></div><span className="form-status">LAB</span></div><p className="caption">Prototype damage modifier + VFX only. Not a finished transformation.</p></div>
   <div className="side-section"><span className="eyebrow">PERSISTENT RECORD</span><div className="metrics"><div><strong>{s.runs}</strong><small>ATTEMPTS</small></div><div><strong>{s.bankedShards}</strong><small>BANKED SHARDS</small></div><div><strong>{fmt(s.bestRoom)}</strong><small>BEST ROOM</small></div></div></div>
   <div className="side-section"><span className="eyebrow">PROTOTYPE FEATURES</span><div className="feature-list"><div><span>◉</span> Directional combo attacks <b>LIVE</b></div><div><span>◉</span> Dash &amp; invulnerability <b>LIVE</b></div><div><span>◉</span> Enemy telegraph &amp; guard <b>LIVE</b></div><div><span>◉</span> Seeded chamber rewards <b>LIVE</b></div><div><span>○</span> Master artwork &amp; animation <b>PLANNED</b></div><div><span>○</span> Full formweaving system <b>PLANNED</b></div></div></div>
   <div className="sideline"/><div className="sidetail">This prototype demonstrates the architecture, not finished art or the promised MVP. See the included design bible and B00 prompt for the next gate.</div>
  </aside></main><footer className="footer"><span>PROJECT VEYRSHIFT <b>•</b> AN ORIGINAL GAME IN DEVELOPMENT</span><span>NO FINAL TITLE OR CHARACTER IP CLEARANCE CLAIMED</span></footer>
 </div>;
}
