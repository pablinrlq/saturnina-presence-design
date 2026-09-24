import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AdminShell, adminLabel } from "@/components/saturnina/admin-shell";
import { summarizeSituation } from "@/lib/ai-summary.functions";

export const Route = createFileRoute("/_authenticated/assistente")({
  head: () => ({ meta: [{ title: "Assistente — Saturnina Admin" }, { name: "description", content: "Resumo inteligente de situações de atendimento." }, { property: "og:title", content: "Assistente — Saturnina Admin" }, { property: "og:description", content: "Resumos e próximos passos com IA." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Assistente,
});

const prio = { baixa: "Prioridade baixa", media: "Prioridade média", alta: "Prioridade alta" } as const;

function Assistente() {
  const [text, setText] = useState("");
  const fn = useServerFn(summarizeSituation);
  const run = useMutation({ mutationFn: (situation: string) => fn({ data: { situation } }), onError: (e: Error) => toast.error(e.message) });
  const r = run.data;
  return (
    <AdminShell eyebrow="Inteligência de atendimento" title="Assistente">
      <div className="grid gap-10 xl:grid-cols-2">
        <form onSubmit={(e) => { e.preventDefault(); run.mutate(text); }}>
          <label htmlFor="situation" className={adminLabel}>Descreva a situação</label>
          <textarea id="situation" value={text} onChange={(e) => setText(e.target.value)} maxLength={4000} rows={12} placeholder="Ex.: Helena chegou 20 minutos atrasada, a coloração precisou ser encurtada e ela saiu insatisfeita com o tom…" className="mt-3 w-full resize-y border border-primary-foreground/20 bg-transparent p-4 text-sm outline-none placeholder:text-primary-foreground/30 focus:border-brand-pink" />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-primary-foreground/40">{text.length}/4000</span>
            <Button type="submit" variant="soft" disabled={run.isPending || text.trim().length < 10}><Sparkles />{run.isPending ? "Gerando…" : "Gerar resumo"}</Button>
          </div>
        </form>
        <section aria-live="polite" className="bg-primary p-7">
          {run.isPending && <p className="animate-pulse text-sm text-primary-foreground/70">Analisando o atendimento…</p>}
          {!run.isPending && !r && <p className="text-sm text-primary-foreground/60">O resumo e os próximos passos aparecerão aqui.</p>}
          {!run.isPending && r && (
            <div>
              <p className="text-xs uppercase text-brand-pink">{prio[r.prioridade]}</p>
              <p className="mt-4 font-display text-2xl leading-snug">{r.resumo}</p>
              <h2 className="mt-8 text-xl">Próximos passos</h2>
              <ol className="mt-3 space-y-2 text-sm">{r.proximos_passos.map((s, i) => <li key={i} className="flex gap-3"><span className="font-display text-brand-pink">{String(i + 1).padStart(2, "0")}</span>{s}</li>)}</ol>
              <div className="mt-8 border-t border-primary-foreground/20 pt-5">
                <div className="flex items-center justify-between"><p className={adminLabel}>Mensagem sugerida</p><button onClick={() => { navigator.clipboard.writeText(r.mensagem_sugerida); toast.success("Copiada."); }} className="text-primary-foreground/60 hover:text-primary-foreground" aria-label="Copiar mensagem"><Copy size={14} /></button></div>
                <p className="mt-2 whitespace-pre-wrap text-sm">{r.mensagem_sugerida}</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
