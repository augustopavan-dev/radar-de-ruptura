// Quantidades são calculadas em milésimos inteiros, evitando erros de ponto flutuante.
export const UNITS = ['un', 'kg', 'L'];
export const MAX_QUANTITY = 1000000;
export const MAX_ORDERS = 1000000;
export function quantity(value, unit = 'kg', label = 'Quantidade') {
  if (typeof value !== 'number' && typeof value !== 'string') throw new Error(`${label}: informe um número.`);
  if (typeof value === 'string' && !/^\d+(?:[.,]\d{1,3})?$/.test(value.trim())) throw new Error(`${label}: use um número positivo com até três casas decimais.`);
  const n = Number(String(value).trim().replace(',', '.'));
  if (!Number.isFinite(n) || n < 0 || n > MAX_QUANTITY) throw new Error(`${label}: informe de 0 a 1.000.000.`);
  const scaled = Math.round(n * 1000);
  if (Math.abs(n * 1000 - scaled) > 0.000001) throw new Error(`${label}: use até três casas decimais.`);
  if (unit === 'un' && !Number.isInteger(n)) throw new Error(`${label}: unidades devem ser inteiras.`);
  return scaled;
}
export function orders(value) {
  if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !/^\d+$/.test(value.trim()))) throw new Error('Informe a quantidade inteira de pedidos.');
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > MAX_ORDERS) throw new Error('Pedidos devem ser inteiros de 0 a 1.000.000.');
  return n;
}
export function text(value, label = 'Nome') {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 80) throw new Error(`${label}: use entre 1 e 80 caracteres.`);
  return value.trim();
}
export function identifier(value) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(value)) throw new Error('Identificador inválido.');
}
export function validateCatalog(ingredients, recipes, demand) {
  if (!Array.isArray(ingredients) || !Array.isArray(recipes) || !demand || typeof demand !== 'object' || Array.isArray(demand)) throw new Error('Dados da operação inválidos.');
  const allIds = new Set();
  for (const i of ingredients) {
    identifier(i.id); text(i.name); if (allIds.has(i.id)) throw new Error('Ingrediente duplicado.'); allIds.add(i.id);
    if (!UNITS.includes(i.unit)) throw new Error('Unidade inválida.');
    quantity(i.stock, i.unit, 'Estoque'); quantity(i.safety, i.unit, 'Reserva');
  }
  const recipeIds = new Set();
  for (const r of recipes) {
    identifier(r.id); text(r.name);
    if (recipeIds.has(r.id)) throw new Error('Prato duplicado.'); recipeIds.add(r.id);
    if (!Array.isArray(r.items) || !r.items.length) throw new Error('Adicione pelo menos um ingrediente à receita.');
    const seen = new Set();
    for (const item of r.items) {
      const ingredient = ingredients.find(i => i.id === item.ingredientId);
      if (!ingredient) throw new Error('A receita referencia um ingrediente que não existe.');
      if (seen.has(item.ingredientId)) throw new Error('Não repita um ingrediente na mesma receita.'); seen.add(item.ingredientId);
      if (item.unit !== ingredient.unit) throw new Error('A unidade da receita deve ser igual à do ingrediente.');
      if (quantity(item.quantity, item.unit, 'Consumo por prato') <= 0) throw new Error('O consumo por prato deve ser maior que zero.');
    }
  }
  for (const [id, n] of Object.entries(demand)) { if (!recipeIds.has(id)) throw new Error('Demanda com prato inexistente.'); orders(n); }
}
export function calculate(ingredients, recipes, demand) {
  validateCatalog(ingredients, recipes, demand);
  const totals = new Map(ingredients.map(i => [i.id, 0]));
  for (const recipe of recipes) for (const item of recipe.items) {
    const amount = quantity(item.quantity, item.unit) * orders(demand[recipe.id] ?? 0);
    const sum = totals.get(item.ingredientId) + amount;
    if (!Number.isSafeInteger(sum)) throw new Error('Demanda excede o limite de cálculo seguro.');
    totals.set(item.ingredientId, sum);
  }
  const rows = ingredients.map(i => {
    const required = totals.get(i.id), stock = quantity(i.stock, i.unit), safety = quantity(i.safety, i.unit);
    if (!Number.isSafeInteger(required + safety)) throw new Error('Demanda excede o limite de cálculo seguro.');
    const projected = stock - required;
    const shortage = Math.max(0, required - stock);
    const replenish = Math.max(0, required + safety - stock);
    return { ingredientId: i.id, name: i.name, unit: i.unit, stock: stock / 1000, safety: safety / 1000, required: required / 1000, projected: projected / 1000, shortage: shortage / 1000, replenish: replenish / 1000, risk: projected < 0 ? 'critical' : projected <= safety ? 'attention' : 'normal', affectedRecipes: recipes.filter(r => orders(demand[r.id] ?? 0) > 0 && r.items.some(it => it.ingredientId === i.id)).map(r => r.name) };
  });
  const menu = recipes.map(r => ({ recipeId: r.id, name: r.name, demand: orders(demand[r.id] ?? 0), capacity: Math.min(...r.items.map(it => Math.floor(quantity(ingredients.find(i => i.id === it.ingredientId).stock, it.unit) / quantity(it.quantity, it.unit)))), atRisk: orders(demand[r.id] ?? 0) > 0 && r.items.some(it => rows.some(row => row.ingredientId === it.ingredientId && row.shortage > 0)) }));
  return { rows, menu, totalOrders: menu.reduce((sum, r) => sum + r.demand, 0) };
}
export function explain(result) {
  const critical = result.rows.filter(r => r.risk === 'critical');
  const attention = result.rows.filter(r => r.risk === 'attention');
  if (critical.length) return `${critical.length} ingrediente(s) não cobrem a demanda informada. Priorize a falta real antes de recompor a reserva. ${result.menu.filter(r => r.atRisk).length} prato(s) com pedidos estimados usam esses ingredientes; a divisão do estoque entre eles precisa ser decidida pelo responsável.`;
  if (attention.length) return `A demanda informada cabe no estoque. ${attention.length} ingrediente(s) ficarão no limite ou abaixo da reserva. Revise a reposição antes do próximo atendimento.`;
  return 'O estoque cobre a demanda informada e mantém todos os ingredientes acima da reserva configurada.';
}
