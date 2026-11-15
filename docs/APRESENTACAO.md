# Apresentação do Radar de Ruptura

Textos de apoio para candidatura. Ajuste à sua forma de falar e só apresente como domínio próprio o que conseguir demonstrar. Este projeto usa automação e desenvolvimento assistido por IA; não implementa IA generativa em tempo de execução.

## Descrição para formulário

O Radar de Ruptura é um projeto de portfólio para apoiar a preparação de um serviço de restaurante. Cruza estoque, receitas e demanda estimada para apontar falta de ingredientes, saldo projetado e reposição sugerida. As propostas passam por revisão humana, sem compras ou alteração automática do estoque.

A aplicação foi desenvolvida com assistência de IA em JavaScript nativo, HTML e CSS, com persistência local e publicação no GitHub Pages. Um workflow real no n8n valida uma análise exportada, recalcula as necessidades e prepara um relatório priorizado. A transferência do JSON é manual, sem webhook ou API paga.

O projeto registra 36 testes automatizados aprovados e validações manuais do cenário de 4 pães faltantes, da aprovação sem alteração de saldo e da persistência do histórico. Meu papel foi fornecer o contexto e os requisitos e realizar esses testes manuais; implementação, correções e testes automatizados tiveram assistência de IA. O repositório documenta as decisões e os limites, incluindo a ausência de backend e de IA generativa real.

Demonstração: https://augustopavan-dev.github.io/radar-de-ruptura/
Código: https://github.com/augustopavan-dev/radar-de-ruptura

## Resumo para currículo

**Radar de Ruptura — projeto de portfólio com assistência de IA.** Aplicação JavaScript para análise de falta de ingredientes, com persistência local, revisão humana e workflow n8n por transferência manual de JSON. Definição de contexto e requisitos e validação manual de cenários; 36 testes automatizados registrados. Demonstração publicada no GitHub Pages.

## Resumo para LinkedIn

O Radar de Ruptura é meu projeto de portfólio para analisar falta de ingredientes em restaurantes. Forneci o contexto e os requisitos e validei manualmente cenários, com assistência de IA na implementação e nos testes. A demonstração reúne estoque, receitas, demanda estimada, propostas com revisão humana e histórico local. O workflow n8n foi testado de verdade e recebe análises por transferência manual de JSON. São 36 testes automatizados aprovados, sem IA generativa no aplicativo ou integração automática por webhook.

## Roteiro de 60–90 segundos

“Meu projeto é o Radar de Ruptura. A ideia parte de um problema simples: um restaurante pode ter carne suficiente e mesmo assim perder pedidos porque faltam pães.

O aplicativo cruza estoque, receitas e uma estimativa de pedidos informada pelo responsável. No exemplo, há oito pães para doze X-Burgers. Ele identifica a falta de quatro e gera uma proposta para revisão. Aprovar registra a decisão, mas não compra nem altera estoque.

A aplicação usa JavaScript, HTML e CSS, salva o histórico no navegador e está publicada no GitHub Pages. No n8n, configurei com assistência de IA um fluxo que recebe o JSON exportado, valida, recalcula e prepara um relatório priorizado. O envio é manual, porque o Pages não tem backend para guardar segredos com segurança.

Eu forneci o contexto e os requisitos e testei manualmente o cálculo, a aprovação e a persistência. A IA auxiliou na implementação, nas correções e nos testes automatizados, que somam 36 aprovações. Não apresento o projeto como IA generativa: hoje é uma solução de regras e automação. A evolução planejada é um backend autenticado para integrar o envio com segurança.”

O tempo é estimado: ensaie com cronômetro e mostre a demonstração durante o exemplo dos pães. A configuração técnica do workflow foi realizada com assistência de IA; não implica domínio independente de todas as opções do n8n.

## Arquitetura em linguagem simples

O GitHub Pages entrega a página, como uma vitrine de arquivos. O navegador faz o cálculo e guarda os dados localmente. Cada análise salva uma fotografia do estoque e das receitas para que mudanças futuras não reescrevam o passado. O n8n recebe uma cópia exportada e prepara um relatório separado. Ele não acessa o armazenamento do navegador nem grava decisões no Radar.

## Como o n8n foi usado

Quatro nós: gatilho manual, entrada JSON em Edit Fields, validação e cálculo em Code e relatório em Code. As fontes de cálculo do aplicativo são incorporadas ao workflow pelo gerador. O fluxo foi executado no Cloud com falta de 4 pães, estoque suficiente e estoque negativo. Nenhum nó usa modelo de linguagem, credenciais ou API externa. A avaliação Cloud não é um plano gratuito permanente.

## Como a IA auxiliou

A IA apoiou a organização da solução, a geração do código, as correções, os testes automatizados, a configuração assistida do workflow e a documentação. Augusto definiu o contexto e os requisitos e realizou as validações manuais descritas. Isso é desenvolvimento assistido por IA, não evidência de que o aplicativo usa um modelo de IA, nem de que todo o código foi escrito sem assistência.

## Perguntas para se preparar

| Pergunta | Ponto que precisa conseguir explicar |
| --- | --- |
| Por que regras em vez de um modelo? | Quantidades e faltas precisam ser conferíveis; não há necessidade de geração de texto para calcular consumo. |
| Como evita contar estoque duas vezes? | Soma consumo de todas as receitas por ingrediente antes de comparar com o saldo. |
| Falta e reserva são iguais? | Falta cobre a demanda; reposição também pode recompor a reserva. |
| Por que a aprovação não baixa o estoque? | Decidir repor não é receber ou consumir material. |
| Por que não chamar um webhook direto? | Um segredo no frontend público ficaria exposto; é necessário backend autenticado. |
| O que os 36 testes não comprovam? | Não substituem teste com restaurante real, auditoria ou cobertura completa de interface e acessibilidade. |

## Perfil do GitHub

O repositório foi fixado e recebeu descrição, site e tópicos. A bio estava vazia e foi preservada: alterar informações pessoais depende de confirmação. Uma opção curta para avaliar é “Projetos de tecnologia aplicados a problemas de operação e estoque.” Isso descreve o foco do portfólio sem declarar senioridade ou experiência não comprovada.

Para alterar a bio, se quiser: abra seu perfil, clique em **Edit profile / Editar perfil**, preencha **Bio** com uma frase que represente você e clique em **Save / Salvar**. Não é necessário fazer isso para acessar o projeto.
