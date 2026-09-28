# Melhorias cirúrgicas no dashboard e assistente contextual

## Objetivo
Adicionar a nova apresentação do painel e um assistente temporário contextual, preservando tarefas, autenticação, check-in, recomendações, lembretes, rotas e banco atuais.

## Alterações visuais
- Inserir abaixo do cabeçalho a saudação “SEU ESPAÇO DE FOCO”, com período do dia calculado no navegador e a mensagem acolhedora solicitada.
- Manter os quatro contadores atuais e, logo abaixo, organizar os componentes já existentes “Seu progresso” e “SUGESTÃO PARA AGORA” em duas colunas no desktop e uma no celular.
- Preservar pontuação, barra, recomendação em cache, atualização e check-in; apenas adequar os componentes para funcionarem no novo grid.
- Manter “AGENDA DO DIA” e a data atual por extenso acima das tarefas, com capitalização e formato em português.

## Assistente contextual
- Adicionar um modal global de conversa temporária, sem histórico no banco ou no navegador.
- Incluir um acesso global visível no dashboard e três atalhos na abertura: “🚨 O que fazer agora?”, “✨ Desconstruir tarefa atual” e “⚡ Descarregar ideia rápida”.
- Manter o campo de texto livre e respostas em Markdown.
- Adicionar “💬 Conversar sobre esta tarefa” aos cards existentes; ao clicar, abrir o mesmo modal com título, duração e energia da tarefa como contexto ativo.
- O atalho de desconstrução utilizará a tarefa contextual quando o chat for aberto por um card; sem tarefa selecionada, a IA orientará o usuário a partir da rotina e tarefas abertas.

## Comportamento da IA
- Enviar o histórico completo da conversa temporária em cada mensagem.
- Acrescentar ao contexto as tarefas abertas e, quando houver, a tarefa ativa.
- Aplicar no prompt: foco em TDAH, resposta fora de assunto em no máximo uma frase com ponte de volta, nenhuma pergunta aberta alheia e encerramento obrigatório com um micro-passo prático ligado à tarefa ativa ou rotina.
- Transmitir a resposta progressivamente, manter opção de interromper e exibir erros seguros sem reenvio automático.

## Detalhes técnicos
- Usar os elementos padronizados de conversa, mensagem Markdown e campo de envio, integrados ao modal e ao estilo roxo atual.
- Criar um endpoint interno de chat com validação das mensagens; chave, prompt e chamada de IA permanecem somente no servidor.
- Usar o modelo padrão `openai/gpt-6-astra` pela API Responses, com raciocínio e `store: false` conforme o contrato atual.
- Não criar ou alterar tabelas, políticas, autenticação ou persistência das conversas.
- Registrar somente a nova decisão arquitetural do chat temporário e manter as decisões anteriores intactas.

## Verificação
- Conferir desktop e celular: saudação, grid, agenda, modal, chips e botão em cada tarefa sem sobreposição.
- Testar abertura global e por tarefa, digitação livre, histórico no mesmo modal, resposta em Markdown, contexto da tarefa e interrupção.
- Testar uma mensagem fora de assunto para confirmar a resposta curta e a ponte de volta.
- Confirmar que atualizar a página limpa apenas o chat e preserva tarefas, check-in e recomendação existentes.
- Validar compilação, lint e ausência de erros na tela.
