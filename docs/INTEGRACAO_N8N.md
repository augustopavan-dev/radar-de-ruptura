# Automação operacional com n8n

Estado em 15/11/2026: workflow configurado e executado no n8n Cloud 2.47.7. O envio de dados do aplicativo é manual e autenticado no editor n8n. Não há chamada direta do Pages para a instância.

## O que foi implementado

1. Iniciar revisão: gatilho manual.
2. Dados da análise: Edit Fields no modo JSON / Fixed.
3. Validar e preparar reposições: Code com as mesmas fontes de cálculo e validação do aplicativo.
4. Relatório para revisão humana: resumo, prioridade, propostas pendentes e identificação da execução.

Não há webhook público, credenciais, API de IA, serviço externo, agendamento, envio de mensagens ou compra. O workflow não altera os saldos nem as decisões no Radar.

O gerador `build-automation.mjs` incorpora `src/engine.mjs` e `src/automation.mjs`. Alterações nas regras devem reconstruir o workflow e ser reimportadas antes de afirmar que o n8n usa a nova versão.

## Como usar a instância já configurada

1. No Radar, entre em **Histórico** e abra **Ver detalhes**.
2. Clique em **Exportar análise para n8n**. Abra o arquivo JSON baixado com o Bloco de Notas e copie seu conteúdo.
3. Na sua instância n8n, abra **Radar de Ruptura — revisão operacional** e dê dois cliques em **Dados da análise**.
4. Mantenha **Modo: JSON** e **Fixo / Fixed**. Substitua todo o JSON do exemplo pelo conteúdo copiado, sem transformá-lo em expressão.
5. Feche o painel do nó e clique em **Executar fluxo de trabalho / Execute workflow**.
6. Abra **Relatório para revisão humana** e confira a saída e seu `analysisId`. Uma saída bem-sucedida não significa compra ou aprovação no Radar.

Em caso de erro, leia a mensagem no nó de validação e corrija os dados na origem. O relatório do n8n não é importado automaticamente. As propostas continuam sendo decididas no Radar.

Use apenas dados fictícios na demonstração pública. Dados colados na instância ficam salvos no workflow e no histórico de execuções conforme a configuração e a retenção do n8n. A exportação mínima evita enviar todo o histórico, mas contém nomes, saldos, receitas e demanda da análise selecionada.

## Reconstruir em outra instalação

1. Importe `automations/radar-n8n-workflow.json` pelo menu **Import from File** do editor.
2. Confira os quatro nós e a nota explicativa.
3. Execute com o exemplo fictício antes de substituir os dados.
4. O workflow só tem gatilho manual, portanto não precisa ser publicado ou ativado como webhook.

O JSON genérico no repositório não contém identificadores da conta, URLs privadas, histórico de execução ou credenciais. Não exporte versões da sua instância com dados reais para um repositório público.

## Contrato de entrada

O botão exporta somente uma fotografia histórica:

```json
{
  "schemaVersion": 1,
  "origin": "radar-de-ruptura",
  "analysisId": "identificador-da-analise",
  "createdAt": "2026-11-15T12:00:00.000Z",
  "snapshot": {
    "ingredients": [],
    "recipes": [],
    "demand": {}
  }
}
```

Consulte o exemplo completo em `automations/example-analysis.json`. O workflow recalcula o resultado; não confia em quantidades de reposição enviadas pelo chamador. Campos extras não são repassados ao pacote normalizado.

Limites: 262.144 caracteres de JSON, 500 ingredientes, 200 pratos, 200 chaves de demanda e 500 itens por receita. Valida versão, origem, ID, data, referências, unidades, precisão e números finitos. O limite de caracteres é validado no Code node depois da leitura do JSON; não é um limite de upload do n8n.

A saída inclui `analysisId`, `summary`, `criticalCount`, `totalOrders`, `proposals`, metadados de execução e os indicadores `approvalRequired: true`, `inventoryChanged: false`, `purchaseCreated: false`. As propostas são novas recomendações pendentes, não o estado de aprovação existente no aplicativo.

## Evidência real e limites

A execução 1 produziu falta e proposta de 4 pães com dados fictícios. Um segundo teste rejeitou estoque -1 no nó de validação. A execução 3, com estoque suficiente, retornou zero itens críticos e nenhuma proposta. O exemplo original foi restaurado e executado novamente.

Esses testes verificam o workflow no Cloud. Os testes de `src/integrations.mjs` continuam sendo dublês locais e não são evidência de integração HTTP. Não foi implementada ou testada uma conexão automática entre navegador e n8n.

Na verificação da conta havia 14 dias restantes de avaliação e cota de 1.000 execuções. Essa informação é pontual. Não foi ativado plano pago nem usado crédito de gateway de IA. A avaliação não equivale a hospedagem gratuita permanente.

## Plano para integração automática futura

GitHub Pages serve arquivos estáticos e não guarda segredos. A arquitetura deverá ser:

- Navegador envia a análise a um backend autenticado por HTTPS.
- Backend verifica usuário e autorização sobre a análise, esquema, tamanho em bytes, frequência e origem permitida.
- Backend recalcula ou verifica o resultado, aplica timeout e uma chave de idempotência vinculada ao usuário e à análise.
- Backend chama webhook protegido do n8n com segredo armazenado no servidor e no gerenciador de credenciais.
- Resposta é associada ao mesmo usuário, `analysisId` e versão; texto é escapado na interface.
- Falha ou indisponibilidade preserva o cálculo local, sem alterar estoque ou registrar sucesso falso.

CORS não autentica usuários. Uma URL difícil de adivinhar e um token embutido no JavaScript também não protegem o webhook. Não colocar segredo em HTML, localStorage, URL, repositório ou logs. Usar rotação e retenção mínima de dados; proteger contra repetição e limitar efeitos a recomendações. Revisão humana continua obrigatória.

Antes de ativar essa etapa, validar autenticação, ausência de acesso entre usuários, duplicidade, indisponibilidade, timeout e correspondência da resposta. Escolher hospedagem e seus limites somente após autorização; nenhum backend ou serviço adicional foi contratado.
