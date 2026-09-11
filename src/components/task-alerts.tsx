import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { useTasks } from "@/lib/task-store";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

function notifyBrowser(title: string, body: string) {
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

function minutesUntil(milliseconds: number): number {
  return Math.max(1, Math.ceil(milliseconds / 60000));
}

export function TaskAlerts() {
  const { tasks } = useTasks();
  const notified = useRef(new Set<string>());

  useEffect(() => {
    function checkSchedules() {
      const now = Date.now();

      for (const task of tasks) {
        if (task.status === "concluida" || !task.dueAt) continue;
        const dueAt = new Date(task.dueAt).getTime();
        if (Number.isNaN(dueAt)) continue;

        const baseKey = `${task.id}:${task.dueAt}`;
        const untilStart = dueAt - now;

        if (untilStart > 0 && untilStart <= FIFTEEN_MINUTES) {
          const key = `${baseKey}:soon`;
          if (!notified.current.has(key)) {
            notified.current.add(key);
            const message = `Faltam ${minutesUntil(untilStart)} min para começar.`;
            toast.info(task.title, { description: message, duration: 10000 });
            notifyBrowser("LightFocus: prepare-se", `${task.title}. ${message}`);
          }
        }

        if (untilStart <= 0 && untilStart > -ONE_DAY) {
          const key = `${baseKey}:start`;
          if (!notified.current.has(key)) {
            notified.current.add(key);
            const message = "É hora de começar. Um primeiro passo já basta.";
            toast.info(task.title, { description: message, duration: 12000 });
            notifyBrowser("LightFocus: hora de começar", `${task.title}. ${message}`);
          }
        }
      }
    }

    checkSchedules();
    const interval = window.setInterval(checkSchedules, 30000);
    return () => window.clearInterval(interval);
  }, [tasks]);

  return null;
}
