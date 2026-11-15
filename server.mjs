import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const allowed = new Set(['index.html','style.css','src/app.mjs','src/engine.mjs','src/model.mjs','src/storage.mjs','src/integrations.mjs']);
const types = {html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',mjs:'text/javascript; charset=utf-8'};
const server = createServer(async (req,res) => {
  const headers = {'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",'X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-store'};
  const path = new URL(req.url,'http://127.0.0.1').pathname;
  const file = path === '/' ? 'index.html' : path.slice(1);
  if (!['GET','HEAD'].includes(req.method) || !allowed.has(file)) {res.writeHead(404,headers);res.end('Não encontrado.');return;}
  try { const data = await readFile(new URL(file,import.meta.url));res.writeHead(200,{...headers,'Content-Type':types[file.split('.').pop()]});res.end(req.method === 'HEAD' ? undefined : data); }
  catch {res.writeHead(500,headers);res.end('Não foi possível abrir o arquivo.');}
});
server.listen(4173,'127.0.0.1',() => console.log('Radar de Ruptura: http://127.0.0.1:4173'));
server.on('error',e => {console.error(e.code === 'EADDRINUSE' ? 'A porta 4173 já está em uso. Feche a outra execução.' : 'Não foi possível iniciar o servidor.');process.exitCode=1;});
