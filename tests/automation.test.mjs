import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {demo,newAnalysis} from '../src/model.mjs';
import {quantity} from '../src/engine.mjs';
import {automationPacket,validateAutomationPacket,processAutomationPacket} from '../src/automation.mjs';

const make=()=>automationPacket(newAnalysis(demo(),'2026-11-15T12:00:00.000Z','teste-automacao'));
test('Exportação contém apenas a fotografia de uma análise, sem decisões ou propriedades extras',()=>{
  const a=newAnalysis(demo());a.secret='nao-exportar';a.snapshot.ingredients[0].credential='nao-exportar';
  const p=automationPacket(a);assert.equal(p.schemaVersion,1);assert.equal(p.origin,'radar-de-ruptura');
  assert.equal(p.analysisId,a.id);assert.equal(p.result,undefined);assert.equal(p.proposals,undefined);
  assert.equal(JSON.stringify(p).includes('nao-exportar'),false);assert.equal(a.snapshot.ingredients[0].credential,'nao-exportar');
});
test('Processamento do pacote mantém falta de 4 pães, prioridade crítica e decisão pendente',()=>{
  const p=make(),before=JSON.stringify(p),r=processAutomationPacket(p);
  assert.equal(r.analysisId,p.analysisId);assert.equal(r.proposals.length,1);assert.equal(r.proposals[0].quantity,4);
  assert.equal(r.proposals[0].shortage,4);assert.equal(r.proposals[0].priority,'critical');assert.equal(r.proposals[0].status,'pending');
  assert.equal(r.inventoryChanged,false);assert.equal(r.purchaseCreated,false);assert.equal(r.approvalRequired,true);assert.equal(JSON.stringify(p),before);
});
test('Automação recalcula a partir da fotografia e ignora resultados fornecidos pelo chamador',()=>{
  const p=make();p.result={rows:[{shortage:999}]};assert.equal(processAutomationPacket(p).proposals[0].shortage,4);
});
test('Estoque suficiente não gera propostas; reserva é separada da falta real',()=>{
  const p=make();p.snapshot.ingredients.forEach(i=>{i.stock=100;i.safety=0;});
  assert.equal(processAutomationPacket(p).requiresReview,false);
  p.snapshot.ingredients[0].stock=12;p.snapshot.ingredients[0].safety=2;
  const r=processAutomationPacket(p);assert.equal(r.proposals[0].shortage,0);assert.equal(r.proposals[0].quantity,2);assert.equal(r.proposals[0].priority,'safety');
});
test('Pacotes incompatíveis, referência quebrada, data inválida e quantidade negativa são rejeitados',()=>{
  for(const change of [p=>p.schemaVersion=2,p=>p.origin='outro',p=>p.createdAt='invalida',p=>p.snapshot.ingredients[0].stock=-1,p=>p.snapshot.recipes[0].items[0].ingredientId='ausente']){
    const p=make();change(p);assert.throws(()=>processAutomationPacket(p));
  }
});
test('Limites de tamanho e quantidade de cadastros impedem processamento descontrolado',()=>{
  const p=make();p.padding='x'.repeat(262144);assert.throws(()=>validateAutomationPacket(p));
  const q=make();q.snapshot.ingredients=Array.from({length:501},(_,n)=>({...q.snapshot.ingredients[0],id:'i'+n}));assert.throws(()=>validateAutomationPacket(q));
});
test('Números com casas decimais minúsculas não são arredondados silenciosamente para zero',()=>{
  for(const value of [1e-12,0.0000000001,0.0001,0.30000000000000004])assert.throws(()=>quantity(value));
  assert.equal(quantity(0.009),9);assert.equal(quantity(0.029),29);
});
test('Histórico inconsistente não pode ser exportado para a automação',()=>{
  const a=newAnalysis(demo());a.result.rows[0].shortage=999;assert.throws(()=>automationPacket(a));
});
test('Workflow gerado não contém webhook, credenciais ou nós que chamem serviços externos',async()=>{
  const workflow=JSON.parse(await readFile(new URL('../automations/radar-n8n-workflow.json',import.meta.url),'utf8'));
  const allowed=new Set(['n8n-nodes-base.manualTrigger','n8n-nodes-base.set','n8n-nodes-base.code','n8n-nodes-base.stickyNote']);
  assert.equal(workflow.active,false);assert.ok(workflow.nodes.every(n=>allowed.has(n.type)&&!n.credentials&&!n.webhookId));
  assert.ok(workflow.nodes.find(n=>n.name==='Dados da análise').parameters.jsonOutput);
});
test('Código exato do workflow executa localmente com metadados de teste e mantém o contrato',async()=>{
  const workflow=JSON.parse(await readFile(new URL('../automations/radar-n8n-workflow.json',import.meta.url),'utf8'));
  const input=JSON.parse(workflow.nodes.find(n=>n.name==='Dados da análise').parameters.jsonOutput);
  const calculation=workflow.nodes.find(n=>n.name==='Validar e preparar reposições').parameters.jsCode;
  const output=runInNewContext('(() => {'+calculation+'})()',{$input:{first:()=>({json:input})},$execution:{id:'teste-local'},$workflow:{id:'teste-local'}},{timeout:1000});
  assert.equal(output[0].json.proposals[0].quantity,4);assert.equal(output[0].json.automation.executionId,'teste-local');
  const report=workflow.nodes.find(n=>n.name==='Relatório para revisão humana').parameters.jsCode;
  const summary=runInNewContext('(() => {'+report+'})()',{$input:{all:()=>output}},{timeout:1000});
  assert.equal(summary[0].json.proposals[0].status,'pending');assert.equal(summary[0].json.inventoryChanged,false);
});
