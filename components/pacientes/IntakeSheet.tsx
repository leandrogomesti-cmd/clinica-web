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
  data_nascimento: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
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
      let r = await supabase
        .from("vw_pacientes_intake_ui")
        .select("nome, telefone, data_nascimento, email")
        .eq("id", id)
        .maybeSingle();
      if (r.error) {
        r = await supabase
          .from("pacientes_intake")
          .select("nome, telefone, data_nascimento, email")
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
      <div className="grid gap-3">
        <Label>Nome</Label>
        <Input {...register("nome")} />
      </div>
      <div className="grid gap-3">
        <Label>Telefone</Label>
        <Input {...register("telefone")} />
      </div>
      <div className="grid gap-3">
        <Label>Nascimento</Label>
        <Input type="date" {...register("data_nascimento")} />
      </div>
      <div className="grid gap-3">
        <Label>E-mail</Label>
        <Input type="email" {...register("email")} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>Salvar</Button>
        <Button type="button" variant="secondary" onClick={onApproved}>Aprovar</Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
      </div>
    </form>
  );
}