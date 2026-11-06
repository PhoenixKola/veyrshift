import { ARENA, ENCOUNTERS, ROOM_COUNT, UPGRADES } from '../data/encounters.js';
import { KAIRO_BASE_ABILITIES, KAIRO_COMBO_HITS, PULSE_TUNING } from '../data/kairoAbilities.js';
import { formById } from '../data/kairoForms.js';
import { clamp, distance, inArc, normalize } from '../core/math.js';
import { facingFromAngle, facingFromVector, type FacingDirection } from '../core/direction.js';
import { SeededRandom, stableRunSeed } from '../core/random.js';
import { loadSave, writeSave } from '../storage/save.js';
import type { AbilityId, AbilityReadyReason, ActionInput, CombatEvent, CombatEventId, Enemy, EnemyKind, GameMode, GameSnapshot, Hero, KairoFormId, Particle, Projectile, SaveData, UpgradeId, Vec2 } from '../core/types.js';

const EMPTY_INPUT: ActionInput = { movement: { x: 0, y: 0 }, aim: { x: 1, y: 0 }, pressed: new Set(), held: new Set() };
const ABILITY_IDS: readonly AbilityId[] = ['combo', 'bolt', 'shockwave', 'guard', 'dodge', 'finisher', 'emberPreview'];
const P = (x: number, y: number): Vec2 => ({ x, y });
const CARDINAL_ANGLE: Record<FacingDirection, number> = { right: 0, front: Math.PI / 2, left: Math.PI, back: -Math.PI / 2 };

export class CombatSession {
  readonly width = ARENA.width;
  readonly height = ARENA.height;
  mode: GameMode = 'hub';
  hero: Hero = CombatSession.makeHero();
  enemies: Enemy[] = [];
  projectiles: Projectile[] = [];
  particles: Particle[] = [];
  save: SaveData;
  room = 0;
  seed = 1;
  runShards = 0;
  upgrades: UpgradeId[] = [];
  rewardChoices: UpgradeId[] = [];
  events: CombatEvent[] = [];
  message = 'The Weave is unstable. Enter the combat laboratory.';
  shake = 0;
  hitstop = 0;
  clock = 0;
  private idCounter = 0;
  private rng = new SeededRandom(1);
  private rewardDelay = -1;
  private previousMode: GameMode = 'playing';

  constructor(save: SaveData = loadSave()) { this.save = save; }

  static makeHero(): Hero {
    return {
      x: 590, y: 360, vx: 0, vy: 0, face: 0, moveFacing: 'right', hurtFacing: 'right', attackFacing: 'right', actionAngle: 0,
      hp: 100, maxHp: 100, pulse: 0, maxPulse: PULSE_TUNING.max,
      dashTime: 0, invuln: 0,
      attackTime: 0, attackAnimTime: 0, attackDuration: 0, attackStartup: 0,
      attackHitFired: false, attackCooldown: 0, attackBuffer: 0, combo: 0, comboWindow: 0,
      abilityCooldowns: { combo: 0, bolt: 0, shockwave: 0, guard: 0, dodge: 0, finisher: 0, emberPreview: 0 },
      currentAbility: null, abilityAnimTime: 0, abilityAnimDuration: 0, abilityContactFired: false,
      guardTime: 0, parryWindow: 0,
      formTime: 0, formMaxTime: 8, transformVisualTime: 0, transformVisualDuration: .72, transformed: false,
      formId: 'ember-drive', emberMarks: 0, glassCounterTime: 0,
      locomotion: 'idle', locomotionTime: 0, movingInput: false,
      hurtTime: 0, ko: false, hitFlash: 0, step: 0,
    };
  }

  get snapshot(): GameSnapshot {
    const abilities = Object.fromEntries(ABILITY_IDS.map(id => [id, this.getAbilitySnapshot(id)])) as GameSnapshot['abilities'];
    return {
      mode: this.mode, room: this.room, roomsTotal: ROOM_COUNT, enemyCount: this.enemies.length,
      hp: Math.ceil(this.hero.hp), maxHp: this.hero.maxHp, pulse: Math.floor(this.hero.pulse), maxPulse: this.hero.maxPulse,
      combo: this.hero.combo, guarding: this.hero.guardTime > 0, parryWindow: this.hero.parryWindow,
      transformed: this.hero.transformed, formTime: this.hero.formTime,
      formId: this.hero.formId,
      formMarks: Math.max(0, ...this.enemies.map(enemy => enemy.emberMarks ?? 0)), counterWindow: this.hero.glassCounterTime,
      shards: this.runShards, bankedShards: this.save.shards, bestRoom: this.save.bestRoom, runs: this.save.runs,
      message: this.message, upgrades: [...this.upgrades], pauseFrom: this.mode === 'paused' ? this.previousMode : undefined,
      abilities,
    };
  }

  private notify(id: CombatEventId, x = this.hero.x, y = this.hero.y, angle?: number, ability?: AbilityId, intensity = 1, comboIndex?: number, formId?: KairoFormId): void {
    this.events.push({ id, x, y, angle, ability, intensity, comboIndex, formId: formId ?? (this.hero.transformed ? this.hero.formId : undefined) });
  }

  consumeEvents(): CombatEvent[] { return this.events.splice(0); }

  private pulseCost(id: AbilityId): number {
    if (id === 'emberPreview') return formById(this.hero.formId)?.activationCost ?? KAIRO_BASE_ABILITIES[id].pulseCost;
    if (id === 'finisher' && this.hero.transformed) return 50;
    return KAIRO_BASE_ABILITIES[id].pulseCost;
  }
  private requiredPulse(id: AbilityId): number {
    return this.pulseCost(id)+(id==='emberPreview'?(formById(this.hero.formId)?.upkeepPerSecond??0):0);
  }

  getAbilityReason(id: AbilityId): AbilityReadyReason {
    const hero = this.hero;
    if (hero.ko || hero.hurtTime > 0) return 'staggered';
    if (id === 'emberPreview' && !this.save.unlockedForms.includes(hero.formId)) return 'locked';
    if (id === 'combo') return hero.attackCooldown > 0 ? 'recovery' : 'ready';
    if (id === 'guard') return 'ready';
    if (hero.abilityCooldowns[id] > 0) return 'cooldown';
    if (hero.pulse < this.requiredPulse(id)) return 'insufficient-pulse';
    if (id !== 'dodge' && hero.currentAbility && hero.currentAbility !== id) {
      const current = KAIRO_BASE_ABILITIES[hero.currentAbility];
      if (hero.abilityAnimTime < current.timing.cancelAt) return 'recovery';
    }
    if (!['dodge', 'emberPreview'].includes(id) && hero.attackCooldown > 0) return 'recovery';
    if (id === 'emberPreview' && (hero.transformed || hero.formTime > 0)) return 'cooldown';
    if (id === 'shockwave' && hero.transformed && hero.formId === 'glass-current' && hero.glassCounterTime <= 0) return 'recovery';
    if (id === 'dodge' && hero.dashTime > 0) return 'recovery';
    return 'ready';
  }

  private getAbilitySnapshot(id: AbilityId) {
    const definition = KAIRO_BASE_ABILITIES[id];
    const reason = this.getAbilityReason(id);
    const remaining = id === 'combo' ? this.hero.attackCooldown : this.hero.abilityCooldowns[id];
    return {
      cooldownRemaining: Math.max(0, remaining),
      cooldownDuration: id === 'combo' ? KAIRO_COMBO_HITS[this.hero.combo ? this.hero.combo - 1 : 0].timing.windup + KAIRO_COMBO_HITS[this.hero.combo ? this.hero.combo - 1 : 0].timing.active + KAIRO_COMBO_HITS[this.hero.combo ? this.hero.combo - 1 : 0].timing.recovery : definition.cooldown,
      pulseCost: this.requiredPulse(id),
      ready: reason === 'ready',
      reason,
    };
  }

  newRun(seed = stableRunSeed()): void {
    this.seed = seed; this.rng = new SeededRandom(seed); this.mode = 'playing'; this.room = 1;
    this.hero = CombatSession.makeHero(); this.enemies = []; this.projectiles = []; this.particles = [];
    this.hero.formId = this.save.equippedForm;
    this.runShards = 0; this.upgrades = []; this.rewardChoices = []; this.rewardDelay = -1; this.clock = 0;
    this.events = [];
    this.message = 'CHAMBER 01 • Broken Atrium'; this.spawnRoom();
  }

  private spawnRoom(): void {
    this.enemies = []; this.projectiles = [];
    this.hero.x = 590; this.hero.y = 340; this.hero.invuln = .65;
    const encounter = ENCOUNTERS[this.room - 1] ?? [];
    encounter.forEach((kind, index) => {
      const angle = index / encounter.length * Math.PI * 2 + .35;
      const range = 220 + this.rng.range(-30, 45);
      const stats: Record<EnemyKind, [number, number, number]> = { wisp: [32, 68, 18], striker: [53, 104, 21], sentinel: [125, 43, 34] };
      const [hp, speed, radius] = stats[kind];
      this.enemies.push({ id: ++this.idCounter, kind, x: clamp(590 + Math.cos(angle) * range, 110, 1070),
        y: clamp(340 + Math.sin(angle) * range, 115, 570), hp, maxHp: hp, radius, speed,
        flash: 0, phase: this.rng.range(0, Math.PI * 2), attackCooldown: .65 + this.rng.range(0, .6),
        telegraph: 0, stagger: 0, vx: 0, vy: 0 });
    });
  }

  chooseReward(index: number): void {
    if (this.mode !== 'reward') return;
    const id = this.rewardChoices[index]; if (!id) return;
    this.upgrades.push(id);
    if (id === 'capacity') { this.hero.maxPulse += 25; this.hero.pulse = Math.min(this.hero.maxPulse, this.hero.pulse + 20); }
    if (id === 'vitality') { this.hero.maxHp += 10; this.hero.hp = clamp(this.hero.hp + 25, 0, this.hero.maxHp); }
    this.mode = 'playing'; this.room++;
    this.message = `CHAMBER ${String(this.room).padStart(2, '0')} • ${this.room === 2 ? 'Resonance Court' : 'Sentinel Threshold'}`;
    this.spawnRoom(); this.notify('reward');
  }

  pause(): void {
    if (this.mode === 'playing') { this.previousMode = 'playing'; this.mode = 'paused'; }
    else if (this.mode === 'paused') this.mode = this.previousMode;
  }

  returnToHub(): void {
    if (this.mode === 'playing' || this.mode === 'paused') this.finish('defeat', true);
    this.mode = 'hub'; this.message = 'The Weave remembers every attempt.';
  }

  private finish(result: 'victory'|'defeat', abandoned = false): void {
    const earned = this.runShards;
    this.save.shards += earned; this.save.runs++; this.save.bestRoom = Math.max(this.save.bestRoom, this.room);
    if (result === 'victory') this.save.totalDefeats++;
    writeSave(this.save); this.mode = result;
    this.message = result === 'victory' ? 'THE THREAD HOLDS • Prototype route cleared' : abandoned ? 'Run abandoned • discoveries retained' : 'THE THREAD COLLAPSES • Return stronger';
    this.notify(result, this.hero.x, this.hero.y, undefined, undefined, abandoned ? 0 : 1);
  }

  private pulse(amount: number): void {
    const before = this.hero.pulse;
    this.hero.pulse = clamp(this.hero.pulse + amount, 0, this.hero.maxPulse);
    if (this.hero.pulse > before) this.notify('pulse-gain', this.hero.x, this.hero.y, undefined, undefined, (this.hero.pulse - before) / Math.max(1, amount));
    if (before < this.hero.maxPulse && this.hero.pulse >= this.hero.maxPulse) this.notify('pulse-ready');
  }

  private burst(x: number, y: number, color: string, count: number, force = 125): void {
    const amount = this.save.settings.particles ? count : Math.min(3, count);
    for (let i = 0; i < amount; i++) {
      const angle = this.rng.range(0, Math.PI * 2), speed = this.rng.range(force * .25, force);
      this.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        life: this.rng.range(.2, .55), maxLife: .55, size: this.rng.range(1.5, 4), color });
    }
    if (this.particles.length > 260) this.particles.splice(0, this.particles.length - 260);
  }

  private damageEnemy(enemy: Enemy, amount: number, direction: Vec2, options: { knockback: number; stagger: number; pulse: number; event: CombatEventId; ability: AbilityId; comboIndex?: number; } ): void {
    if (enemy.hp <= 0) return;
    enemy.hp -= amount; enemy.flash = .22; enemy.stagger = Math.max(enemy.stagger, options.stagger);
    const vector = normalize(direction); enemy.vx += vector.x * options.knockback; enemy.vy += vector.y * options.knockback;
    const impactColor = this.hero.transformed && this.hero.formId === 'ember-drive' ? '#ff7a3d' : this.hero.transformed && this.hero.formId === 'glass-current' ? '#b6eaf1' : options.ability === 'finisher' ? '#f4d39a' : options.ability === 'shockwave' ? '#90dce1' : '#b6e8ef';
    this.burst(enemy.x, enemy.y, impactColor, options.ability === 'finisher' ? 18 : 10, options.knockback);
    if (options.pulse > 0) this.pulse(options.pulse);
    this.shake = Math.min(options.ability === 'finisher' ? 15 : 10, this.shake + (options.ability === 'finisher' ? 5.5 : options.ability === 'shockwave' ? 3.2 : 2.2));
    this.hitstop = Math.min(options.ability === 'finisher' ? .11 : .075, this.hitstop + (options.ability === 'finisher' ? .075 : .032));
    this.notify(options.event, enemy.x, enemy.y, Math.atan2(vector.y, vector.x), options.ability,
      options.ability === 'finisher' ? 1.5 : options.comboIndex ?? 1, options.comboIndex);
    if (enemy.hp <= 0) {
      this.runShards += enemy.kind === 'sentinel' ? 9 : enemy.kind === 'striker' ? 4 : 2;
      this.pulse(PULSE_TUNING.killBonus); this.burst(enemy.x, enemy.y, '#f6d59c', 15, 200); this.notify('kill', enemy.x, enemy.y, undefined, options.ability);
    }
  }

  private combo(): void {
    const hero = this.hero;
    if (hero.attackCooldown > 0 || hero.dashTime > 0 || hero.hurtTime > 0 || hero.ko) return;
    const next = hero.comboWindow > 0 ? hero.combo % KAIRO_COMBO_HITS.length + 1 : 1;
    const hit = KAIRO_COMBO_HITS[next - 1];
    hero.combo = next; hero.comboWindow = .82;
    hero.attackFacing = facingFromAngle(hero.face); hero.face = CARDINAL_ANGLE[hero.attackFacing]; hero.actionAngle = hero.face;
    hero.attackDuration = hit.timing.windup + hit.timing.active + hit.timing.recovery;
    hero.attackTime = hero.attackDuration; hero.attackAnimTime = 0; hero.attackStartup = hit.timing.windup;
    hero.attackHitFired = false; hero.attackCooldown = Math.max(.04, hero.attackDuration - .04);
    this.notify('combo-start', hero.x, hero.y, hero.face, 'combo', next, next);
  }

  private hitArc(angle: number, ability: AbilityId, hit: { damage: number; range: number; arcRadians: number; targetCap: number; knockback: number; stagger: number; pulseOnHit: number; }, event: CombatEventId, comboIndex?: number): number {
    const hero = this.hero;
    const targets = this.enemies.filter(enemy => enemy.hp > 0 && inArc(P(hero.x, hero.y), angle, enemy, hit.range + enemy.radius, hit.arcRadians))
      .sort((a, b) => distance(hero, a) - distance(hero, b) || a.id - b.id).slice(0, hit.targetCap);
    const direction = { x: Math.cos(angle), y: Math.sin(angle) };
    for (const enemy of targets) {
      this.damageEnemy(enemy, hit.damage, direction, { knockback: hit.knockback, stagger: hit.stagger, pulse: hit.pulseOnHit, event, ability, comboIndex });
      if (ability === 'combo' && this.hero.transformed && this.hero.formId === 'ember-drive') {
        const form=formById(this.hero.formId)!;
        enemy.emberMarks = Math.min(form.combat.markCap, (enemy.emberMarks ?? 0) + 1);
        if (comboIndex === 3 && enemy.emberMarks > 0) {
          const marks = enemy.emberMarks; enemy.emberMarks = 0;
          this.damageEnemy(enemy, marks * form.combat.markDetonationDamage, direction, { knockback: 80, stagger: .3, pulse: 0, event, ability, comboIndex });
        }
      }
    }
    return targets.length;
  }

  private beginAbility(id: Exclude<AbilityId, 'combo'|'guard'|'dodge'>): void {
    const hero = this.hero;
    const definition = KAIRO_BASE_ABILITIES[id];
    const reason = this.getAbilityReason(id);
    if (reason !== 'ready') { this.notify('action-unavailable', hero.x, hero.y, hero.face, id, reason === 'insufficient-pulse' ? .35 : .18); return; }
    if (id === 'emberPreview' && !this.save.unlockedForms.includes(hero.formId)) { this.notify('action-unavailable',hero.x,hero.y,hero.face,id,.18); return; }
    const cost=this.pulseCost(id);if (cost) this.pulse(-cost);
    hero.abilityCooldowns[id] = definition.cooldown;
    hero.currentAbility = id; hero.abilityAnimTime = 0;
    hero.abilityAnimDuration = definition.timing.windup + definition.timing.active + definition.timing.recovery;
    hero.abilityContactFired = false;
    if (id === 'bolt') hero.actionAngle = hero.face;
    else { hero.attackFacing = facingFromAngle(hero.face); hero.face = CARDINAL_ANGLE[hero.attackFacing]; hero.actionAngle = hero.face; }
    if (id === 'shockwave') this.notify('shockwave-charge', hero.x, hero.y, undefined, id);
    if (id === 'finisher') this.notify('finisher-build', hero.x, hero.y, hero.actionAngle, id);
    if (id === 'emberPreview') { this.activateForm(); hero.currentAbility = null; }
    if (id === 'shockwave' && hero.transformed && hero.formId === 'glass-current') {
      const form=formById(hero.formId)!;
      hero.glassCounterTime = 0;
      const targets = this.enemies.filter(enemy => enemy.hp > 0 && distance(hero, enemy) <= form.combat.specialRadius + enemy.radius).sort((a,b)=>distance(hero,a)-distance(hero,b)).slice(0,form.combat.specialTargetCap);
      for (const enemy of targets) this.damageEnemy(enemy, form.combat.specialDamage, normalize({x:enemy.x-hero.x,y:enemy.y-hero.y}), {knockback:220,stagger:.65,pulse:4,event:'shockwave-hit',ability:'shockwave'});
      this.notify('glass-counter',hero.x,hero.y,hero.face,'shockwave',targets.length?1:.5);
      hero.currentAbility = null;
    }
  }

  private fireBolt(): void {
    const hero = this.hero;
    const angle = hero.actionAngle, direction = { x: Math.cos(angle), y: Math.sin(angle) };
    const definition = KAIRO_BASE_ABILITIES.bolt;
    const life = definition.range / 610;
    const form=hero.transformed?formById(hero.formId):undefined;
    const ember = form?.id === 'ember-drive';
    const glass = form?.id === 'glass-current';
    this.projectiles.push({ x: hero.x + direction.x * 30, y: hero.y + direction.y * 30,
      vx: direction.x * 610, vy: direction.y * 610, life, maxLife: life, age: 0, radius: 9, power: definition.damage,
      source: 'hero', color: ember ? '#ff7942' : glass ? '#c4f3f2' : '#9ceaf0', ability: 'bolt', hitsRemaining: form?.combat.boltPierceTargets ?? 1, piercedEnemyIds: glass ? [] : undefined });
    this.notify('bolt-cast', hero.x + direction.x * 31, hero.y + direction.y * 31, angle, 'bolt');
    this.burst(hero.x + direction.x * 25, hero.y + direction.y * 25, '#c6f8f4', 5, 70);
  }

  private releaseShockwave(): void {
    const hero = this.hero, definition = KAIRO_BASE_ABILITIES.shockwave;
    const form=hero.transformed?formById(hero.formId):undefined;
    const glass = form?.id === 'glass-current';
    if (glass) return;
    const ember = form?.id === 'ember-drive';
    const range=ember?form.combat.specialRadius:definition.range,damage=ember?form.combat.specialDamage:definition.damage,cap=ember?form.combat.specialTargetCap:definition.targetCap;
    const targets = this.enemies.filter(enemy => enemy.hp > 0 && (ember ? inArc(P(hero.x,hero.y),hero.actionAngle,enemy,range+enemy.radius,1.0) : distance(hero, enemy) <= range + enemy.radius))
      .sort((a, b) => distance(hero, a) - distance(hero, b) || a.id - b.id).slice(0, cap);
    for (const enemy of targets) this.damageEnemy(enemy, damage,
      { x: enemy.x - hero.x, y: enemy.y - hero.y }, { knockback: definition.knockback, stagger: definition.stagger,
        pulse: definition.pulseOnHit, event: 'shockwave-hit', ability: 'shockwave' });
    this.notify('shockwave-release', hero.x, hero.y, undefined, 'shockwave', targets.length ? 1 : .75);
  }

  private releaseFinisher(): void {
    const hero = this.hero, base = KAIRO_BASE_ABILITIES.finisher;
    const form=hero.transformed?formById(hero.formId):undefined;
    const definition = form ? {...base,damage:form.combat.finisherDamage,targetCap:form.combat.finisherTargetCap,range:form.combat.finisherRange} : base;
    const direction = { x: Math.cos(hero.actionAngle), y: Math.sin(hero.actionAngle) };
    hero.x = clamp(hero.x + direction.x * 24, ARENA.inset, this.width - ARENA.inset);
    hero.y = clamp(hero.y + direction.y * 24, ARENA.inset, this.height - ARENA.inset);
    this.hitArc(hero.actionAngle, 'finisher', definition, 'finisher-hit');
    this.notify('finisher-hit', hero.x + direction.x * 35, hero.y + direction.y * 30, hero.actionAngle, 'finisher', 1.4);
  }

  private advanceAbilityAnimation(dt: number): void {
    const hero = this.hero, id = hero.currentAbility;
    if (!id || id === 'combo' || id === 'guard' || id === 'dodge') return;
    const definition = KAIRO_BASE_ABILITIES[id];
    hero.abilityAnimTime += dt;
    if (!hero.abilityContactFired && hero.abilityAnimTime >= definition.timing.windup) {
      hero.abilityContactFired = true;
      if (id === 'bolt') this.fireBolt();
      if (id === 'shockwave') this.releaseShockwave();
      if (id === 'finisher') this.releaseFinisher();
    }
    if (hero.abilityAnimTime >= hero.abilityAnimDuration) {
      if (id === 'finisher') this.notify('finisher-fade', hero.x, hero.y, hero.actionAngle, id);
      if (id === 'emberPreview') hero.currentAbility = null;
      else hero.currentAbility = null;
    }
  }

  private activateForm(): void {
    const hero = this.hero;
    const form = formById(hero.formId); if (!form) return;
    if (!this.save.unlockedForms.includes(form.id)) return;
    hero.formMaxTime = form.duration; hero.formTime = form.duration; hero.transformVisualDuration = .5;
    hero.transformVisualTime = hero.transformVisualDuration; hero.transformed = true; hero.invuln = .32; hero.glassCounterTime=0;
    this.message = `${form.name.toUpperCase()} • Form active`;
    const event = hero.formId === 'ember-drive' ? 'ember-start' : 'glass-start'; this.notify(event, hero.x, hero.y, hero.face, 'emberPreview');
    this.burst(hero.x, hero.y, hero.formId === 'ember-drive' ? '#d96a3d' : '#b6eaf1', 18, 180);
  }

  private endForm(): void {
    const hero=this.hero; if (!hero.transformed) return;
    hero.transformed=false; hero.formTime=0; hero.transformVisualTime=0;
    hero.glassCounterTime=0;for(const enemy of this.enemies)enemy.emberMarks=0;
    this.notify(hero.formId==='ember-drive'?'ember-end':'glass-end',hero.x,hero.y,hero.face,'emberPreview',1,undefined,hero.formId);
    this.burst(hero.x,hero.y,hero.formId==='ember-drive'?'#bd6645':'#9ddde8',8,110);
  }

  private startDodge(input: ActionInput): void {
    const hero = this.hero;
    const reason = this.getAbilityReason('dodge');
    if (reason !== 'ready') { this.notify('action-unavailable', hero.x, hero.y, hero.face, 'dodge', .16); return; }
    const definition = KAIRO_BASE_ABILITIES.dodge;
    const form=hero.transformed?formById(hero.formId):undefined;
    hero.abilityCooldowns.dodge = definition.cooldown; hero.dashTime = form?.combat.dodgeDuration ?? .19; hero.invuln = form?.combat.dodgeIframes ?? .26;
    if (form?.id === 'glass-current') hero.glassCounterTime = .32;
    const move = normalize(input.movement);
    const direction = Math.hypot(move.x, move.y) > .1 ? move : { x: Math.cos(hero.face), y: Math.sin(hero.face) };
    hero.moveFacing = facingFromVector(direction); hero.vx = direction.x * 820; hero.vy = direction.y * 820;
    hero.attackTime = 0; hero.attackCooldown = 0; hero.attackHitFired = true; hero.attackBuffer = 0;
    hero.currentAbility = null; hero.dashTime = .19;
    this.notify('dash-start', hero.x, hero.y, Math.atan2(direction.y, direction.x), 'dodge');
  }

  private damageHero(amount: number, origin: Vec2): void {
    const hero = this.hero;
    if (hero.invuln > 0 || hero.dashTime > 0) {
      if (hero.transformed && hero.formId === 'glass-current' && hero.glassCounterTime > 0) {
        hero.glassCounterTime = 0;
        const form=formById(hero.formId)!;
        const angle = Math.atan2(origin.y-hero.y,origin.x-hero.x);
        const counter = this.enemies.filter(enemy=>enemy.hp>0&&distance(hero,enemy)<150).sort((a,b)=>distance(hero,a)-distance(hero,b)).slice(0,1);
        for (const enemy of counter) this.damageEnemy(enemy,form.combat.counterDamage,{x:Math.cos(angle),y:Math.sin(angle)},{knockback:210,stagger:.5,pulse:4,event:'glass-counter',ability:'dodge'});
        this.notify('glass-counter',hero.x,hero.y,angle,'dodge',counter.length?1:.5);
      }
      return;
    }
    if (hero.guardTime > 0) {
      if (hero.parryWindow > 0) {
        this.pulse(PULSE_TUNING.parry); this.notify('parry', hero.x, hero.y, Math.atan2(origin.y - hero.y, origin.x - hero.x), 'guard');
        if (hero.transformed && hero.formId === 'glass-current') hero.glassCounterTime = .55;
        this.save.precisionTrials++; if (this.save.precisionTrials >= 5 && !this.save.unlockedForms.includes('glass-current')) this.save.unlockedForms.push('glass-current');
        writeSave(this.save);
        this.shake += 2.2; return;
      }
      amount *= .32; this.notify('block', hero.x, hero.y, Math.atan2(origin.y - hero.y, origin.x - hero.x), 'guard');
    }
    hero.hp = Math.max(0, hero.hp - amount); hero.hitFlash = .28; hero.hurtTime = .34; hero.invuln = .65;
    hero.hurtFacing = facingFromVector({ x: origin.x - hero.x, y: origin.y - hero.y });
    const push = normalize({ x: hero.x - origin.x, y: hero.y - origin.y }); hero.vx += push.x * 185; hero.vy += push.y * 185;
    this.burst(hero.x, hero.y, '#dc9f9b', 12, 135); this.notify('hurt', hero.x, hero.y, Math.atan2(push.y, push.x)); this.shake += 3;
    if (hero.hp <= 0) { hero.ko = true; hero.hurtTime = .8; this.finish('defeat'); }
  }

  private updateLocomotion(dt: number, movement: Vec2): void {
    const hero = this.hero;
    const moving = Math.hypot(movement.x, movement.y) > .08;
    if (moving && !hero.movingInput) { hero.locomotion = 'start'; hero.locomotionTime = .15; }
    else if (!moving && hero.movingInput) { hero.locomotion = 'stop'; hero.locomotionTime = .17; }
    hero.movingInput = moving;
    if (hero.locomotion === 'start' || hero.locomotion === 'stop') {
      hero.locomotionTime = Math.max(0, hero.locomotionTime - dt);
      if (hero.locomotionTime === 0) hero.locomotion = moving ? 'run' : 'idle';
    } else hero.locomotion = moving ? 'run' : 'idle';
  }

  update(dt: number, input: ActionInput = EMPTY_INPUT): void {
    if (this.mode !== 'playing') return;
    dt = clamp(dt, 0, .05); this.clock += dt;
    const hero = this.hero;
    if (input.pressed.has('attack')) hero.attackBuffer = Math.max(hero.attackBuffer, .27);
    if (this.hitstop > 0) { this.hitstop = Math.max(0, this.hitstop - dt); this.tickParticles(dt); return; }

    const dec = (value: number) => Math.max(0, value - dt);
    hero.invuln = dec(hero.invuln); hero.hurtTime = dec(hero.hurtTime); hero.attackCooldown = dec(hero.attackCooldown);
    hero.attackBuffer = dec(hero.attackBuffer); hero.comboWindow = dec(hero.comboWindow);
    for (const id of ABILITY_IDS) hero.abilityCooldowns[id] = dec(hero.abilityCooldowns[id]);
    hero.hitFlash = dec(hero.hitFlash); hero.transformVisualTime = dec(hero.transformVisualTime);
    if (hero.comboWindow === 0 && hero.attackTime === 0) hero.combo = 0;

    const wasDashing = hero.dashTime > 0;
    if (hero.attackTime > 0) {
      hero.attackTime = dec(hero.attackTime); hero.attackAnimTime += dt;
      const hit = KAIRO_COMBO_HITS[Math.max(0, Math.min(2, hero.combo - 1))];
      if (!hero.attackHitFired && hero.attackAnimTime >= hit.timing.windup) {
        hero.attackHitFired = true;
        const hitCount = this.hitArc(hero.actionAngle, 'combo', hit, 'combo-contact', hero.combo);
        if (!hitCount) this.notify('swing', hero.x, hero.y, hero.actionAngle, 'combo', hero.combo, hero.combo);
      }
    }

    this.advanceAbilityAnimation(dt);
    if (hero.transformed) {
      hero.glassCounterTime = Math.max(0,hero.glassCounterTime-dt);
      hero.formTime = dec(hero.formTime);
      hero.pulse = clamp(hero.pulse - dt * (formById(hero.formId)?.upkeepPerSecond ?? 2), 0, hero.maxPulse);
      if (hero.formTime === 0 || hero.pulse === 0) {
        hero.transformed = false; hero.transformVisualTime = 0; this.burst(hero.x, hero.y, '#c6b7a5', 10, 130);
        hero.glassCounterTime=0;for(const enemy of this.enemies)enemy.emberMarks=0;
        this.notify(hero.formId === 'ember-drive' ? 'ember-end':'glass-end', hero.x, hero.y, hero.face, 'emberPreview', 1, undefined, hero.formId);
      }
    }

    const aim = normalize(input.aim);
    if (Math.hypot(aim.x, aim.y) > .001) hero.face = Math.atan2(aim.y, aim.x);
    const move = normalize(input.movement);
    this.updateLocomotion(dt, move);
    if (Math.hypot(move.x, move.y) > .001) hero.moveFacing = facingFromVector(move);

    if (input.pressed.has('dash')) this.startDodge(input);
    if (hero.dashTime > 0) {
      hero.dashTime = dec(hero.dashTime);
      if (hero.dashTime === 0 && wasDashing) this.notify('dash-land', hero.x, hero.y, Math.atan2(hero.vy, hero.vx), 'dodge');
    } else {
      const speed = hero.transformed ? (formById(hero.formId)?.combat.moveSpeed ?? 277) : 277;
      const drag = move.x === 0 && move.y === 0 ? .08 : .23;
      hero.vx = hero.vx * drag + move.x * (1 - drag) * speed;
      hero.vy = hero.vy * drag + move.y * (1 - drag) * speed;
      if (hero.attackBuffer > 0 && hero.attackCooldown === 0) { hero.attackBuffer = 0; this.combo(); }
      if (input.pressed.has('bolt')) this.beginAbility('bolt');
      if (input.pressed.has('shockwave')) this.beginAbility('shockwave');
      if (input.pressed.has('finisher')) this.beginAbility('finisher');
      if (input.pressed.has('transform')) { if (hero.transformed) this.endForm(); else this.beginAbility('emberPreview'); }
    }

    const wasGuarding = hero.guardTime > 0;
    if (input.held.has('guard') && hero.hurtTime === 0) {
      hero.guardTime += dt; hero.parryWindow = Math.max(0, KAIRO_BASE_ABILITIES.guard.timing.active - hero.guardTime);
      if (!wasGuarding) this.notify('guard-start', hero.x, hero.y, hero.face, 'guard');
    } else {
      if (wasGuarding) this.notify('guard-end', hero.x, hero.y, hero.face, 'guard');
      hero.guardTime = 0; hero.parryWindow = 0;
    }

    hero.x = clamp(hero.x + hero.vx * dt, ARENA.inset, ARENA.width - ARENA.inset);
    hero.y = clamp(hero.y + hero.vy * dt, ARENA.inset, ARENA.height - ARENA.inset);
    hero.step += Math.hypot(hero.vx, hero.vy) * dt;
    this.updateEnemies(dt); this.updateProjectiles(dt); this.tickParticles(dt);
    this.shake = Math.max(0, this.shake - dt * 22);
    if (this.enemies.length === 0 && this.rewardDelay < 0) { this.rewardDelay = .88; this.notify('room-clear'); }
    if (this.rewardDelay >= 0) { this.rewardDelay -= dt; if (this.rewardDelay < 0) this.roomComplete(); }
  }

  private updateEnemies(dt: number): void {
    for (const enemy of this.enemies) {
      enemy.flash = Math.max(0, enemy.flash - dt); enemy.stagger = Math.max(0, enemy.stagger - dt); enemy.phase += dt * 1.3;
      enemy.attackCooldown = Math.max(0, enemy.attackCooldown - dt);
      const direction = normalize({ x: this.hero.x - enemy.x, y: this.hero.y - enemy.y });
      const gap = distance(enemy, this.hero);
      if (enemy.stagger > 0) { enemy.x += enemy.vx * dt; enemy.y += enemy.vy * dt; enemy.vx *= .85; enemy.vy *= .85; continue; }
      if (enemy.telegraph > 0) {
        enemy.telegraph -= dt;
        if (enemy.telegraph <= 0) {
          if (distance(enemy, this.hero) < enemy.radius + 54) this.damageHero(enemy.kind === 'sentinel' ? 19 : 12, enemy);
          this.burst(enemy.x + direction.x * 25, enemy.y + direction.y * 25, '#e1a0a2', 6, 65);
          enemy.attackCooldown = enemy.kind === 'striker' ? .85 : enemy.kind === 'sentinel' ? 1.65 : 1.2;
          enemy.telegraph = 0;
        }
      } else if (gap < enemy.radius + 54 && enemy.attackCooldown === 0) enemy.telegraph = enemy.kind === 'sentinel' ? .78 : .47;
      else if (gap > enemy.radius + 37) {
        const speed = enemy.kind === 'wisp' ? 1 + Math.sin(enemy.phase) * .1 : 1;
        enemy.x += direction.x * enemy.speed * speed * dt; enemy.y += direction.y * enemy.speed * speed * dt;
      }
      enemy.x = clamp(enemy.x, ARENA.inset, ARENA.width - ARENA.inset); enemy.y = clamp(enemy.y, ARENA.inset, ARENA.height - ARENA.inset);
    }
    this.enemies = this.enemies.filter(enemy => enemy.hp > 0);
  }

  private updateProjectiles(dt: number): void {
    for (const projectile of this.projectiles) {
      projectile.life -= dt; projectile.age += dt; projectile.x += projectile.vx * dt; projectile.y += projectile.vy * dt;
      if (projectile.source === 'hero') {
        let hitSomething = false;
        for (const enemy of this.enemies) {
          if (enemy.hp > 0 && !projectile.piercedEnemyIds?.includes(enemy.id) && distance(projectile, enemy) < projectile.radius + enemy.radius) {
            const definition = KAIRO_BASE_ABILITIES.bolt;
            this.damageEnemy(enemy, projectile.power, { x: projectile.vx, y: projectile.vy }, {
              knockback: definition.knockback, stagger: definition.stagger, pulse: definition.pulseOnHit, event: 'bolt-hit', ability: 'bolt',
            });
            hitSomething = true;
            if (this.hero.transformed && this.hero.formId==='ember-drive') {
              const form=formById(this.hero.formId)!;
              const splash=this.enemies.filter(other=>other!==enemy&&other.hp>0&&distance(enemy,other)<form.combat.boltSplashRadius).slice(0,2);
              for (const other of splash) this.damageEnemy(other,form.combat.boltSplashDamage,{x:projectile.vx,y:projectile.vy},{knockback:95,stagger:.12,pulse:0,event:'bolt-hit',ability:'bolt'});
            }
            if (projectile.hitsRemaining && projectile.hitsRemaining>1) { projectile.hitsRemaining--; projectile.piercedEnemyIds?.push(enemy.id); continue; }
            projectile.life = 0; break;
          }
        }
        if (hitSomething && projectile.life<=0) projectile.life=0;
      } else if (projectile.source === 'enemy' && distance(projectile, this.hero) < projectile.radius + 18) {
        this.damageHero(projectile.power, projectile); projectile.life = 0;
      }
      if (projectile.life <= 0) this.notify('bolt-dissipate', projectile.x, projectile.y, Math.atan2(projectile.vy, projectile.vx), projectile.ability ?? 'bolt');
    }
    this.projectiles = this.projectiles.filter(projectile => projectile.life > 0 && projectile.x > -30 && projectile.x < this.width + 30 && projectile.y > -30 && projectile.y < this.height + 30);
  }

  private tickParticles(dt: number): void {
    for (const particle of this.particles) { particle.life -= dt; particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.vx *= .94; particle.vy *= .94; }
    this.particles = this.particles.filter(particle => particle.life > 0);
  }

  private roomComplete(): void {
    this.runShards += 6;
    if (this.room >= ROOM_COUNT) { this.finish('victory'); return; }
    this.mode = 'reward'; this.rewardChoices = [];
    const available = UPGRADES.filter(upgrade => !this.upgrades.includes(upgrade.id));
    while (this.rewardChoices.length < Math.min(3, available.length)) {
      const id = this.rng.pick(available).id;
      if (!this.rewardChoices.includes(id)) this.rewardChoices.push(id);
    }
    this.message = 'CHAMBER CLEARED • Choose one technique'; this.notify('room-clear');
  }
}
