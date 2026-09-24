import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminShell, adminInput, adminLabel, statusLabel, statusColor } from "@/components/saturnina/admin-shell";

export const Route = createFileRoute("/_authenticated/clientes")({
  head: () => ({ meta: [{ title: "Clientes — Saturnina Admin" }, { name: "description", content: "Cadastro e histórico de clientes Saturnina." }, { property: "og:title", content: "Clientes — Saturnina Admin" }, { property: "og:description", content: "CRM de clientes Saturnina." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Clientes,
});

const clientSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome").max(120),
  phone: z.string().trim().max(30),
  whatsapp: z.string().trim().max(30),
  email: z.union([z.literal(""), z.string().trim().email("E-mail inválido").max(255)]),
  birthday: z.string().optional(),
  preferences: z.string().trim().max(2000),
  notes: z.string().trim().max(2000),
});

function Clientes() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clients").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });
  const filtered = clients.filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(search.toLowerCase()));
  const current = clients.find((c) => c.id === selected) ?? null;

  const create = useMutation({
    mutationFn: async (v: z.infer<typeof clientSchema>) => {
      const { data, error } = await supabase.from("clients").insert({ ...v, birthday: v.birthday || null }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (c) => { qc.invalidateQueries({ queryKey: ["clients"] }); setCreating(false); setSelected(c.id); toast.success("Cliente cadastrada."); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminShell eyebrow="Relacionamento" title="Clientes" actions={<Button variant="soft" onClick={() => setCreating(true)}><Plus />Nova cliente</Button>}>
      <div className="grid gap-10 xl:grid-cols-[1fr_1.3fr]">
        <section>
          <label className="flex items-center gap-3 border-b border-primary-foreground/25 pb-2">
            <Search size={16} className="text-primary-foreground/40" />
            <span className="sr-only">Buscar cliente</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, e-mail ou telefone" className="w-full bg-transparent text-sm outline-none placeholder:text-primary-foreground/30" />
          </label>
          <ul className="mt-4">
            {isLoading && <li className="py-6 text-sm text-primary-foreground/50">Carregando…</li>}
            {!isLoading && filtered.length === 0 && <li className="py-10 text-sm text-primary-foreground/50">Nenhuma cliente encontrada. Cadastre a primeira em “Nova cliente”.</li>}
            {filtered.map((c) => (
              <li key={c.id}>
                <button onClick={() => setSelected(c.id)} className={`flex w-full items-baseline justify-between border-b border-primary-foreground/10 px-2 py-4 text-left transition-colors hover:bg-primary-foreground/5 ${selected === c.id ? "bg-primary" : ""}`}>
                  <span className="font-display text-xl">{c.name}</span>
                  <span className="text-xs text-primary-foreground/50">{c.phone || c.email}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section>{current ? <ClientDetail key={current.id} client={current} /> : <p className="border border-primary-foreground/10 p-10 text-sm text-primary-foreground/50">Selecione uma cliente para ver histórico, preferências e observações.</p>}</section>
      </div>
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="border-primary-foreground/10 bg-brand-ink text-primary-foreground">
          <DialogHeader><DialogTitle className="font-display text-3xl font-normal">Nova cliente</DialogTitle></DialogHeader>
          <ClientForm submitting={create.isPending} onSubmit={(v) => create.mutate(v)} />
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}

type Client = { id: string; name: string; phone: string; whatsapp: string; email: string; birthday: string | null; preferences: string; notes: string };

function ClientForm({ initial, submitting, onSubmit }: { initial?: Partial<Client>; submitting: boolean; onSubmit: (v: z.infer<typeof clientSchema>) => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  function handle(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const r = clientSchema.safeParse(f);
    if (!r.success) { setErrors(Object.fromEntries(r.error.issues.map((i) => [i.path[0], i.message]))); return; }
    setErrors({});
    onSubmit(r.data);
  }
  const field = (name: keyof Client, label: string, type = "text") => (
    <label className="block"><span className={adminLabel}>{label}</span><input name={name} type={type} defaultValue={(initial?.[name] as string) ?? ""} className={adminInput} aria-invalid={!!errors[name]} />{errors[name] && <span className="text-xs text-brand-pink">{errors[name]}</span>}</label>
  );
  return (
    <form onSubmit={handle} className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">{field("name", "Nome")}</div>
      {field("phone", "Telefone", "tel")}
      {field("whatsapp", "WhatsApp", "tel")}
      {field("email", "E-mail", "email")}
      {field("birthday", "Aniversário", "date")}
      <label className="sm:col-span-2"><span className={adminLabel}>Preferências</span><textarea name="preferences" rows={2} defaultValue={initial?.preferences ?? ""} className={adminInput} /></label>
      <label className="sm:col-span-2"><span className={adminLabel}>Observações</span><textarea name="notes" rows={2} defaultValue={initial?.notes ?? ""} className={adminInput} /></label>
      <Button type="submit" variant="soft" disabled={submitting} className="sm:col-span-2">{submitting ? "Salvando…" : "Salvar"}</Button>
    </form>
  );
}

function ClientDetail({ client }: { client: Client }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["client-history", client.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("appointments").select("id, starts_at, status, notes, services(name), professionals(name)").eq("client_id", client.id).order("starts_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const update = useMutation({
    mutationFn: async (v: z.infer<typeof clientSchema>) => {
      const { error } = await supabase.from("clients").update({ ...v, birthday: v.birthday || null }).eq("id", client.id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["clients"] }); setEditing(false); toast.success("Dados atualizados."); },
    onError: (e: Error) => toast.error(e.message),
  });
  const done = history.filter((h) => h.status === "completed");
  const upcoming = history.filter((h) => new Date(h.starts_at) > new Date() && h.status !== "cancelled").at(-1);
  const fmt = (d: string) => new Date(d).toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-display text-4xl">{client.name}</h2>
        <Button variant="ghost" size="sm" onClick={() => setEditing((e) => !e)}>{editing ? "Fechar" : "Editar"}</Button>
      </div>
      {editing ? <div className="mt-6"><ClientForm initial={client} submitting={update.isPending} onSubmit={(v) => update.mutate(v)} /></div> : (
        <>
          <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
            {[["Telefone", client.phone], ["WhatsApp", client.whatsapp], ["E-mail", client.email], ["Aniversário", client.birthday ? new Date(client.birthday + "T12:00").toLocaleDateString("pt-BR") : ""], ["Próximo atendimento", upcoming ? fmt(upcoming.starts_at) : ""], ["Serviços realizados", String(done.length)]].map(([k, v]) => (
              <div key={k}><dt className={adminLabel}>{k}</dt><dd className="mt-1">{v || "—"}</dd></div>
            ))}
          </dl>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div className="bg-primary p-5"><p className={adminLabel}>Preferências</p><p className="mt-2 whitespace-pre-wrap text-sm">{client.preferences || "Nenhuma preferência registrada."}</p></div>
            <div className="border border-primary-foreground/15 p-5"><p className={adminLabel}>Observações</p><p className="mt-2 whitespace-pre-wrap text-sm">{client.notes || "Nenhuma observação."}</p></div>
          </div>
        </>
      )}
      <h3 className="mt-10 text-2xl">Histórico de agendamentos</h3>
      <div className="mt-4 border-t border-primary-foreground/20">
        {isLoading && <p className="py-4 text-sm text-primary-foreground/50">Carregando…</p>}
        {!isLoading && history.length === 0 && <p className="py-6 text-sm text-primary-foreground/50">Sem agendamentos vinculados.</p>}
        {history.map((h) => (
          <div key={h.id} className="grid grid-cols-[1fr_auto] gap-2 border-b border-primary-foreground/10 py-4 text-sm sm:grid-cols-[160px_1fr_1fr_100px]">
            <span className="text-primary-foreground/60">{fmt(h.starts_at)}</span>
            <span>{h.services?.name ?? "Serviço"}</span>
            <span className="hidden text-primary-foreground/50 sm:block">{h.professionals?.name ?? "—"}</span>
            <span className={`text-xs ${statusColor[h.status]}`}>{statusLabel[h.status]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
