import { spawn, spawnSync } from 'node:child_process';
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const repoRoot = process.cwd();
const evidenceRoot = path.resolve(repoRoot, 'tests/evidence/b05/live-chrome');
const runId = `${new Date().toISOString().replaceAll(':', '-').replaceAll('.', '-')}-pid${process.pid}`;
const runDir = path.join(evidenceRoot, `run-${runId}`);
const tempVideoDir = path.join(runDir, 'video-tmp');
const viewport = { width: 1280, height: 720 };
const cli = parseArgs(process.argv.slice(2));
const report = {
  label: 'AUTOMATED / HUMAN REVIEW PENDING',
  scope: 'B05 premium form animation/VFX gameplay evidence; automation only, never owner visual/audio approval',
  runId,
  startedAt: new Date().toISOString(),
  mode: cli.headless ? 'headless supplementary' : 'headed local Chrome',
  requestedUrl: cli.url ?? 'http://127.0.0.1:5173/',
  environment: { node: process.version, platform: process.platform, arch: process.arch, os: `${os.type()} ${os.release()}`, viewport },
  checks: [],
  artifacts: [],
  telemetry: { consoleErrors: [], pageErrors: [], failedRequests: [], badResponses: [] },
  browser: { channel: 'chrome', launch: 'not attempted' },
  audio: { capture: 'not captured', note: 'Playwright recordVideo is video-only. Owner must record system sound and listen.' },
  acceptance: {
    automation: 'PENDING', humanVisual: 'PENDING', humanAudio: 'PENDING', fluidAnimation: 'PENDING — new playable atlas motion requires owner review; old eight-pose draft remains rejected', layeredVfx: 'IMPLEMENTED CANDIDATE — visual review pending',
  },
};

let viteChild = null;
let browser = null;
let exitCode = 0;
let playwright = null;

function parseArgs(args) {
  const out = { headless: false, selfTest: false, help: false, url: process.env.B05_QA_URL ?? null };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--headless') out.headless = true;
    else if (arg === '--self-test') out.selfTest = true;
    else if (arg === '--help' || arg === '-h') out.help = true;
    else if (arg === '--url') {
      out.url = args[++i];
      if (!out.url) throw new Error('--url requires a loopback Vite URL.');
    } else throw new Error(`Unknown option: ${arg}`);
  }
  return out;
}

function isLoopbackUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' && ['127.0.0.1', 'localhost', '::1', '[::1]'].includes(u.hostname) && !u.username && !u.password;
  } catch { return false; }
}

function check(name, status, detail = '', meta = undefined) {
  report.checks.push({ name, status, detail, ...(meta ? { meta } : {}) });
}

function artifact(file, kind, note = '') {
  report.artifacts.push({ path: path.relative(repoRoot, file).replaceAll('\\', '/'), kind, note });
}

async function saveReport() {
  report.finishedAt = new Date().toISOString();
  report.outputDirectory = path.relative(repoRoot, runDir).replaceAll('\\', '/');
  await mkdir(runDir, { recursive: true });
  const reportPath = path.join(runDir, 'qa-report.json');
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  if (!report.artifacts.some(item => item.path === path.relative(repoRoot, reportPath).replaceAll('\\', '/'))) artifact(reportPath, 'machine-readable report', report.label);
  // Re-write so the report lists itself.
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`B05 local Chrome QA: ${report.label}`);
  console.log(`Report: ${reportPath}`);
}

function percentile(sorted, p) {
  if (!sorted.length) return null;
  return Number(sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))].toFixed(2));
}

function makePageTelemetry(page, label) {
  const data = { label, consoleErrors: [], pageErrors: [], failedRequests: [], badResponses: [] };
  page.on('console', message => { if (message.type() === 'error') data.consoleErrors.push(message.text()); });
  page.on('pageerror', error => data.pageErrors.push(error.stack ?? error.message));
  page.on('requestfailed', request => data.failedRequests.push({ url: request.url(), error: request.failure()?.errorText ?? 'unknown request failure' }));
  page.on('response', response => { if (response.status() >= 400) data.badResponses.push({ url: response.url(), status: response.status() }); });
  return data;
}

function mergeTelemetry(data) {
  report.telemetry.consoleErrors.push(...data.consoleErrors.map(text => ({ page: data.label, text })));
  report.telemetry.pageErrors.push(...data.pageErrors.map(text => ({ page: data.label, text })));
  report.telemetry.failedRequests.push(...data.failedRequests.map(item => ({ page: data.label, ...item })));
  report.telemetry.badResponses.push(...data.badResponses.map(item => ({ page: data.label, ...item })));
}

async function newRecordingPage(label) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    recordVideo: { dir: tempVideoDir, size: viewport },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(9000);
  const video = page.video();
  const telemetry = makePageTelemetry(page, label);
  return { context, page, video, telemetry };
}

async function closeRecordingPage(recording, videoName) {
  const { context, page, video, telemetry } = recording;
  try { await page.close(); } catch { /* browser may already have closed after a launch failure */ }
  if (video) {
    const target = path.join(runDir, videoName);
    try {
      await video.saveAs(target);
      artifact(target, 'video-only WebM', 'Normal-speed Playwright recording; no audio track.');
    } catch (error) {
      check(`save ${videoName}`, 'FAIL', error.message);
    }
  }
  try { await context.close(); } catch { /* no-op after browser failure */ }
  mergeTelemetry(telemetry);
}

async function capture(page, name) {
  const file = path.join(runDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true, animations: 'allow' });
  artifact(file, 'screenshot');
}

async function wait(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function verifyVite(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1800), redirect: 'manual' });
    const body = await response.text();
    const viteMarkup = body.includes('/@vite/client') && body.includes('<html');
    return { reachable: true, status: response.status, viteMarkup, bodySample: body.slice(0, 500), url };
  } catch (error) {
    return { reachable: false, error: error.message, url };
  }
}

function withQuery(baseUrl, query) {
  const u = new URL(baseUrl);
  u.pathname = '/';
  for (const [key, value] of Object.entries(query)) u.searchParams.set(key, value);
  return u.toString();
}

function findChrome() {
  const candidates = [];
  if (process.env.CHROME_PATH) candidates.push(process.env.CHROME_PATH);
  if (process.platform === 'win32') {
    for (const root of [process.env['PROGRAMFILES'], process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA]) {
      if (root) candidates.push(path.join(root, 'Google', 'Chrome', 'Application', 'chrome.exe'));
    }
    const where = spawnSync('where.exe', ['chrome.exe'], { encoding: 'utf8', windowsHide: true });
    if (!where.error && where.status === 0) candidates.push(...where.stdout.split(/\r?\n/).map(line => line.trim()).filter(Boolean));
  } else {
    for (const command of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
      const result = spawnSync('which', [command], { encoding: 'utf8' });
      if (!result.error && result.status === 0) candidates.push(result.stdout.trim());
    }
  }
  return [...new Set(candidates)];
}

async function waitForStartedVite(child, url) {
  let last = null;
  for (let i = 0; i < 60; i += 1) {
    if (child.exitCode !== null) return { ...(last ?? {}), childExitCode: child.exitCode };
    last = await verifyVite(url);
    if (last.viteMarkup) return last;
    await wait(250);
  }
  return last ?? { reachable: false, error: 'Vite startup timed out.' };
}

async function ensureVite() {
  const requested = cli.url ?? 'http://127.0.0.1:5173/';
  if (!isLoopbackUrl(requested)) {
    const detail = '--url is restricted to http://localhost, http://127.0.0.1, or http://[::1].';
    check('loopback URL restriction', 'FAIL', detail);
    throw new Error(detail);
  }
  const base = new URL(requested);
  base.pathname = '/'; base.search = ''; base.hash = '';
  let result = await verifyVite(base.toString());
  if (result.viteMarkup) {
    check('Vite server', 'PASS', 'Reused the reachable loopback Vite server; this tool did not start or stop it.', { url: base.toString() });
    return base.toString();
  }
  if (cli.url) {
    const detail = result.reachable
      ? `The supplied URL returned HTTP ${result.status}, but the response did not identify a Vite dev server.`
      : `The supplied Vite URL is unreachable: ${result.error}`;
    check('Vite server', 'BLOCKED', detail, { url: base.toString(), httpStatus: result.status, responseSample: result.bodySample });
    throw new Error(`${detail} Start Vite on loopback, then rerun with --url.`);
  }
  if (result.reachable) {
    const detail = `Port 5173 is occupied by a reachable non-Vite response (HTTP ${result.status}); the tool will not take it over.`;
    check('Vite server', 'BLOCKED', detail, { url: base.toString(), bodySample: result.bodySample });
    throw new Error(`${detail} Stop the conflicting service or run Vite on another loopback port and pass --url.`);
  }
  const viteCli = path.resolve(repoRoot, 'node_modules/vite/bin/vite.js');
  try { await access(viteCli); } catch {
    const detail = `Vite CLI is missing at ${viteCli}. Run npm ci from the repository root.`;
    check('Vite server', 'BLOCKED', detail);
    throw new Error(detail);
  }
  let output = '';
  viteChild = spawn(process.execPath, [viteCli, '--host', '127.0.0.1', '--port', '5173', '--strictPort'], {
    cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
  });
  const collect = chunk => { output = `${output}${chunk.toString()}`.slice(-12000); };
  viteChild.stdout.on('data', collect);
  viteChild.stderr.on('data', collect);
  viteChild.on('error', error => { output = `${output}\n${error.message}`.slice(-12000); });
  result = await waitForStartedVite(viteChild, base.toString());
  if (!result.viteMarkup) {
    const detail = result.error ?? `Vite did not become ready (child exit ${result.childExitCode ?? 'unknown'}).`;
    check('Vite server', 'BLOCKED', detail, { url: base.toString(), viteOutput: output });
    throw new Error(`${detail}\nVite output:\n${output}`);
  }
  check('Vite server', 'PASS', 'Started the actual Vite app bound to 127.0.0.1. Only this child process will be stopped by cleanup.', { url: base.toString(), viteOutput: output });
  return base.toString();
}

async function readDebugState(page) {
  return page.evaluate(() => {
    const c = window.__VEYRSHIFT_DEBUG__;
    if (!c) return null;
    const s = c.session;
    const h = s.hero;
    return {
      mode: s.mode, room: s.room, formId: h.formId, transformed: h.transformed,
      hero: { x: h.x, y: h.y, hp: h.hp, pulse: h.pulse, dashTime: h.dashTime, guardTime: h.guardTime,
        attackTime: h.attackTime, attackAnimTime: h.attackAnimTime, attackFormId: h.attackFormId,
        currentAbility: h.currentAbility, abilityFormId: h.abilityFormId, formTime: h.formTime,
        transformVisualTime: h.transformVisualTime, glassCounterTime: h.glassCounterTime, locomotion: h.locomotion },
      enemies: s.enemies.map(enemy => ({ id: enemy.id, x: enemy.x, y: enemy.y, hp: enemy.hp, telegraph: enemy.telegraph, emberMarks: enemy.emberMarks ?? 0 })),
      snapshot: s.snapshot,
      proof: c.visualProof ? { form: c.visualProof.form, elapsed: c.visualProof.elapsed } : null,
      premiumShowcase: c.premiumShowcase ? { ...c.premiumShowcase, held: [...c.premiumShowcase.held] } : null,
      rigProof: c.rigCutoutProof ? { ...c.rigCutoutProof } : null,
      sounds: c.sound.eventLog.slice(-80).map(sound => ({ id: sound.id, gameTime: sound.gameTime, audioTime: sound.audioTime, audioState: sound.audioState })),
    };
  });
}

async function measureAndSample(page, durationMs) {
  return page.evaluate(ms => new Promise(resolve => {
    const deltas = [];
    const samples = [];
    let first = 0, previous = 0, lastSample = 0;
    const tick = now => {
      if (!first) first = now;
      if (previous) deltas.push(now - previous);
      previous = now;
      if (!lastSample || now - lastSample >= 100) {
        const c = window.__VEYRSHIFT_DEBUG__;
        const s = c?.session, h = s?.hero;
        samples.push({ atMs: Math.round(now - first), proof: c?.visualProof ? { ...c.visualProof } : null,
          rigProof: c?.rigCutoutProof ? { ...c.rigCutoutProof } : null,
          premiumShowcase: c?.premiumShowcase ? { form: c.premiumShowcase.form, elapsed: c.premiumShowcase.elapsed } : null,
          mode: s?.mode, formId: h?.formId, transformed: h?.transformed, formTime: h?.formTime,
          currentAbility: h?.currentAbility, abilityFormId: h?.abilityFormId, combo: h?.combo, attackFormId: h?.attackFormId,
          dashTime: h?.dashTime, guardTime: h?.guardTime, glassCounterTime: h?.glassCounterTime,
          heroHp: h?.hp, targetHp: s?.enemies?.[0]?.hp ?? null, targetTelegraph: s?.enemies?.[0]?.telegraph ?? null });
        lastSample = now;
      }
      if (now - first >= ms) {
        const sorted = deltas.slice().sort((a, b) => a - b);
        resolve({ frames: deltas.length, observedFps: Number((deltas.length / (deltas.reduce((a, b) => a + b, 0) / 1000)).toFixed(2)),
          frameTimeMs: { median: percentileInPage(sorted, .5), p95: percentileInPage(sorted, .95), max: Number(sorted.at(-1)?.toFixed(2) ?? 0) }, samples });
      } else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    function percentileInPage(sorted, p) { return sorted.length ? Number(sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))].toFixed(2)) : null; }
  }), durationMs);
}

async function runSelfTest() {
  await mkdir(runDir, { recursive: true });
  const checks = [
    ['default local endpoint is loopback', isLoopbackUrl('http://127.0.0.1:5173/')],
    ['localhost endpoint is loopback', isLoopbackUrl('http://localhost:5173/')],
    ['IPv6 loopback endpoint is loopback', isLoopbackUrl('http://[::1]:5173/')],
    ['external hosts are rejected', !isLoopbackUrl('http://example.com:5173/')],
    ['HTTPS external URL is rejected', !isLoopbackUrl('https://127.0.0.1:5173/')],
    ['credential-bearing URLs are rejected', !isLoopbackUrl('http://user:pass@127.0.0.1:5173/')],
    ['query builder opens the B05 route', withQuery('http://127.0.0.1:5173/', { b05showcase: '1' }) === 'http://127.0.0.1:5173/?b05showcase=1'],
  ];
  for (const [name, pass] of checks) check(name, pass ? 'PASS' : 'FAIL');
  report.acceptance.automation = checks.every(([, pass]) => pass) ? 'SELF-TEST PASS; actual browser run pending' : 'SELF-TEST FAIL';
  if (checks.some(([, pass]) => !pass)) exitCode = 1;
}

function usage() {
  console.log(`B05 owner-local Chrome QA\n\n  npm run qa:chrome:local\n  npm run qa:chrome:headless\n  node tools/b05-chrome-local-qa.mjs --url http://127.0.0.1:5175/\n  npm run qa:chrome:self-test\n\nDefault mode is headed Chrome. The dedicated headless script is supplementary automation only. --url must be loopback.`);
}

async function runOrdinaryGame(baseUrl) {
  const recording = await newRecordingPage('ordinary-game');
  const { page } = recording;
  const result = { assertions: [], states: {}, frameStats: null };
  const assertion = (name, passed, detail = '') => {
    result.assertions.push({ name, status: passed ? 'PASS' : 'FAIL', detail });
    check(`ordinary game: ${name}`, passed ? 'PASS' : 'FAIL', detail);
    if (!passed) exitCode = 1;
  };
  try {
    await page.addInitScript(() => localStorage.setItem('veyrshift-save-v1', JSON.stringify({ version: 3, shards: 0, bestRoom: 0, runs: 0,
      totalDefeats: 0, unlockedHeroes: ['kairo'], unlockedForms: ['ember-drive', 'glass-current'], equippedForm: 'ember-drive', precisionTrials: 5,
      settings: { masterVolume: .75, musicVolume: .35, effectsVolume: .8, screenshake: true, particles: true, reducedFlash: false, reducedMotion: false } })));
    await page.goto(withQuery(baseUrl, { dev: '1' }), { waitUntil: 'domcontentloaded' });
    await capture(page, 'ordinary-01-title');
    await page.getByRole('button', { name: 'New Run' }).click();
    await capture(page, 'ordinary-02-hub');
    await page.getByRole('button', { name: 'Character' }).click();
    assertion('character selection reached', await page.getByRole('heading', { name: 'KAIRO VENN' }).isVisible());
    await capture(page, 'ordinary-03-character');
    await page.getByRole('button', { name: /BACK/ }).click();
    await page.getByRole('button', { name: 'Forms' }).click();
    assertion('form selection reached', await page.getByRole('heading', { name: 'FORMS' }).isVisible());
    const formCards = await page.locator('.form-select-card').count();
    assertion('two prototype forms listed', formCards === 2, `Found ${formCards} form cards.`);
    const glassCard = page.locator('.form-select-card').filter({ hasText: 'Glass Current' });
    await glassCard.getByRole('button', { name: /EQUIP FORM/ }).click();
    const glassSave = await page.evaluate(() => JSON.parse(localStorage.getItem('veyrshift-save-v1') ?? '{}'));
    assertion('Glass is selected through the real form UI and saved', glassSave.equippedForm === 'glass-current', `equippedForm: ${glassSave.equippedForm}`);
    const emberCard = page.locator('.form-select-card').filter({ hasText: 'Ember Drive' });
    await emberCard.getByRole('button', { name: /EQUIP FORM/ }).click();
    const emberSave = await page.evaluate(() => JSON.parse(localStorage.getItem('veyrshift-save-v1') ?? '{}'));
    assertion('Ember form selection persists to v3 local save', emberSave.equippedForm === 'ember-drive' && emberSave.version === 3, `version: ${emberSave.version}, equippedForm: ${emberSave.equippedForm}`);
    await capture(page, 'ordinary-04-form-selection');
    await page.getByRole('button', { name: /BACK/ }).click();
    await page.getByRole('button', { name: 'Character' }).click();
    await page.getByRole('button', { name: /PLAY KAIRO/ }).click();
    const canvas = page.locator('canvas[aria-label="Combat arena"]');
    await canvas.waitFor({ state: 'visible' });
    await page.getByRole('button', { name: /DEV.*VFX CROWD/i }).click();
    await page.getByRole('button', { name: /DEV.*SET PULSE/i }).click();
    await wait(180);
    const crowd = await readDebugState(page);
    assertion('populated combat encounter created for VFX/frame sampling', crowd.enemies.length >= 8, `active enemies: ${crowd.enemies.length}`);
    assertion('ability HUD visible', await page.locator('.ability-ribbon').isVisible());
    assertion('form status HUD visible', await page.locator('.form-live').isVisible());
    await capture(page, 'ordinary-05-game-start');

    let before = await readDebugState(page);
    await page.keyboard.down('ArrowRight'); await wait(260); await page.keyboard.up('ArrowRight'); await wait(80);
    let after = await readDebugState(page);
    assertion('arrow movement changes world position', after.hero.x > before.hero.x + 4, `x: ${before.hero.x.toFixed(1)} → ${after.hero.x.toFixed(1)}`);
    before = after;
    await page.keyboard.down('w'); await wait(220); await page.keyboard.up('w'); await wait(70);
    after = await readDebugState(page);
    assertion('WASD movement changes world position', after.hero.y < before.hero.y - 4, `y: ${before.hero.y.toFixed(1)} → ${after.hero.y.toFixed(1)}`);

    const target = await page.evaluate(() => {
      const c = window.__VEYRSHIFT_DEBUG__, canvas = document.querySelector('canvas');
      const r = canvas.getBoundingClientRect(), enemy = c.session.enemies[0];
      return { rect: { x: r.x, y: r.y, width: r.width, height: r.height }, arena: { width: c.session.width, height: c.session.height }, enemy: { x: enemy.x, y: enemy.y, hp: enemy.hp } };
    });
    await page.mouse.move(target.rect.x + target.enemy.x / target.arena.width * target.rect.width, target.rect.y + target.enemy.y / target.arena.height * target.rect.height);
    await page.mouse.down(); await wait(70); await page.mouse.up(); await wait(750);
    after = await readDebugState(page);
    assertion('manual mouse attack damages test target', after.enemies[0]?.hp < target.enemy.hp, `target HP: ${target.enemy.hp} → ${after.enemies[0]?.hp ?? 'missing'}`);
    result.states.attack = after;
    await capture(page, 'ordinary-06-attack');

    await page.keyboard.down('e'); await wait(110);
    const guardState = await readDebugState(page); await page.keyboard.up('e');
    assertion('guard input activates guard state', guardState.hero.guardTime > 0, `guard timer: ${guardState.hero.guardTime.toFixed(3)}s`);
    await page.keyboard.down('ArrowRight'); await page.keyboard.down('Shift'); await wait(90);
    const dashState = await readDebugState(page); await page.keyboard.up('Shift'); await page.keyboard.up('ArrowRight'); await wait(190);
    assertion('dodge input activates dash state', dashState.hero.dashTime > 0, `dash timer: ${dashState.hero.dashTime.toFixed(3)}s`);
    result.states.guard = guardState; result.states.dodge = dashState;
    await capture(page, 'ordinary-07-guard-dodge');

    await page.keyboard.press('r'); await wait(260);
    const formState = await readDebugState(page);
    assertion('form activation reaches transformed state', formState.transformed, `form: ${formState.formId}, pulse ${formState.hero.pulse}`);
    assertion('transformed form HUD updates', (await page.locator('.form-live').innerText()).toUpperCase().includes('EMBER DRIVE'));
    result.states.form = formState;
    await capture(page, 'ordinary-08-form-active');

    await page.getByRole('button', { name: /DEV.*SET PULSE/i }).click();
    await page.keyboard.press('q'); await wait(520);
    const emberSpecial = await readDebugState(page);
    await page.keyboard.press('f'); await wait(900);
    const emberFinisher = await readDebugState(page);
    assertion('ordinary Ember gameplay resolves special and finisher events', emberFinisher.sounds.some(sound => sound.id === 'ember-special') && emberFinisher.sounds.some(sound => sound.id === 'ember-finisher-hit'),
      `recent form cues: ${emberFinisher.sounds.filter(sound => sound.id.startsWith('ember-')).map(sound => sound.id).slice(-8).join(', ')}`);
    result.states.emberSpecial = emberSpecial; result.states.emberFinisher = emberFinisher;

    await page.getByRole('button', { name: /PAUSE/i }).first().click();
    assertion('pause menu opens', await page.getByRole('heading', { name: /TAKE A BREATH/ }).isVisible());
    await capture(page, 'ordinary-09-pause');
    await page.getByRole('button', { name: 'SETTINGS' }).click();
    assertion('pause settings panel opens', await page.getByRole('heading', { name: /SETTINGS.*RUN REMAINS PAUSED/ }).isVisible());
    await page.getByLabel('Reduced flash').check();
    const settingSave = await page.evaluate(() => JSON.parse(localStorage.getItem('veyrshift-save-v1') ?? '{}'));
    assertion('pause setting change persists in local save', settingSave.settings?.reducedFlash === true, `reducedFlash: ${settingSave.settings?.reducedFlash}`);
    await capture(page, 'ordinary-10-pause-settings');
    await page.getByRole('button', { name: /PAUSE MENU/ }).click();
    await page.getByRole('button', { name: 'RESUME' }).click();
    assertion('resume returns to active game', (await readDebugState(page)).mode === 'playing');
    await page.setViewportSize({ width: 960, height: 540 });
    await capture(page, 'ordinary-11-game-960x540');
    result.frameStats = await measureAndSample(page, 1100);
    result.states.final = await readDebugState(page);

    await page.getByRole('button', { name: /PAUSE/i }).first().click();
    await page.getByRole('button', { name: /ABANDON RUN/ }).click();
    await page.getByRole('button', { name: /ABANDON RUN/ }).click();
    assertion('paused run returns cleanly to the hub', await page.getByRole('button', { name: 'Forms' }).isVisible());
    await capture(page, 'ordinary-12-return-hub');
    await page.getByRole('button', { name: 'Forms' }).click();
    const glassCardAgain = page.locator('.form-select-card').filter({ hasText: 'Glass Current' });
    await glassCardAgain.getByRole('button', { name: /EQUIP FORM/ }).click();
    const selectedGlass = await page.evaluate(() => JSON.parse(localStorage.getItem('veyrshift-save-v1') ?? '{}'));
    assertion('Glass selection survives hub return and is saved', selectedGlass.equippedForm === 'glass-current', `equippedForm: ${selectedGlass.equippedForm}`);
    await page.getByRole('button', { name: /BACK/ }).click();
    await page.getByRole('button', { name: 'Character' }).click();
    await page.getByRole('button', { name: /PLAY KAIRO/ }).click();
    await page.locator('canvas[aria-label="Combat arena"]').waitFor({ state: 'visible' });
    await wait(180);
    await page.getByRole('button', { name: /DEV.*TEST TARGET/i }).click();
    await page.getByRole('button', { name: /DEV.*SET PULSE/i }).click();
    const glassLoad = await readDebugState(page);
    assertion('normal run loads the newly selected Glass form', glassLoad.formId === 'glass-current', `loaded form: ${glassLoad.formId}`);
    await page.keyboard.press('r'); await wait(250);
    await page.getByRole('button', { name: /DEV.*SHOW TELEGRAPH/i }).click();
    await wait(235);
    await page.keyboard.down('ArrowRight'); await page.keyboard.down('Shift'); await wait(245);
    await page.keyboard.up('Shift'); await page.keyboard.up('ArrowRight'); await wait(110);
    const glassCounter = await readDebugState(page);
    assertion('Glass dodge earns a real counter window in ordinary play', glassCounter.hero.glassCounterTime > 0, `counter window: ${glassCounter.hero.glassCounterTime.toFixed(3)}s`);
    assertion('Glass counter is earned from the dodge event', glassCounter.sounds.some(sound => sound.id === 'glass-counter'),
      `recent Glass cues: ${glassCounter.sounds.filter(sound => sound.id.startsWith('glass-')).map(sound => sound.id).slice(-6).join(', ')}`);
    await page.keyboard.press('q'); await wait(620);
    const glassSpecial = await readDebugState(page);
    assertion('Glass counter special consumes its earned window', glassSpecial.hero.glassCounterTime === 0 && glassSpecial.sounds.some(sound => sound.id === 'glass-special'),
      `counter: ${glassSpecial.hero.glassCounterTime.toFixed(3)}s`);
    result.states.glassLoad = glassLoad; result.states.glassCounter = glassCounter; result.states.glassSpecial = glassSpecial;
    await capture(page, 'ordinary-13-glass-counter');
  } catch (error) {
    assertion('ordinary flow completes without automation exception', false, error.stack ?? error.message);
  } finally {
    result.telemetry = recording.telemetry;
    report.ordinaryGame = result;
    await closeRecordingPage(recording, 'ordinary-game.webm');
  }
}

async function runShowcase(baseUrl, form, durationMs) {
  const label = `showcase-${form}`;
  const recording = await newRecordingPage(label);
  const { page } = recording;
  const result = { form, durationMs, actualGameplay: true, cycles: 3, assertions: [], stateSamples: [], frameStats: null };
  const assertion = (name, passed, detail = '') => {
    result.assertions.push({ name, status: passed ? 'PASS' : 'FAIL', detail });
    check(`${label}: ${name}`, passed ? 'PASS' : 'FAIL', detail);
    if (!passed) exitCode = 1;
  };
  try {
    await page.goto(withQuery(baseUrl, { b05showcase: '1', b05scale: '100', b05bg: 'dark' }), { waitUntil: 'domcontentloaded' });
    const buttonName = form === 'ember-drive' ? /PLAY EMBER SHOWCASE/ : /PLAY GLASS SHOWCASE/;
    const button = page.getByRole('button', { name: buttonName });
    await button.waitFor({ state: 'visible' });
    const routeInitial = await readDebugState(page);
    assertion('real Vite showcase route opened', await page.locator('canvas[aria-label="Combat arena"]').isVisible());
    await capture(page, `${label}-before`);
    await button.click();
    const showcaseInitial = await readDebugState(page);
    const measurePromise = measureAndSample(page, durationMs + 400);
    await wait(250); await capture(page, `${label}-start`);
    await wait(durationMs / 2); await capture(page, `${label}-mid`);
    const measured = await measurePromise;
    result.frameStats = { viewport, ...measured };
    result.stateSamples = measured.samples;
    await capture(page, `${label}-end`);
    const final = await readDebugState(page);
    result.initial = showcaseInitial; result.final = final;
    assertion('36-second normal-speed gameplay replay advanced', measured.samples.some(sample => sample.premiumShowcase && sample.premiumShowcase.elapsed > 1));
    assertion('form transformation was active during replay', measured.samples.some(sample => sample.transformed));
    const activations = measured.samples.reduce((count, sample, index) => count + (sample.transformed && !measured.samples[index - 1]?.transformed ? 1 : 0), 0);
    assertion('three form activations and reversions were exercised', activations >= 3 && measured.samples.some(sample => !sample.transformed), `observed activations: ${activations}`);
    assertion('crowded encounter remained populated during the clip', measured.samples.some(sample => sample.targetHp !== null) && final.enemies.length >= 5, `remaining targets: ${final.enemies.length}`);
    const formCuePrefix = form === 'ember-drive' ? 'ember-' : 'glass-';
    assertion('form-specific audio events were emitted by the real event path', final.sounds.some(sound => sound.id.startsWith(formCuePrefix)),
      `recent cues: ${final.sounds.map(sound => sound.id).slice(-12).join(', ')}`);
    if (form === 'ember-drive') {
      const startHp = showcaseInitial.enemies[0]?.hp;
      const endHp = final.enemies[0]?.hp;
      assertion('Ember combo and finisher landed real hitbox damage', Number.isFinite(startHp) && Number.isFinite(endHp) && endHp < startHp, `target HP: ${startHp} → ${endHp}`);
    } else {
      assertion('Glass dodge earned a counter window during its real gameplay segment', measured.samples.some(sample =>
        sample.premiumShowcase?.elapsed >= 3.65 && sample.premiumShowcase?.elapsed <= 4.15 && sample.glassCounterTime > 0));
      const startHp = showcaseInitial.enemies[0]?.hp;
      const endHp = final.enemies[0]?.hp;
      assertion('Glass counter special damaged the real target', Number.isFinite(startHp) && Number.isFinite(endHp) && endHp < startHp, `target HP: ${startHp} → ${endHp}`);
    }
    assertion('showcase completed and reverted to base state', final.premiumShowcase === null && final.transformed === false, `showcase active: ${Boolean(final.premiumShowcase)}, transformed: ${final.transformed}`);
    result.routeInitial = routeInitial;
    result.initial = showcaseInitial;
    result.soundEvents = final.sounds;
    result.audioStateObserved = [...new Set(final.sounds.map(sound => sound.audioState))];
    result.audioClaim = 'Event log only; no sound was captured or heard by this automated run.';
  } catch (error) {
    assertion('showcase completes without automation exception', false, error.stack ?? error.message);
  } finally {
    result.telemetry = recording.telemetry;
    report.showcases ??= [];
    report.showcases.push(result);
    await closeRecordingPage(recording, `${label}.webm`);
  }
}

async function captureShowcaseMatrix(baseUrl, form) {
  const label = `showcase-matrix-${form}`;
  const cases = [
    { scale: '100', bg: 'dark', effects: 'normal' },
    { scale: '100', bg: 'midtone', effects: 'reduced' },
    { scale: '75', bg: 'dark', effects: 'reduced' },
    { scale: '75', bg: 'midtone', effects: 'normal' },
  ];
  const result = { form, screenshots: [], assertions: [] };
  for (const variant of cases) {
    const name = `${label}-${variant.scale}-${variant.bg}-${variant.effects}`;
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await context.newPage();
    page.setDefaultTimeout(9000);
    const telemetry = makePageTelemetry(page, name);
    try {
      await page.goto(withQuery(baseUrl, { b05showcase: '1', b05scale: variant.scale, b05bg: variant.bg,
        ...(variant.effects === 'reduced' ? { b05effects: 'reduced' } : {}) }), { waitUntil: 'domcontentloaded' });
      const button = page.getByRole('button', { name: form === 'ember-drive' ? /PLAY EMBER SHOWCASE/ : /PLAY GLASS SHOWCASE/ });
      await button.click(); await wait(1050);
      const state = await readDebugState(page);
      const pass = state?.transformed === true && state?.premiumShowcase?.form === form;
      result.assertions.push({ name, status: pass ? 'PASS' : 'FAIL', state: { formId: state?.formId, transformed: state?.transformed, scale: variant.scale, background: variant.bg, effects: variant.effects } });
      check(`${name}: active gameplay frame captured`, pass ? 'PASS' : 'FAIL');
      if (!pass) exitCode = 1;
      const fileName = `${name}.png`;
      await capture(page, name);
      result.screenshots.push({ path: `tests/evidence/b05/live-chrome/${runDir.split(path.sep).at(-1)}/${fileName}`, scale: variant.scale, background: variant.bg, effects: variant.effects });
    } catch (error) {
      result.assertions.push({ name, status: 'FAIL', error: error.stack ?? error.message });
      check(`${name}: screenshot matrix completes`, 'FAIL', error.message); exitCode = 1;
    } finally {
      try { await page.close(); } catch { /* page may already be closed */ }
      try { await context.close(); } catch { /* no-op after page close */ }
      mergeTelemetry(telemetry);
    }
  }
  report.showcasePresentationMatrix ??= [];
  report.showcasePresentationMatrix.push(result);
}

async function runShortTransformationClip(baseUrl) {
  const label = 'transformation-attack-reversion-short';
  const recording = await newRecordingPage(label);
  const { page } = recording;
  const result = { durationMs: 7600, form: 'ember-drive', assertions: [], frameStats: null };
  const assertion = (name, passed, detail = '') => {
    result.assertions.push({ name, status: passed ? 'PASS' : 'FAIL', detail });
    check(`${label}: ${name}`, passed ? 'PASS' : 'FAIL', detail);
    if (!passed) exitCode = 1;
  };
  try {
    await page.goto(withQuery(baseUrl, { b05showcase: '1', b05scale: '100', b05bg: 'dark' }), { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /PLAY EMBER SHOWCASE/ }).click();
    const initial = await readDebugState(page);
    const measurePromise = measureAndSample(page, result.durationMs);
    await wait(900); await capture(page, `${label}-activation`);
    await wait(1800); await capture(page, `${label}-attack`);
    result.frameStats = await measurePromise;
    result.final = await readDebugState(page);
    assertion('clip shows an activated form during the real Vite run', result.frameStats.samples.some(sample => sample.transformed));
    assertion('clip includes confirmed combat damage', result.final.enemies[0]?.hp < initial.enemies[0]?.hp,
      `target HP: ${initial.enemies[0]?.hp} → ${result.final.enemies[0]?.hp}`);
    assertion('clip includes a form reversion', result.final.transformed === false && result.final.premiumShowcase?.elapsed > 6.8,
      `transformed: ${result.final.transformed}; timeline: ${result.final.premiumShowcase?.elapsed}`);
  } catch (error) {
    assertion('short transformation clip completes', false, error.stack ?? error.message);
  } finally {
    result.telemetry = recording.telemetry;
    report.transformationClip = result;
    await closeRecordingPage(recording, `${label}.webm`);
  }
}

async function runRigCutoutProof(baseUrl, scale) {
  const percent = Math.round(scale * 100);
  const label = `rig-cutout-${percent}`;
  const recording = await newRecordingPage(label);
  const { page } = recording;
  const result = { scale, durationMs: 1700, method: 'One generated right-facing profile cutout, code-interpolated whole-body translation/rotation, fixed scale, no joint deformation.', assertions: [], frameStats: null };
  const assertion = (name, passed, detail = '') => {
    result.assertions.push({ name, status: passed ? 'PASS' : 'FAIL', detail });
    check(`${label}: ${name}`, passed ? 'PASS' : 'FAIL', detail);
    if (!passed) exitCode = 1;
  };
  try {
    await page.goto(withQuery(baseUrl, { b05showcase: '1', b05rigproof: String(percent) }), { waitUntil: 'domcontentloaded' });
    await page.locator('.rig-proof-panel').waitFor({ state: 'visible' });
    await page.waitForFunction(() => {
      const images = Array.from(document.querySelectorAll('.rig-proof-reference img'));
      return images.length === 2 && images.every(image => image.complete && image.naturalWidth > 0);
    }, null, { timeout: 9000 });
    const comparison = await page.locator('.rig-proof-reference img').evaluateAll(images => images.map(image => ({ loaded: image.complete && image.naturalWidth > 0, width: image.naturalWidth, height: image.naturalHeight })));
    assertion('live Vite comparison includes source art and failed eight-pose GIF', comparison.length === 2 && comparison.every(image => image.loaded), JSON.stringify(comparison));
    const labelText = await page.locator('.rig-proof-panel > b').innerText();
    assertion('live game overlay identifies requested sprite scale', labelText.includes(`${percent}%`), labelText);
    await capture(page, `${label}-before`);
    await page.getByRole('button', { name: 'PLAY CUTOUT PROOF' }).click();
    const started = await readDebugState(page);
    assertion('cutout uses requested game scale', started.rigProof?.scale === scale, `expected ${scale}; found ${started.rigProof?.scale ?? 'inactive'}`);
    const measurePromise = measureAndSample(page, 2150);
    await wait(220); await capture(page, `${label}-start`);
    await wait(650); await capture(page, `${label}-mid`);
    const measured = await measurePromise;
    result.frameStats = { viewport, ...measured };
    result.samples = measured.samples;
    await capture(page, `${label}-end`);
    const final = await readDebugState(page);
    const timed = measured.samples.map(sample => sample.rigProof).filter(Boolean);
    assertion('code-interpolated cutout timeline advances', timed.length > 4 && timed.at(-1).elapsed >= 1.5, `captured ${timed.length} timed samples, last ${timed.at(-1)?.elapsed ?? 0}s`);
    assertion('scale stays fixed through the action', timed.length > 0 && timed.every(sample => sample.scale === scale), `observed scales: ${[...new Set(timed.map(sample => sample.scale))].join(', ')}`);
    assertion('lunge resolves a real directional melee hit', final.enemies[0]?.hp < started.enemies[0]?.hp, `target HP: ${started.enemies[0]?.hp} → ${final.enemies[0]?.hp}`);
    result.hitTargetHp = { before: started.enemies[0]?.hp, after: final.enemies[0]?.hp };
    result.scaleSamples = [...new Set(timed.map(sample => sample.scale))];
    result.humanVisualStatus = 'PENDING — owner inspection required; this cutout lunge is a feasibility test only.';
  } catch (error) {
    assertion('cutout pipeline proof completes without automation exception', false, error.stack ?? error.message);
  } finally {
    result.telemetry = recording.telemetry;
    report.rigCutoutProofs ??= [];
    report.rigCutoutProofs.push(result);
    await closeRecordingPage(recording, `${label}.webm`);
  }
}

async function run() {
  await mkdir(runDir, { recursive: true });
  if (cli.help) { usage(); return; }
  if (cli.selfTest) { await runSelfTest(); return; }

  report.environment.chromeCandidates = findChrome();
  if (Number(process.versions.node.split('.')[0]) < 22) {
    const detail = `Node.js 22+ is required; found ${process.version}. Install Node 22+ and rerun from PowerShell.`;
    check('Node.js version', 'BLOCKED', detail);
    report.acceptance.automation = 'BLOCKED';
    throw new Error(detail);
  }
  check('Node.js version', 'PASS', `${process.version} meets the Node 22+ requirement.`);

  try { playwright = await import('playwright'); }
  catch (error) {
    const detail = `Playwright could not be imported: ${error.message}. Run npm ci from the repository root.`;
    check('Playwright dependency', 'BLOCKED', detail);
    report.acceptance.automation = 'BLOCKED';
    throw new Error(detail);
  }
  check('Playwright dependency', 'PASS', `Installed Playwright ${playwright.chromium ? 'package found' : 'package import unresolved'}.`);

  const baseUrl = await ensureVite();
  report.actualBaseUrl = baseUrl;
  report.environment.chromeCandidatesFound = report.environment.chromeCandidates.length > 0;
  if (!report.environment.chromeCandidatesFound) {
    check('Chrome availability preflight', 'WARN', 'Chrome was not found in common install paths/PATH; Playwright channel launch will verify the registered Chrome channel and preserve the actual error if unavailable.');
  } else {
    check('Chrome availability preflight', 'PASS', `Found Chrome candidate(s): ${report.environment.chromeCandidates.join(', ')}`);
  }
  try {
    browser = await playwright.chromium.launch({ channel: 'chrome', headless: cli.headless });
    report.browser.launch = 'PASS';
    report.browser.version = browser.version();
    report.browser.headless = cli.headless;
    check('Chrome launch', 'PASS', `Launched channel chrome (${browser.version()}) in ${cli.headless ? 'headless supplementary' : 'headed'} mode.`);
  } catch (error) {
    report.browser.launch = 'BLOCKED';
    report.browser.error = error.stack ?? error.message;
    report.acceptance.automation = 'BLOCKED — browser could not launch';
    check('Chrome launch', 'BLOCKED', error.message, { action: 'Run this script in an authorized interactive Windows session. Do not bypass browser policy.' });
    throw new Error(`Chrome launch failed: ${error.message}`);
  }

  await runOrdinaryGame(baseUrl);
  await runShowcase(baseUrl, 'ember-drive', 36000);
  await captureShowcaseMatrix(baseUrl, 'ember-drive');
  await runShowcase(baseUrl, 'glass-current', 36000);
  await captureShowcaseMatrix(baseUrl, 'glass-current');
  await runShortTransformationClip(baseUrl);
  await runRigCutoutProof(baseUrl, 1);
  await runRigCutoutProof(baseUrl, .75);
  const hasFailures = report.checks.some(item => item.status === 'FAIL');
  const hasTelemetry = report.telemetry.consoleErrors.length || report.telemetry.pageErrors.length || report.telemetry.failedRequests.length || report.telemetry.badResponses.length;
  if (hasFailures || hasTelemetry) {
    report.acceptance.automation = 'COMPLETED WITH FINDINGS';
    if (hasTelemetry) check('browser telemetry', 'FAIL', 'One or more console errors, runtime errors, failed requests or HTTP error responses were recorded. See telemetry arrays.');
    exitCode = 1;
  } else {
    report.acceptance.automation = cli.headless ? 'SUPPLEMENTARY AUTOMATED RUN PASS — owner headed run pending' : 'AUTOMATED CHECKS PASS — human review pending';
    check('browser telemetry', 'PASS', 'No browser console errors, page exceptions, failed requests or >=400 responses were observed.');
  }
  report.acceptance.humanVisual = 'PENDING — owner must watch the normal-speed Vite recordings/screenshots at 100%/75% scale and judge animation/VFX quality.';
  report.acceptance.humanAudio = 'PENDING — Playwright video has no audio; owner must record system sound and listen.';
  report.reportStatus = report.acceptance.automation;
}

try {
  await run();
} catch (error) {
  report.failure = error.stack ?? error.message;
  if (report.acceptance.automation === 'PENDING') report.acceptance.automation = 'BLOCKED';
  if (!report.checks.some(item => item.status === 'BLOCKED' || item.status === 'FAIL')) check('run failure', 'BLOCKED', error.message);
  exitCode = 1;
} finally {
  if (browser) {
    try { await browser.close(); } catch { /* preserve the primary test report */ }
  }
  if (viteChild && viteChild.exitCode === null) {
    try { viteChild.kill(); } catch { /* only the child started by this tool is targeted */ }
  }
  if (!cli.help) await saveReport();
}

process.exitCode = exitCode;
