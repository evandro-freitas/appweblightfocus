import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";
import { assistantPrompt } from "@/lib/assistant-prompt.server";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId, withLovableAiGatewayRunIdHeader } from "@/lib/ai-run-id.server";

const taskSchema = z.object({ title: z.string().max(300), estimatedMinutes: z.number(), energy: z.string().max(30) });
const requestSchema = z.object({
  messages: z.array(z.object({ id: z.string(), role: z.enum(["user", "assistant", "system"]), parts: z.array(z.any()) }).passthrough()).max(100),
  task: taskSchema.nullable(),
  openTasks: z.array(taskSchema).max(30),
});

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const parsed = requestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return new Response("Mensagem inválida.", { status: 400 });
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("A conversa não está configurada.", { status: 401 });

        const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
        const provider = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          fetch: runIdFetch.fetch,
        });
        const messages = parsed.data.messages as UIMessage[];
        const result = streamText({
          model: provider.responses("openai/gpt-6-astra"),
          system: assistantPrompt(parsed.data.task, parsed.data.openTasks),
          messages: await convertToModelMessages(messages),
          abortSignal: request.signal,
          providerOptions: { openai: { forceReasoning: true, reasoningEffort: "medium", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
        });
        return withLovableAiGatewayRunIdHeader(result.toUIMessageStreamResponse({
          originalMessages: messages,
          sendReasoning: true,
          onFinish: () => { /* conversa temporária: nada é salvo */ },
          onError: (error) => error instanceof Error ? error.message : "Não foi possível responder agora.",
        }), runIdFetch);
      },
    },
  },
});