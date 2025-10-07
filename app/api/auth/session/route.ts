// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  const { access_token, refresh_token } = await req.json();

  const store = cookies();
  const supabase = createServerClient(url, key, {
    cookies: {
      get: (name) => store.get(name)?.value,
      set: (name, value, options) => store.set({ name, value, ...options }),
      remove: (name, options) =>
        store.set({ name, value: '', ...options, maxAge: 0 }),
    },
  });

  await supabase.auth.setSession({ access_token, refresh_token });
  return NextResponse.json({ ok: true });
}