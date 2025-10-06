// lib/auth/requireRole.ts
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

export type Role = "staff" | "doctor" | "admin";

/**
 * Garante que o usuário está autenticado e possui um dos perfis permitidos.
 * Retorna o supabase server client, o user e o role.
 */
async function requireRole(allowed: Role[]) {
  const supabase = createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    // se der erro lendo o perfil, trata como não autorizado
    redirect("/login");
  }

  const role = (profile?.role ?? null) as Role | null;

  if (!role || !allowed.includes(role)) {
    redirect("/login");
  }

  return { supabase, user, role };
}

// ✅ Exporta dos dois jeitos para compatibilidade
export { requireRole };
export default requireRole;