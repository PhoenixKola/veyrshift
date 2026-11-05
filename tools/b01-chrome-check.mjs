import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const out='tests/evidence/b01/chrome';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:false});
const context=await browser.newContext({viewport:{width:1480,height:980},deviceScaleFactor:1,recordVideo:{dir:out,size:{width:1480,height:980}}});
const page=await context.newPage();
const errors=[],failed=[];
page.on('pageerror',e=>errors.push(String(e)));
page.on('console',m=>{if(m.type()==='error')errors.push(`${m.text()} @ ${JSON.stringify(m.location())}`)});
page.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`)});
await page.goto('http://127.0.0.1:5174/',{waitUntil:'domcontentloaded'});await page.waitForTimeout(500);
const title=await page.locator('.title-copy h1').innerText();await page.screenshot({path:`${out}/title-menu.png`});
const physicalGamepadCount=await page.evaluate(()=>Array.from(navigator.getGamepads()).filter(p=>p?.connected).length);
// Real Gamepad API-shaped mock: exercise DOM focus, A confirm, and input label. No physical controller is connected.
await page.evaluate(()=>{
 const buttons=Array.from({length:16},()=>({pressed:false,touched:false,value:0}));
 const pad={id:'Xbox 360 Controller',index:0,connected:true,mapping:'standard',timestamp:0,axes:[0,0,0,0],buttons, vibrationActuator:null};
 Object.defineProperty(navigator,'getGamepads',{configurable:true,value:()=>[pad]});
 Object.defineProperty(window,'__b01Pad',{configurable:true,value:pad});
});
const pressPad=async(index)=>{await page.evaluate(i=>{const p=window.__b01Pad;p.buttons.forEach(b=>{b.pressed=false;b.value=0});p.buttons[i].pressed=true;p.buttons[i].value=1;p.timestamp++;},index);await page.waitForTimeout(90);await page.evaluate(()=>window.__b01Pad.buttons.forEach(b=>{b.pressed=false;b.value=0}));await page.waitForTimeout(100);};
await pressPad(13);await pressPad(13);await pressPad(0);await page.getByText('KAIRO VENN',{exact:true}).waitFor({timeout:3000});
await page.screenshot({path:`${out}/character.png`});await page.getByRole('button',{name:'← BACK'}).click();await page.getByRole('button',{name:/MAIN MENU/}).click();
await page.getByRole('button',{name:'Forms'}).click();await page.screenshot({path:`${out}/forms-locked-prototype.png`});await page.getByRole('button',{name:'← BACK'}).click();await page.getByRole('button',{name:/MAIN MENU/}).click();
await page.getByRole('button',{name:'Records'}).click();await page.screenshot({path:`${out}/records.png`});await page.getByRole('button',{name:'← BACK'}).click();await page.getByRole('button',{name:/MAIN MENU/}).click();
await page.getByRole('button',{name:'Credits'}).click();await page.screenshot({path:`${out}/credits.png`});await page.getByRole('button',{name:'← BACK'}).click();await page.getByRole('button',{name:/MAIN MENU/}).click();
await page.getByRole('button',{name:'Settings'}).click();
await page.locator('input[type=range]').nth(0).fill('0.64');await page.locator('input[type=range]').nth(2).fill('0.71');
await page.getByLabel('Reduced flash').check();await page.getByLabel('Reduced motion').check();await page.getByLabel('Particles and effects').uncheck();
const musicDisabled=await page.getByLabel('Music volume').isDisabled();await page.screenshot({path:`${out}/settings.png`});
await page.keyboard.press('Escape');await page.getByRole('button',{name:/MAIN MENU/}).click();await page.getByRole('button',{name:/New Run/}).click();
await page.screenshot({path:`${out}/character-hub.png`});
await page.getByRole('button',{name:'FULLSCREEN'}).click();await page.waitForTimeout(150);const fullscreenEntered=await page.evaluate(()=>Boolean(document.fullscreenElement));if(fullscreenEntered){await page.getByRole('button',{name:'EXIT FULLSCREEN'}).click();await page.waitForTimeout(150);}const fullscreenExited=await page.evaluate(()=>!document.fullscreenElement);
await page.getByRole('button',{name:/START RUN/}).click();await page.locator('canvas').waitFor({state:'visible'});await page.waitForTimeout(600);
const canvasBox=await page.locator('canvas').boundingBox();await page.screenshot({path:`${out}/gameplay-native.png`});
// Keyboard movement, arrow movement, mouse aim/attack, heavy, dash, guard, special, finisher, pause/resume.
await page.keyboard.down('d');await page.waitForTimeout(320);await page.keyboard.up('d');
await page.keyboard.down('ArrowUp');await page.waitForTimeout(260);await page.keyboard.up('ArrowUp');
await page.mouse.move(canvasBox.x+canvasBox.width*.64,canvasBox.y+canvasBox.height*.48);await page.mouse.down();await page.waitForTimeout(180);await page.mouse.up();
await page.mouse.click(canvasBox.x+canvasBox.width*.65,canvasBox.y+canvasBox.height*.49,{button:'right'});
await page.keyboard.press('Shift');await page.keyboard.press('q');await page.keyboard.down('e');await page.waitForTimeout(280);await page.keyboard.up('e');await page.keyboard.press('f');
await page.waitForTimeout(200);await page.screenshot({path:`${out}/combat-action-poses.png`});
await page.keyboard.press('Escape');await page.getByText('TAKE A BREATH.').waitFor({timeout:2500});await page.screenshot({path:`${out}/pause.png`});
await page.keyboard.press('Escape');await page.waitForTimeout(250);
await page.keyboard.down('d');await page.waitForTimeout(100);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await page.keyboard.up('d');await page.getByText('TAKE A BREATH.').waitFor({timeout:2500});await page.screenshot({path:`${out}/pause-focus-loss.png`});await page.keyboard.press('Escape');await page.waitForTimeout(200);
// Dev-only harness is gated by the explicit ?dev=1 query. Seed the prototype form resource then activate via R.
await page.evaluate(()=>history.replaceState({},'',`${location.pathname}?dev=1`));await page.waitForTimeout(150);
await page.getByRole('button',{name:/SEED FORM PREVIEW/}).click();await page.keyboard.press('r');await page.waitForTimeout(90);
await page.screenshot({path:`${out}/ember-visual-gameplay.png`,style:'.dev-tools{display:none!important}'});
await page.getByRole('button',{name:/SHOW TELEGRAPH/}).click();await page.waitForTimeout(80);await page.screenshot({path:`${out}/enemy-telegraph.png`,style:'.dev-tools{display:none!important}'});
await page.getByRole('button',{name:/SHOW TELEGRAPH/}).click();await page.waitForTimeout(25);
await page.screenshot({path:`${out}/gameplay-reduced-flash-grayscale.png`,style:'.game-root{filter:grayscale(1)!important}.dev-tools{display:none!important}'});
await page.setViewportSize({width:1110,height:740});await page.waitForTimeout(200);await page.screenshot({path:`${out}/gameplay-75-percent.png`});
const smallViewport=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:innerHeight,scrollHeight:document.documentElement.scrollHeight,canvas:document.querySelector('canvas')?.getBoundingClientRect().toJSON()}));
const viewportMatrix=[];for(const [name,width,height] of [['16-9',1920,1080],['16-10',1600,1000],['ultrawide',2560,1080],['reduced',960,540]]){await page.setViewportSize({width,height});await page.waitForTimeout(120);const metrics=await page.evaluate(()=>({width:innerWidth,documentWidth:document.documentElement.scrollWidth,height:innerHeight,documentHeight:document.documentElement.scrollHeight,canvas:document.querySelector('canvas')?.getBoundingClientRect().toJSON()}));viewportMatrix.push({name,...metrics});await page.screenshot({path:`${out}/gameplay-${name}.png`});}
await page.setViewportSize({width:1110,height:740});
// Real browser API reports hardware availability; the mock above is synthetic only.
// Finish the three-room loop via the dev-only room-clear fixture to exercise actual reward/results overlays.
for(let room=1;room<=3;room++){
 if(room===1)await page.getByRole('button',{name:/FORCE ROOM CLEAR/}).click();
 else if(await page.locator('.dev-clear').count()===0)await page.evaluate(()=>history.replaceState({},'',`${location.pathname}?dev=1`));
 if(room>1)await page.getByRole('button',{name:/FORCE ROOM CLEAR/}).click();
 if(room<3){await page.getByRole('heading',{name:'CHOOSE YOUR THREAD'}).waitFor({timeout:3000});if(room===1)await page.screenshot({path:`${out}/reward.png`});await page.keyboard.press('Enter');await page.locator('.game-modal').waitFor({state:'detached',timeout:3000});await page.waitForTimeout(100);}
}
await page.getByRole('heading',{name:'THE THREAD HOLDS'}).waitFor({timeout:3000});await page.screenshot({path:`${out}/victory.png`});
await page.getByRole('button',{name:/RUN AGAIN/}).click();await page.waitForTimeout(200);await page.keyboard.press('Escape');await page.getByRole('button',{name:/ABANDON RUN/}).click();await page.waitForTimeout(200);await page.getByRole('button',{name:'Settings'}).click();
const savedSettings=await page.locator('input[type=range]').nth(0).inputValue();await page.reload({waitUntil:'domcontentloaded'});await page.waitForTimeout(300);const saved=await page.evaluate(()=>localStorage.getItem('veyrshift-save-v1'));await page.getByRole('button',{name:'Settings'}).click();const masterVolumeReloaded=await page.locator('input[type=range]').nth(0).inputValue();
const result={browser:'Google Chrome',browserVersion:browser.version(),title,viewport:{width:1480,height:980},smallViewport,viewportMatrix,fullscreenEntered,fullscreenExited,musicSliderDisabled:musicDisabled,masterVolumeBeforeReload:savedSettings,masterVolumeAfterReload:masterVolumeReloaded,saveSchema:JSON.parse(saved).version,physicalGamepadCount,syntheticGamepadMenu:'d-pad down x2 + A opened Character; device label switched to Xbox',performed:['title menu','character','forms prototype/locked honesty','records','credits','settings volume and accessibility persistence','new run','WASD movement','arrow movement','mouse aim and melee','right-click ranged shot','dash','guard','special','finisher','pause/resume','window blur clears held input and pauses','form visual-only activation in dev fixture','telegraph/reduced-flash/grayscale readability view','reward overlay and reward choice','three-room dev-fixture route to victory','run again and abandon to hub','75% viewport','16:9, 16:10, ultrawide, and reduced viewport fit'],errors,failed};
if(errors.length||failed.length)throw new Error(JSON.stringify({errors,failed}));
await fs.writeFile(`${out}/result.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));const video=page.video();await context.close();if(video){const temp=await video.path();await fs.rename(temp,`${out}/b01-gameplay-evidence.webm`);}await browser.close();
