import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { seedTasks } from "./mock-tasks";
import { isSupabaseConfigured, supabaseExternal } from "./supabase-external";
import { newId, type Status, type Task, type TaskInput, type TaskStep } from "./tasks";

// ---------------------------------------------------------------------------
// Reducer (CRUD em memória — atualiza a tela na hora)
// ---------------------------------------------------------------------------

type Action =
  | { type: "hydrate"; tasks: Task[] }
  | { type: "add"; task: Task }
  | { type: "update"; id: string; input: TaskInput }
  | { type: "remove"; id: string }
  | { type: "setStatus"; id: string; status: Status }
  | { type: "toggleStep"; taskId: string; stepId: string }
  | { type: "setSteps"; taskId: string; steps: TaskStep[] };

function reducer(state: Task[], action: Action): Task[] {
  switch (action.type) {
    case "hydrate":
      return action.tasks;
    case "add":
      return [action.task, ...state];
    case "update":
      return state.map((t) => (t.id === action.id ? { ...t, ...action.input } : t));
    case "remove":
      return state.filter((t) => t.id !== action.id);
    case "setStatus":
      return state.map((t) =>
        t.id === action.id
          ? {
              ...t,
              status: action.status,
              completedAt: action.status === "concluida" ? new Date().toISOString() : null,
              steps:
                action.status === "concluida"
                  ? t.steps.map((s) => ({ ...s, done: true }))
                  : t.steps,
            }
          : t,
      );
    case "toggleStep":
      return state.map((t) =>
        t.id === action.taskId
          ? {
              ...t,
              steps: t.steps.map((s) => (s.id === action.stepId ? { ...s, done: !s.done } : s)),
            }
          : t,
      );
    case "setSteps":
      return state.map((t) => (t.id === action.taskId ? { ...t, steps: action.steps } : t));
  }
}

// ---------------------------------------------------------------------------
// Sincronização opcional com o Supabase externo (fire-and-forget)
// ---------------------------------------------------------------------------

function taskToRow(t: Task) {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority,
    status: t.status,
    energy: t.energy,
    estimated_minutes: t.estimatedMinutes,
    created_at: t.createdAt,
    completed_at: t.completedAt,
  };
}

function stepsToRows(t: Task) {
  return t.steps.map((s) => ({
    id: s.id,
    task_id: t.id,
    title: s.title,
    done: s.done,
    position: s.position,
  }));
}

function mirrorSave(task: Task) {
  if (!supabaseExternal) return;
  void (async () => {
    await supabaseExternal.from("tasks").upsert(taskToRow(task));
    await supabaseExternal.from("task_steps").delete().eq("task_id", task.id);
    const rows = stepsToRows(task);
    if (rows.length > 0) await supabaseExternal.from("task_steps").insert(rows);
  })().catch((e) => console.error("Supabase sync:", e));
}

function mirrorDelete(id: string) {
  if (!supabaseExternal) return;
  void (async () => {
    await supabaseExternal.from("tasks").delete().eq("id", id);
  })().catch((e: unknown) => console.error("Supabase sync:", e));
}

async function loadFromDb(): Promise<Task[] | null> {
  if (!supabaseExternal) return null;
  try {
    const { data: rows, error } = await supabaseExternal
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    // Banco vazio na primeira vez: popula com os dados de exemplo
    if (!rows || rows.length === 0) {
      const seeds = seedTasks();
      await supabaseExternal.from("tasks").insert(seeds.map(taskToRow));
      const allSteps = seeds.flatMap(stepsToRows);
      if (allSteps.length > 0) await supabaseExternal.from("task_steps").insert(allSteps);
      return seeds;
    }

    const ids = rows.map((r) => r.id as string);
    const { data: stepRows } = await supabaseExternal
      .from("task_steps")
      .select("*")
      .in("task_id", ids)
      .order("position", { ascending: true });

    return rows.map((r) => ({
      id: r.id as string,
      title: r.title as string,
      description: (r.description as string) ?? "",
      priority: r.priority as Task["priority"],
      status: r.status as Task["status"],
      energy: r.energy as Task["energy"],
      estimatedMinutes: (r.estimated_minutes as number) ?? 15,
      createdAt: r.created_at as string,
      completedAt: (r.completed_at as string) ?? null,
      steps: (stepRows ?? [])
        .filter((s) => s.task_id === r.id)
        .map((s) => ({
          id: s.id as string,
          title: s.title as string,
          done: Boolean(s.done),
          position: (s.position as number) ?? 0,
        })),
    }));
  } catch (e) {
    console.error("Supabase load:", e);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Provider + hook
// ---------------------------------------------------------------------------

interface TasksContextValue {
  tasks: Task[];
  addTask: (input: TaskInput) => void;
  updateTask: (id: string, input: TaskInput) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  startTask: (id: string) => void;
  toggleStep: (taskId: string, stepId: string) => void;
  setSteps: (taskId: string, stepTitles: string[]) => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, dispatch] = useReducer(reducer, undefined, () => seedTasks());

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;
    void loadFromDb().then((dbTasks) => {
      if (!cancelled && dbTasks) dispatch({ type: "hydrate", tasks: dbTasks });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const find = useCallback((id: string) => tasks.find((t) => t.id === id), [tasks]);

  const addTask = useCallback((input: TaskInput) => {
    const task: Task = {
      ...input,
      id: newId(),
      createdAt: new Date().toISOString(),
      completedAt: input.status === "concluida" ? new Date().toISOString() : null,
      steps: [],
    };
    dispatch({ type: "add", task });
    mirrorSave(task);
    toast.success("Tarefa criada com sucesso!");
    return task.id;
  }, []);

  const updateTask = useCallback(
    (id: string, input: TaskInput) => {
      dispatch({ type: "update", id, input });
      const t = find(id);
      if (t) mirrorSave({ ...t, ...input });
      toast.success("Tarefa atualizada!");
    },
    [find],
  );

  const deleteTask = useCallback((id: string) => {
    dispatch({ type: "remove", id });
    mirrorDelete(id);
    toast.success("Tarefa excluída.");
  }, []);

  const toggleComplete = useCallback(
    (id: string) => {
      const t = find(id);
      if (!t) return;
      const next: Status = t.status === "concluida" ? "pendente" : "concluida";
      dispatch({ type: "setStatus", id, status: next });
      const updated = { ...t, status: next, completedAt: next === "concluida" ? new Date().toISOString() : null };
      mirrorSave(updated);
      if (next === "concluida") {
        toast.success("Tarefa concluída! Mandou bem. 🎉");
      } else {
        toast.info("Tarefa reaberta.");
      }
    },
    [find],
  );

  const startTask = useCallback(
    (id: string) => {
      const t = find(id);
      if (!t || t.status === "em_andamento") return;
      dispatch({ type: "setStatus", id, status: "em_andamento" });
      mirrorSave({ ...t, status: "em_andamento" });
      toast.success("Boa! Foco total nessa tarefa. 💪");
    },
    [find],
  );

  const toggleStep = useCallback(
    (taskId: string, stepId: string) => {
      dispatch({ type: "toggleStep", taskId, stepId });
      const t = find(taskId);
      if (t) {
        mirrorSave({
          ...t,
          steps: t.steps.map((s) => (s.id === stepId ? { ...s, done: !s.done } : s)),
        });
      }
    },
    [find],
  );

  const setSteps = useCallback(
    (taskId: string, stepTitles: string[]) => {
      const steps: TaskStep[] = stepTitles.map((title, i) => ({
        id: newId(),
        title,
        done: false,
        position: i,
      }));
      dispatch({ type: "setSteps", taskId, steps });
      const t = find(taskId);
      if (t) mirrorSave({ ...t, steps });
      toast.success("Tarefa decomposta em micro-passos!");
    },
    [find],
  );

  const value = useMemo(
    () => ({ tasks, addTask, updateTask, deleteTask, toggleComplete, startTask, toggleStep, setSteps }),
    [tasks, addTask, updateTask, deleteTask, toggleComplete, startTask, toggleStep, setSteps],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks(): TasksContextValue {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks deve ser usado dentro de <TasksProvider>");
  return ctx;
}
