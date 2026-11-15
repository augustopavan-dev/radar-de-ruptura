import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
// Empacotamento reproduzível, sem dependências. Os módulos continuam sendo a fonte.
const modules=['src/engine.mjs','src/model.mjs','src/storage.mjs','src/automation.mjs','src/app.mjs'];
const normalize=value=>value.replace(/\r\n?/g,'\n');
const scripts=await Promise.all(modules.map(async path=>normalize(await readFile(new URL(path,import.meta.url),'utf8')).replace(/^import .*;\n/gm,'').replace(/^export /gm,'')));
const css=normalize(await readFile(new URL('style.css',import.meta.url),'utf8'));
const bundledScript=scripts.join('\n');
const hash=value=>createHash('sha256').update(value).digest('base64');
const csp=`default-src 'none'; script-src 'sha256-${hash(bundledScript)}'; style-src 'sha256-${hash(css)}'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`;
const html=(await readFile(new URL('index.html',import.meta.url),'utf8')).replace('<head>','<head><meta http-equiv="Content-Security-Policy" content="'+csp+'">').replace('<link rel="stylesheet" href="/style.css">',()=>`<style>${css}</style>`).replace('<script type="module" src="/src/app.mjs"></script>',()=>`<script type="module">${bundledScript}</script>`);
await writeFile(new URL('Radar_de_Ruptura.html',import.meta.url),html);
await mkdir(new URL('docs/',import.meta.url),{recursive:true});
await writeFile(new URL('docs/index.html',import.meta.url),html);
await writeFile(new URL('docs/.nojekyll',import.meta.url),'');
console.log('Arquivo independente e entrada do GitHub Pages gerados.');
