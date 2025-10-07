// lib/supabase/client.ts
// Helper para ser usado em Client Components
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createSupabaseClient(url, anon, {
    auth: {
      // mantém sessão no browser; RLS protege os dados
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}