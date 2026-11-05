# PROJECT VEYRSHIFT — GAME VISION V2

> **INTERNAL CODENAME ONLY — NOT CLEARED FOR RELEASE.**
> Replaces the earlier `skybreakers-limit-zero-game-vision-mvp-codex-roadmap.md` concept. Do not implement or publish the discarded title SKYBREAKERS: LIMIT ZERO. `Skybreakers` is an existing 2023 game and `LIMIT ZERO BREAKERS` is another anime action game with trademark filings.
>
> **Status:** Proposed game design, not production approval or a finished IP clearance review. Design direction updated 2026-11-05.
>
> **Platform:** Desktop web browser first, standalone desktop (possibly Electron) later.
> **Genre:** 2.5D, premium anime-inspired, **fully manual action roguelite** with interconnected combat chambers, branching routes, challenging bosses, deep build crafting, and spectacular mechanical transformations.
> **Non-goal:** Megabonk-style auto-combat/horde survival. Hades is a reference for the *feel and structure of manual action roguelite gameplay*, not something to replicate in characters, UI, stories, environments, specific boons or art.

## 1. Core promise

In the first 60 seconds a player can move, dash, land a responsive combo, launch an enemy, fire an energy technique, and defeat a small room. In a strong run, the player's fighting style evolves through skill, technique choices, relic combinations and earned transformations. Forms change how players **play**, not just their color or damage. Every run includes multiple meaningful choices, a spectacular boss, and something interesting to discover or unlock for the next run.

**Three non-negotiables:** (1) Combat feel is polished before content volume. (2) Every transformation has a distinct combat fantasy, silhouette, animation language and VFX. (3) The game has its own visual and world identity; do not reproduce Dragon Ball, Hades, Megabonk, or previous user's RPG content.

## 2. Revised genre and loop

### Hub → chamber run → reward → climax → hub
1. At the hub, select one hero, a starting technique set, and one currently unlocked form discipline. Later unlock a second equipped discipline.
2. Enter a short route of **hand-authored encounter rooms** assembled into a branching run. Procedural generation selects room sequences, modifiers, rewards, enemy combinations, and some environmental hazards; rooms themselves are designed for readable action combat.
3. Engage in **fully manual** melee strings, ranged specials, dodges, timed counters/guards, launchers and finishers. Enemies have clear tells, priorities, stagger rules and learnable patterns.
4. Select an upgrade or relic after rooms; occasionally choose a riskier elite/event path for stronger rewards, new form catalysts or permanent resources.
5. Charge **Pulse** with stylish, controlled play: accurate hits, directional combo finishes, dangerous counters, stagger breaks. The meter is not primarily based on passive damage absorption.
6. Activate a fitted transformation when it matters. Its combat rules and move kit genuinely change. Earn evolution catalysts in-run to unlock an advanced version of that form for the rest of the run.
7. Fight a multi-phase boss, collect rewards, reach a new branch or conclude the run. Failure also makes meaningful unlock progress without trivializing skill.
8. Return to the hub to unlock new disciplines, alternate techniques, other characters, cosmetic VFX/aura accents, challenges, narrative fragments and alternate route hazards.

**Run length targets (not promises):** 18–25 minutes for the first complete MVP route, potentially 25–35 minutes for later full branches. Always allow pause, quick restart and suspend/resume in browser where practical.

### Proposed desktop controls
- WASD: movement; mouse: attack direction / aim.
- Left click: manually controlled main attack chain (press/hold decisions), including launchers and directional finishers.
- Right click: secondary attack / ranged energy technique.
- Shift: fast dodge with carefully authored invulnerability frames and readable recovery.
- Q: equipped active technique; E: guard/parry/counter (character-specific).
- R: activate equipped transformation; later use a simple wheel/alternate key for the second equipped discipline.
- F: ultimate/finisher when the resource and game state allow it; Esc: pause.
- Input buffering, cancels, hitstop, recovery frames, aim-assist tuning, controller rebinding and accessibility require intentional design. Do not add ten buttons at once in onboarding.

### Combat systems that change from the previous plan
- **Replace** auto-target auto-fire with manual attack state machines, directional hitboxes and aim assistance.
- **Add** grounded combo windows, cancel rules, anti-spam tuning, attack priorities and move properties (stagger, launch, knockback, armor break, guard damage).
- **Add** enemy attack telegraphs and decision state machines, room-specific hazards, deliberate wave composition and boss phase scripts.
- **Replace** timer/horde survival with branching authored rooms, doors/rewards, encounters, elite events and route progression.
- **Rework** upgrades to modify specific manual actions, form mechanics, and synergies without turning combat into passive auto-fire.
- **Add** transformation move-set substitution, resource lifecycles, state transitions, combat-safe activation, encounter rules and explicit animation/VFX cues.
- **Keep** modular TypeScript data, run-seeded randomness, save/versioning, asset pipeline, performance instrumentation and browser-first architecture.

## 3. Signature differentiator: FORMWEAVING

The world consists of **unfinished versions of places and futures** stitched together by the **Weave Engine**. Combatants are not generic aura warriors: they learn to stabilize one possible version of themselves at a time. The adversaries are distortions caused by futures colliding; level geometry changes in legible, authored ways during encounters. It creates a thematic explanation for alternative forms, branching combat, changing routes and repeat runs without copying existing anime lore.

Each of six characters has a **seven-form long-term design target**:
- **Fury discipline**: two stages (offense, tempo, risk).
- **Precision discipline**: two stages (defense, timing, repositioning).
- **Anomaly discipline**: two stages (space, gravity, projectiles, control or another hero-specific mechanic).
- **Mythic form**: one difficult-to-unlock synthesis form, requiring mastery and a form catalyst.

That makes **42 authored forms across 6 heroes in the long-term vision**. This is a long-range *content ambition*, NOT an MVP promise or something to ask Codex to implement with cheap recolors in one prompt. Some forms can share underlying locomotion/rig technology, but their major attacks, VFX, movement posture, silhouettes, sound and mechanics must be individually authored. Ship only as many as can be polished.

### The form quality contract
Every shippable form must deliver all of these:
1. A readable form activation sequence (anticipated, impactful, optionally skippable/shortened).
2. A recognizably changed **character silhouette**, not simply a hair recolor.
3. A unique aura **motion vocabulary** (e.g., shards orbiting, ink shadows collapsing, tether lines, seismic plates, reversed particles).
4. A changed idle, move/dash and key-combat animation set.
5. At least **one new basic chain mechanic**, **two modified active moves**, **one mobility/defense change**, and **one finisher**.
6. Unique VFX and audio layers that communicate its mechanics; performance and accessibility variants.
7. Gameplay usefulness demonstrated in ordinary rooms **and** boss fights, not just pretty cutscenes.
8. Form-specific tooltips, HUD feedback and unlock / mastery tracking.

**Transformation balance:** Forms cost Pulse to activate and maintain, but the meter rewards engaging play. Avoid long lockouts, forced button mashing or repeated unskippable cutscenes. A form can stay active across nearby rooms if the build enables it; designers must test abuse cases. Different forms should favor different enemy scenarios rather than one being the universal best.

**Big action moment:** Activation briefly interrupts the scene with anticipation (~0.3 sec), a dramatic energy burst (~0.5–1 sec), and immediate movement-ready recovery. For an especially rare Mythic unlock, a longer first-ever cinematic is acceptable; later activations should be fast or skippable. Ensure boss attack tells remain readable even under heavy particles.

## 4. Character roster — all names provisional

The six concepts are original proposals, not guaranteed legally unique. Web exact-name checks as of 2026-11-05 found no obvious indexed matches for **Kairo Venn, Lyra Kest, Bram Roux, Noxi Vale, Pip Ardo**, but that is not clearance. **Sera Voss is already used by other fictional/AI game characters and should be replaced.** `Nyvelle Oris` is only a *provisional replacement* pending clearance. Character silhouettes must be independently compared with existing game/anime designs before visual signoff.

### KAIRO VENN — kinetic brawler (starter)
Lean athletic build; asymmetric swept-back plum hair; cropped charcoal jacket with bronze ring joints and split coat. More like a street-fighting momentum athlete than a traditional shonen hero. Strikes, knock-ups, short-range blasts; gameplay asks you to advance and weave between targets.
- **Fury I: Ember Drive** — each consecutive hit leaves a delayed ignition mark; a held combo finisher detonates stacked marks. Short red-amber pressure ripples around forearms.
- **Fury II: Comet Regalia** — attacks can be dash-cancelled into meteor punches; fast streaking shoulder plates and comet trails, momentum-based finishers.
- **Precision I: Glass Current** — clean dodge creates a temporary counter echo; glass-slice visuals and a quiet near-silent reaction window.
- **Precision II: Horizon Still** — measured parry windows let the player mark incoming attacks, then flash-step between marked targets; slender moving horizon lines replace flame particles.
- **Anomaly I: Gravity Break** — launchers and throws suspend enemies briefly; massive grounded uppercuts and floating fractured stones.
- **Anomaly II: Nova Undertow** — attacks pull scattered foes into a controlled impact center; dark amber orbiting gravity arcs.
- **Mythic: Split-Sun Sovereign** — deliberately mixes pressure and precision: successful counter creates a second echo-combo that can be detonated manually. Twin opposite solar halos and fracture seams; must not resemble an existing golden-spiky-hair anime transformation.

### LYRA KEST — orbit acrobat (starter)
Long teal segmented braids, crescent shoulder shell, asymmetric coat, distinctive gyroscopic ring technology. Ranged melee-ranged interweaving, repositioning, controlled ricochets.
- **Fury I: Orbitstorm** — ring strikes accelerate through repeated successful throws.
- **Fury II: Meteor Loom** — weave ring trails into an explosive lattice.
- **Precision I: Silent Meridian** — precise dodges set intercept points for timed counterthrows.
- **Precision II: Zero Arc** — draw safe lanes through projectiles, then snap those trajectories back at enemies.
- **Anomaly I: Twin Singularity** — place two gravity wells and reposition enemies between them.
- **Anomaly II: Celestial Tether** — tether foes, objects and environmental hazards into chain reactions.
- **Mythic: Astral Polarity** — swap push/pull polarity during combos to create stage-wide geometric attacks; visible inverted orbital geometry and distinct footsteps/dashes.

### BRAM ROUX — seismic bruiser (unlock)
Square silhouette, broad metal-stone gauntlets, salt-white short hair, thick sleeveless mechanic armor; slow deliberate strikes with exceptional counterforce.
- Fury: **Fault Pulse** → **Titan Mantle** (stack impact fractures; compress them into giant armor-breaking sweeps).
- Precision: **Bedrock Heart** → **Still Quarry** (perfect heavy guard creates counter pillars; defend then crush).
- Anomaly: **Ironquake** → **World Hammer** (reposition quake lines, shift arena geometry temporarily).
- Mythic: **Mountain Unmade** (dismantles his own external armor to turn defense into a cinematic ranged boulder barrage).

### NOXI VALE — echo duelist (unlock)
Thin angular silhouette, ink-dark asymmetric hair, ribbon-blade, high collar, nonhuman afterimages with distinct triangular profiles.
- Fury: **Echo Rush** → **Night Cascade** (delayed multi-hit blade repeats become controllable).
- Precision: **Ghost Interval** → **Hollow Step** (phase through strikes, counter from precise angles).
- Anomaly: **Ink Reversal** → **Shade Swarm** (place decoys that absorb attacks and burst into reactive attacks).
- Mythic: **Ten Thousand Steps** (choreograph several pre-placed echo positions, unleash them as one controllable sequence).

### PIP ARDO — gadget fighter (unlock)
Small rounded silhouette, insulated yellow jacket, angular visor, chunky utility gloves, unique animated drone.
- Fury: **Sparkstorm** → **Thunder Architect** (conduction chains, fast up-close electrified punches).
- Precision: **Deadlock** → **Clockwork Grace** (parry-driven drone counter and calculated repositioning).
- Anomaly: **Overcharge** → **Event Horizon** (relocate crafted orbs to form damage paths).
- Mythic: **One-Second Universe** (briefly program a series of drone paths, then execute them synchronously; visually playful and different from an invincible anime fighter).

### NYVELLE ORIS — prism duelist (PROVISIONAL RENAME; unlock)
White cropped asymmetric hair, tall collar with split transparent mantle, floating asymmetric prism sword, layered burgundy armor panels; not a traditional katana fighter.
- Fury: **Prism Drive** → **Hundred Edge** (multi-angle blade beam chains).
- Precision: **Crystal Poise** → **Zero Reflection** (return hostile projectiles and cut along their paths).
- Anomaly: **Fracture Waltz** → **Glass Tempest** (split the main blade into remote defensive/offensive planes).
- Mythic: **Luminous Divide** (temporarily splits offensive and defensive stances into two independent orbiting blades).

## 5. MVP — impressive rather than superficially huge

Build **one complete, replayable route** in a polished prototype:
- Two playable heroes (Kairo, Lyra) with independent base combat kits, strong character art and animations.
- **Four fully implemented transformations**: two distinct disciplines for Kairo and two for Lyra. Optionally add **one evolved second-stage form** as a proof of how ascension works, only if high quality is achieved.
- 10–14 encounter rooms from several hand-authored arena layouts, branching routes, traps, one narrative/event chamber, one elite encounter, two boss phases plus miniboss.
- 7–9 mechanically distinct enemy archetypes, strong spawn pacing and visible telegraphs.
- 24–36 meaningful combat upgrades, 10–14 relics and at least 6 combos that noticeably modify action play.
- Hub with unlockable alternate loadouts/form paths, challenges, cosmetics, results, local persistent saves and a full replay loop.
- Playable keyboard/mouse and preferably controller, stable frame pacing, readable UI, input remapping where feasible, reduced camera shake, reduced-flash options and accessible telegraph variants.
- Complete music / sound response pass. A compelling *first minute* and a compelling *final boss*.

**MVP acceptance:** A real player completes a 20-ish-minute run and says the combat is good even without future content; both heroes feel truly different; all four forms have changed gameplay and high-quality art; bosses are readable; a player can return for a different build on the next run. A large count of incomplete upgrades is not evidence of quality.

## 6. Revised Codex batch sequence

Prompts should be delivered as **actual downloadable, kebab-case `.md` files** one by one and must cite current repository structure and observed evidence. Do not pretend visual UAT is satisfied by unit tests alone.

**B00 — Creative/IP/tech checkpoint.** Lock the genre, originality restrictions, original title candidate shortlist, visual bible and feasibility samples. Test how character sprites, depth-sorting, shadows, VFX, effects layers and camera movement render in real gameplay. No asset mass production before visual signoff.

**B01 — Clean browser foundation.** React + TypeScript + Vite UI shell; evaluate Phaser 3 or a newer equivalent by real test, not habit. Resolution scaling, world/game state, typed actions, asset manifests, controller approach, deterministic seeds and save schema.

**B02 — Kairo combat-feel vertical slice.** One room, one enemy, directional 3-hit chain, heavy/launcher, dash, guard/counter, responsive hitboxes, invulnerability windows, hitstop and readable feedback. Must be fun to hit and move before adding content.

**B03 — Art master and character animations.** Original Kairo turnaround, stance states, attack poses, atlas/rig pipeline, frame consistency, readable isometric angle, shadows and layer alignment. Visual inspect in actual browser at target resolution.

**B04 — Encounter intelligence.** More enemy types, state machine AI, threat balancing, elite behaviors, room-clear transitions and hazards.

**B05 — First two Kairo transformations.** Ember Drive and Glass Current each full quality-contract implementation. Form resources, swap/routing rules, VFX/audio/camera options, balance and gameplay tests.

**B06 — First major boss and vertical-slice gate.** Multi-phase boss, parries, targeted area attacks, transformed counter opportunities and results. First high-quality playable slice assessment.

**B07 — Connected route and rewards.** Chamber transitions, branching nodes, seeded rewards, optional risk routes, shortcuts and meaningful room selection.

**B08 — Builds and form synergies.** Upgrades/relics, combo interactions, precision-vs-fury build economy, upgrade UI and deterministic behavior/roll back tests.

**B09 — Lyra and two signature forms.** Entirely different base kit and two full forms, with sprite art/vfx consistency checks, character selection and comparative playtesting.

**B10 — Persistent progression and hub.** Progress, form unlocks, cosmetics, mastery/quests/challenges, save version migration and no unwinnable grind.

**B11 — Full MVP route.** Add rooms, miniboss, final boss, events, unlock flow, first-run tutorial and complete end-to-end run.

**B12 — Presentation and accessibility.** Game UI/HUD, responsive onboarding, audio direction, controller, performance profiles, lower VFX, motion settings and robust loading/error states.

**B13 — Independent real Chrome gameplay signoff.** Manually play full runs with each hero/form, exercise keyboard/controller where available, check actual attacks/collisions/inputs/saves/menus and review visual recordings. Automated tests support, but never replace, hands-on interaction.

**Post-MVP expansion:** Unlock remaining four heroes, later form branches, 42-form long-range content target, alternate biomes/routes, rival bosses, daily seeded challenge, greater difficulty and eventually desktop wrapping. Every content expansion requires gameplay and visual signoff.

## 7. Originality and copyright/trademark guardrails

- Working title remains **PROJECT VEYRSHIFT** until exact searches and appropriate trademark/domain/store availability research and, when warranted, professional legal advice. A quick web search does NOT guarantee clearance.
- `Skybreakers: Limit Zero` is retired due to verified name collisions. Do not ship that name or copy its preexisting game descriptions.
- `Sera Voss` retired due to exact-name collisions. All other hero names and `Nyvelle Oris` remain provisional.
- Draw original poses, outfits, color blocking, geometry and physical silhouettes from approved custom concept sheets; avoid iconic gold spiked hair / specific Super Saiyan and Ultra Instinct likenesses, Goku outfit and stance, signature attack names or beam rituals, and Hades mythological character/IP styling.
- The whole cast must pass a grayscale silhouette test at normal gameplay scale, and each form must remain recognizable as *that hero*.
- Record an asset provenance/approval ledger for master sheets, sprites, prompts, source images and changes. Generated output must be reviewed for unexpected resemblance.
- Don't promise trademark uniqueness, copyright ownership outcomes, or freedom from resemblance solely from AI-generated concepts and online searches.

## 8. The decision now

**LOCKED DIRECTION (subject to future user revision):** 2.5D, fully manual Hades-like action roguelite, spectacular distinct transformations, browser-first, single-player, strong replayability, original IP and master artwork. Build a high-quality prototype before scaling content. A later Electron desktop build remains optional.

**NOT LOCKED:** commercial game title, final cast names, final art sheets, precise transformation names/counts, controller mapping, engine version and content budgets. These need art review, prototyping, playtesting and originality checks.
