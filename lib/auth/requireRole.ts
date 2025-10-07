// lib/auth/requireRole.ts
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export type Role = 'user' | 'staff' | 'doctor' | 'admin';

export default async function requireRole(allowed: Role[]) {
  const supabase = createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile || !allowed.includes(profile.role as Role)) {
    redirect("/login?e=forbidden");
  }

  return { user, role: profile.role as Role, supabase };
}