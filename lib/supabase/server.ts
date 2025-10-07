// lib/supabase/server.ts
import { cookies } from "next/headers";
import { createServerClient as _createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function cookieMethods() {
  const store = cookies();
  return {
    get: (name: string) => store.get(name)?.value,
    set: (name: string, value: string, options?: any) => {
      store.set({ name, value, ...options });
    },
    remove: (name: string, options?: any) => {
      store.set({ name, value: "", ...options, maxAge: 0 });
    },
  };
}

/** Helper preferido: cria client SSR já com cookies do Next */
export function createSupabaseServer() {
  return _createServerClient(url, key, { cookies: cookieMethods() as any });
}

/** Back-compat: muitos arquivos importam { createServerClient } sem args */
export function createServerClient() {
  return createSupabaseServer();
}