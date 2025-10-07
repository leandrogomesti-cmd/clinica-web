// lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient as _createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createSupabaseServer() {
  const store = cookies();
  return _createServerClient(url, key, {
    cookies: {
      get: (name) => store.get(name)?.value,
      set: (name, value, options) => {
        store.set({ name, value, ...options });
      },
      remove: (name, options) => {
        store.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });
}

// ✅ re-exporta para manter compatibilidade com arquivos que importam { createServerClient } de '@/lib/supabase/server'
export { _createServerClient as createServerClient };