import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, Send, Square } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import type { Task } from "@/lib/tasks";

const globalPrompts = [
  "🚨 O que fazer agora?",
  "✨ Desconstruir tarefa atual",
  "⚡ Descarregar ideia rápida",
];
type TaskContext = Pick<Task, "id" | "title" | "estimatedMinutes" | "energy" | "steps">;

function taskPrompts(task: TaskContext) {
  return [
    "✨ Qual o primeiro micro-passo de 2 minutos?",
    `⏱️ Como dividir esses ${task.estimatedMinutes} minutos em etapas sem me cansar?`,
    "🛡️ O que fazer se eu sentir resistência para começar?",
    "🧩 Desconstruir os passos desta tarefa",
  ];
}

export function AssistantDialog({
  open,
  onOpenChange,
  task,
  tasks,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskContext | null;
  tasks: Task[];
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prompts = task ? taskPrompts(task) : globalPrompts;
  const taskPayload = useMemo(
    () =>
      task
        ? {
            title: task.title,
            estimatedMinutes: task.estimatedMinutes,
            energy: task.energy,
            completedSteps: task.steps.filter((s) => s.done).map((s) => s.title),
            pendingSteps: task.steps.filter((s) => !s.done).map((s) => s.title),
          }
        : null,
    [task],
  );
  const openTasks = useMemo(
    () =>
      task
        ? []
        : tasks
            .filter((t) => t.status !== "concluida")
            .map((t) => ({
              title: t.title,
              estimatedMinutes: t.estimatedMinutes,
              energy: t.energy,
            })),
    [tasks, task],
  );
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { task: taskPayload, openTasks },
      }),
    [taskPayload, openTasks],
  );
  const { messages, sendMessage, status, stop, error } = useChat({
    id: task ? `task-${task.id}` : "global",
    transport,
    onError: (err) => toast.error(err.message || "Não foi possível responder agora."),
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (open && !busy) textareaRef.current?.focus();
  }, [open, busy]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    void sendMessage({ text: trimmed });
    setInput("");
    textareaRef.current?.focus();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(85dvh,680px)] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4">
          <DialogTitle className="flex items-center gap-2 font-display">
            <MessageCircle className="size-5 text-primary" /> Conversar com LightFocus
          </DialogTitle>
          {task && (
            <p className="text-left text-xs text-muted-foreground">
              {task.title} · {task.estimatedMinutes} min · energia {task.energy}
            </p>
          )}
        </DialogHeader>
        <Conversation className="min-h-0">
          <ConversationContent className="gap-4 px-5 py-5">
            {messages.length === 0 && (
              <div className="space-y-4 py-5">
                <p className="text-sm text-muted-foreground">
                  {task
                    ? `Vamos dar um passo em “${task.title}”.`
                    : "Qual é o próximo passo para você?"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {prompts.map((prompt) => (
                    <Button
                      type="button"
                      key={prompt}
                      variant="outline"
                      size="sm"
                      className="h-auto whitespace-normal text-left"
                      disabled={busy}
                      onClick={() => send(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent
                  className={message.role === "user" ? "bg-primary text-primary-foreground" : ""}
                >
                  {message.parts.map((part, i) =>
                    part.type === "text" ? (
                      <MessageResponse key={i}>{part.text}</MessageResponse>
                    ) : part.type === "reasoning" ? null : (
                      <span key={i} className="text-xs text-muted-foreground">
                        {part.type.startsWith("tool-") ? "Consultando…" : ""}
                      </span>
                    ),
                  )}
                </MessageContent>
              </Message>
            ))}
            {status === "submitted" && (
              <p role="status" className="text-sm text-muted-foreground">
                Pensando no próximo passo…
              </p>
            )}
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error.message}
              </p>
            )}
          </ConversationContent>
          <ConversationScrollButton aria-label="Ir para a última mensagem" />
        </Conversation>
        <div className="shrink-0 border-t border-border bg-background p-4">
          <PromptInput onSubmit={({ text }) => send(text)}>
            <PromptInputBody>
              <PromptInputTextarea
                ref={textareaRef}
                aria-label="Sua mensagem"
                placeholder="Escreva o que quiser…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <span className="text-xs text-muted-foreground">Um passo de cada vez</span>
              <PromptInputSubmit
                status={status}
                onStop={() => void stop()}
                disabled={!busy && !input.trim()}
                aria-label={busy ? "Parar resposta" : "Enviar mensagem"}
                className="size-8 shrink-0"
              >
                {busy ? <Square className="size-4" /> : <Send className="size-4" />}
              </PromptInputSubmit>
            </PromptInputFooter>
          </PromptInput>
        </div>
      </DialogContent>
    </Dialog>
  );
}
