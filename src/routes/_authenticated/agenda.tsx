import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Check, X, CalendarClock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AdminShell,
  adminInput,
  adminLabel,
  statusLabel,
  statusColor,
} from "@/components/saturnina/admin-shell";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda — Saturnina Admin" },
      { name: "description", content: "Agenda administrativa Saturnina por dia e semana." },
      { property: "og:title", content: "Agenda — Saturnina Admin" },
      { property: "og:description", content: "Reservas, disponibilidade e status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Agenda,
});

const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};
const toLocalInput = (iso: string) => {
  const d = new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
const time = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

type Appt = {
  id: string;
  starts_at: string;
  status: string;
  client_name: string;
  notes: string;
  professional_id: string | null;
  services: { name: string } | null;
  professionals: { name: string } | null;
};

function Agenda() {
  const qc = useQueryClient();
  const [view, setView] = useState<"day" | "week">("day");
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
  const [reschedule, setReschedule] = useState<Appt | null>(null);
  const [creating, setCreating] = useState(false);
  const start = view === "day" ? anchor : addDays(anchor, -anchor.getDay());
  const days = view === "day" ? [start] : Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const end = addDays(start, days.length);

  const { data: appts = [], isLoading } = useQuery({
    queryKey: ["appointments", start.toISOString(), view],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          "id, starts_at, status, client_name, notes, professional_id, services(name), professionals(name)",
        )
        .gte("starts_at", start.toISOString())
        .lt("starts_at", end.toISOString())
        .order("starts_at");
      if (error) throw error;
      return data as Appt[];
    },
  });
  const { data: pros = [] } = useQuery({
    queryKey: ["pros-availability"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professionals")
        .select("id, name, professional_availability(id, weekday, start_time, end_time)")
        .eq("is_active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "confirmed" | "cancelled" | "completed";
    }) => {
      const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      toast.success(`Reserva ${statusLabel[v.status].toLowerCase()}.`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const move = useMutation({
    mutationFn: async ({ id, starts_at }: { id: string; starts_at: string }) => {
      const { error } = await supabase
        .from("appointments")
        .update({ starts_at, status: "pending" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      setReschedule(null);
      toast.success("Reserva remarcada — aguardando confirmação.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const label =
    view === "day"
      ? anchor.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
      : `${start.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} – ${addDays(end, -1).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}`;

  return (
    <AdminShell
      eyebrow="Operação"
      title="Agenda"
      actions={
        <Button variant="soft" onClick={() => setCreating(true)}>
          <Plus />
          Nova reserva
        </Button>
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-primary-foreground/15 pb-5">
        <div className="flex items-center gap-2">
          <Button
            variant="iconGhost"
            size="icon"
            aria-label="Anterior"
            onClick={() => setAnchor(addDays(anchor, view === "day" ? -1 : -7))}
          >
            <ChevronLeft />
          </Button>
          <p className="min-w-52 text-center font-display text-2xl capitalize">{label}</p>
          <Button
            variant="iconGhost"
            size="icon"
            aria-label="Próximo"
            onClick={() => setAnchor(addDays(anchor, view === "day" ? 1 : 7))}
          >
            <ChevronRight />
          </Button>
          <button
            className="ml-2 text-xs uppercase text-brand-pink"
            onClick={() => setAnchor(startOfDay(new Date()))}
          >
            Hoje
          </button>
        </div>
        <div role="tablist" className="flex border border-primary-foreground/20">
          {(["day", "week"] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={`px-5 py-2 text-xs uppercase ${view === v ? "bg-primary" : "text-primary-foreground/60"}`}
            >
              {v === "day" ? "Dia" : "Semana"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-10 xl:grid-cols-[1fr_300px]">
        <div
          className={view === "week" ? "grid gap-px bg-primary-foreground/10 md:grid-cols-7" : ""}
        >
          {days.map((d) => {
            const list = appts.filter(
              (a) => startOfDay(new Date(a.starts_at)).getTime() === d.getTime(),
            );
            return (
              <div
                key={d.toISOString()}
                className={view === "week" ? "min-h-40 bg-brand-ink p-3" : ""}
              >
                {view === "week" && (
                  <p className="mb-3 text-xs uppercase text-primary-foreground/50">
                    {weekdays[d.getDay()]}{" "}
                    <span className="font-display text-lg text-primary-foreground">
                      {d.getDate()}
                    </span>
                  </p>
                )}
                {isLoading && <p className="text-sm text-primary-foreground/40">…</p>}
                {!isLoading && list.length === 0 && (
                  <p className="py-4 text-xs text-primary-foreground/40">
                    {view === "day" ? "Nenhuma reserva neste dia." : "Livre"}
                  </p>
                )}
                {list.map((a) =>
                  view === "week" ? (
                    <button
                      key={a.id}
                      onClick={() => {
                        setView("day");
                        setAnchor(startOfDay(new Date(a.starts_at)));
                      }}
                      className="mb-2 block w-full border-l-2 border-primary px-2 py-1 text-left text-xs hover:bg-primary-foreground/5"
                    >
                      <span className="block font-display text-sm">{time(a.starts_at)}</span>
                      <span className="block truncate">{a.client_name}</span>
                      <span className={statusColor[a.status]}>{statusLabel[a.status]}</span>
                    </button>
                  ) : (
                    <article
                      key={a.id}
                      className="grid gap-3 border-b border-primary-foreground/10 py-5 sm:grid-cols-[70px_1fr_auto] sm:items-center"
                    >
                      <span className="font-display text-2xl">{time(a.starts_at)}</span>
                      <div>
                        <p>{a.client_name}</p>
                        <p className="text-sm text-primary-foreground/50">
                          {a.services?.name ?? "Serviço"} ·{" "}
                          {a.professionals?.name ?? "Sem profissional"}
                        </p>
                        <p className={`mt-1 text-xs ${statusColor[a.status]}`}>
                          {statusLabel[a.status]}
                        </p>
                      </div>
                      {a.status !== "cancelled" && a.status !== "completed" && (
                        <div className="flex flex-wrap gap-1">
                          {a.status === "pending" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setStatus.mutate({ id: a.id, status: "confirmed" })}
                            >
                              <Check />
                              Confirmar
                            </Button>
                          )}
                          {a.status === "confirmed" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setStatus.mutate({ id: a.id, status: "completed" })}
                            >
                              <Check />
                              Concluir
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => setReschedule(a)}>
                            <CalendarClock />
                            Remarcar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-brand-pink"
                            onClick={() => {
                              if (confirm(`Cancelar a reserva de ${a.client_name}?`))
                                setStatus.mutate({ id: a.id, status: "cancelled" });
                            }}
                          >
                            <X />
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </article>
                  ),
                )}
              </div>
            );
          })}
        </div>
        <Availability pros={pros} days={days} />
      </div>

      <Dialog open={!!reschedule} onOpenChange={(o) => !o && setReschedule(null)}>
        <DialogContent className="border-primary-foreground/10 bg-brand-ink text-primary-foreground">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl font-normal">
              Remarcar reserva
            </DialogTitle>
          </DialogHeader>
          {reschedule && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const v = String(new FormData(e.currentTarget).get("when"));
                if (!v) return;
                move.mutate({ id: reschedule.id, starts_at: new Date(v).toISOString() });
              }}
              className="space-y-6"
            >
              <p className="text-sm text-primary-foreground/60">
                {reschedule.client_name} · {reschedule.services?.name}
              </p>
              <label className="block">
                <span className={adminLabel}>Nova data e horário</span>
                <input
                  name="when"
                  type="datetime-local"
                  required
                  defaultValue={toLocalInput(reschedule.starts_at)}
                  className={adminInput}
                />
              </label>
              <Button type="submit" variant="soft" className="w-full" disabled={move.isPending}>
                {move.isPending ? "Salvando…" : "Remarcar"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <NewAppointment open={creating} onOpenChange={setCreating} pros={pros} />
    </AdminShell>
  );
}

type Pro = {
  id: string;
  name: string;
  professional_availability: {
    id: string;
    weekday: number;
    start_time: string;
    end_time: string;
  }[];
};

function Availability({ pros, days }: { pros: Pro[]; days: Date[] }) {
  const qc = useQueryClient();
  const wds = new Set(days.map((d) => d.getDay()));
  const add = useMutation({
    mutationFn: async (v: {
      professional_id: string;
      weekday: number;
      start_time: string;
      end_time: string;
    }) => {
      const { error } = await supabase.from("professional_availability").insert(v);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pros-availability"] });
      toast.success("Disponibilidade adicionada.");
    },
    onError: (e: Error) =>
      toast.error(
        e.message.includes("check") ? "O horário final deve ser depois do inicial." : e.message,
      ),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("professional_availability").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pros-availability"] }),
  });
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    add.mutate({
      professional_id: String(f.get("pro")),
      weekday: Number(f.get("weekday")),
      start_time: String(f.get("start")),
      end_time: String(f.get("end")),
    });
  }
  return (
    <aside className="bg-primary p-6">
      <h2 className="text-2xl">Disponibilidade</h2>
      {pros.length === 0 && (
        <p className="mt-4 text-sm text-primary-foreground/60">
          Nenhuma profissional ativa cadastrada.
        </p>
      )}
      <ul className="mt-5 space-y-5">
        {pros.map((p) => {
          const slots = p.professional_availability
            .filter((s) => wds.has(s.weekday))
            .sort((a, b) => a.weekday - b.weekday || a.start_time.localeCompare(b.start_time));
          return (
            <li key={p.id}>
              <p className="font-display text-xl">{p.name}</p>
              {slots.length === 0 ? (
                <p className="text-xs text-primary-foreground/50">Indisponível no período</p>
              ) : (
                slots.map((s) => (
                  <p
                    key={s.id}
                    className="flex items-center justify-between text-xs text-primary-foreground/80"
                  >
                    <span>
                      {weekdays[s.weekday]} · {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                    </span>
                    <button
                      aria-label="Remover horário"
                      onClick={() => remove.mutate(s.id)}
                      className="text-primary-foreground/50 hover:text-brand-pink"
                    >
                      <X size={12} />
                    </button>
                  </p>
                ))
              )}
            </li>
          );
        })}
      </ul>
      {pros.length > 0 && (
        <form
          onSubmit={submit}
          className="mt-8 space-y-4 border-t border-primary-foreground/20 pt-5"
        >
          <p className={adminLabel}>Adicionar horário</p>
          <select name="pro" aria-label="Profissional" className={adminInput}>
            {pros.map((p) => (
              <option key={p.id} value={p.id} className="bg-brand-ink">
                {p.name}
              </option>
            ))}
          </select>
          <select name="weekday" aria-label="Dia da semana" className={adminInput}>
            {weekdays.map((w, i) => (
              <option key={w} value={i} className="bg-brand-ink">
                {w}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              name="start"
              type="time"
              required
              aria-label="Início"
              defaultValue="09:00"
              className={adminInput}
            />
            <input
              name="end"
              type="time"
              required
              aria-label="Fim"
              defaultValue="18:00"
              className={adminInput}
            />
          </div>
          <Button
            type="submit"
            variant="soft"
            size="sm"
            className="w-full"
            disabled={add.isPending}
          >
            Adicionar
          </Button>
        </form>
      )}
    </aside>
  );
}

function NewAppointment({
  open,
  onOpenChange,
  pros,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  pros: Pro[];
}) {
  const qc = useQueryClient();
  const { data: services = [] } = useQuery({
    queryKey: ["services-admin"],
    queryFn: async () => {
      const { data } = await supabase
        .from("services")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      return data ?? [];
    },
  });
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await supabase.from("clients").select("*").order("name");
      return data ?? [];
    },
  });
  const create = useMutation({
    mutationFn: async (f: FormData) => {
      const client = clients.find((c) => c.id === f.get("client"));
      if (!client) throw new Error("Selecione uma cliente.");
      const when = String(f.get("when"));
      if (!when) throw new Error("Informe data e horário.");
      const { error } = await supabase.from("appointments").insert({
        client_id: client.id,
        client_name: client.name,
        client_email: client.email,
        client_phone: client.phone || client.whatsapp,
        service_id: (f.get("service") as string) || null,
        professional_id: (f.get("pro") as string) || null,
        starts_at: new Date(when).toISOString(),
        status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
      onOpenChange(false);
      toast.success("Reserva criada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-primary-foreground/10 bg-brand-ink text-primary-foreground">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl font-normal">Nova reserva</DialogTitle>
        </DialogHeader>
        {clients.length === 0 ? (
          <p className="text-sm text-primary-foreground/60">
            Cadastre uma cliente antes de criar reservas.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate(new FormData(e.currentTarget));
            }}
            className="space-y-5"
          >
            <label className="block">
              <span className={adminLabel}>Cliente</span>
              <select name="client" className={adminInput}>
                {clients.map((c) => (
                  <option key={c.id} value={c.id} className="bg-brand-ink">
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={adminLabel}>Serviço</span>
              <select name="service" className={adminInput}>
                <option value="" className="bg-brand-ink">
                  A definir
                </option>
                {services.map((s) => (
                  <option key={s.id} value={s.id} className="bg-brand-ink">
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={adminLabel}>Profissional</span>
              <select name="pro" className={adminInput}>
                <option value="" className="bg-brand-ink">
                  A definir
                </option>
                {pros.map((p) => (
                  <option key={p.id} value={p.id} className="bg-brand-ink">
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={adminLabel}>Data e horário</span>
              <input name="when" type="datetime-local" required className={adminInput} />
            </label>
            <Button type="submit" variant="soft" className="w-full" disabled={create.isPending}>
              {create.isPending ? "Salvando…" : "Criar reserva"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
