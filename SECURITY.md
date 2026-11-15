# Segurança e dados

Revisão de código e comportamento em 15/11/2026. Não constitui auditoria independente.

## Proteções atuais

- Nenhuma credencial, chave de API ou URL privada de n8n é necessária no código público.
- O aplicativo não faz chamadas de rede: o HTML publicado usa CSP com `connect-src 'none'`.
- JavaScript e CSS incorporados são autorizados por hash SHA-256; o build normaliza quebras de linha antes do cálculo.
- A CSP bloqueia scripts e estilos não autorizados, objetos, mudança de base e submissão de formulários.
- Nomes e valores dinâmicos são escapados antes de entrar em HTML; mensagens simples usam textContent.
- Quantidades, unidades, referências e limites de cálculo são validados. Precisão excessiva, inclusive números minúsculos em notação exponencial, é rejeitada.
- O armazenamento valida fotografias e resultados históricos e detecta revisão antiga entre abas.
- A exportação para n8n seleciona apenas os campos de uma análise. O workflow usa gatilho manual autenticado no editor e não possui credenciais ou webhook.
- Aprovação e processamento de automação não alteram estoque ou fazem compras.

## Limites de proteção

LocalStorage não é criptografado, autenticado ou protegido de outras pessoas que usam o mesmo perfil. Extensões do navegador e alterações locais podem acessar os dados. Não inserir informações pessoais, credenciais ou estoque confidencial na demonstração.

A CSP em meta é uma proteção adicional. GitHub Pages não permite configurar todos os cabeçalhos de segurança desta aplicação; por exemplo, frame-ancestors não pode ser aplicado por meta. A CSP não substitui validação ou um backend autenticado.

Históricos locais e execuções n8n podem conter dados operacionais. Exporte antes de limpar o navegador e revise a retenção da sua instância antes de usar dados reais. O arquivo de consulta não tem restauração implementada.

## Alterações e incidentes

Nunca publique tokens em issues ou prints. Se uma credencial for exposta, revogue e substitua no provedor; apagar o texto no último commit não remove a credencial do histórico.

Mudanças nas fontes exigem reconstrução dos HTMLs e do workflow, execução dos testes e verificação da demonstração publicada. Não acrescente integrações externas ao frontend sem revisar o modelo de segurança e a CSP.
