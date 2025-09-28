'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Intake = {
  id: string;
  nome: string | null;
  phone: string | null;
  cpf: string | null;
  rg: string | null;
  data_nascimento: string | null;
  created_at: string;
  status: string | null;
};

export default function SecretariaIntakePage() {
  const [items, setItems] = useState<Intake[]>([]);
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    const { data, error } = await supabase
      .from('pacientes_intake')
      .select('id, nome, phone, cpf, rg, data_nascimento, created_at, status')
      .eq('status', 'pendente')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) setError(error.message);
    setItems(data || []);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(it =>
      (it.nome || '').toLowerCase().includes(s) ||
      (it.phone || '').toLowerCase().includes(s) ||
      (it.cpf || '').toLowerCase().includes(s) ||
      (it.rg || '').toLowerCase().includes(s)
    );
  }, [items, q]);

  async function aprovar(id: string) {
    setBusy(true);
    setError(null);
    const { error } = await supabase.rpc('promover_intake_paciente', { p_intake_id: id });
    if (error) setError(error.message);
    await load();
    setBusy(false);
  }

  async function rejeitar(id: string) {
    const motivo = prompt('Motivo da rejeição (opcional):') || null;
    setBusy(true);
    setError(null);
    const { error } = await supabase.rpc('rejeitar_intake_paciente', { p_intake_id: id, p_motivo: motivo });
    if (error) setError(error.message);
    await load();
    setBusy(false);
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Pré-cadastros pendentes</h1>

      <div className="flex gap-2">
        <input
          className="border p-2 rounded flex-1"
          placeholder="Buscar por nome / telefone / CPF / RG"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={load} className="border px-3 rounded">Atualizar</button>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-3 rounded">{error}</div>}

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left p-2">Nome</th>
            <th className="text-left p-2">Telefone</th>
            <th className="text-left p-2">CPF</th>
            <th className="text-left p-2">RG</th>
            <th className="text-left p-2">Nascimento</th>
            <th className="text-left p-2">Criado</th>
            <th className="text-left p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((it) => (
            <tr key={it.id} className="border-t">
              <td className="p-2">{it.nome || '—'}</td>
              <td className="p-2">{it.phone || '—'}</td>
              <td className="p-2">{it.cpf || '—'}</td>
              <td className="p-2">{it.rg || '—'}</td>
              <td className="p-2">
                {it.data_nascimento ? new Date(it.data_nascimento).toLocaleDateString() : '—'}
              </td>
              <td className="p-2">{new Date(it.created_at).toLocaleString()}</td>
              <td className="p-2 flex gap-2">
                <button
                  disabled={busy}
                  onClick={() => aprovar(it.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  Aprovar
                </button>
                <button
                  disabled={busy}
                  onClick={() => rejeitar(it.id)}
                  className="bg-gray-200 px-3 py-1 rounded disabled:opacity-50"
                >
                  Rejeitar
                </button>
              </td>
            </tr>
          ))}
          {!filtered.length && (
            <tr><td colSpan={7} className="p-4 text-center text-gray-500">Nenhum pré-cadastro pendente</td></tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
