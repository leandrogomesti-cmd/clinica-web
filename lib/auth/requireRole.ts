// lib/auth/requireRole.ts
import { redirect } from "next/navigation";
import { serverSupabase } from "@/lib/supabase/server";

export type Role = "staff" | "doctor" | "admin";

// implementa como função "normal"
async function requireRole(roles: Role[]) {
  const supabase = serverSupabase();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data: ok, error } = await supabase.rpc("klinikia_has_role", { roles });

  if (error) {
    console.error("klinikia_has_role error:", error);
    redirect("/login");
  }

  if (!ok) {
    redirect("/login");
  }

  // devolve o user caso a página queira usar
  return session.user;
}

// exporta dos dois jeitos para compatibilidade
export default requireRole;
export { requireRole };