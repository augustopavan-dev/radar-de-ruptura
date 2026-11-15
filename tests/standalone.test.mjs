import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {Script} from 'node:vm';
test('Arquivo independente contém fontes atuais, CSS incorporado e JavaScript compilável',async()=>{
  const base=new URL('../',import.meta.url),html=await readFile(new URL('Radar_de_Ruptura.html',base),'utf8');
  const css=await readFile(new URL('style.css',base),'utf8');
  const script=html.match(/<script type="module">([\s\S]*)<\/script>/)?.[1];
  assert.ok(script);assert.ok(html.includes(`<style>${css}</style>`));
  assert.equal(await readFile(new URL('docs/index.html',base),'utf8'),html);
  assert.doesNotThrow(()=>new Script(script));
  assert.equal(/^import /m.test(script),false);
  for(const path of ['src/engine.mjs','src/model.mjs','src/storage.mjs','src/app.mjs']) {
    const source=(await readFile(new URL(path,base),'utf8')).replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
    assert.ok(script.includes(source),`Fontes desatualizadas: ${path}`);
  }
});
