# Contrato proposto para n8n

**Estado: proposta de implementação, sem integração real.** O aplicativo funciona sem este recurso. Não há webhook, segredo ou chamada externa configurados.

## Responsabilidades

O cálculo determinístico continua sendo a fonte das quantidades. O n8n pode organizar uma explicação ou prioridades a partir do resultado validado. Uma resposta externa não altera saldos, resultados, propostas ou decisões.

A interface chamará um endpoint autenticado do backend da aplicação. Somente esse backend poderá chamar o webhook n8n. O segredo do webhook fica no backend e no gerenciador de credenciais do n8n; nunca no HTML ou em um repositório.

## Entrada proposta

POST com Content-Type application/json. Autenticação entre backend e n8n por credencial em cabeçalho. O valor real deve ser definido na interface de segredos, sem copiá-lo na conversa.

```json
{
  "schemaVersion": 1,
  "analysisId": "identificador-da-analise",
  "result": {
    "totalOrders": 12,
    "rows": [
      {
        "ingredientId": "pao",
        "name": "Pão de hambúrguer",
        "unit": "un",
        "stock": 8,
        "safety": 0,
        "required": 12,
        "projected": -4,
        "shortage": 4,
        "replenish": 4,
        "risk": "critical",
        "affectedRecipes": ["X-Burger"]
      }
    ],
    "menu": [
      {"recipeId":"burger","name":"X-Burger","demand":12,"capacity":8,"atRisk":true}
    ]
  }
}
```

O exemplo é reduzido ao ingrediente em falta. Uma chamada real deverá enviar o conjunto de linhas e pratos do resultado registrado, respeitando um limite de tamanho definido no backend.

## Saída proposta

```json
{
  "analysisId": "identificador-da-analise",
  "summary": "Faltam 4 pães para a demanda de 12 X-Burgers. Revise a reposição antes do serviço."
}
```

O cliente verifica a associação com a análise e aceita somente uma explicação textual não vazia de até 2.000 caracteres. A saída deve ser exibida como texto escapado, nunca como HTML. Não aceitar quantidades substitutas produzidas pelo workflow ou por IA.

## Workflow a configurar

1. Webhook POST com autenticação de cabeçalho e acesso limitado ao backend.
2. Validação de esquema, tamanho, unidades, identificação e números finitos.
3. Construção do resumo por regras; IA generativa só se houver provedor e custo autorizados.
4. Montagem da resposta com o mesmo analysisId.
5. Respond to Webhook.

Guardar URL e credenciais como segredos do servidor. Evitar registrar tokens em logs. Limitar a frequência das chamadas. Definir idempotência por analysisId para que uma repetição não dispare efeitos de negócio. Esta automação não deverá enviar mensagens, criar pedidos de compra ou aprovar propostas.

## Falhas e evidência

O ponto de extensão `explainWithFallback` usa explicação local quando o adaptador não existe, falha, excede o tempo ou devolve um contrato inválido. Os testes de falha e sucesso foram feitos com funções de teste locais. Isso verifica a política de fallback, mas não autenticação, disponibilidade ou execução do n8n Cloud.

Antes de afirmar integração concluída, registrar uma chamada real com ID da análise, status HTTP, identificação da execução n8n, resposta correspondente e comportamento com o workflow indisponível. Não guardar segredos nessa evidência.

Após validar, exportar o workflow sem credenciais e documentar reconstrução e hospedagem. O período de avaliação do n8n não deve ser tratado como hospedagem gratuita permanente.
