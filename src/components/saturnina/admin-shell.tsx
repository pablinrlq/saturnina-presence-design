import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  CalendarDays,
  Users,
  LayoutDashboard,
  Sparkles,
  LogOut,
  Scissors,
  Gem,
  Package,
  Wallet,
  FileText,
  Settings,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { logoutEnvAdmin } from "@/lib/admin-auth.functions";

const links = [
  { to: "/dashboard", label: "Visão geral", Icon: LayoutDashboard },
  { to: "/agenda", label: "Agenda", Icon: CalendarDays },
  { to: "/clientes", label: "Clientes", Icon: Users },
  { to: "/assistente", label: "Assistente", Icon: Sparkles },
] as const;
const soon = [
  ["Serviços", Scissors],
  ["Saturn Club", Gem],
  ["Produtos", Package],
  ["Financeiro", Wallet],
  ["Conteúdo do site", FileText],
  ["Configurações", Settings],
] as const;

export function AdminShell({
  title,
  eyebrow,
  children,
  actions,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await logoutEnvAdmin();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }
  return (
    <main className="min-h-screen bg-brand-ink text-primary-foreground md:grid md:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-primary-foreground/10 p-7 md:flex md:flex-col">
        <p className="font-display text-3xl">saturnina</p>
        <p className="text-[9px] uppercase text-brand-pink">Admin</p>
        <nav className="mt-14 flex-1 space-y-1" aria-label="Administração">
          {links.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-3 py-3 text-sm text-primary-foreground/60 hover:text-primary-foreground"
              activeProps={{ className: "bg-primary !text-primary-foreground" }}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <div className="pt-6">
            {soon.map(([label, Icon]) => (
              <span
                key={label}
                className="flex items-center gap-3 px-3 py-2 text-xs text-primary-foreground/30"
              >
                <Icon size={14} />
                {label}
              </span>
            ))}
          </div>
        </nav>
        <Button variant="ghost" onClick={signOut}>
          <LogOut />
          Sair
        </Button>
      </aside>
      <div className="min-w-0">
        <nav
          className="flex gap-1 overflow-x-auto border-b border-primary-foreground/10 px-4 md:hidden"
          aria-label="Administração"
        >
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="whitespace-nowrap px-3 py-4 text-sm text-primary-foreground/60"
              activeProps={{ className: "!text-brand-pink" }}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={signOut}
            className="ml-auto px-3 text-primary-foreground/60"
            aria-label="Sair"
          >
            <LogOut size={16} />
          </button>
        </nav>
        <section className="p-5 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              {eyebrow && <p className="text-xs uppercase text-brand-pink">{eyebrow}</p>}
              <h1 className="mt-3 text-5xl md:text-6xl">{title}</h1>
            </div>
            {actions}
          </div>
          <div className="mt-10">{children}</div>
        </section>
      </div>
    </main>
  );
}

export const adminInput =
  "w-full border-0 border-b border-primary-foreground/25 bg-transparent py-2 text-sm text-primary-foreground outline-none placeholder:text-primary-foreground/30 focus:border-brand-pink";
export const adminLabel = "block text-[10px] uppercase tracking-widest text-primary-foreground/50";

export const statusLabel: Record<string, string> = {
  confirmed: "Confirmado",
  pending: "Pendente",
  completed: "Concluído",
  cancelled: "Cancelado",
};
export const statusColor: Record<string, string> = {
  confirmed: "text-brand-pink",
  pending: "text-brand-rose",
  completed: "text-primary-foreground/50",
  cancelled: "text-primary-foreground/30 line-through",
};
