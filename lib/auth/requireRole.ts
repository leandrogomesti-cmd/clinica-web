// lib/auth/requireRole.ts
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseServer } from "@/lib/supabase/server";

export type AppRole = "staff" | "doctor" | "admin";

/**
 * Garante que o usuário esteja autenticado e com uma das roles permitidas.
 * Redireciona para /login se não cumprir os requisitos.
 * Retorna { user, profile, supabase } para uso na página/ação.
 */
export default async function requireRole(
  roles: AppRole[] = ["staff", "doctor", "admin"]
): Promise<{
  user: User;
  profile: { id: string; role: string | null; full_name: string | null } | null;
  supabase: ReturnType<typeof createSupabaseServer>;
}> {
  const supabase = createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    redirect("/login");
  }

  if (!profile || !profile.role || !roles.includes(profile.role as AppRole)) {
    redirect("/login");
  }

  return { user: user!, profile, supabase };
}