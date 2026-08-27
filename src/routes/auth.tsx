import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Brain, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar no LightFocus — foco para quem tem TDAH" },
      {
        name: "description",
        content:
          "Acesse sua conta do LightFocus para ver suas tarefas, check-ins e recomendações salvas.",
      },
      { property: "og:title", content: "Entrar no LightFocus" },
      {
        property: "og:description",
        content: "Acesse sua conta do LightFocus e continue de onde parou.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/" });
  }, [loading, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "entrar") {
        await signIn(email.trim(), password);
        toast.success("Bem-vindo de volta! 🙌");
        void navigate({ to: "/" });
      } else {
        const { needsConfirmation } = await signUp(email.trim(), password);
        if (needsConfirmation) {
          toast.success("Conta criada! Confirme o e-mail para entrar.");
          setMode("entrar");
        } else {
          toast.success("Conta criada. Vamos começar! ✨");
          void navigate({ to: "/" });
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível continuar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Brain className="h-6 w-6" />
          </div>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">LightFocus</h1>
          <p className="text-xs text-muted-foreground">Uma coisa de cada vez.</p>
        </div>

        <Card>
          <CardHeader className="space-y-3">
            <div>
              <CardTitle className="font-display text-lg">
                {mode === "entrar" ? "Entrar" : "Criar conta"}
              </CardTitle>
              <CardDescription>
                {mode === "entrar"
                  ? "Use seu e-mail e senha para acessar suas tarefas."
                  : "Crie sua conta para salvar tarefas e check-ins."}
              </CardDescription>
            </div>
            <Tabs value={mode} onValueChange={(v) => setMode(v as "entrar" | "criar")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="entrar">Entrar</TabsTrigger>
                <TabsTrigger value="criar">Criar conta</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="voce@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "entrar" ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="mínimo 6 caracteres"
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "entrar" ? "Entrar" : "Criar conta"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
