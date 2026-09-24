import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, AlertCircle } from "lucide-react";
import { AdminShell } from "@/components/saturnina/admin-shell";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Visão geral — Saturnina Admin" }, { name: "description", content: "Painel administrativo Saturnina." }, { property: "og:title", content: "Saturnina Admin" }, { property: "og:description", content: "Visão geral operacional." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <AdminShell eyebrow="Quarta-feira, 23 de setembro" title="Boa tarde, Fernanda.">
      <div className="grid gap-px bg-primary-foreground/10 sm:grid-cols-2 xl:grid-cols-4">
        {[["Experiências hoje", "08"], ["Faturamento do dia", "R$ 4.280"], ["Novas clientes", "05"], ["Horários disponíveis", "12"]].map(([a, b]) => (
          <article key={a} className="bg-brand-ink p-6"><p className="text-xs text-primary-foreground/50">{a}</p><p className="mt-8 font-display text-5xl">{b}</p></article>
        ))}
      </div>
      <div className="mt-10 grid gap-8 xl:grid-cols-[1.6fr_1fr]">
        <section>
          <div className="mb-5 flex items-center justify-between"><h2 className="text-3xl">Agenda de hoje</h2><Link to="/agenda" className="text-xs uppercase text-brand-pink">Ver agenda</Link></div>
          <div className="border-t border-primary-foreground/20">
            {[["09:00", "Helena Costa", "Corte & forma", "Confirmado"], ["11:30", "Sofia Mendes", "Coloração autoral", "Pendente"], ["14:00", "Marina Lima", "Tratamento ritual", "Confirmado"], ["16:30", "Ana Clara", "Finalização", "Confirmado"]].map((r) => (
              <div key={r[0]} className="grid grid-cols-[60px_1fr] gap-4 border-b border-primary-foreground/10 py-5 sm:grid-cols-[70px_1fr_1fr_100px]"><span className="font-display text-xl">{r[0]}</span><span>{r[1]}</span><span className="hidden text-primary-foreground/50 sm:block">{r[2]}</span><span className="text-xs text-brand-pink">{r[3]}</span></div>
            ))}
          </div>
        </section>
        <aside className="bg-primary p-7"><p className="text-xs uppercase text-brand-pink">Próximo atendimento</p><p className="mt-8 font-display text-5xl">09:00</p><p className="mt-3 text-xl">Helena Costa</p><p className="mt-1 text-sm text-primary-foreground/60">Corte & forma · Fernanda</p><div className="mt-12 border-t border-primary-foreground/20 pt-6"><p className="flex items-center gap-2 text-sm"><Clock size={16} /> Em 32 minutos</p></div></aside>
      </div>
      <div className="mt-10 flex items-center gap-3 border border-brand-rose/40 p-5 text-sm"><AlertCircle size={18} className="text-brand-pink" /><span>2 confirmações aguardando retorno para amanhã.</span></div>
    </AdminShell>
  );
}
