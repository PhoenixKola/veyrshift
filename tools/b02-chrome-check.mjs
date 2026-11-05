import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const out = 'tests/evidence/b02/chrome';
await fs.mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: false });
const context = await browser.newContext({
  viewport: { width: 1480, height: 980 },
  deviceScaleFactor: 1,
  recordVideo: { dir: out, size: { width: 1480, height: 980 } },
});
const page = await context.newPage();
const errors = [];
const failed = [];
page.on('pageerror', error => errors.push(String(error)));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });

await page.goto('http://127.0.0.1:5174/?dev=1', { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(450);
const title = await page.locator('.title-copy h1').innerText();
await page.screenshot({ path: `${out}/title-menu.png` });
await page.getByRole('button', { name: /New Run/ }).click();
await page.getByRole('button', { name: /START RUN/ }).click();
const canvas = page.locator('canvas');
await canvas.waitFor({ state: 'visible' });
await page.waitForTimeout(450);
const box = await canvas.boundingBox();
if (!box) throw new Error('Combat canvas has no visible bounds');
await page.screenshot({ path: `${out}/idle-live.png` });

await page.keyboard.down('d');
await page.waitForTimeout(520);
await page.keyboard.up('d');
await page.waitForTimeout(100);
await page.screenshot({ path: `${out}/locomotion-live.png` });

await page.getByRole('button', { name: 'DEV TEST TARGET' }).click();
const attackX = box.x + box.width * (578 / 1180);
const attackY = box.y + box.height * (340 / 680);
await page.mouse.move(attackX, attackY);
for (let hit = 1; hit <= 3; hit++) {
  await page.keyboard.press('Space');
  await page.waitForTimeout(hit === 1 ? 300 : 300);
  await page.screenshot({ path: `${out}/combo-hit-${hit}.png` });
}
await page.waitForTimeout(120);
await page.screenshot({ path: `${out}/combo-live.png` });

await page.keyboard.press('Shift');
await page.waitForTimeout(55);
await page.screenshot({ path: `${out}/dodge-live.png` });
await page.keyboard.down('e');
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}/guard-live.png` });
await page.keyboard.up('e');

await page.getByRole('button', { name: /SEED FORM PREVIEW/ }).click();
await page.keyboard.press('r');
await page.waitForTimeout(100);
await page.screenshot({ path: `${out}/ember-activation-live.png` });
await page.waitForTimeout(250);
await page.screenshot({ path: `${out}/ember-active-live.png` });

await page.keyboard.press('Escape');
await page.getByText('TAKE A BREATH.').waitFor({ timeout: 3000 });
await page.screenshot({ path: `${out}/pause-live.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(180);
const pauseResumed = await page.getByText('TAKE A BREATH.').count() === 0;

const animationFrames = await page.evaluate(() => new Promise(resolve => {
  const samples = [];
  let start = 0;
  let previous = 0;
  const sample = now => {
    if (!start) { start = now; previous = now; }
    else { samples.push(now - previous); previous = now; }
    if (now - start >= 1800) {
      const sorted = samples.slice().sort((a, b) => a - b);
      resolve({
        samples: sorted.length,
        medianFrameMs: Number(sorted[Math.floor(sorted.length * .5)].toFixed(2)),
        p95FrameMs: Number(sorted[Math.floor(sorted.length * .95)].toFixed(2)),
      });
    } else requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
}));

await page.getByRole('button', { name: /FORCE ROOM CLEAR/ }).click();
await page.getByRole('heading', { name: 'CHOOSE YOUR THREAD' }).waitFor({ timeout: 3000 });
await page.screenshot({ path: `${out}/reward-live.png` });
await page.locator('.reward-options button').first().click();
await page.waitForTimeout(180);
const rewardResumed = await page.locator('.game-modal').count() === 0;

const viewportMatrix = [];
for (const [name, width, height] of [['16-9', 1280, 720], ['reduced', 960, 540]]) {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(160);
  const metrics = await page.evaluate(() => ({
    viewport: [innerWidth, innerHeight],
    document: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
    canvas: document.querySelector('canvas')?.getBoundingClientRect().toJSON(),
  }));
  viewportMatrix.push({ name, ...metrics });
  await page.screenshot({ path: `${out}/gameplay-${name}.png` });
}

const result = {
  browser: 'Google Chrome',
  browserVersion: browser.version(),
  title,
  actions: ['title to hub to gameplay', 'locomotion', 'training-target three-hit combo', 'dodge', 'guard', 'Ember Drive activation and active state', 'pause and resume', 'reward selection and resume', '16:9 and reduced viewport fit'],
  pauseResumed,
  rewardResumed,
  animationFrames,
  viewportMatrix,
  errors,
  failedRequests: failed,
  note: 'Combat dummy, form resource seed, and room-clear reward use the dev-only harness. Human owner art/game-feel signoff remains pending.',
};
if (errors.length || failed.length) throw new Error(JSON.stringify({ errors, failed }));
await fs.writeFile(`${out}/result.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
const video = page.video();
await context.close();
if (video) await fs.rename(await video.path(), `${out}/b02-gameplay-evidence.webm`);
await browser.close();
