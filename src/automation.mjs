import { calculate, explain, identifier } from './engine.mjs';

export const AUTOMATION_SCHEMA_VERSION = 1;
const MAX_PACKET_LENGTH = 262144;
// Contrato sem credenciais: somente uma fotografia operacional, nunca o backup inteiro.
export function validateAutomationPacket(packet) {
  if (!packet || typeof packet !== 'object' || Array.isArray(packet) || packet.schemaVersion !== AUTOMATION_SCHEMA_VERSION || packet.origin !== 'radar-de-ruptura') throw new Error('Formato de análise para automação inválido.');
  if (JSON.stringify(packet).length > MAX_PACKET_LENGTH) throw new Error('Arquivo de análise excede o limite de 256 mil caracteres.');
  identifier(packet.analysisId);
  if (typeof packet.createdAt !== 'string' || packet.createdAt.length > 40 || !Number.isFinite(Date.parse(packet.createdAt))) throw new Error('Data da análise inválida.');
  const s = packet.snapshot;
  if (!s || !Array.isArray(s.ingredients) || !Array.isArray(s.recipes) || !s.demand || typeof s.demand !== 'object' || Array.isArray(s.demand)) throw new Error('Fotografia da análise inválida.');
  if (s.ingredients.length > 500 || s.recipes.length > 200 || Object.keys(s.demand).length > 200 || s.recipes.some(r => !Array.isArray(r?.items) || r.items.length > 500)) throw new Error('A análise excede os limites da demonstração.');
  const result = calculate(s.ingredients, s.recipes, s.demand);
  // Seleção explícita de campos evita exportar propriedades estranhas ao domínio.
  const snapshot = {
    ingredients: s.ingredients.map(i => ({id:i.id,name:i.name,unit:i.unit,stock:i.stock,safety:i.safety})),
    recipes: s.recipes.map(r => ({id:r.id,name:r.name,items:r.items.map(i => ({ingredientId:i.ingredientId,quantity:i.quantity,unit:i.unit}))})),
    demand: Object.fromEntries(Object.entries(s.demand))
  };
  return {schemaVersion:AUTOMATION_SCHEMA_VERSION,origin:'radar-de-ruptura',analysisId:packet.analysisId,createdAt:packet.createdAt,snapshot,result};
}

export function automationPacket(analysis) {
  const validated = validateAutomationPacket({schemaVersion:AUTOMATION_SCHEMA_VERSION,origin:'radar-de-ruptura',analysisId:analysis.id,createdAt:analysis.createdAt,snapshot:analysis.snapshot});
  if (JSON.stringify(validated.result) !== JSON.stringify(analysis.result)) throw new Error('A análise contém um resultado inconsistente.');
  const {result, ...packet} = validated;
  return packet;
}

export function processAutomationPacket(packet) {
  const validated = validateAutomationPacket(packet);
  const result = validated.result;
  const proposals = result.rows.filter(r => r.replenish > 0).map(r => ({
    ingredientId:r.ingredientId,name:r.name,unit:r.unit,shortage:r.shortage,quantity:r.replenish,
    priority:r.shortage > 0 ? 'critical' : 'safety',status:'pending',
    reason:r.shortage > 0 ? 'Atender demanda e recompor reserva' : 'Recompor reserva'
  })).sort((a,b) => Number(b.priority === 'critical') - Number(a.priority === 'critical') || a.name.localeCompare(b.name,'pt-BR'));
  return {
    schemaVersion:AUTOMATION_SCHEMA_VERSION,analysisId:validated.analysisId,createdAt:validated.createdAt,
    processing:'deterministic',summary:explain(result),
    criticalCount:result.rows.filter(r=>r.risk==='critical').length,
    attentionCount:result.rows.filter(r=>r.risk==='attention').length,
    totalOrders:result.totalOrders,requiresReview:proposals.length > 0,
    proposals,result,approvalRequired:true,inventoryChanged:false,purchaseCreated:false
  };
}
