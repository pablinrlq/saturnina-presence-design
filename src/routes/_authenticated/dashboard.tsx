import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, ArrowUpRight, CalendarDays, Clock, Users } from "lucide-react";
import { AdminShell, statusColor, statusLabel } from "@/components/saturnina/admin-shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Visão geral — Saturnina Admin" },
      { name: "description", content: "Painel administrativo Saturnina." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Dashboard,
});

type Appointment = {
  id: string;
  client_name: string;
  starts_at: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  services: { name: string; price_cents: number | null } | null;
  professionals: { name: string } | null;
};

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

function Dashboard() {
  const { authMode } = Route.useRouteContext();
  const today = new Date();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard-overview", start.toISOString()],
    queryFn: async () => {
      if (authMode === "env") {
        return { appointments: [] as Appointment[], clientsCount: 0, displayName: "Saturnina" };
      }
      const [appointmentsResult, clientsResult, profileResult] = await Promise.all([
        supabase
          .from("appointments")
          .select(
            "id, client_name, starts_at, status, services(name, price_cents), professionals(name)",
          )
          .gte("starts_at", start.toISOString())
          .lt("starts_at", end.toISOString())
          .order("starts_at"),
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.auth.getUser(),
      ]);

      if (appointmentsResult.error) throw appointmentsResult.error;
      if (clientsResult.error) throw clientsResult.error;

      let displayName = "Equipe Saturnina";
      const user = profileResult.data.user;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .maybeSingle();
        displayName = profile?.display_name?.trim() || user.email?.split("@")[0] || displayName;
      }

      return {
        appointments: (appointmentsResult.data ?? []) as Appointment[],
        clientsCount: clientsResult.count ?? 0,
        displayName,
      };
    },
  });

  const appointments = data?.appointments ?? [];
  const activeAppointments = appointments.filter((item) => item.status !== "cancelled");
  const pendingCount = appointments.filter((item) => item.status === "pending").length;
  const confirmedCount = appointments.filter((item) => item.status === "confirmed").length;
  const revenue = appointments
    .filter((item) => item.status === "confirmed" || item.status === "completed")
    .reduce((total, item) => total + (item.services?.price_cents ?? 0), 0);
  const nextAppointment = activeAppointments.find(
    (item) => new Date(item.starts_at).getTime() >= Date.now(),
  );
  const firstName = data?.displayName.split(" ")[0] ?? "Saturnina";
  const dateLabel = today.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <AdminShell
      eyebrow={dateLabel}
      title={`Olá, ${firstName}.`}
      actions={
        <Link to="/agenda" className="admin-top-action">
          <CalendarDays size={16} /> Nova reserva
        </Link>
      }
    >
      {error && (
        <div className="admin-feedback" role="alert">
          <AlertCircle size={18} />
          <span>Não foi possível carregar os dados do painel.</span>
          <button type="button" onClick={() => void refetch()}>
            Tentar novamente
          </button>
        </div>
      )}

      <div className="admin-metric-grid" aria-busy={isLoading}>
        {[
          [
            "Experiências hoje",
            isLoading ? "—" : String(activeAppointments.length).padStart(2, "0"),
          ],
          ["Confirmadas", isLoading ? "—" : String(confirmedCount).padStart(2, "0")],
          [
            "Clientes cadastradas",
            isLoading ? "—" : String(data?.clientsCount ?? 0).padStart(2, "0"),
          ],
          [
            "Faturamento previsto",
            isLoading
              ? "—"
              : (revenue / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
          ],
        ].map(([label, value], index) => (
          <article key={label}>
            <span>0{index + 1}</span>
            <p>{label}</p>
            <strong>{value}</strong>
          </article>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-agenda-panel">
          <div className="admin-panel-heading">
            <div>
              <p>OPERAÇÃO DE HOJE</p>
              <h2>Agenda</h2>
            </div>
            <Link to="/agenda">
              Ver agenda completa <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="admin-appointment-list">
            {!isLoading && activeAppointments.length === 0 && (
              <div className="admin-empty-state">
                <CalendarDays size={24} />
                <p>Nenhuma experiência agendada para hoje.</p>
                <Link to="/agenda">Criar uma reserva</Link>
              </div>
            )}
            {activeAppointments.slice(0, 6).map((appointment) => (
              <article key={appointment.id}>
                <time>{formatTime(appointment.starts_at)}</time>
                <div>
                  <strong>{appointment.client_name}</strong>
                  <small>
                    {appointment.services?.name ?? "Experiência Saturnina"}
                    {appointment.professionals?.name ? ` · ${appointment.professionals.name}` : ""}
                  </small>
                </div>
                <span className={statusColor[appointment.status]}>
                  {statusLabel[appointment.status]}
                </span>
              </article>
            ))}
          </div>
        </section>

        <aside className="admin-next-panel">
          <p>PRÓXIMA EXPERIÊNCIA</p>
          {nextAppointment ? (
            <>
              <time>{formatTime(nextAppointment.starts_at)}</time>
              <h2>{nextAppointment.client_name}</h2>
              <span>{nextAppointment.services?.name ?? "Experiência Saturnina"}</span>
              <div>
                <Clock size={17} />
                {nextAppointment.professionals?.name ?? "Profissional a definir"}
              </div>
            </>
          ) : (
            <div className="admin-next-empty">
              <span>Agenda livre</span>
              <p>Não há próximos atendimentos para hoje.</p>
            </div>
          )}
        </aside>
      </div>

      <div className="admin-bottom-row">
        <div className="admin-pending-note">
          <AlertCircle size={18} />
          <span>
            {pendingCount === 0
              ? "Todas as experiências de hoje estão organizadas."
              : `${pendingCount} ${pendingCount === 1 ? "confirmação aguarda" : "confirmações aguardam"} retorno hoje.`}
          </span>
        </div>
        <Link to="/clientes" className="admin-client-link">
          <Users size={17} /> Ver clientes <ArrowRight size={15} />
        </Link>
      </div>
    </AdminShell>
  );
}
