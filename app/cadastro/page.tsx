'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Form = {
  full_name: string;
  birth_date: string;
  sexo: string;
  estado_civil: string;
  cpf: string;
  rg: string;
  profissao: string;
  phone: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  city: string;
  state: string;
  convenio: string;
  numero_carteirinha: string;
  validade_carteirinha: string;
  titular_plano: string;
  alergias: string;
  medicamentos_uso: string;
  doencas_cronicas: string;
  historico_cirurgico: string;
};

const initial: Form = {
  full_name: '',
  birth_date: '',
  sexo: '',
  estado_civil: '',
  cpf: '',
  rg: '',
  profissao: '',
  phone: '',
  email: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  city: '',
  state: '',
  convenio: '',
  numero_carteirinha: '',
  validade_carteirinha: '',
  titular_plano: '',
  alergias: '',
  medicamentos_uso: '',
  doencas_cronicas: '',
  historico_cirurgico: '',
};

export default function CadastroInternoPage() {
  const [f, setF] = useState<Form>(initial);
  const [status, setStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const set = (k: keyof Form, v: string) => setF((p) => ({ ...p, [k]: v }));
  const onlyDigits = (s: string) => s.replace(/\D/g, '');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setErrorMsg(null);

    const payload = {
      ...f,
      cpf: onlyDigits(f.cpf),
      phone: onlyDigits(f.phone),
      cep: onlyDigits(f.cep),
    };

    const { error } = await supabase.from('patients').insert(payload);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setStatus('Paciente cadastrado com sucesso.');
    setF(initial);
    router.push('/pacientes');
  }

  return (
    <main className="space-y-4">
      <h1 className="text-xl font-semibold">Cadastro de Paciente (Secretaria)</h1>
      {status && <div className="rounded border border-green-500 bg-green-50 px-3 py-2">{status}</div>}
      {errorMsg && <div className="rounded border border-red-500 bg-red-50 px-3 py-2">{errorMsg}</div>}

      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm">Nome completo *</label>
          <input className="w-full rounded border px-3 py-2" value={f.full_name} onChange={(e) => set('full_name', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm">Data de nascimento</label>
          <input type="date" className="w-full rounded border px-3 py-2" value={f.birth_date} onChange={(e) => set('birth_date', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm">Telefone (WhatsApp) *</label>
          <input className="w-full rounded border px-3 py-2" value={f.phone} onChange={(e) => set('phone', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm">CPF</label>
          <input className="w-full rounded border px-3 py-2" value={f.cpf} onChange={(e) => set('cpf', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm">RG</label>
          <input className="w-full rounded border px-3 py-2" value={f.rg} onChange={(e) => set('rg', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm">E-mail</label>
          <input type="email" className="w-full rounded border px-3 py-2" value={f.email} onChange={(e) => set('email', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm">CEP</label>
          <input className="w-full rounded border px-3 py-2" value={f.cep} onChange={(e) => set('cep', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm">Logradouro</label>
          <input className="w-full rounded border px-3 py-2" value={f.logradouro} onChange={(e) => set('logradouro', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm">Número</label>
          <input className="w-full rounded border px-3 py-2" value={f.numero} onChange={(e) => set('numero', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm">Complemento</label>
          <input className="w-full rounded border px-3 py-2" value={f.complemento} onChange={(e) => set('complemento', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm">Bairro</label>
          <input className="w-full rounded border px-3 py-2" value={f.bairro} onChange={(e) => set('bairro', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm">Cidade</label>
          <input className="w-full rounded border px-3 py-2" value={f.city} onChange={(e) => set('city', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm">Estado (UF)</label>
          <input className="w-full rounded border px-3 py-2" value={f.state} onChange={(e) => set('state', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm">Convênio</label>
          <input className="w-full rounded border px-3 py-2" value={f.convenio} onChange={(e) => set('convenio', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm">Carteirinha</label>
          <input className="w-full rounded border px-3 py-2" value={f.numero_carteirinha} onChange={(e) => set('numero_carteirinha', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm">Validade da carteirinha</label>
          <input type="date" className="w-full rounded border px-3 py-2" value={f.validade_carteirinha} onChange={(e) => set('validade_carteirinha', e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm">Titular do plano</label>
          <input className="w-full rounded border px-3 py-2" value={f.titular_plano} onChange={(e) => set('titular_plano', e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm">Alergias</label>
          <textarea className="w-full rounded border px-3 py-2" value={f.alergias} onChange={(e) => set('alergias', e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm">Medicamentos de uso</label>
          <textarea className="w-full rounded border px-3 py-2" value={f.medicamentos_uso} onChange={(e) => set('medicamentos_uso', e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm">Doenças crônicas</label>
          <textarea className="w-full rounded border px-3 py-2" value={f.doencas_cronicas} onChange={(e) => set('doencas_cronicas', e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-sm">Histórico cirúrgico</label>
          <textarea className="w-full rounded border px-3 py-2" value={f.historico_cirurgico} onChange={(e) => set('historico_cirurgico', e.target.value)} />
        </div>

        <div className="md:col-span-2 mt-2">
          <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            Salvar
          </button>
        </div>
      </form>
    </main>
  );
}