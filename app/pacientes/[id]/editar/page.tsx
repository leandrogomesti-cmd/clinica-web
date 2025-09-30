'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Patient = {
  id: string;
  full_name: string | null;
  birth_date: string | null;
  sexo: string | null;
  estado_civil: string | null;
  cpf: string | null;
  rg: string | null;
  profissao: string | null;
  phone: string | null;
  email: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  city: string | null;
  state: string | null;
  convenio: string | null;
  numero_carteirinha: string | null;
  validade_carteirinha: string | null;
  titular_plano: string | null;
  alergias: string | null;
  medicamentos_uso: string | null;
  doencas_cronicas: string | null;
  historico_cirurgico: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function EditarPacientePage() {
  const params = useParams();
  const id = (params?.id as string) || '';
  const router = useRouter();

  const [data, setData] = useState<Patient | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();
      if (error) setErrorMsg(error.message);
      setData((data as Patient) ?? null);
    })();
  }, [id]);

  async function salvar() {
    if (!data) return;
    setSaving(true);
    setErrorMsg(null);
    const { error } = await supabase
      .from('patients')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id);
    setSaving(false);
    if (error) setErrorMsg(error.message);
    else router.push('/pacientes');
  }

  async function excluir() {
    setSaving(true);
    setErrorMsg(null);
    const { error } = await supabase.from('patients').delete().eq('id', id);
    setSaving(false);
    if (error) setErrorMsg(error.message);
    else router.push('/pacientes');
  }

  if (!data) return <main className="p-4">Carregando…</main>;

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Editar paciente</h1>
      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm">Nome completo</label>
          <input className="w-full rounded border px-3 py-2"
            value={data.full_name ?? ''} onChange={(e) => setData({ ...data, full_name: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">Data de nascimento</label>
          <input type="date" className="w-full rounded border px-3 py-2"
            value={data.birth_date ?? ''} onChange={(e) => setData({ ...data, birth_date: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">Sexo</label>
          <input className="w-full rounded border px-3 py-2"
            value={data.sexo ?? ''} onChange={(e) => setData({ ...data, sexo: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">Estado civil</label>
          <input className="w-full rounded border px-3 py-2"
            value={data.estado_civil ?? ''} onChange={(e) => setData({ ...data, estado_civil: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">CPF</label>
          <input className="w-full rounded border px-3 py-2"
            value={data.cpf ?? ''} onChange={(e) => setData({ ...data, cpf: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">RG</label>
          <input className="w-full rounded border px-3 py-2"
            value={data.rg ?? ''} onChange={(e) => setData({ ...data, rg: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">Profissão</label>
          <input className="w-full rounded border px-3 py-2"
            value={data.profissao ?? ''} onChange={(e) => setData({ ...data, profissao: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">Telefone (WhatsApp)</label>
          <input className="w-full rounded border px-3 py-2"
            value={data.phone ?? ''} onChange={(e) => setData({ ...data, phone: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">E-mail</label>
          <input type="email" className="w-full rounded border px-3 py-2"
            value={data.email ?? ''} onChange={(e) => setData({ ...data, email: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">CEP</label>
          <input className="w-full rounded border px-3 py-2"
            value={data.cep ?? ''} onChange={(e) => setData({ ...data, cep: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">Logradouro</label>
          <input className="w-full rounded border px-3 py-2"
            value={data.logradouro ?? ''} onChange={(e) => setData({ ...data, logradouro: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">Número</label>
          <input className="w-full rounded border px-3 py-2"
            value={data.numero ?? ''} onChange={(e) => setData({ ...data, numero: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">Complemento</label>
          <input className="w-full rounded border px-3 py-2"
            value={data.complemento ?? ''} onChange={(e) => setData({ ...data, complemento: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">Bairro</label>
          <input className="w-full rounded border px-3 py-2"
            value={data.bairro ?? ''} onChange={(e) => setData({ ...data, bairro: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">Cidade</label>
          <input className="w-full rounded border px-3 py-2"
            value={data.city ?? ''} onChange={(e) => setData({ ...data, city: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">Estado (UF)</label>
          <input className="w-full rounded border px-3 py-2"
            value={data.state ?? ''} onChange={(e) => setData({ ...data, state: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">Convênio</label>
          <input className="w-full rounded border px-3 py-2"
            value={data.convenio ?? ''} onChange={(e) => setData({ ...data, convenio: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">Carteirinha</label>
          <input className="w-full rounded border px-3 py-2"
            value={data.numero_carteirinha ?? ''} onChange={(e) => setData({ ...data, numero_carteirinha: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">Validade da carteirinha</label>
          <input type="date" className="w-full rounded border px-3 py-2"
            value={data.validade_carteirinha ?? ''} onChange={(e) => setData({ ...data, validade_carteirinha: e.target.value })}/>
        </div>
        <div>
          <label className="mb-1 block text-sm">Titular do plano</label>
          <input className="w-full rounded border px-3 py-2"
            value={data.titular_plano ?? ''} onChange={(e) => setData({ ...data, titular_plano: e.target.value })}/>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm">Alergias</label>
          <textarea className="w-full rounded border px-3 py-2"
            value={data.alergias ?? ''} onChange={(e) => setData({ ...data, alergias: e.target.value })}/>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm">Medicamentos de uso</label>
          <textarea className="w-full rounded border px-3 py-2"
            value={data.medicamentos_uso ?? ''} onChange={(e) => setData({ ...data, medicamentos_uso: e.target.value })}/>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm">Doenças crônicas</label>
          <textarea className="w-full rounded border px-3 py-2"
            value={data.doencas_cronicas ?? ''} onChange={(e) => setData({ ...data, doencas_cronicas: e.target.value })}/>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm">Histórico cirúrgico</label>
          <textarea className="w-full rounded border px-3 py-2"
            value={data.historico_cirurgico ?? ''} onChange={(e) => setData({ ...data, historico_cirurgico: e.target.value })}/>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={salvar}
          disabled={saving}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Salvando…' : 'Salvar'}
        </button>

        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} className="rounded border px-4 py-2 hover:bg-gray-100">
            Excluir
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 rounded border px-3 py-2">
            <span>Você tem certeza que deseja excluir o paciente?</span>
            <button onClick={excluir} className="rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-700">
              Sim
            </button>
            <button onClick={() => setConfirmDelete(false)} className="rounded border px-3 py-1.5 hover:bg-gray-100">
              Não
            </button>
          </div>
        )}
      </div>
    </main>
  );
}