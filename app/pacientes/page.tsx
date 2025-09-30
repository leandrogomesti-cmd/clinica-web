'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Campos mínimos para a lista
type Row = {
  id: string;
  full_name: string | null;
  phone: string | null;
  cpf: string | null;
  rg: string | null;
  created_at: string | null;
};

export default function PacientesPage() {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function load(search: string) {
    setLoading(true);
    setErrorMsg(null);

    let query = supabase
      .from('patients')
      .select('id, full_name, phone, cpf, rg, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (search.trim()) {
      const s = `%${search.trim()}%`;
      // Busca por nome/CPF/RG
      query = query.or(`full_name.ilike.${s},cpf.ilike.${s},rg.ilike.${s}`);
    }

    const { data, error } = await query;

    if (error) {
      setErrorMsg(error.message);
    }

    setRows(data ?? []);
    setLoading(false);
  } // <= IMPORTANTE: fecha a função aqui

  useEffect(() => {
    void load('');
  }, []);

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">Pacientes</h1>
        <Link
          href="/cadastro"
          className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
        >
          Adicionar
        </Link>
      </div>

      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(q)}
          placeholder="Buscar por nome, CPF ou RG"
          className="w-full rounded border p-2"
        />
        <button
          onClick={() => load(q)}
          className="rounded border px-3 py-2 hover:bg-gray-100"
        >
          Buscar
        </button>
        <button
          onClick={() => {
            setQ('');
            void load('');
          }}
          className="rounded border px-3 py-2 hover:bg-gray-100"
        >
          Limpar
        </button>
      </div>

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="border-b bg-gray-50 text-left">
            <th className="p-2">Nome</th>
            <th className="p-2">Telefone</th>
            <th className="p-2">CPF</th>
            <th className="p-2">RG</th>
            <th className="p-2">Criado</th>
            <th className="p-2 w-24">Ações</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-b">
              <td className="p-2">{p.full_name || '—'}</td>
              <td className="p-2">{p.phone || '—'}</td>
              <td className="p-2">{p.cpf || '—'}</td>
              <td className="p-2">{p.rg || '—'}</td>
              <td className="p-2">
                {p.created_at ? new Date(p.created_at).toLocaleString() : '—'}
              </td>
              <td className="p-2">
                <Link
                  href={`/pacientes/${p.id}/editar`}
                  className="rounded border px-2 py-1 text-sm hover:bg-gray-100"
                >
                  Editar
                </Link>
              </td>
            </tr>
          ))}
          {!rows.length && !loading && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-gray-500">
                Nenhum paciente encontrado
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {loading && <p className="text-sm text-gray-500">Carregando…</p>}
    </main>
  );
}