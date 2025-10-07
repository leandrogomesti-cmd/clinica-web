// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  const { access_token, refresh_token } = await req.json();

  // vamos escrever cookies na resposta
  const res = NextResponse.json({ ok: true });

  const supabase = createServerClient(url, key, {
    cookies: {
      // no Route Handler, use só set/remove (sem get)
      set(name, value, options) {
        res.cookies.set({ name, value, ...options });
      },
      remove(name, options) {
        res.cookies.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });

  await supabase.auth.setSession({ access_token, refresh_token });

  return res;
}