'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Patient = {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
};

export default function PacientesPage() {
  const [items, setItems] = useState<Patient[]>([]);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [buscaNome, setBuscaNome] = useState('');
  const [buscaTelefone, setBuscaTelefone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    const { data, error } = await supabase
      .from('patients')
      .select('id, full_name, phone, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) setError(error.message);
    setItems(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const n = buscaNome.trim().toLowerCase();
    const t = buscaTelefone.trim().toLowerCase();
    return items.filter((p) => {
      const okN = !n || (p.full_name || '').toLowerCase().includes(n);
      const okT = !t || (p.phone || '').toLowerCase().includes(t);
      return okN && okT;
    });
  }, [items, buscaNome, buscaTelefone]);

  async function add() {
    if (!nome.trim()) return;
    setBusy(true);
    setError(null);

    const payload = {
      full_name: nome.trim(),
      phone: telefone.trim() || null,
    };

    const { error } = await supabase.from('patients').insert(payload);
    if (error) setError(error.message);

    setNome('');
    setTelefone('');
    await load();
    setBusy(false);
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Pacientes</h1>

      {/* Filtros */}
      <div className="flex gap-3">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Nome"
          value={buscaNome}
          onChange={(e) => setBuscaNome(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2 w-64"
          placeholder="Telefone"
          value={buscaTelefone}
          onChange={(e) => setBuscaTelefone(e.target.value)}
        />
        <button
          onClick={load}
          className="border rounded px-4 py-2"
          disabled={busy}
        >
          Atualizar
        </button>
      </div>

      {/* Form adicionar */}
      <div className="flex gap-3">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2 w-64"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />
        <button
          onClick={add}
          className="bg-blue-600 text-white rounded px-4 py-2"
          disabled={busy || !nome.trim()}
        >
          Adicionar
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded">
          {error}
        </div>
      )}

      {/* Tabela */}
      <table className="w-full text-sm mt-2">
        <thead>
          <tr className="text-left">
            <th className="p-2">Nome</th>
            <th className="p-2">Telefone</th>
            <th className="p-2">Criado</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2">{p.full_name || '—'}</td>
              <td className="p-2">{p.phone || '—'}</td>
              <td className="p-2">
                {p.created_at
                  ? new Date(p.created_at).toLocaleString()
                  : '—'}
              </td>
            </tr>
          ))}
          {!filtered.length && (
            <tr>
              <td colSpan={3} className="p-4 text-center text-gray-500">
                Nenhum paciente encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
