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
  full_name: z.string().min(2),
  phone: z.string().optional().nullable(),
  birth_date: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
});
type FormData = z.infer<typeof schema>;

export function PacienteSheet({
  id,
  onSaved,
  onDeleted,
}: {
  id: string;
  onSaved: () => void;
  onDeleted: () => void;
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
      const { data, error } = await supabase
        .from("patients")
        .select("full_name, phone, birth_date, email, address")
        .eq("id", id)
        .maybeSingle();
      if (error) toast.error("Erro ao carregar paciente");
      if (data) reset(data as any);
    })();
  }, [id]);

  async function onSubmit(values: FormData) {
    const { error } = await supabase.from("patients").update(values).eq("id", id);
    if (error) return toast.error("Falha ao salvar");
    toast.success("Paciente salvo");
    onSaved();
  }

  async function onDelete() {
    if (!confirm("Confirmar exclusão do paciente?")) return;
    const { error } = await supabase.from("patients").delete().eq("id", id);
    if (error) return toast.error("Falha ao excluir");
    toast.success("Paciente excluído");
    onDeleted();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-6">
      <div className="grid gap-3">
        <Label>Nome</Label>
        <Input {...register("full_name")} />
      </div>
      <div className="grid gap-3">
        <Label>Telefone</Label>
        <Input {...register("phone")} />
      </div>
      <div className="grid gap-3">
        <Label>Nascimento</Label>
        <Input type="date" {...register("birth_date")} />
      </div>
      <div className="grid gap-3">
        <Label>E-mail</Label>
        <Input type="email" {...register("email")} />
      </div>
      <div className="grid gap-3">
        <Label>Endereço</Label>
        <Input {...register("address")} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isSubmitting}>Salvar</Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>Cancelar</Button>
        <Button
          type="button"
          variant="outline"
          className="border-red-600 text-red-700 hover:bg-red-50"
          onClick={onDelete}
        >
          Excluir
        </Button>
      </div>
    </form>
  );
}