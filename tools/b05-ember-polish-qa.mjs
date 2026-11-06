import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const url = process.argv[2] ?? 'http://127.0.0.1:5175/';
const baseline = process.argv.includes('--baseline');
const output = path.resolve('tests/evidence/b05/live-chrome', `ember-polish-${baseline?'before':'after'}-${new Date().toISOString().replaceAll(':','-').replaceAll('.','-')}`);
await mkdir(output,{recursive:true});
const browser = await chromium.launch({channel:'chrome',headless:true});
const results=[];
async function scene(name,play){
 const context=await browser.newContext({viewport:{width:1280,height:720},recordVideo:{dir:output,size:{width:1280,height:720}}});
 const page=await context.newPage();const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('requestfailed',request=>errors.push(`${request.url()}: ${request.failure()?.errorText}`));
 await page.addInitScript(()=>localStorage.setItem('veyrshift-save-v1',JSON.stringify({version:3,shards:0,bestRoom:0,runs:0,totalDefeats:0,unlockedHeroes:['kairo'],unlockedForms:['ember-drive','glass-current'],equippedForm:'ember-drive',precisionTrials:5,settings:{masterVolume:.75,musicVolume:.35,effectsVolume:.8,screenshake:true,particles:true,reducedFlash:false,reducedMotion:false}})));
 await page.goto(`${url.replace(/\/$/,'')}/?dev=1`,{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'New Run'}).click();
 await page.getByRole('button',{name:'Character'}).click();
 await page.getByRole('button',{name:/PLAY KAIRO/}).click();
 await page.locator('canvas[aria-label="Combat arena"]').waitFor();
 await page.waitForTimeout(450);
 try {await play(page);} finally {
  const video=page.video();await page.close();
  await video.saveAs(path.join(output,`${name}.webm`));
  await context.close();results.push({scene:name,errors});
 }
}
const state=page=>page.evaluate(()=>{const h=window.__VEYRSHIFT_DEBUG__.session.hero;return{x:h.x,y:h.y,facing:h.moveFacing,combo:h.combo,form:h.formId,transformed:h.transformed,enemies:window.__VEYRSHIFT_DEBUG__.session.enemies.map(e=>e.hp)}});
await scene('diagonal-four-directions',async page=>{
 const samples=[];
 for(const [keys,expected] of [[['w','d'],'right'],[['w','a'],'left'],[['s','d'],'right'],[['s','a'],'left']]){
  for(const key of keys)await page.keyboard.down(key);
  await page.waitForTimeout(330);samples.push({keys:keys.join('+'),...await state(page)});
  for(const key of keys)await page.keyboard.up(key);
  await page.waitForTimeout(140);
  const vertical=keys[0];await page.keyboard.down(vertical);await page.waitForTimeout(180);await page.keyboard.up(vertical);
  await page.waitForTimeout(100);
  const required=baseline?(keys[0]==='w'?'back':'front'):expected;
  if(samples.at(-1).facing!==required)throw new Error(`${keys} presented as ${samples.at(-1).facing}; expected ${required}`);
 }
 await page.screenshot({path:path.join(output,'diagonal-final.png')});results.push({scene:'diagonal samples',samples});
});
await scene('base-three-hit-combo',async page=>{
 await page.getByRole('button',{name:/DEV.*TEST TARGET/i}).click();
 const before=await state(page);
 const canvas=page.locator('canvas[aria-label="Combat arena"]');const box=await canvas.boundingBox();
 await page.mouse.move(box.x+(555/1180)*box.width,box.y+(340/680)*box.height);
 for(const delay of [335,370,650]){await page.mouse.click(box.x+(555/1180)*box.width,box.y+(340/680)*box.height);await page.waitForTimeout(delay);}
 const after=await state(page);await page.screenshot({path:path.join(output,'base-combo-final.png')});
 if(after.enemies[0]>=before.enemies[0])throw new Error('Base combo did not damage the target');
 results.push({scene:'base damage',before:before.enemies[0],after:after.enemies[0]});
});
await scene('ember-activation-combo-special-finisher-reversion',async page=>{
 await page.getByRole('button',{name:/DEV.*TEST TARGET/i}).click();
 await page.getByRole('button',{name:/DEV.*SET PULSE/i}).click();
 const canvas=page.locator('canvas[aria-label="Combat arena"]');const box=await canvas.boundingBox();
 const x=box.x+(555/1180)*box.width,y=box.y+(340/680)*box.height;await page.mouse.move(x,y);
 await page.keyboard.press('r');await page.waitForTimeout(690);const active=await state(page);
 for(const delay of [335,370,650]){await page.mouse.click(x,y);await page.waitForTimeout(delay);}
 await page.keyboard.press('q');await page.waitForTimeout(760);
 await page.getByRole('button',{name:/DEV.*SET PULSE/i}).click();
 await page.keyboard.press('f');await page.waitForTimeout(1030);
 await page.keyboard.press('r');await page.waitForTimeout(600);
 const final=await state(page);await page.screenshot({path:path.join(output,'ember-reversion-final.png')});
 if(!active.transformed||final.transformed||final.enemies[0]>=active.enemies[0])throw new Error('Ember activation, damage or reversion failed');
 results.push({scene:'ember states',active,final});
});
await browser.close();await writeFile(path.join(output,'report.json'),JSON.stringify({url,baselineCommit:baseline?'ed04098':null,mode:'headless Chrome, normal-speed video, no audio',results},null,2));
if(results.some(result=>result.errors?.length))process.exitCode=1;
console.log(output);console.log(JSON.stringify(results.map(result=>({scene:result.scene,errors:result.errors})),null,2));
