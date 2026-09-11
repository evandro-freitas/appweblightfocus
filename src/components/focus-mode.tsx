import { useEffect, useState } from "react";
import { Check, Pause, Play, RotateCcw, TimerReset, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Task } from "@/lib/tasks";

const DURATIONS = [5, 15, 25, 45];

interface FocusModeProps {
  task: Task | null;
  onClose: () => void;
  onComplete: (id: string) => void;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remaining = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remaining}`;
}

export function FocusMode({ task, onClose, onComplete }: FocusModeProps) {
  const [duration, setDuration] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(duration * 60);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (!task) return;
    setDuration(25);
    setSecondsLeft(25 * 60);
    setRunning(true);
  }, [task?.id]);

  useEffect(() => {
    if (!task || !running || secondsLeft <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [task, running, secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0) setRunning(false);
  }, [secondsLeft]);

  function changeDuration(next: number) {
    setDuration(next);
    setSecondsLeft(next * 60);
    setRunning(true);
  }

  function resetTimer() {
    setSecondsLeft(duration * 60);
    setRunning(true);
  }

  return (
    <Dialog open={Boolean(task)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="overflow-hidden border-primary/30 p-0 sm:max-w-xl">
        <div className="bg-primary/8 px-6 pb-8 pt-6 sm:px-10 sm:pb-10 sm:pt-8">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <DialogTitle className="text-sm font-medium text-primary">Modo Foco</DialogTitle>
              <Button variant="ghost" size="icon" onClick={onClose} aria-label="Sair do modo foco">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {task && (
            <div className="mt-8 text-center">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Uma coisa de cada vez
              </p>
              <h2 className="mx-auto mt-3 max-w-lg font-display text-3xl font-bold leading-tight sm:text-4xl">
                {task.title}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                {secondsLeft === 0
                  ? "Bloco encerrado. Registre o que avançou ou continue mais um pouco."
                  : "Você não precisa terminar tudo agora. Só precisa ficar com esta tarefa."}
              </p>

              <div className="mx-auto mt-8 flex max-w-xs items-center justify-center rounded-3xl border border-primary/15 bg-background/70 px-6 py-7 shadow-sm">
                <span className="font-display text-7xl font-semibold tabular-nums tracking-tight">
                  {formatTime(secondsLeft)}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {DURATIONS.map((minutes) => (
                  <Button
                    key={minutes}
                    type="button"
                    size="sm"
                    variant={duration === minutes ? "default" : "outline"}
                    onClick={() => changeDuration(minutes)}
                  >
                    {minutes} min
                  </Button>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  size="lg"
                  variant={running ? "outline" : "default"}
                  onClick={() => setRunning((current) => !current)}
                  className="min-w-36 gap-2"
                >
                  {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {running ? "Pausar" : "Retomar"}
                </Button>
                <Button type="button" size="lg" variant="ghost" onClick={resetTimer} aria-label="Reiniciar timer">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button type="button" size="lg" onClick={() => onComplete(task.id)} className="gap-2">
                  <Check className="h-4 w-4" />
                  Concluir tarefa
                </Button>
              </div>

              <p className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground">
                <TimerReset className="h-3.5 w-3.5" />
                O timer é flexível: terminar antes também conta como progresso.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}