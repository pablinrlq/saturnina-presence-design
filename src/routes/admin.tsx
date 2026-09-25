import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SaturnMark } from "@/components/saturnina/brand";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Saturnina" },
      { name: "description", content: "Acesso ao painel administrativo Saturnina." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminEntry,
});

function AdminEntry() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    async function resolveDestination() {
      const { data } = await supabase.auth.getUser();
      if (!active) return;

      if (!data.user) {
        await navigate({ to: "/auth", replace: true });
        return;
      }

      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: data.user.id,
        _role: "admin",
      });

      await navigate({ to: isAdmin ? "/dashboard" : "/auth", replace: true });
    }

    void resolveDestination();
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <main className="admin-entry-page">
      <SaturnMark />
      <p>Preparando seu painel</p>
      <span aria-hidden="true" />
    </main>
  );
}
