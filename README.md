# Remix of Focus Flow Manager

Crie o MVP funcional de uma aplicação web responsiva.

Propósito e Função do App:

Função do Sistema: O sistema é um gerenciador de tarefas para pessoas com TDAH.

Problema que Resolve: Ele serve para ajudar o usuário a quebrar tarefas complexas em passos simples sem se sentir sobrecarregado.

Fluxo Principal do Usuário: O usuário entra no app, visualiza suas tarefas do dia no dashboard], clica para adicionar um novo item ou marcar como concluído e recebe um feedback visual de progresso.

Funcionalidades Core (Obrigatórias):

Lista/Grid principal exibindo os itens cadastrados com busca por texto e filtro.

Formulário simples (modal ou página) para Criar e Editar registros, Título, Descrição, Prioridade, Status).

Ação rápida para excluir um registro ou alterar seu status (ex: marcar como concluído) com confirmação.

Layout e experiência do usuário:

Design clean e moderno, com suporte nativo a Dark Mode.

Navegação via barra superior (Navbar) ou lateral (Sidebar) simples.

Destaque visual para o botão principal de ação (ex: "+ Criar Novo").

Estado e Dados (CRUD Operacional):

Adicione dados de exemplo (mock) para o sistema já iniciar com 3 a 5 registros preenchidos.

O CRUD deve funcionar imediatamente em memória (adicionar, editar, listar e deletar atualizando a tela na hora).

Notificações tipo "Toast" para confirmação de ações (ex: "Registro salvo com sucesso!").

O app/web utilizará o supabase externo, não utilizara o lovable cloud

Preciso que crie os sql necessarios das tabelas

Este mvp sera apenas o inicio e depois iremos ampliar mais de momento preciso apenas de um mvp

Será necessario utilizar IA para auxiliar na decomposição das tarefas. 
Qual energia, humor, prioridades da tarefa e baseado nas repostas ela defini qual tarefa é a mais apropriada para o momento.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/805fc30e-09c2-4795-ae8d-51b82b9e2055).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
