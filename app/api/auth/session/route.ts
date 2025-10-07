// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  const { access_token, refresh_token } = await req.json();

  // Cookie jar do Next (em Route Handler, usar cookies() é o mais estável)
  const store = cookies();

  // Compat com ambas assinaturas do @supabase/ssr (evita erro de tipos no build)
  const supabase = createServerClient(url, key, {
    cookies: {
      get: (name: string) => store.get(name)?.value,
      set: (name: string, value: string, options: any) =>
        store.set({ name, value, ...options }),
      remove: (name: string, options: any) =>
        store.set({ name, value: "", ...options, maxAge: 0 }),
    } as any, // <- garante compatibilidade de tipos entre versões (CookieMethodsServer/Deprecated)
  });

  // Grava a sessão (vai emitir Set-Cookie na resposta automaticamente)
  await supabase.auth.setSession({ access_token, refresh_token });

  return NextResponse.json({ ok: true });
}