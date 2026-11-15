import { calculate, validateCatalog, identifier } from './engine.mjs';
export const clone = value => structuredClone(value);
export const uid = () => crypto.randomUUID();
export function demo() {
  return { version: 1, restaurant: 'Bistrô Horizonte', revision: 0, ingredients: [
    {id:'pao',name:'Pão de hambúrguer',unit:'un',stock:8,safety:0},
    {id:'carne',name:'Hambúrguer bovino',unit:'un',stock:15,safety:0},
    {id:'queijo',name:'Queijo muçarela',unit:'kg',stock:0.6,safety:0.2},
    {id:'batata',name:'Batata pré-frita',unit:'kg',stock:3,safety:1},
    {id:'oleo',name:'Óleo vegetal',unit:'L',stock:2,safety:0.5},
    {id:'alface',name:'Alface higienizada',unit:'kg',stock:0.5,safety:0.1}
  ], recipes: [
    {id:'burger',name:'X-Burger',items:[{ingredientId:'pao',quantity:1,unit:'un'},{ingredientId:'carne',quantity:1,unit:'un'},{ingredientId:'queijo',quantity:0.025,unit:'kg'}]},
    {id:'fritas',name:'Porção de fritas',items:[{ingredientId:'batata',quantity:0.25,unit:'kg'},{ingredientId:'oleo',quantity:0.03,unit:'L'}]},
    {id:'salada',name:'Salada do bistrô',items:[{ingredientId:'alface',quantity:0.1,unit:'kg'},{ingredientId:'queijo',quantity:0.025,unit:'kg'}]}
  ], demand: {burger:12,fritas:8,salada:4}, analyses: [] };
}
export function validateState(s) {
  if (!s || s.version !== 1 || !Number.isSafeInteger(s.revision) || s.revision < 0 || !Array.isArray(s.analyses)) throw new Error('Arquivo salvo inválido ou incompatível.');
  validateCatalog(s.ingredients, s.recipes, s.demand);
  const seen = new Set();
  for (const a of s.analyses) {
    identifier(a.id);
    if (typeof a.id !== 'string' || seen.has(a.id) || !Number.isFinite(Date.parse(a.createdAt)) || a.source !== 'local' || !a.snapshot || !Array.isArray(a.proposals)) throw new Error('Histórico inválido.');
    seen.add(a.id);
    const expected = calculate(a.snapshot.ingredients, a.snapshot.recipes, a.snapshot.demand);
    if (JSON.stringify(expected) !== JSON.stringify(a.result)) throw new Error('O histórico contém cálculos inconsistentes.');
    const wanted = expected.rows.filter(r => r.replenish > 0);
    if (a.proposals.length !== wanted.length) throw new Error('Propostas inconsistentes.');
    const ingredientIds = new Set();
    for (const p of a.proposals) {
      const row = wanted.find(r => r.ingredientId === p.ingredientId);
      if (!row || ingredientIds.has(p.ingredientId) || p.id !== `${a.id}:${p.ingredientId}` || p.quantity !== row.replenish || p.shortage !== row.shortage || p.createdAt !== a.createdAt || p.unit !== row.unit || p.name !== row.name || !['pending','approved','rejected'].includes(p.status) || !Array.isArray(p.decisions)) throw new Error('Proposta inválida.');
      ingredientIds.add(p.ingredientId);
      if (p.status === 'pending' ? p.decisions.length !== 0 : p.decisions.length !== 1 || p.decisions[0].status !== p.status || !Number.isFinite(Date.parse(p.decisions[0].at))) throw new Error('Decisão inválida.');
    }
  }
  return s;
}
export function newAnalysis(state, now = new Date().toISOString(), id = uid()) {
  if (state.analyses.some(a => a.id === id)) throw new Error('Análise já registrada.');
  const snapshot = clone({ingredients:state.ingredients,recipes:state.recipes,demand:state.demand});
  const result = calculate(snapshot.ingredients, snapshot.recipes, snapshot.demand);
  const proposals = result.rows.filter(r => r.replenish > 0).map(r => ({id:`${id}:${r.ingredientId}`,ingredientId:r.ingredientId,name:r.name,unit:r.unit,quantity:r.replenish,shortage:r.shortage,status:'pending',createdAt:now,decisions:[]}));
  return {id,createdAt:now,source:'local',snapshot,result,proposals};
}
export function decide(state, proposalId, status, now = new Date().toISOString()) {
  if (!['approved','rejected'].includes(status)) throw new Error('Decisão inválida.');
  const next = clone(state);
  const p = next.analyses.flatMap(a => a.proposals).find(p => p.id === proposalId);
  if (!p || p.status !== 'pending') throw new Error('A proposta já foi decidida ou não existe.');
  p.status = status; p.decisions.push({status,at:now});
  return next;
}
export function removeIngredient(state, id) {
  if (state.recipes.some(r => r.items.some(i => i.ingredientId === id))) throw new Error('Ingrediente usado em uma receita. Remova o vínculo no cardápio antes de excluir.');
  const next = clone(state); next.ingredients = next.ingredients.filter(i => i.id !== id); return next;
}
export function removeRecipe(state, id) {
  const next = clone(state); next.recipes = next.recipes.filter(r => r.id !== id); delete next.demand[id]; return next;
}
