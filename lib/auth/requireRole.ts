// lib/auth/requireRole.ts
import { redirect } from "next/navigation"
import { createSupabaseServer } from "@/lib/supabase/server"

export async function requireRole(allowed: Array<'staff'|'doctor'|'admin'>) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || !allowed.includes(profile.role as any)) redirect('/login')
  return { supabase, user, role: profile.role as 'staff'|'doctor'|'admin' }
}