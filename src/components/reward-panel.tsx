import { useEffect, useRef, useState } from "react";
import { Sparkles, Star, Trophy } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import type { Task } from "@/lib/tasks";

interface RewardPanelProps {
  tasks: Task[];
}

export function RewardPanel({ tasks }: RewardPanelProps) {
  const completed = tasks.filter((task) => task.status === "concluida").length;
  const points = completed * 10;
  const milestone = Math.max(50, (Math.floor(points / 50) + 1) * 50);
  const progress = Math.min(100, Math.round((points / milestone) * 100));
  const previousCompleted = useRef(completed);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (completed > previousCompleted.current) {
      setCelebrating(true);
      toast.success("Tarefa concluída", {
        description: "+10 pontos. Progresso real também conta.",
      });
      const timeout = window.setTimeout(() => setCelebrating(false), 1600);
      previousCompleted.current = completed;
      return () => window.clearTimeout(timeout);
    }
    previousCompleted.current = completed;
  }, [completed]);

  return (
    <Card className="relative mt-4 overflow-hidden border-accent/40 bg-accent/10">
      {celebrating && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => (
            <span key={index} className={`confetti confetti-${(index % 6) + 1}`} />
          ))}
        </div>
      )}
      <CardContent className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-accent p-2.5 text-accent-foreground">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-display font-semibold">Seu progresso</p>
              <Sparkles className="h-3.5 w-3.5 text-accent-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              Cada tarefa concluída vale 10 pontos. Sem cobrança, só reconhecimento.
            </p>
          </div>
        </div>
        <div className="min-w-44">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 font-medium">
              <Star className="h-3.5 w-3.5 text-accent-foreground" />
              {points} pontos
            </span>
            <span className="text-muted-foreground">próximo marco: {milestone}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-background/70">
            <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
