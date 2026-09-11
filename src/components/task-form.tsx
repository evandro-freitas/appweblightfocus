import { useState } from "react";
import { CalendarClock, Plus, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { decomposeTask } from "@/lib/ai.functions";
import { useServerFn } from "@tanstack/react-start";
import { EMPTY_RECURRENCE, WEEKDAY_LABELS, type Task, type TaskInput } from "@/lib/tasks";

const emptyInput: TaskInput = {
  title: "",
  description: "",
  priority: "media",
  status: "pendente",
  energy: "media",
  estimatedMinutes: 25,
  dueAt: null,
  recurrence: EMPTY_RECURRENCE,
};

function toDateTimeLocal(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface TaskFormProps {
  onSubmit: (input: TaskInput, steps?: string[]) => void;
  editingTask?: Task | null;
  onCancel?: () => void;
  trigger?: React.ReactNode;
}

export function TaskForm({ onSubmit, editingTask, onCancel, trigger }: TaskFormProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState<TaskInput>(
    editingTask ? { ...editingTask, recurrence: editingTask.recurrence ?? EMPTY_RECURRENCE } : emptyInput,
  );
  const [isDecomposing, setIsDecomposing] = useState(false);
  const decompose = useServerFn(decomposeTask);

  const isEditing = Boolean(editingTask);
  const recurrence = input.recurrence;
  const recurrenceReady = recurrence.frequency !== "weekly" || recurrence.weekdays.length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.title.trim() || !recurrenceReady) return;
    onSubmit(input);
    if (!isEditing) {
      setInput(emptyInput);
      setOpen(false);
    } else {
      onCancel?.();
    }
  }

  async function handleDecompose() {
    if (!input.title.trim()) return;
    setIsDecomposing(true);
    try {
      const result = await decompose({
        data: {
          title: input.title,
          description: input.description,
          estimatedMinutes: input.estimatedMinutes,
        },
      });
      onSubmit(input, result.steps);
      setInput(emptyInput);
      setOpen(false);
    } finally {
      setIsDecomposing(false);
    }
  }

  const formBody = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={input.title}
          onChange={(e) => setInput((i) => ({ ...i, title: e.target.value }))}
          placeholder="Ex: Responder e-mails pendentes"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={input.description}
          onChange={(e) => setInput((i) => ({ ...i, description: e.target.value }))}
          placeholder="O que precisa ser feito? (opcional)"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select
            value={input.priority}
            onValueChange={(v) => setInput((i) => ({ ...i, priority: v as TaskInput["priority"] }))}
          >
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="energy">Energia necessária</Label>
          <Select
            value={input.energy}
            onValueChange={(v) => setInput((i) => ({ ...i, energy: v as TaskInput["energy"] }))}
          >
            <SelectTrigger id="energy">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="media">Média</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="minutes">Tempo estimado (minutos)</Label>
        <Input
          id="minutes"
          type="number"
          min={5}
          max={480}
          value={input.estimatedMinutes}
          onChange={(e) =>
            setInput((i) => ({ ...i, estimatedMinutes: Number(e.target.value) || 5 }))
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="due-at">Quando começar?</Label>
        <Input
          id="due-at"
          type="datetime-local"
          value={toDateTimeLocal(input.dueAt)}
          onChange={(event) =>
            setInput((current) => ({
              ...current,
              dueAt: event.target.value ? new Date(event.target.value).toISOString() : null,
            }))
          }
        />
        <p className="text-xs text-muted-foreground">Você receberá um aviso 15 minutos antes e outro na hora.</p>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-secondary/30 p-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          <div>
            <Label htmlFor="recurrence">Repetição</Label>
            <p className="text-xs text-muted-foreground">Para rotinas que voltam sem recriar a tarefa.</p>
          </div>
        </div>
        <Select
          value={recurrence.frequency}
          onValueChange={(value) =>
            setInput((current) => ({
              ...current,
              recurrence: {
                ...current.recurrence,
                frequency: value as TaskInput["recurrence"]["frequency"],
                weekdays: value === "weekly" ? current.recurrence.weekdays : [],
                dayOfMonth: value === "monthly" ? current.recurrence.dayOfMonth ?? 1 : null,
              },
            }))
          }
        >
          <SelectTrigger id="recurrence"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Não se repete</SelectItem>
            <SelectItem value="weekly">Toda semana</SelectItem>
            <SelectItem value="monthly">Todo mês</SelectItem>
          </SelectContent>
        </Select>

        {recurrence.frequency === "weekly" && (
          <div className="space-y-2">
            <Label>Dias da semana</Label>
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAY_LABELS.map((day, index) => {
                const selected = recurrence.weekdays.includes(index);
                return (
                  <Button
                    key={day}
                    type="button"
                    size="sm"
                    variant={selected ? "default" : "outline"}
                    className="px-1 text-xs"
                    onClick={() =>
                      setInput((current) => ({
                        ...current,
                        recurrence: {
                          ...current.recurrence,
                          weekdays: selected
                            ? current.recurrence.weekdays.filter((value) => value !== index)
                            : [...current.recurrence.weekdays, index].sort(),
                        },
                      }))
                    }
                  >
                    {day}
                  </Button>
                );
              })}
            </div>
            {!recurrenceReady && <p className="text-xs text-destructive">Escolha pelo menos um dia.</p>}
          </div>
        )}

        {recurrence.frequency === "monthly" && (
          <div className="space-y-2">
            <Label htmlFor="month-day">Dia do mês</Label>
            <Input
              id="month-day"
              type="number"
              min={1}
              max={31}
              value={recurrence.dayOfMonth ?? 1}
              onChange={(event) =>
                setInput((current) => ({
                  ...current,
                  recurrence: {
                    ...current.recurrence,
                    dayOfMonth: Math.min(31, Math.max(1, Number(event.target.value) || 1)),
                  },
                }))
              }
            />
            <p className="text-xs text-muted-foreground">Em meses sem esse dia, usamos o último dia do mês.</p>
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        {isEditing ? (
          <>
            <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Salvar alterações
            </Button>
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleDecompose}
              disabled={isDecomposing || !input.title.trim() || !recurrenceReady}
              className="w-full gap-1.5 sm:w-auto"
            >
              <Sparkles className="h-4 w-4" />
              {isDecomposing ? "Decompondo..." : "Decompor com IA"}
            </Button>
            <Button type="submit" disabled={!input.title.trim() || !recurrenceReady} className="w-full sm:w-auto">
              Adicionar tarefa
            </Button>
          </>
        )}
      </div>
    </form>
  );

  if (isEditing) {
    return (
      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardContent className="p-4">{formBody}</CardContent>
      </Card>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova tarefa
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova tarefa</DialogTitle>
        </DialogHeader>
        {formBody}
      </DialogContent>
    </Dialog>
  );
}
