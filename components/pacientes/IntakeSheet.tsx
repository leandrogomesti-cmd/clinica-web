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
  estado_civil: z.string().optional().nullable(),
  sexo: z.string().optional().nullable(),
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    (async () => {
      // tenta view primeiro (caso a view não tenha todos, caímos para a tabela)
      let r = await supabase
        .from("vw_pacientes_intake_ui")
        .select(
          "nome, telefone, rg, cpf, data_nascimento, email, estado_civil, sexo, cep, logradouro, numero, bairro, cidade, complemento, profissao, observacoes"
        )
        .eq("id", id)
        .maybeSingle();

      if (r.error || !r.data) {
        r = await supabase
          .from("pacientes_intake")
          .select(
            "nome, telefone, rg, cpf, data_nascimento, email, estado_civil, sexo, cep, logradouro, numero, bairro, cidade, complemento, profissao, observacoes"
          )
          .eq("id", id)
          .maybeSingle();
      }

      if (r.error) return toast.error("Erro ao carregar intake");
      reset(r.data as any);
    })();
  }, [id]);

  async function onSubmit(values: FormData) {
    const { error } = await supabase
      .from("pacientes_intake")
      .update(values)
      .eq("id", id);
    if (error) return toast.error("Falha ao salvar correções");
    toast.success("Alterações salvas");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-6">
      {/* Nome */}
      <div className="grid gap-3">
        <Label>Nome</Label>
        <Input {...register("nome")} />
      </div>

      {/* Telefone */}
      <div className="grid gap-3">
        <Label>Telefone</Label>
        <Input {...register("telefone")} />
      </div>

      {/* RG e CPF (RG vem antes do CPF) */}
      <div className="grid gap-3">
        <Label>RG</Label>
        <Input {...register("rg")} />
      </div>
      <div className="grid gap-3">
        <Label>CPF</Label>
        <Input {...register("cpf")} />
      </div>

      {/* Nascimento */}
      <div className="grid gap-3">
        <Label>Nascimento</Label>
        <Input type="date" {...register("data_nascimento")} />
      </div>

      {/* E-mail */}
      <div className="grid gap-3">
        <Label>E-mail</Label>
        <Input type="email" {...register("email")} />
      </div>

      {/* Depois do e-mail: Estado Civil, Sexo, CEP, Logradouro, Número, Bairro, Cidade, Complemento, Profissão, Observações */}
      <div className="grid gap-3">
        <Label>Estado Civil</Label>
        <Input placeholder="NAO_INFORMADO / SOLTEIRO / CASADO / ..." {...register("estado_civil")} />
      </div>
      <div className="grid gap-3">
        <Label>Sexo</Label>
        <Input placeholder="NAO_INFORMADO / MASCULINO / FEMININO / OUTRO" {...register("sexo")} />
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