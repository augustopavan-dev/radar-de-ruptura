import {readFile,writeFile,mkdir} from 'node:fs/promises';
// Empacotamento reproduzível, sem dependências. Os módulos continuam sendo a fonte.
const modules=['src/engine.mjs','src/model.mjs','src/storage.mjs','src/app.mjs'];
const scripts=await Promise.all(modules.map(async path=>(await readFile(new URL(path,import.meta.url),'utf8')).replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'')));
const css=await readFile(new URL('style.css',import.meta.url),'utf8');
const html=(await readFile(new URL('index.html',import.meta.url),'utf8')).replace('<link rel="stylesheet" href="/style.css">',()=>`<style>${css}</style>`).replace('<script type="module" src="/src/app.mjs"></script>',()=>`<script type="module">${scripts.join('\n')}</script>`);
await writeFile(new URL('Radar_de_Ruptura.html',import.meta.url),html);
await mkdir(new URL('docs/',import.meta.url),{recursive:true});
await writeFile(new URL('docs/index.html',import.meta.url),html);
await writeFile(new URL('docs/.nojekyll',import.meta.url),'');
console.log('Arquivo independente e entrada do GitHub Pages gerados.');
