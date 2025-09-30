'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pacienteIntakeSchema, type PacienteIntakeInput } from '@/app/autocadastro/schema';
import { supabase } from '@/lib/supabase';

const UFs = [
  'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT',
  'PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO'
];

export default function CadastroSecretariaPage() {
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null);
  const [ocrOpen, setOcrOpen] = useState(false);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<PacienteIntakeInput>({
    resolver: zodResolver(pacienteIntakeSchema),
    defaultValues: { sexo: 'NAO_INFORMADO', estado_civil: 'NAO_INFORMADO' },
  });

  const onSubmit = async (data: PacienteIntakeInput) => {
    setStatus(null);
    const onlyDigits = (s?: string) => (s ? s.replace(/\D/g, '') : s);

    // mapeia intake -> patients (e normaliza datas vazias para null)
    const payload = {
      full_name: data.nome,
      birth_date: data.data_nascimento || null,
      sexo: data.sexo || null,
      estado_civil: data.estado_civil || null,
      cpf: onlyDigits(data.cpf) || null,
      rg: data.rg || null,
      profissao: data.profissao || null,
      phone: onlyDigits(data.telefone_whatsapp) || null,
      email: data.email || null,
      cep: onlyDigits(data.cep) || null,
      logradouro: data.logradouro || null,
      numero: data.numero || null,
      complemento: data.complemento || null,
      bairro: data.bairro || null,
      city: data.cidade || null,
      state: data.estado?.toUpperCase() || null,
      convenio: data.convenio || null,
      numero_carteirinha: data.numero_carteirinha || null,
      validade_carteirinha: data.validade_carteirinha || null,
      titular_plano: data.titular_plano || null,
      alergias: data.alergias || null,
      medicamentos_uso: data.medicamentos_uso || null,
      doencas_cronicas: data.doencas_cronicas || null,
      historico_cirurgico: data.historico_cirurgico || null,
    };

    const { error } = await supabase.from('patients').insert(payload);
    if (error) {
      setStatus({ ok: false, msg: error.message });
    } else {
      setStatus({ ok: true, msg: 'Paciente cadastrado com sucesso.' });
      reset();
    }
  };

  async function handleOCRSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setOcrError(null);
    setOcrBusy(true);
    try {
      const file = (e.currentTarget.elements.namedItem('file') as HTMLInputElement).files?.[0];
      if (!file) throw new Error('Selecione um arquivo de imagem');

      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `public_intake/${crypto.randomUUID()}.${ext}`;

      const up = await supabase.storage.from('patient_documents').upload(path, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });
      if (up.error) throw up.error;

      const signed = await supabase.storage.from('patient_documents').createSignedUrl(path, 60 * 5);
      if (signed.error || !signed.data?.signedUrl) throw signed.error || new Error('Falha ao assinar URL');

      const resp = await fetch('/api/ocr/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: signed.data.signedUrl }),
      });
      const json = await resp.json();
      if (!resp.ok || !json?.ok) throw new Error(json?.error || 'Falha no OCR');

      const parsed = json.parsed || {};
      if (parsed.nome) setValue('nome', parsed.nome, { shouldDirty: true });
      if (parsed.cpf) setValue('cpf', parsed.cpf, { shouldDirty: true });
      if (parsed.rg) setValue('rg', parsed.rg, { shouldDirty: true });
      if (parsed.data_nascimento) setValue('data_nascimento', parsed.data_nascimento, { shouldDirty: true });

      setOcrOpen(false);
    } catch (err: any) {
      setOcrError(err?.message || 'Não foi possível ler o documento.');
    } finally {
      setOcrBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      {/* Header com botão de OCR à direita */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Cadastro de Paciente (Secretaria)</h1>
          <p className="text-sm text-gray-600">Mesma experiência do autocadastro, mas grava direto em <code>patients</code>.</p>
        </div>
        <button
          type="button"
          onClick={() => setOcrOpen(true)}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Ler documento
        </button>
      </div>

      {/* Formulário idêntico ao /autocadastro */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Dados pessoais */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm">Nome completo *</label>
            <input className="w-full rounded border px-3 py-2" {...register('nome')} />
            {errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm">Data de nascimento</label>
            <input type="date" className="w-full rounded border px-3 py-2" {...register('data_nascimento')} />
          </div>

          <div>
            <label className="mb-1 block text-sm">Sexo</label>
            <select className="w-full rounded border px-3 py-2" {...register('sexo')}>
              <option value="NAO_INFORMADO">Não informado</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm">Estado civil</label>
            <select className="w-full rounded border px-3 py-2" {...register('estado_civil')}>
              <option value="NAO_INFORMADO">Não informado</option>
              <option value="SOLTEIRO">Solteiro(a)</option>
              <option value="CASADO">Casado(a)</option>
              <option value="DIVORCIADO">Divorciado(a)</option>
              <option value="VIUVO">Viúvo(a)</option>
              <option value="UNIAO_ESTAVEL">União estável</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm">CPF</label>
            <input className="w-full rounded border px-3 py-2" placeholder="Somente números" {...register('cpf')} />
          </div>

          <div>
            <label className="mb-1 block text-sm">RG</label>
            <input className="w-full rounded border px-3 py-2" {...register('rg')} />
          </div>

          <div>
            <label className="mb-1 block text-sm">Profissão</label>
            <input className="w-full rounded border px-3 py-2" {...register('profissao')} />
          </div>
        </section>

        {/* Contato */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm">Telefone (WhatsApp) *</label>
            <input
              className="w-full rounded border px-3 py-2"
              placeholder="(11) 9 9999-9999"
              {...register('telefone_whatsapp')}
            />
            {errors.telefone_whatsapp && <p className="text-sm text-red-600">{errors.telefone_whatsapp.message}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm">Telefone fixo</label>
            <input className="w-full rounded border px-3 py-2" {...register('telefone_fixo')} />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm">E-mail</label>
            <input type="email" className="w-full rounded border px-3 py-2" {...register('email')} />
            {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
          </div>
        </section>

        {/* Endereço */}
        <section>
          <h2 className="mb-2 text-lg font-medium">Endereço</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm">CEP</label>
              <input className="w-full rounded border px-3 py-2" {...register('cep')} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm">Logradouro</label>
              <input className="w-full rounded border px-3 py-2" {...register('logradouro')} />
            </div>
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm">Número</label>
              <input className="w-full rounded border px-3 py-2" {...register('numero')} />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm">Complemento</label>
              <input className="w-full rounded border px-3 py-2" {...register('complemento')} />
            </div>
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm">Bairro</label>
              <input className="w-full rounded border px-3 py-2" {...register('bairro')} />
            </div>
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm">Cidade</label>
              <input className="w-full rounded border px-3 py-2" {...register('cidade')} />
            </div>
            <div className="md:col-span-1">
              <label className="mb-1 block text-sm">Estado (UF)</label>
              <select className="w-full rounded border px-3 py-2" {...register('estado')}>
                <option value="">Selecione</option>
                {UFs.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Convênio */}
        <section>
          <h2 className="mb-2 text-lg font-medium">Convênio / Plano de saúde (opcional)</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm">Convênio</label>
              <input className="w-full rounded border px-3 py-2" placeholder="Ex.: Unimed, Amil, ou PARTICULAR" {...register('convenio')} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm">Número da carteirinha</label>
              <input className="w-full rounded border px-3 py-2" {...register('numero_carteirinha')} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm">Validade da carteirinha</label>
              <input type="date" className="w-full rounded border px-3 py-2" {...register('validade_carteirinha')} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm">Titular do plano</label>
              <input className="w-full rounded border px-3 py-2" {...register('titular_plano')} />
            </div>
          </div>
        </section>

        <div className="pt-2">
          <button type="submit" disabled={isSubmitting}
            className="rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? 'Salvando…' : 'Salvar'}
          </button>
        </div>

        {status && (
          <p className={`mt-3 text-sm ${status.ok ? 'text-green-700' : 'text-red-700'}`}>{status.msg}</p>
        )}
      </form>

      {/* Modal OCR (Ler Documento) */}
      {ocrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleOCRSubmit} className="w-full max-w-md space-y-3 rounded-xl bg-white p-4 shadow-lg">
            <h3 className="text-lg font-semibold">Enviar RG/CPF/CNH</h3>
            <input type="file" name="file" accept="image/*" required />
            {ocrError && <p className="text-sm text-red-600">{ocrError}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className="rounded border px-3 py-1" onClick={() => setOcrOpen(false)}>Cancelar</button>
              <button type="submit" className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50" disabled={ocrBusy}>
                {ocrBusy ? 'Processando…' : 'Ler'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}