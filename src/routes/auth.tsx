import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import loginImage from "@/assets/saturnina-login.jpg";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { SaturnMark } from "@/components/saturnina/brand";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin — Saturnina" },
      { name: "description", content: "Acesso reservado à administração Saturnina." },
      { property: "og:title", content: "Admin — Saturnina" },
      { property: "og:description", content: "Acesso reservado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Auth,
});
function Auth() {
  const nav = useNavigate();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email || password.length < 6) {
      setMessage("Revise seu e-mail e sua senha.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage("Não foi possível entrar. Verifique seus dados.");
      setLoading(false);
      return;
    }
    await nav({ to: "/dashboard" });
  }
  async function reset() {
    const email = (document.querySelector<HTMLInputElement>("#admin-email")?.value ?? "").trim();
    if (!email) {
      setMessage("Informe seu e-mail para receber o acesso.");
      return;
    }
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setMessage("Enviamos as instruções para o seu e-mail.");
  }
  return (
    <main className="grid min-h-screen bg-primary text-primary-foreground md:grid-cols-[42%_58%]">
      <section className="order-2 flex min-h-[58vh] flex-col justify-between px-7 py-9 md:order-1 md:min-h-screen md:px-14 md:py-12">
        <div>
          <p className="font-display text-4xl">saturnina</p>
          <p className="mt-1 text-[10px] uppercase text-brand-pink">Admin</p>
        </div>
        <form onSubmit={submit} className="my-16 max-w-sm">
          <p className="mb-10 font-display text-4xl">Bem-vinda de volta.</p>
          <label className="block text-[10px] uppercase">
            E-mail
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={255}
              className="mt-2 w-full border-b border-primary-foreground/50 bg-transparent py-3 text-base outline-none"
            />
          </label>
          <label className="relative mt-8 block text-[10px] uppercase">
            Senha
            <input
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              required
              minLength={6}
              maxLength={128}
              className="mt-2 w-full border-b border-primary-foreground/50 bg-transparent py-3 pr-10 text-base outline-none"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label="Exibir senha"
              className="absolute -bottom-1 -right-2 flex size-11 items-center justify-center"
            >
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </label>
          <div className="my-7 flex items-center justify-between text-xs">
            <label className="flex min-h-11 items-center gap-2">
              <input type="checkbox" className="accent-brand-pink" />
              Lembrar de mim
            </label>
            <button
              type="button"
              onClick={reset}
              className="min-h-11 border-b border-primary-foreground/40"
            >
              Esqueci minha senha
            </button>
          </div>
          {message && (
            <p role="status" className="mb-4 text-sm text-brand-pink">
              {message}
            </p>
          )}
          <Button variant="soft" size="lg" className="w-full" disabled={loading}>
            {loading ? "ENTRANDO..." : "ENTRAR"}
          </Button>
        </form>
        <SaturnMark className="opacity-60" />
      </section>
      <section className="relative order-1 min-h-[42vh] md:order-2 md:min-h-screen">
        <img
          src={loginImage}
          width={1200}
          height={1600}
          alt="Retrato editorial Saturnina"
          className="absolute inset-0 h-full w-full object-cover image-veil"
        />
        <h1 className="absolute bottom-8 left-7 text-6xl leading-[.8] md:bottom-14 md:left-14 md:text-8xl">
          Beleza
          <br />
          que revela
          <br />
          <em>presença</em>
        </h1>
      </section>
    </main>
  );
}
