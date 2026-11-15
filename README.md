# Radar de Ruptura

Um restaurante pode ter carne suficiente para o serviço e não conseguir atender os pedidos porque faltam pães. O Radar de Ruptura relaciona estoque, receitas e demanda informada para identificar esse problema antes do atendimento e organizar propostas de reposição.

Projeto independente de portfólio de Augusto Pavan Ribeiro, desenvolvido com assistência de IA. Não possui vínculo com o iFood. O restaurante **Bistrô Horizonte** e todos os dados de exemplo são fictícios.

## Estado da versão

O núcleo local possui testes automáticos para regras de cálculo, validação, propostas, histórico e persistência. A publicação está sendo preparada no GitHub Pages. Consulte [VERIFICACAO.md](docs/VERIFICACAO.md) para distinguir testes executados de verificações pendentes.

As explicações operacionais são feitas por regras. Não há IA generativa, previsão estatística de vendas ou workflow n8n conectado. Nenhuma compra é realizada pelo aplicativo.

## O que o aplicativo faz

- Cadastra ingredientes, saldos, unidades e reservas de segurança.
- Cadastra pratos e o consumo de ingredientes por porção.
- Recebe uma estimativa manual de pedidos por prato.
- Soma a necessidade dos ingredientes compartilhados entre todas as receitas.
- Mostra risco, saldo projetado, falta real e reposição para recompor a reserva.
- Gera propostas com revisão humana e decisões registradas.
- Preserva a fotografia dos dados usados em cada análise.
- Exporta os dados em JSON e restaura o exemplo após confirmação.

Os dados ficam somente no navegador de quem usa a demonstração. Não há sincronização entre visitantes ou acesso a um estoque real.

## Experimente o cenário obrigatório

Na seção **Demanda e análise**, registre os pedidos de exemplo:

| Item | Estoque | Consumo por X-Burger | Demanda |
| --- | --- | --- | --- |
| Pão de hambúrguer | 8 un | 1 un | 12 X-Burgers |
| Hambúrguer bovino | 15 un | 1 un | 12 X-Burgers |

Com reserva zero, o resultado esperado é necessidade de 12 pães, **falta de 4 pães**, pão crítico, carne normal e capacidade isolada de **8 X-Burgers**. A fixture automatizada usa somente pão e carne; o conjunto visual inclui queijo e outros pratos para demonstrar mais situações.

## Regras verificáveis

```text
necessário = soma(consumo por prato × pedidos estimados)
saldo projetado = estoque disponível − necessário
falta real = máximo(0, necessário − estoque disponível)
reposição sugerida = máximo(0, necessário + reserva − estoque disponível)
```

| Situação | Regra |
| --- | --- |
| Crítico | Saldo projetado menor que zero |
| Atenção | Saldo projetado entre zero e a reserva, inclusive |
| Normal | Saldo projetado maior que a reserva |

A igualdade exata com a reserva é atenção, mas pode ter reposição zero. Não são criadas propostas de quantidade zero. Demanda zero não consome estoque; uma reserva insuficiente ainda pode gerar proposta.

Quantidades são calculadas em milésimos inteiros para evitar erros como 0,1 + 0,2 no limite da reserva. Kg e L aceitam até três casas decimais; un e pedidos exigem inteiros. A receita usa a mesma unidade do ingrediente. Não há conversão automática de g para kg ou mL para L.

A capacidade de um prato é **isolada**: considera dedicar a ele todo o estoque. Capacidades não são somáveis quando os pratos compartilham ingredientes. A aplicação aponta o risco agregado, sem escolher quais pedidos atender primeiro.

## Executar e testar

É possível abrir `Radar_de_Ruptura.html` diretamente no navegador. Algumas configurações de navegador podem limitar o armazenamento em arquivos locais; o servidor é a alternativa recomendada nesses casos.

Com Node.js 22 ou superior, na pasta do projeto:

```text
node server.mjs
```

Abra o endereço local mostrado no terminal. Para reconstruir a página independente e a entrada do GitHub Pages e executar os testes:

```text
node build-standalone.mjs
node --test tests/core.test.mjs tests/standalone.test.mjs
```

Não há dependências para instalar. O relatório da execução acompanha o projeto em `docs/testes-executados.txt`.

## Tecnologias e organização

- JavaScript com módulos nativos, HTML e CSS responsivo.
- Node.js para testes, empacotamento e servidor estático opcional.
- LocalStorage para dados da demonstração.
- GitHub Pages para distribuição estática, sem backend.

| Arquivo | Responsabilidade |
| --- | --- |
| `src/engine.mjs` | Regras de cálculo, precisão e validação |
| `src/model.mjs` | Fotografias históricas e decisões |
| `src/storage.mjs` | Persistência e detecção de revisão desatualizada |
| `src/app.mjs` | Interface e interações |
| `src/integrations.mjs` | Ponto de extensão e fallback, sem conexão externa |
| `tests/` | Testes do núcleo e do empacotamento |
| `docs/index.html` | Página gerada para publicação |

O build gera o HTML público a partir das fontes. Não edite `docs/index.html` manualmente. Configure o Pages para publicar da branch `main`, pasta `/docs`; o arquivo `.nojekyll` indica distribuição estática.

## Limitações importantes

- Não há autenticação, múltiplos usuários, banco remoto ou sincronização.
- O navegador pode remover seus dados locais. Exporte antes de limpar o armazenamento.
- O JSON exportado serve como cópia de consulta; a importação ainda não foi implementada.
- Aprovar não compra, não recebe material e não altera o estoque.
- Propostas de análises diferentes podem representar a mesma necessidade e não são uma lista consolidada de compras.
- A detecção de revisão antiga entre abas não substitui transações de um banco de dados.
- Não há lotes, validade, fornecedores, custos, prazos de entrega ou otimização de alocação entre pratos.
- Os testes do adaptador usam dublês locais; não comprovam uma integração n8n real.

## Próximas etapas

Completar a validação visual e dos fluxos publicados, registrar capturas reais e testar com pessoas usuárias. Uma futura automação com n8n exigirá backend autenticado, segredos no servidor e testes reais de sucesso e falha. O [contrato proposto](docs/INTEGRACAO_N8N.md) documenta essa separação. Chamadas diretas do navegador para um webhook secreto não fazem parte deste desenho.

## Autoria e aprendizado

O contexto e os requisitos do projeto foram fornecidos por Augusto. A implementação inicial e os testes automáticos foram produzidos com assistência de IA. As contribuições e validações posteriores devem ser descritas conforme o trabalho efetivamente realizado. Não foram medidos resultados em restaurantes reais nem estimadas economias sem evidência.
