import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nova senha — Saturnina" },
      { name: "description", content: "Crie uma nova senha para seu acesso." },
      { property: "og:title", content: "Nova senha — Saturnina" },
      { property: "og:description", content: "Recuperação de acesso." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reset,
});
function Reset() {
  const [message, setMessage] = useState("");
  const [recovery, setRecovery] = useState(false);
  useEffect(() => {
    setRecovery(window.location.hash.includes("type=recovery"));
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!recovery) {
      setMessage("Este link não é válido. Solicite um novo acesso.");
      return;
    }
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    if (password.length < 8) {
      setMessage("Use pelo menos 8 caracteres.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    setMessage(
      error
        ? "Não foi possível atualizar. Solicite um novo link."
        : "Senha atualizada. Você já pode entrar.",
    );
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-primary px-5 text-primary-foreground">
      <form onSubmit={submit} className="w-full max-w-sm">
        <p className="font-display text-4xl">saturnina</p>
        <h1 className="mt-20 text-6xl">Nova senha.</h1>
        <label className="mt-12 block text-xs uppercase">
          Senha
          <input
            name="password"
            type="password"
            minLength={8}
            maxLength={128}
            required
            className="mt-2 w-full border-b bg-transparent py-3"
          />
        </label>
        {message && <p className="mt-5 text-sm text-brand-pink">{message}</p>}
        <Button variant="soft" size="lg" className="mt-8 w-full">
          SALVAR SENHA
        </Button>
        <Link to="/auth" className="mt-5 block text-center text-xs">
          Voltar ao acesso
        </Link>
      </form>
    </main>
  );
}
