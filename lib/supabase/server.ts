// lib/supabase/server.ts
// Helper para ser usado em Server Components / Server Actions / Route Handlers
import { cookies } from 'next/headers';
import { createServerClient as createSSRClient } from '@supabase/ssr';

export function createServerClient() {
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createSSRClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        // Em Server Actions/Route Handlers o cookie é mutável
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });
}