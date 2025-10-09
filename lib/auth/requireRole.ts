// lib/auth/requireRole.ts
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createSupabaseServer } from '@/lib/supabase/server';

export type Role = 'admin' | 'staff' | 'doctor';

export default async function requireRole(roles: Role[] = []) {
  const supabase = createSupabaseServer();

  // garante que cookies sejam atualizados
  const { data: { user } } = await supabase.auth.getUser();

  // path atual p/ montar ?next=
  const h = headers();
  const url = new URL(h.get('x-url') ?? h.get('referer') ?? '/', 'https://dummy');
  const nextPath = url.pathname || '/';

  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);

  // checa papel em profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || (roles.length && !roles.includes(profile.role))) {
    redirect(`/login?forbidden=1&next=${encodeURIComponent(nextPath)}`);
  }

  return { supabase, user, role: profile.role as Role };
}