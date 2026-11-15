# Verificação e critérios de aceite

Data: 15/11/2026. Ambiente de teste: Node.js v24.22.1, Windows. O resultado bruto está em `testes-executados.txt`.

## Cenário obrigatório

Teste automatizado com X-Burger usando somente 1 pão e 1 carne por unidade, reserva zero e demanda de 12 unidades:

| Verificação | Esperado | Obtido |
| --- | --- | --- |
| Pães disponíveis | 8 un | 8 un |
| Pães necessários | 12 un | 12 un |
| Falta de pão | 4 un | 4 un |
| Classificação do pão | Crítico | Crítico |
| Carnes disponíveis | 15 un | 15 un |
| Carnes necessárias | 12 un | 12 un |
| Classificação da carne | Normal | Normal |
| Proposta | 4 pães | 4 pães |
| Capacidade isolada do X-Burger | 8 unidades | 8 unidades |

O teste usa uma fixture específica. O restaurante de demonstração inclui queijo na receita e outros pratos para exibir mais estados; não confundir o conjunto mais completo com a fixture mínima.

## Cobertura executada

Estoque suficiente e insuficiente; igualdade exata da reserva; distinção entre falta e reserva; ingrediente compartilhado; precisão 0,1 + 0,2; quantidades inválidas; pedidos fracionários; demanda zero; unidade inconsistente; referência ausente; ingrediente repetido; exclusão protegida; exclusão de prato; fotografia histórica; duplicidade de proposta; decisão sem alterar estoque; gravação e recarga; falha de gravação; conflito entre revisões de abas; limpeza de armazenamento; adulteração do histórico; identificadores inválidos; fallback sem adaptador; falha e tempo excedido simulados; resposta simulada válida; arquivo independente com fontes atuais e JavaScript compilável.

Não houve acesso real ao n8n ou a API de IA. Testes de adaptador são dublês locais.

## Estado dos critérios finais

| Critério original | Estado atual |
| --- | --- |
| Aplicação inicia no navegador | Pendente: servidor emitiu endereço de escuta, mas abertura foi bloqueada no ambiente |
| Navegação funciona | Implementada; execução visual pendente |
| Cadastro e edição de ingredientes | Implementados; fluxo de interface pendente |
| Exclusão protegida | Regra testada; confirmação visual pendente |
| Receitas e vínculos | Validação testada; formulários pendentes de execução manual |
| Demanda | Validação testada; envio do formulário pendente |
| Cenário obrigatório | Aprovado por teste automático |
| Ingredientes compartilhados | Aprovado por teste automático |
| Propostas e aprovação | Regras testadas; fluxo de interface pendente |
| Aprovação sem compra ou mudança de saldo | Aprovado na camada de dados; aplicação não possui API de compra |
| Histórico preservado | Aprovado por teste automático |
| Histórico inspecionável na interface | Tela e diálogo implementados; execução pendente |
| Dados de demonstração identificados | Rótulos implementados; verificação visual pendente |
| Layout, responsividade e acessibilidade | Implementados; revisão visual pendente |
| Configuração e limitações documentadas | Concluído nos arquivos do pacote |
| Publicação e URL pública | Não iniciadas |
| Repositório GitHub | Pendente; README preparado |
| Integração n8n real | Não configurada |
| IA generativa real | Não configurada; explicações locais declaradas |

## Limite da revisão de interface

A tentativa de conexão com o servidor local retornou bloqueio de socket no executor e erro de conexão no navegador. Uma tentativa posterior de abrir o HTML diretamente foi recusada pela política de URLs do navegador automatizado. Não foi contornado esse bloqueio. Não foram capturadas imagens da interface nem foi possível validar cliques, foco, contraste, quebra de layout ou funcionamento de LocalStorage no navegador.

Um teste de compilação do código não prova renderização correta. Por isso, esta entrega é uma base implementada com núcleo testado, não um produto integralmente verificado.

## Checklist manual para a próxima sessão

| Ação | Resultado esperado |
| --- | --- |
| Abrir Radar_de_Ruptura.html | Painel com Bistrô Horizonte e rótulo de demonstração |
| Abrir todas as sete seções | Conteúdo correspondente, sem tela vazia ou erro |
| Cadastrar um ingrediente de teste em kg | Aparece no estoque com os valores informados |
| Informar quantidade negativa e quatro casas decimais | Erro claro, sem salvar |
| Criar prato com ingrediente cadastrado | Receita aparece no cardápio |
| Tentar excluir ingrediente usado | Exclusão bloqueada, orientação para remover vínculo |
| Registrar demanda do exemplo | Pão crítico, falta de 4 e capacidade de 8 X-Burgers |
| Abrir Reposições e aprovar | Decisão registrada; estoque de pães continua em 8 |
| Editar estoque depois de analisar | Histórico anterior continua mostrando 8 pães disponíveis |
| Recarregar a página | Cadastros, histórico e decisão continuam presentes |
| Testar uma aba desatualizada | Mensagem orientando recarregar antes de editar |
| Exportar JSON | Arquivo contém cadastros e análises |
| Abrir no celular ou janela estreita | Navegação acessível; tabelas rolam sem esconder ações |
| Usar teclado | Navegação, formulários e diálogo operáveis; foco visível |
| Restaurar demonstração, após exportar e confirmar | Voltam os dados fictícios e o histórico fica vazio |

Não foi feita auditoria de segurança, teste com usuários reais ou medição de impacto em restaurante.
