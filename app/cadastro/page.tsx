"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pacienteIntakeSchema, type PacienteIntakeInput } from "./schema";
import { supabase } from '@/lib/supabase'; // ajuste o path conforme sua estrutura
import { useState } from "react";

const UFs = ["AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA","PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO"];

export default function CadastroPage() {
  const [status, setStatus] = useState<null | { ok: boolean; msg: string }>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm<PacienteIntakeInput>({
      resolver: zodResolver(pacienteIntakeSchema),
      defaultValues: {
        sexo: "NAO_INFORMADO",
        estado_civil: "NAO_INFORMADO",
      },
    });

  const onSubmit = async (data: PacienteIntakeInput) => {
    setStatus(null);
    try {

      // Normalizações simples (ex.: tira máscara do telefone)
      const onlyDigits = (s?: string) => (s ? s.replace(/\D/g, "") : s);

      const payload = {
        ...data,
        telefone_whatsapp: onlyDigits(data.telefone_whatsapp),
        telefone_fixo: onlyDigits(data.telefone_fixo),
        cpf: data.cpf ? data.cpf.replace(/\D/g, "") : null,
        estado: data.estado?.toUpperCase() ?? null,
        // campos vazios como null pra bater com as constraints do Postgres
        data_nascimento: data.data_nascimento || null,
        validade_carteirinha: data.validade_carteirinha || null,
      };

    const { error } = await supabase
      .from("pacientes_intake")
      .insert(payload);
      if (error) throw error;

      setStatus({ ok: true, msg: "Cadastro enviado com sucesso! Aguarde confirmação." });
      reset();
    } catch (e: any) {
      setStatus({ ok: false, msg: e.message || "Falha ao enviar cadastro." });
    }
  };

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Autocadastro de Paciente</h1>
      <p className="text-sm text-gray-600 mb-6">
        Preencha seus dados. Suas informações serão analisadas pela clínica.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Dados pessoais */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Nome completo *</label>
            <input className="w-full border rounded px-3 py-2" {...register("nome")} />
            {errors.nome && <p className="text-red-600 text-sm">{errors.nome.message}</p>}
          </div>
          <div>
            <label className="block text-sm mb-1">Data de nascimento</label>
            <input type="date" className="w-full border rounded px-3 py-2" {...register("data_nascimento")} />
          </div>

          <div>
            <label className="block text-sm mb-1">Sexo</label>
            <select className="w-full border rounded px-3 py-2" {...register("sexo")}>
              <option value="NAO_INFORMADO">Não informado</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Estado civil</label>
            <select className="w-full border rounded px-3 py-2" {...register("estado_civil")}>
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
            <label className="block text-sm mb-1">CPF</label>
            <input className="w-full border rounded px-3 py-2" placeholder="Somente números" {...register("cpf")} />
          </div>

          <div>
            <label className="block text-sm mb-1">RG</label>
            <input className="w-full border rounded px-3 py-2" {...register("rg")} />
          </div>

          <div>
            <label className="block text-sm mb-1">Profissão</label>
            <input className="w-full border rounded px-3 py-2" {...register("profissao")} />
          </div>
        </section>

        {/* Contato */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Telefone (WhatsApp) *</label>
            <input className="w-full border rounded px-3 py-2" placeholder="(11) 9 9999-9999" {...register("telefone_whatsapp")} />
            {errors.telefone_whatsapp && <p className="text-red-600 text-sm">{errors.telefone_whatsapp.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Telefone fixo</label>
            <input className="w-full border rounded px-3 py-2" {...register("telefone_fixo")} />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm mb-1">E-mail</label>
            <input type="email" className="w-full border rounded px-3 py-2" {...register("email")} />
            {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
          </div>
        </section>

        {/* Endereço */}
        <section>
          <h2 className="text-lg font-medium mb-2">Endereço</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm mb-1">CEP</label>
              <input className="w-full border rounded px-3 py-2" {...register("cep")} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Logradouro</label>
              <input className="w-full border rounded px-3 py-2" {...register("logradouro")} />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm mb-1">Número</label>
              <input className="w-full border rounded px-3 py-2" {...register("numero")} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Complemento</label>
              <input className="w-full border rounded px-3 py-2" {...register("complemento")} />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm mb-1">Bairro</label>
              <input className="w-full border rounded px-3 py-2" {...register("bairro")} />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm mb-1">Cidade</label>
              <input className="w-full border rounded px-3 py-2" {...register("cidade")} />
            </div>
            <div className="md:col-span-1">
              <label className="block text-sm mb-1">Estado (UF)</label>
              <select className="w-full border rounded px-3 py-2" {...register("estado")}>
                <option value="">Selecione</option>
                {UFs.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Convênio */}
        <section>
          <h2 className="text-lg font-medium mb-2">Convênio / Plano de saúde (opcional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Convênio</label>
              <input className="w-full border rounded px-3 py-2" placeholder="Ex.: Unimed, Amil, ou PARTICULAR" {...register("convenio")} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Número da carteirinha</label>
              <input className="w-full border rounded px-3 py-2" {...register("numero_carteirinha")} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Validade da carteirinha</label>
              <input type="date" className="w-full border rounded px-3 py-2" {...register("validade_carteirinha")} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Titular do plano</label>
              <input className="w-full border rounded px-3 py-2" {...register("titular_plano")} />
            </div>
          </div>
        </section>

        {/* Dados médicos (opcional) */}
        <section>
          <h2 className="text-lg font-medium mb-2">Informações médicas (opcional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Alergias</label>
              <textarea className="w-full border rounded px-3 py-2" rows={2} {...register("alergias")} />
            </div>
            <div>
              <label className="block text-sm mb-1">Medicamentos em uso</label>
              <textarea className="w-full border rounded px-3 py-2" rows={2} {...register("medicamentos_uso")} />
            </div>
            <div>
              <label className="block text-sm mb-1">Doenças crônicas</label>
              <textarea className="w-full border rounded px-3 py-2" rows={2} {...register("doencas_cronicas")} />
            </div>
            <div>
              <label className="block text-sm mb-1">Histórico cirúrgico</label>
              <textarea className="w-full border rounded px-3 py-2" rows={2} {...register("historico_cirurgico")} />
            </div>
          </div>
        </section>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Enviando..." : "Enviar cadastro"}
          </button>
        </div>

        {status && (
          <p className={`mt-3 text-sm ${status.ok ? "text-green-700" : "text-red-700"}`}>
            {status.msg}
          </p>
        )}
      </form>
    </main>
  );
}