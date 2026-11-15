import { explain } from './engine.mjs';
// Ponto de extensão para um futuro backend autenticado. Não faz chamadas externas.
// O adaptador só deve ser fornecido pelo backend após configuração e teste reais.
export async function explainWithFallback(analysis, adapter, timeoutMs = 3000) {
  const local = {source:'local', summary:explain(analysis.result), integration:adapter ? 'failed' : 'not-configured'};
  if (!adapter) return local;
  let timer;
  try {
    const response = await Promise.race([Promise.resolve().then(() => adapter({schemaVersion:1,analysisId:analysis.id,result:analysis.result})),new Promise((_, reject) => {timer = setTimeout(() => reject(new Error('timeout')),timeoutMs);})]);
    if (!response || response.analysisId !== analysis.id || typeof response.summary !== 'string' || !response.summary.trim() || response.summary.length > 2000) return local;
    return {source:'external',summary:response.summary,integration:'completed'};
  } catch { return local; } finally { clearTimeout(timer); }
}
