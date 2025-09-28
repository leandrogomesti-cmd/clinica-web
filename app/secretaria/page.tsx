'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import IntakeOcrButton from './IntakeOcrButton';

type Intake = {
  id: string;
  nome: string | null;
  phone: string | null;
  cpf: string | null;
  rg: string | null;
  data_nascimento: string | null; // ISO (yyyy-mm-dd) ou null
  created_at: string;             // ISO datetime
  status: string | null;
};

export default function SecretariaIntakePage() {
  const [items, setItems] = useState<Intake[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    const { data, error } = await supabase
      .from('vw_pacientes_intake_ui')
      .select('id, nome, phone, cpf, rg, data_nascimento, created_at, status')
      .eq('status', 'pendente')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) setError(error.message);
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

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

  async function aprovar(id: string) {
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase.rpc('promover_intake_paciente', { p_intake_id: id });
      if (error) throw error;
      await load();
    } catch (e: any) {
      setError(e?.message || 'Falha ao aprovar');
    } finally {
      setBusy(false);
    }
  }

  async function rejeitar(id: string) {
    const motivo = prompt('Motivo da rejeição (opcional):') || null;
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase.rpc('rejeitar_intake_paciente', { p_intake_id: id, p_motivo: motivo });
      if (error) throw error;
      await load();
    } catch (e: any) {
      setError(e?.message || 'Falha ao rejeitar');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Pré-cadastros pendentes</h1>

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

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded">
          {error}
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
          {filtered.map((it) => (
            <tr key={it.id} className="border-t">
              <td className="p-2">{it.nome || '—'}</td>
              <td className="p-2">{it.phone || '—'}</td>
              <td className="p-2">{it.cpf || '—'}</td>
              <td className="p-2">{it.rg || '—'}</td>
              <td className="p-2">
                {it.data_nascimento ? new Date(it.data_nascimento).toLocaleDateString() : '—'}
