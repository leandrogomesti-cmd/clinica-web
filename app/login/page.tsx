// app/login/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Page({ searchParams }: { searchParams?: { next?: string } }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const email = String(formData.get('email') || '');
    const password = String(formData.get('password') || '');
    const next = searchParams?.next || '/secretaria';

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // persiste cookies de sessão no server
    if (data.session) {
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
      });
    }

    window.location.href = next;
  }

  return (
    <form action={onSubmit} className="space-y-3 max-w-md mx-auto p-6">
      <div className="text-xl font-semibold mb-2">Entrar no painel</div>
      <input name="email" placeholder="Email" className="border p-2 rounded w-full" />
      <input name="password" type="password" placeholder="Senha" className="border p-2 rounded w-full" />
      <button className="w-full bg-blue-600 text-white rounded p-2" disabled={loading}>
        {loading ? 'Entrando…' : 'Entrar'}
      </button>
      <div className="text-sm pt-2">
        ou <a className="underline" href="/autocadastro">autocadastrar paciente</a>
      </div>
    </form>
  );
}