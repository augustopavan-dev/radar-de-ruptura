import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {automationPacket} from './src/automation.mjs';
import {demo,newAnalysis} from './src/model.mjs';

// O workflow incorpora as mesmas fontes de cálculo: não há uma segunda regra de estoque.
const base = new URL('./',import.meta.url);
const sources = await Promise.all(['src/engine.mjs','src/automation.mjs'].map(async path => (await readFile(new URL(path,base),'utf8')).replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'')));
const example = automationPacket(newAnalysis(demo(),'2026-11-15T12:00:00.000Z','exemplo-x-burger'));
const code = sources.join('\n') + '\nconst result = processAutomationPacket($input.first().json);\nresult.automation = {platform:"n8n",executionId:String($execution.id),workflowId:String($workflow.id)};\nreturn [{json:result}];\n';
const workflow = {
  name:'Radar de Ruptura — revisão operacional',active:false,
  nodes:[
    {id:'manual',name:'Iniciar revisão',type:'n8n-nodes-base.manualTrigger',typeVersion:1,position:[0,0],parameters:{}},
    {id:'input',name:'Dados da análise',type:'n8n-nodes-base.set',typeVersion:3.4,position:[240,0],parameters:{mode:'raw',jsonOutput:JSON.stringify(example,null,2),options:{}}},
    {id:'review',name:'Validar e preparar reposições',type:'n8n-nodes-base.code',typeVersion:2,position:[500,0],parameters:{mode:'runOnceForAllItems',jsCode:code}},
    {id:'report',name:'Relatório para revisão humana',type:'n8n-nodes-base.code',typeVersion:2,position:[760,0],parameters:{mode:'runOnceForAllItems',jsCode:'return $input.all().map(item => ({json:{analysisId:item.json.analysisId,automation:item.json.automation,summary:item.json.summary,criticalCount:item.json.criticalCount,totalOrders:item.json.totalOrders,proposals:item.json.proposals,approvalRequired:true,inventoryChanged:false,purchaseCreated:false}}));'}},
    {id:'note',name:'Como usar',type:'n8n-nodes-base.stickyNote',typeVersion:1,position:[190,-290],parameters:{width:780,height:220,content:'## Revisão sem APIs pagas\nO início é manual e protegido pelo login do editor n8n. Em **Dados da análise**, use JSON Output em modo Fixed e substitua o exemplo pelo JSON exportado de uma análise do Radar. Execute o workflow e confira o relatório. Não há webhook público, compra ou alteração de estoque. A demonstração do GitHub Pages continua local e independente.'}}
  ],
  connections:{
    'Iniciar revisão':{main:[[{node:'Dados da análise',type:'main',index:0}]]},
    'Dados da análise':{main:[[{node:'Validar e preparar reposições',type:'main',index:0}]]},
    'Validar e preparar reposições':{main:[[{node:'Relatório para revisão humana',type:'main',index:0}]]}
  },
  settings:{executionOrder:'v1',saveManualExecutions:true,saveDataErrorExecution:'all',saveDataSuccessExecution:'all'},pinData:{},tags:[]
};
await mkdir(new URL('automations/',base),{recursive:true});
await writeFile(new URL('automations/radar-n8n-workflow.json',base),JSON.stringify(workflow,null,2)+'\n');
await writeFile(new URL('automations/example-analysis.json',base),JSON.stringify(example,null,2)+'\n');
console.log('Workflow n8n e exemplo gerados sem credenciais e sem conexão externa.');
