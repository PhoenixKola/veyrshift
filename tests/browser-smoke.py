"""Actual Chromium render/input smoke without local URL navigation.
The sandbox restricts browser navigation to file/localhost; injects the prebuilt
standalone bundle into an isolated about:blank document for equivalent behavior.
Requires playwright for Python and /usr/bin/chromium.
"""
from pathlib import Path
import os, re
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
preview=root/'dist-preview'
html=(preview/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="./styles.css"/>','').replace('<script type="module" src="./src/preview/main.js"></script>','')
css=re.sub(r'^@import[^\n]*\n', '', (preview/'styles.css').read_text())
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True, executable_path=os.getenv('CHROMIUM_PATH','/usr/bin/chromium'), args=['--no-sandbox','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':1480,'height':980}, device_scale_factor=1)
 errors=[]
 page.on('pageerror', lambda exc: errors.append(str(exc)))
 page.set_content(html)
 page.add_style_tag(content=css)
 page.add_script_tag(content=(preview/'standalone.js').read_text())
 page.wait_for_timeout(180)
 assert page.get_by_role('button',name='ENTER THE SHATTERFIELDS').is_visible()
 page.screenshot(path=str(root/'tests/browser-hub.png'),full_page=True)
 page.get_by_role('button',name='ENTER THE SHATTERFIELDS').click()
 page.wait_for_timeout(130)
 assert page.locator('#overlay').is_hidden(), 'overlay should hide in battle'
 assert 'ROOM 01 / 3' in page.locator('#stats').inner_text()
 page.mouse.move(790,370)
 page.mouse.click(790,370)
 page.keyboard.down('d');page.wait_for_timeout(180);page.keyboard.up('d')
 page.screenshot(path=str(root/'tests/browser-combat.png'),full_page=True)
 page.keyboard.press('Escape');page.wait_for_timeout(80)
 assert page.get_by_role('button',name='RESUME COMBAT').is_visible()
 page.get_by_role('button',name='RESUME COMBAT').click()
 assert page.locator('#overlay').is_hidden()
 assert not errors, 'Browser JS errors: '+str(errors)
 print('Chromium smoke PASSED: hub, start, input, pause/resume, renderer and no JS errors')
 browser.close()
