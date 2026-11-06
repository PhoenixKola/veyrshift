import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { chromium } from 'playwright';

const baseUrl = process.env.B03_URL ?? 'http://127.0.0.1:5175/?dev=1';
const evidenceDir = path.resolve('tests/evidence/b03');
const videoDir = path.join(evidenceDir, 'video');
const tempVideoDir = path.resolve('node_modules/.cache/b03-video');
await mkdir(tempVideoDir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const context = await browser.newContext({ viewport: { width: 1480, height: 920 }, recordVideo: { dir: tempVideoDir, size: { width: 1480, height: 920 } } });
const page = await context.newPage();
const mainVideo = page.video();
let b02Video = null;
page.setDefaultTimeout(7000);
const errors = [];
const failedRequests = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('requestfailed', request => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
const screenshots = [];
async function capture(name) {
  const file = path.join(evidenceDir, name);
  await page.screenshot({ path: file, fullPage: true });
  screenshots.push(path.basename(file));
}
async function measureFrames(targetPage, durationMs) {
  return targetPage.evaluate(ms => new Promise(resolve => {
    const deltas = []; let first = 0; let previous = 0;
    const tick = now => {
      if (!first) first = now;
      if (previous) deltas.push(now - previous);
      previous = now;
      if (now - first >= ms) {
        const sorted = deltas.slice().sort((a, b) => a - b);
        const percentile = p => sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))];
        resolve({ frames: deltas.length, observedFps: deltas.length / (sorted.reduce((sum, value) => sum + value, 0) / 1000), frameTimeMs: { median: percentile(.5), p95: percentile(.95), max: sorted.at(-1) } });
      } else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), durationMs);
}

try {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /New Run/ }).click();
  await page.getByRole('button', { name: /START RUN/ }).click({ force: true });
  const canvas = page.locator('canvas');
  await canvas.waitFor({ state: 'visible' });
  await page.getByRole('button', { name: /DEV TEST TARGET/i }).click();
  await page.waitForTimeout(700);
  await capture('chrome-game-start.png');
  const directions = [
    ['front', 'ArrowDown'], ['back', 'ArrowUp'], ['left', 'ArrowLeft'], ['right', 'ArrowRight'],
  ];
  for (const [name, key] of directions) {
    await page.keyboard.down(key);
    await page.waitForTimeout(200);
    await capture(`chrome-${name}-run.png`);
    await page.waitForTimeout(120);
    await page.keyboard.up(key);
    await page.waitForTimeout(260);
    await capture(`chrome-${name}-move-idle.png`);
  }
  await page.keyboard.down('KeyW');
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(220);
  await capture('chrome-wasd-diagonal-turn.png');
  await page.keyboard.up('KeyW');
  await page.keyboard.up('KeyD');
  await page.waitForTimeout(220);
  const rect = await canvas.boundingBox();
  if (!rect) throw new Error('Combat canvas has no visible bounds');
  const aimAt = async (x, y) => page.mouse.move(rect.x + rect.width * x, rect.y + rect.height * y);
  for (const [name, x, y] of [['right', .77, .5], ['front', .5, .78], ['left', .23, .5], ['back', .5, .22]]) {
    await aimAt(x, y);
    await page.keyboard.press('Space');
    await page.waitForTimeout(120);
    await capture(`chrome-attack-${name}.png`);
    await page.waitForTimeout(260);
  }
  await aimAt(.77, .53);
  await page.keyboard.press('Space');
  await page.waitForTimeout(180);
  await page.keyboard.press('Space');
  await page.waitForTimeout(180);
  await page.keyboard.press('Space');
  await page.waitForTimeout(160);
  await capture('chrome-combo-playback.png');
  for (const [name, key] of [['front', 'ArrowDown'], ['back', 'ArrowUp'], ['left', 'ArrowLeft'], ['right', 'ArrowRight']]) {
    await page.keyboard.down(key);
    await page.keyboard.down('Shift');
    await page.waitForTimeout(75);
    await capture(`chrome-dodge-${name}.png`);
    await page.keyboard.up('Shift');
    await page.keyboard.up(key);
    await page.waitForTimeout(220);
  }
  await capture('chrome-dodge-up-recovery.png');
  await page.keyboard.down('KeyE');
  await page.waitForTimeout(100);
  await capture('chrome-parry-contact.png');
  await page.waitForTimeout(240);
  await capture('chrome-guard-held.png');
  await page.keyboard.up('KeyE');
  await page.getByRole('button', { name: /DEV · SEED FORM PREVIEW/i }).click();
  await page.keyboard.press('KeyR');
  await page.waitForTimeout(260);
  await capture('chrome-ember-compatibility.png');
  await page.keyboard.down('ArrowRight');
  await page.keyboard.down('Space');
  const frameSamples = [];
  frameSamples.push(await measureFrames(page, 2200));
  await page.keyboard.up('Space'); await page.keyboard.up('ArrowRight');
  for (let sample = 1; sample < 3; sample += 1) {
    await page.keyboard.down('ArrowRight'); await page.keyboard.down('Space');
    frameSamples.push(await measureFrames(page, 2200));
    await page.keyboard.up('Space'); await page.keyboard.up('ArrowRight');
  }
  const atlasMemory = await page.evaluate(async () => {
    const paths = ['idle', 'run', 'dodge', 'combo', 'states'].map(name => `/assets/characters/kairo/b03/${name}.png`);
    const images = await Promise.all(paths.map(async src => { const image = new Image(); image.src = src; await image.decode(); return { src, width: image.naturalWidth, height: image.naturalHeight, bytesDecoded: image.naturalWidth * image.naturalHeight * 4 }; }));
    return { images, approximateDecodedBytes: images.reduce((total, image) => total + image.bytesDecoded, 0) };
  });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await capture('chrome-pause.png');
  await page.getByRole('button', { name: /RESUME/ }).click({ force: true });
  await page.getByRole('button', { name: /DEV · SHOW TELEGRAPH/i }).click();
  await page.waitForTimeout(440);
  await capture('chrome-real-hit-hurt.png');
  await page.getByRole('button', { name: /DEV · FORCE ROOM CLEAR/i }).click();
  await page.waitForTimeout(180);
  await capture('chrome-reward.png');
  await page.locator('.reward-options button').first().click({ force: true });
  await page.waitForTimeout(200);
  await page.getByRole('button', { name: /DEV TEST TARGET/i }).click();
  await capture('chrome-reward-selected-next-room.png');
  for (let hit = 1; hit < 9; hit += 1) {
    await page.waitForTimeout(500);
    const telegraph = page.getByRole('button', { name: /DEV · SHOW TELEGRAPH/i });
    if (await telegraph.count()) await telegraph.click();
    await page.waitForTimeout(440);
  }
  await capture('chrome-real-hit-ko.png');
  await page.getByRole('button', { name: /RETURN TO HUB/ }).click({ force: true });
  await page.getByRole('button', { name: /Settings/ }).click();
  const reducedMotion = page.getByLabel('Reduced motion');
  await reducedMotion.check();
  await capture('chrome-settings-reduced-motion.png');
  await page.setViewportSize({ width: 1280, height: 800 });
  await capture('chrome-layout-1280x800.png');
  await page.setViewportSize({ width: 1920, height: 800 });
  await capture('chrome-layout-1920x800.png');
  await page.setViewportSize({ width: 960, height: 540 });
  await capture('chrome-layout-960x540.png');

  const comparison = await context.newPage();
  await comparison.goto(baseUrl, { waitUntil: 'load' });
  await comparison.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 520;
    const c = canvas.getContext('2d');
    if (!c) throw new Error('Comparison canvas context unavailable');
    c.fillStyle = '#101a2a'; c.fillRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = '#e8eef5'; c.font = '600 26px sans-serif';
    c.fillText('B02 · current three-quarter idle', 155, 86);
    c.fillText('B03 · authored right profile idle', 715, 86);
    c.fillStyle = '#8da2b7'; c.font = '16px sans-serif';
    c.fillText('Same display bounds: 100 × 140 px · rightward-facing comparison', 316, 470);
    const oldAtlas = new Image(); oldAtlas.src = '/assets/characters/kairo/b02/idle.png';
    const newAtlas = new Image(); newAtlas.src = '/assets/characters/kairo/b03/idle.png';
    await Promise.all([oldAtlas.decode(), newAtlas.decode()]);
    c.drawImage(oldAtlas, 0, 0, 128, 160, 280, 190, 100, 140);
    c.drawImage(newAtlas, 0, 256, 192, 256, 820, 190, 100, 140);
    const frame = document.createElement('div'); frame.style.cssText = 'margin:0;background:#101a2a';
    frame.append(canvas); document.body.replaceChildren(frame);
  });
  await comparison.screenshot({ path: path.join(evidenceDir, 'b02-vs-b03-equal-scale.png') });
  await comparison.evaluate(async () => {
    const c = document.querySelector('canvas')?.getContext('2d');
    if (!c) throw new Error('Scale evidence canvas context unavailable');
    const atlas = new Image(); atlas.src = '/assets/characters/kairo/b03/idle.png'; await atlas.decode();
    c.fillStyle = '#101a2a'; c.fillRect(0, 0, 1200, 520);
    c.fillStyle = '#e8eef5'; c.font = '600 26px sans-serif';
    c.fillText('B03 right-profile idle · runtime scale samples', 340, 86);
    c.fillStyle = '#8da2b7'; c.font = '16px sans-serif';
    c.fillText('100% · 100 × 140 px', 282, 380); c.fillText('75% · 75 × 105 px', 750, 380);
    c.drawImage(atlas, 0, 256, 192, 256, 300, 190, 100, 140);
    c.drawImage(atlas, 0, 256, 192, 256, 770, 208, 75, 105);
  });
  await comparison.screenshot({ path: path.join(evidenceDir, 'runtime-sprite-scales.png') });
  await comparison.close();

  const b02Page = await context.newPage();
  b02Video = b02Page.video();
  b02Page.setDefaultTimeout(7000);
  await b02Page.goto(baseUrl.replace('dev=1', 'dev=1&anim=b02'), { waitUntil: 'domcontentloaded' });
  await b02Page.getByRole('button', { name: /New Run/ }).click();
  await b02Page.getByRole('button', { name: /START RUN/ }).click({ force: true });
  await b02Page.locator('canvas').waitFor({ state: 'visible' });
  await b02Page.getByRole('button', { name: /DEV TEST TARGET/i }).click();
  const b02FrameSamples = [];
  for (let sample = 0; sample < 3; sample += 1) {
    await b02Page.keyboard.down('ArrowRight'); await b02Page.keyboard.down('Space');
    b02FrameSamples.push(await measureFrames(b02Page, 2200));
    await b02Page.keyboard.up('Space'); await b02Page.keyboard.up('ArrowRight');
  }
  await b02Page.screenshot({ path: path.join(evidenceDir, 'chrome-b02-live-reference.png'), fullPage: true });
  await b02Page.close();

  const offlineContext = await browser.newContext({ viewport: { width: 1480, height: 920 } });
  const offlinePage = await offlineContext.newPage();
  const offlineErrors = [];
  offlinePage.on('pageerror', error => offlineErrors.push(error.message));
  offlinePage.on('console', message => { if (message.type() === 'error') offlineErrors.push(message.text()); });
  const standalonePath = path.resolve('dist-preview/standalone.html').replaceAll('\\', '/');
  await offlinePage.goto(`file:///${standalonePath}`, { waitUntil: 'load' });
  await offlinePage.getByRole('button', { name: /ENTER THE SHATTERFIELDS/i }).click({ force: true });
  await offlinePage.waitForFunction(() => window.__VEYRSHIFT_DEBUG__?.renderer?.directional?.idle?.naturalWidth > 0, null, { timeout: 10000 });
  const offlineAtlases = await offlinePage.evaluate(() => Object.fromEntries(Object.entries(window.__VEYRSHIFT_DEBUG__.renderer.directional).map(([name, image]) => [name, { width: image.naturalWidth, height: image.naturalHeight, src: image.src }])));
  await offlinePage.screenshot({ path: path.join(evidenceDir, 'chrome-offline-standalone.png'), fullPage: true });
  await offlineContext.close();
  if (offlineErrors.length || Object.values(offlineAtlases).some(image => image.width === 0)) throw new Error(`Offline standalone preview failed: ${JSON.stringify({ offlineErrors, offlineAtlases })}`);

  const data = {
    date: new Date().toISOString(),
    browser: await page.evaluate(() => navigator.userAgent),
    machine: { cpu: os.cpus()[0]?.model ?? 'not exposed', logicalCores: os.cpus().length, totalMemoryBytes: os.totalmem() },
    url: baseUrl,
    viewportRuns: [
      { width: 1480, height: 920 }, { width: 1280, height: 800 },
      { width: 1920, height: 800 }, { width: 960, height: 540 },
    ],
    directionalInput: directions.map(([direction]) => direction),
    screenshots,
    frameSamplesUnderMovementAndAttack: frameSamples,
    b02FrameSamplesUnderMovementAndAttack: b02FrameSamples,
    decodedAtlasMemoryEstimate: atlasMemory,
    offlineFilePreviewAtlases: offlineAtlases,
    offlineFilePreviewErrors: offlineErrors,
    errors,
    failedRequests,
    videos: ['video/b03-live-gameplay.webm', 'video/b02-live-reference.webm'],
  };
  await writeFile(path.join(evidenceDir, 'chrome-run.json'), `${JSON.stringify(data, null, 2)}\n`);
  if (errors.length || failedRequests.length) process.exitCode = 1;
  console.log(JSON.stringify(data, null, 2));
} finally {
  await context.close();
  await mkdir(videoDir, { recursive: true });
  if (mainVideo) await mainVideo.saveAs(path.join(videoDir, 'b03-live-gameplay.webm'));
  if (b02Video) await b02Video.saveAs(path.join(videoDir, 'b02-live-reference.webm'));
  await browser.close();
}
