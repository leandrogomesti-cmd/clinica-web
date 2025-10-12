"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const schema = z.object({
  nome: z.string().min(2),
  telefone: z.string().optional().nullable(),
  rg: z.string().optional().nullable(),
  cpf: z.string().optional().nullable(),
  data_nascimento: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  estado_civil: z
    .enum(["SOLTEIRO","CASADO","DIVORCIADO","VIUVO","UNIAO_ESTAVEL","NAO_INFORMADO"])
    .optional().nullable(),
  sexo: z
    .enum(["FEMININO","MASCULINO","OUTRO","NAO_INFORMADO"])
    .optional().nullable(),
  cep: z.string().optional().nullable(),
  logradouro: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  complemento: z.string().optional().nullable(),
  profissao: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
});
type FormData = z.infer<typeof schema>;

// Normaliza "DD/MM/YYYY" -> "YYYY-MM-DD" e corta ISO "YYYY-MM-DDTHH:MM:SS"
function toISODate(v: any): any {
  if (!v || typeof v !== "string") return v;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(v)) {
    const [dd, mm, yyyy] = v.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  return v;
}

export function IntakeSheet({
  id,
  onApproved,
  onClose,
}: {
  id: string;
  onApproved: () => void;
  onClose: () => void;
}) {
  const supabase = createClient();
  const { register, handleSubmit, reset, formState: { isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    (async () => {
      // Tenta a view; cai para a tabela se necessário
      let r = await supabase
        .from("vw_pacientes_intake_ui")
        .select("nome, telefone, rg, cpf, data_nascimento, email, estado_civil, sexo, cep, logradouro, numero, bairro, cidade, complemento, profissao, observacoes")
        .eq("id", id)
        .maybeSingle();

      if (r.error || !r.data) {
        r = await supabase
          .from("pacientes_intake")
          .select("nome, telefone, rg, cpf, data_nascimento, email, estado_civil, sexo, cep, logradouro, numero, bairro, cidade, complemento, profissao, observacoes")
          .eq("id", id)
          .maybeSingle();
      }
      if (r.error) return toast.error("Erro ao carregar intake");

      const payload = { ...(r.data as any) };
      payload.data_nascimento = toISODate(payload.data_nascimento); // 👈 normaliza p/ input type=date
      reset(payload);
    })();
  }, [id]);

  async function onSubmit(values: FormData) {
    // "" -> null e normaliza a data antes do update
    const sanitized = Object.fromEntries(
      Object.entries(values).map(([k, v]) => [k, v === "" ? null : v])
    ) as any;
    sanitized.data_nascimento = toISODate(sanitized.data_nascimento); // 👈 normaliza p/ Postgres

    const { error } = await supabase
      .from("pacientes_intake")
      .update(sanitized)
      .eq("id", id);

    if (error) {
      toast.error(error.message ?? "Falha ao salvar correções");
      return;
    }
    toast.success("Alterações salvas");
    onClose(); // fecha painel após sucesso
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-6">
      <div className="grid gap-3">
        <Label>Nome</Label>
        <Input {...register("nome")} />
      </div>

      <div className="grid gap-3">
        <Label>Telefone</Label>
        <Input {...register("telefone")} />
      </div>

      <div className="grid gap-3">
        <Label>RG</Label>
        <Input {...register("rg")} />
      </div>
      <div className="grid gap-3">
        <Label>CPF</Label>
        <Input {...register("cpf")} />
      </div>

      <div className="grid gap-3">
        <Label>Nascimento</Label>
        <Input type="date" {...register("data_nascimento")} />
      </div>

      <div className="grid gap-3">
        <Label>E-mail</Label>
        <Input type="email" {...register("email")} />
      </div>

      <div className="grid gap-3">
        <Label>Estado civil</Label>
        <select
          className="border rounded-md h-10 px-3"
          {...register("estado_civil", { setValueAs: (v) => (v === "" ? null : v) })}
          defaultValue=""
        >
          <option value="">Selecione</option>
          <option value="SOLTEIRO">Solteiro(a)</option>
          <option value="CASADO">Casado(a)</option>
          <option value="DIVORCIADO">Divorciado(a)</option>
          <option value="VIUVO">Viúvo(a)</option>
          <option value="UNIAO_ESTAVEL">União estável</option>
          <option value="NAO_INFORMADO">Prefiro não informar</option>
        </select>
      </div>

      <div className="grid gap-3">
        <Label>Sexo</Label>
        <select
          className="border rounded-md h-10 px-3"
          {...register("sexo", { setValueAs: (v) => (v === "" ? null : v) })}
          defaultValue=""
        >
          <option value="">Selecione</option>
          <option value="FEMININO">Feminino</option>
          <option value="MASCULINO">Masculino</option>
          <option value="OUTRO">Outro</option>
          <option value="NAO_INFORMADO">Prefiro não informar</option>
        </select>
      </div>

      <div className="grid gap-3">
        <Label>CEP</Label>
        <Input {...register("cep")} />
      </div>
      <div className="grid gap-3">
        <Label>Logradouro</Label>
        <Input {...register("logradouro")} />
      </div>
      <div className="grid gap-3">
        <Label>Número</Label>
        <Input {...register("numero")} />
      </div>
      <div className="grid gap-3">
        <Label>Bairro</Label>
        <Input {...register("bairro")} />
      </div>
      <div className="grid gap-3">
        <Label>Cidade</Label>
        <Input {...register("cidade")} />
      </div>
      <div className="grid gap-3">
        <Label>Complemento</Label>
        <Input {...register("complemento")} />
      </div>
      <div className="grid gap-3">
        <Label>Profissão</Label>
        <Input {...register("profissao")} />
      </div>
      <div className="grid gap-3">
        <Label>Observações</Label>
        <Input {...register("observacoes")} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>Salvar</Button>
        <Button type="button" variant="secondary" onClick={onApproved}>Aprovar</Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
      </div>
    </form>
  );
}