import { cpSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { platform } from 'node:os';
mkdirSync('dist-preview',{recursive:true});
cpSync('src/preview/index.html','dist-preview/index.html');
cpSync('src/app/styles.css','dist-preview/styles.css');
cpSync('public/assets','dist-preview/assets',{recursive:true});
console.log('Offline preview built → dist-preview/');

const python = process.env.PYTHON || (platform()==='win32' ? 'python' : 'python3');
const result=spawnSync(python,['tools/bundle-standalone.py'],{stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
