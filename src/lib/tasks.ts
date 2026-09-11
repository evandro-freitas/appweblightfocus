// Tipos e rótulos do domínio de tarefas (LightFocus)

export type Priority = "baixa" | "media" | "alta";
export type Status = "pendente" | "em_andamento" | "concluida";
export type Energy = "baixa" | "media" | "alta";
export type Mood = "otimo" | "bem" | "neutro" | "ansioso" | "sobrecarregado";
export type RecurrenceFrequency = "none" | "weekly" | "monthly";

export interface TaskRecurrence {
  frequency: RecurrenceFrequency;
  weekdays: number[];
  dayOfMonth: number | null;
}

export interface TaskStep {
  id: string;
  title: string;
  done: boolean;
  position: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  energy: Energy;
  estimatedMinutes: number;
  createdAt: string;
  completedAt: string | null;
  startedAt?: string | null;
  dueAt: string | null;
  recurrence: TaskRecurrence;
  steps: TaskStep[];
}

export interface CheckIn {
  energy: Energy;
  mood: Mood;
  availableMinutes: number;
  /** Prioridades do dia, em texto livre (opcional). */
  priorities?: string | undefined;
}

export interface TaskInput {
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  energy: Energy;
  estimatedMinutes: number;
  recurrence: TaskRecurrence;
}

export const EMPTY_RECURRENCE: TaskRecurrence = {
  frequency: "none",
  weekdays: [],
  dayOfMonth: null,
};

export const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function recurrenceLabel(recurrence: TaskRecurrence): string | null {
  if (recurrence.frequency === "weekly") {
    return `Toda semana · ${recurrence.weekdays.map((day) => WEEKDAY_LABELS[day]).join(", ")}`;
  }
  if (recurrence.frequency === "monthly" && recurrence.dayOfMonth) {
    return `Todo mês · dia ${recurrence.dayOfMonth}`;
  }
  return null;
}

export function nextRecurrenceDate(recurrence: TaskRecurrence, from = new Date()): string | null {
  if (recurrence.frequency === "weekly") {
    for (let offset = 0; offset <= 7; offset += 1) {
      const candidate = new Date(from);
      candidate.setDate(candidate.getDate() + offset);
      candidate.setHours(9, 0, 0, 0);
      if (candidate > from && recurrence.weekdays.includes(candidate.getDay())) {
        return candidate.toISOString();
      }
    }
  }

  if (recurrence.frequency === "monthly" && recurrence.dayOfMonth) {
    const candidate = new Date(from);
    const targetMonth = candidate.getMonth() + (candidate.getDate() >= recurrence.dayOfMonth ? 1 : 0);
    candidate.setMonth(targetMonth, 1);
    const lastDay = new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0).getDate();
    candidate.setDate(Math.min(recurrence.dayOfMonth, lastDay));
    candidate.setHours(9, 0, 0, 0);
    return candidate.toISOString();
  }

  return null;
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

export const STATUS_LABELS: Record<Status, string> = {
  pendente: "Pendente",
  em_andamento: "Em andamento",
  concluida: "Concluída",
};

export const ENERGY_LABELS: Record<Energy, string> = {
  baixa: "Energia baixa",
  media: "Energia média",
  alta: "Energia alta",
};

export const MOOD_LABELS: Record<Mood, string> = {
  otimo: "Ótimo",
  bem: "Bem",
  neutro: "Neutro",
  ansioso: "Ansioso",
  sobrecarregado: "Sobrecarregado",
};

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
