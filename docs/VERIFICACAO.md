# Verificação e critérios de aceite

Data: 15/11/2026. Windows, Node.js v24.22.1, Chrome e n8n Cloud 2.47.7.

## Testes automatizados

**36 testes aprovados, zero falhas.** Resultado bruto em [testes-executados.txt](testes-executados.txt).

Cobrem falta de 4 pães; estoque suficiente; reserva e falta separadas; ingrediente compartilhado; precisão decimal; números inválidos; referências e unidades; exclusão protegida; fotografias históricas; decisões sem alterar saldo; persistência; falha de gravação; conflito entre abas; histórico adulterado; contrato e limites da automação; pacote mínimo; execução local do código exato do workflow; empacotamento e hashes da CSP.

Os três testes do adaptador futuro usam dublês locais. Não representam chamadas de rede.

## Verificação manual e publicada

| Verificação | Evidência |
| --- | --- |
| Repositório e Pages | Repositório público existente preservado; publicação pela branch main, /docs |
| Falta de 4 pães | Confirmada manualmente pelo autor e por teste automatizado |
| Aprovar não altera estoque | Confirmado manualmente pelo autor e por teste automatizado |
| Histórico após atualizar | Confirmado manualmente pelo autor e por teste automatizado |
| Workflow n8n real | Configurado na instância existente, sem credenciais ou API paga |
| Execução 1 | Exemplo fictício: 4 pães, prioridade crítica, pendente |
| Execução 2 | Estoque -1 rejeitado no nó de validação; relatório não gerado |
| Execução 3 | Estoque suficiente: zero críticos e propostas vazias |
| Execução 4 | Exemplo original restaurado, sucesso e histórico salvo após recarregar |
| Segurança do frontend | Escape de dados, validação de entradas e CSP no HTML gerado |
| Integração automática HTTP | Não implementada; plano em INTEGRACAO_N8N.md |

A revisão final da interface publicada está em andamento nesta atualização; os resultados serão registrados depois da implantação. Não há teste em restaurante real, medição de impacto ou auditoria independente.

## Limitações assumidas

- Os dados são fictícios e locais; não há login ou sincronização no Radar.
- Exportar para n8n inicia uma passagem manual de dados, não uma conexão automática.
- Aprovar e executar o workflow não compra nem movimenta material.
- A avaliação n8n não é hospedagem gratuita permanente.
- Importar um backup para restaurar o Radar e um backend autenticado são evoluções futuras.
