import { newId, type Task } from "./tasks";

// Dados de exemplo — o app já inicia com 5 tarefas realistas para quem tem TDAH.
export function seedTasks(): Task[] {
  const now = new Date().toISOString();
  return [
    {
      id: newId(),
      title: "Responder e-mails pendentes",
      description: "Caixa de entrada está acumulando. Focar só nos que precisam de resposta hoje.",
      priority: "alta",
      status: "em_andamento",
      energy: "media",
      estimatedMinutes: 25,
      createdAt: now,
      completedAt: null,
      steps: [
        { id: newId(), title: "Abrir a caixa de entrada", done: true, position: 0 },
        { id: newId(), title: "Marcar os 5 e-mails mais urgentes", done: true, position: 1 },
        { id: newId(), title: "Responder o primeiro (rascunho curto)", done: false, position: 2 },
        { id: newId(), title: "Responder os demais, um de cada vez", done: false, position: 3 },
      ],
    },
    {
      id: newId(),
      title: "Preparar apresentação da reunião",
      description: "Slides para a reunião de sexta. Começar pelo esqueleto, sem caprichar no design ainda.",
      priority: "alta",
      status: "pendente",
      energy: "alta",
      estimatedMinutes: 60,
      createdAt: now,
      completedAt: null,
      steps: [],
    },
    {
      id: newId(),
      title: "Organizar a mesa de trabalho",
      description: "Limpar papéis e cabos para diminuir distrações visuais.",
      priority: "media",
      status: "pendente",
      energy: "baixa",
      estimatedMinutes: 15,
      createdAt: now,
      completedAt: null,
      steps: [],
    },
    {
      id: newId(),
      title: "Fazer compras da semana",
      description: "Lista no bloco de notas do celular. Ir fora do horário de pico.",
      priority: "media",
      status: "pendente",
      energy: "media",
      estimatedMinutes: 45,
      createdAt: now,
      completedAt: null,
      steps: [],
    },
    {
      id: newId(),
      title: "Lavar a louça acumulada",
      description: "Pia cheia desde ontem. Colocar um podcast e fazer em blocos de 10 minutos.",
      priority: "baixa",
      status: "concluida",
      energy: "baixa",
      estimatedMinutes: 10,
      createdAt: now,
      completedAt: now,
      steps: [],
    },
  ];
}
