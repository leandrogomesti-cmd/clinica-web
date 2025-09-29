'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import LerDocumentoButton from './_components/ler-documento-button'; // <-- botão novo

type Intake = {
  id: string;
  nome: string | null;
  phone: string | null;
  cpf: string | null;
  rg: string | null;
  data_nascimento: string | null;
  created_at: string | null;
  status: string | null;
};

type WhoAmI = { userId: string | null; email: string | null; role: string | null };

export default function SecretariaIntakePage() {
  const [items, setItems] = useState<Intake[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<WhoAmI>({ userId: null, email: null, role: null });

  async function getMe() {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user ?? null;
    let role: string | null = null;
    if (user?.id) {
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      role = prof?.role ?? null;
    }
    setMe({ userId: user?.id ?? null, email: user?.email ?? null, role });
  }

  async function load() {
    setError(null);
    setLoading(true);
    const { data, error } = await supabase
      .from('vw_pacientes_intake_ui')
      .select('id, nome, phone, cpf, rg, data_nascimento, created_at, status')
      .eq('status', 'pendente')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) { setError(`Falha ao carregar pendentes: ${error.message}`); setItems([]); }
    else { setItems(data || []); }
    setLoading(false);
  }

  useEffect(() => {
    getMe();
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => { getMe(); load(); });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) =>
      (it.nome || '').toLowerCase().includes(s) ||
      (it.phone || '').toLowerCase().includes(s) ||
      (it.cpf || '').toLowerCase().includes(s) ||
      (it.rg || '').toLowerCase().includes(s)
    );
  }, [items, q]);

  const canApprove = me.role === 'staff';

  async function aprovar(id: string) {
    if (!canApprove) { setError('Apenas staff pode aprovar.'); return; }
    setBusy(true); setError(null);
    const { error } = await supabase.rpc('promover_intake_paciente', { p_intake_id: id });
    if (error) { setError(error.message); setBusy(false); return; }
    await load(); setBusy(false);
  }

  async function rejeitar(id: string) {
    if (!canApprove) { setError('Apenas staff pode rejeitar.'); return; }
    const motivo = prompt('Motivo da rejeição (opcional):') || null;
    setBusy(true); setError(null);
    const { error } = await supabase.rpc('rejeitar_intake_paciente', { p_intake_id: id, p_motivo: motivo });
    if (error) { setError(error.message); setBusy(false); return; }
    await load(); setBusy(false);
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Pré-cadastros pendentes</h1>

      <div className="text-xs text-gray-600 flex items-center">
        <span>
          Usuário: {me.email || '—'} · Papel: <b>{me.role || '—'}</b>
        </span>
        {me.role === 'staff' && (
          <span className="ml-3 inline-flex">
            <LerDocumentoButton onDone={load} /> {/* <-- botão fixo */}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="border p-2 rounded flex-1"
          placeholder="Buscar por nome / telefone / CPF / RG"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={load} className="border px-3 rounded" disabled={loading || busy}>
          {loading ? 'Atualizando…' : 'Atualizar'}
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded">{error}</div>}

      {me.role && me.role !== 'staff' && (
        <div className="bg-yellow-50 text-yellow-700 border border-yellow-200 p-3 rounded">
          Você não é <b>staff</b>. As ações de Aprovar/Rejeitar ficam desabilitadas.
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className="p-2">Nome</th>
            <th className="p-2">Telefone</th>
            <th className="p-2">CPF</th>
            <th className="p-2">RG</th>
            <th className="p-2">Nascimento</th>
            <th className="p-2">Criado</th>
            <th className="p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={7} className="p-4 text-center text-gray-500">Carregando…</td></tr>}
          {!loading && filtered.length === 0 && (
            <tr><td colSpan={7} className="p-4 text-center text-gray-500">Nenhum pré-cadastro pendente</td></tr>
          )}
          {!loading && filtered.map((it) => (
            <tr key={it.id} className="border-t">
              <td className="p-2">{it.nome || '—'}</td>
              <td className="p-2">{it.phone || '—'}</td>
              <td className="p-2">{it.cpf || '—'}</td>
              <td className="p-2">{it.rg || '—'}</td>
              <td className="p-2">{it.data_nascimento ? new Date(it.data_nascimento).toLocaleDateString() : '—'}</td>
              <td className="p-2">{it.created_at ? new Date(it.created_at).toLocaleString() : '—'}</td>
              <td className="p-2 flex flex-wrap gap-2">
                <button
                  disabled={!canApprove || busy}
                  onClick={() => aprovar(it.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  Aprovar
                </button>
                <button
                  disabled={!canApprove || busy}
                  onClick={() => rejeitar(it.id)}
                  className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
                >
                  Rejeitar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
