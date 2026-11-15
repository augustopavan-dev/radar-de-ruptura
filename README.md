# Radar de Ruptura

Um restaurante pode ter carne suficiente e perder pedidos por falta de pães. O Radar cruza estoque, receitas e demanda informada para identificar a falta antes do atendimento e organizar reposições para revisão humana.

**[Abrir demonstração](https://augustopavan-dev.github.io/radar-de-ruptura/)** · [Verificações](docs/VERIFICACAO.md) · [Automação n8n](docs/INTEGRACAO_N8N.md) · [Segurança](SECURITY.md)

Projeto independente de portfólio de Augusto Pavan Ribeiro, desenvolvido com assistência de IA, sem vínculo com o iFood. Bistrô Horizonte e seus dados são fictícios.

## Estado atual

A demonstração está publicada no GitHub Pages. O núcleo, a persistência, o empacotamento e o contrato de automação possuem 36 testes automatizados. Uma automação foi configurada e executada de verdade no n8n Cloud, com dados fictícios, sem credenciais e sem APIs pagas.

O envio ao n8n é **manual**: abra uma análise no Histórico, exporte seu JSON e cole no workflow autenticado. Depois do início manual, o workflow valida, recalcula, prioriza e prepara o relatório. Não existe conexão automática entre Pages e n8n. O aplicativo continua funcionando sem o n8n.

## Funcionalidades

- Ingredientes com saldo, unidade e reserva de segurança.
- Receitas com consumo por porção e ingredientes compartilhados.
- Demanda estimada informada pela pessoa usuária.
- Falta real, saldo projetado, risco e reposição para recompor a reserva.
- Propostas com aprovação ou rejeição humana, sem compras ou alteração de estoque.
- Histórico com fotografia dos dados usados na análise.
- Exportação completa para consulta e exportação de uma análise para n8n.
- Persistência local e detecção de revisões desatualizadas entre abas.

As explicações usam regras determinísticas. Não há IA generativa ou previsão estatística de vendas.

## Cenário de referência

| Ingrediente | Disponível | Por X-Burger | Pedidos | Necessário | Falta |
| --- | --- | --- | --- | --- | --- |
| Pão | 8 un | 1 un | 12 | 12 un | **4 un** |
| Carne | 15 un | 1 un | 12 | 12 un | 0 un |

Com reserva zero, pão é crítico, carne é normal e a capacidade isolada é 8 X-Burgers. O exemplo visual inclui queijo e outros pratos.

```text
necessário = soma(consumo por prato × pedidos)
saldo projetado = estoque - necessário
falta real = máximo(0, necessário - estoque)
reposição = máximo(0, necessário + reserva - estoque)
```

Saldo negativo é crítico; de zero até a reserva, inclusive, é atenção; acima da reserva é normal. Não se cria proposta de quantidade zero. Demanda zero pode gerar reposição se a reserva estiver insuficiente.

Kg e L aceitam até três casas decimais; unidades e pedidos exigem inteiros. O cálculo usa milésimos inteiros. A receita deve usar a unidade do ingrediente, sem conversão automática. Capacidades são isoladas e não podem ser somadas quando há ingredientes compartilhados.

## Executar e testar

Requer Node.js 22 ou superior, sem dependências para instalar:

```text
node server.mjs
```

Abra o endereço mostrado no terminal. Também é possível abrir `Radar_de_Ruptura.html`; o armazenamento de arquivos locais depende das regras do navegador.

```text
node build-standalone.mjs
node build-automation.mjs
node --test tests/core.test.mjs tests/automation.test.mjs tests/standalone.test.mjs
```

O build gera `docs/index.html`, o HTML independente e o workflow com as mesmas regras das fontes. Não edite os arquivos gerados manualmente. Pages publica a branch `main`, pasta `/docs`.

| Arquivo | Responsabilidade |
| --- | --- |
| `src/engine.mjs` | Cálculo, unidades e validação |
| `src/model.mjs` | Fotografias históricas e decisões |
| `src/storage.mjs` | Persistência e revisão entre abas |
| `src/automation.mjs` | Pacote mínimo, validação e processamento |
| `src/app.mjs` | Interface e exportação |
| `src/integrations.mjs` | Adaptador futuro e fallback, testado com dublês |
| `automations/radar-n8n-workflow.json` | Workflow importável sem credenciais |
| `automations/example-analysis.json` | Entrada fictícia de exemplo |
| `docs/testes-executados.txt` | Resultado bruto dos testes |

## Limites e continuidade

Dados ficam no navegador, sem autenticação no aplicativo, banco remoto, sincronização ou integração com estoque real. Limpar dados do site pode apagar o histórico; exporte antes. A exportação completa é uma cópia de consulta; importação ainda não existe.

Aprovar não compra, recebe material ou altera estoque. Propostas de análises diferentes podem repetir a mesma necessidade. Não há fornecedores, custos, validade, lotes, prazos ou otimização da alocação entre pratos.

O período de avaliação do n8n Cloud não é um plano gratuito permanente. O workflow exportado permite continuidade em uma instalação própria; hospedagem própria pode ter custos e não foi instalada neste trabalho. Nenhuma assinatura ou API paga foi contratada.

A integração automática permanece uma etapa futura: exige backend autenticado e proteção de segredos. O [plano](docs/INTEGRACAO_N8N.md) define essa arquitetura e seus critérios de aceite.

## Autoria

Augusto forneceu o contexto, os requisitos e realizou os testes manuais informados na documentação. Implementação, correções e testes foram produzidos com assistência de IA. Não foram medidos resultados em restaurantes reais nem estimadas economias sem evidência.
