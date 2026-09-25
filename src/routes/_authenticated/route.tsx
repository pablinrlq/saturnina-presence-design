import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getEnvAdminSession } from "@/lib/admin-auth.functions";
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const envSession = await getEnvAdminSession();
    if (envSession.authenticated) {
      return { authMode: "env" as const, user: null };
    }
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      await supabase.auth.signOut();
      throw redirect({ to: "/auth" });
    }
    return { authMode: "supabase" as const, user: data.user };
  },
  component: () => <Outlet />,
});
