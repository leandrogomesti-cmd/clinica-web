"use client";

import AppFrame from "@/components/app-frame";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui/primitives";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CadastroClient() {
  const supabase = createClient();
  const [form, setForm] = useState({ nome: "", cpf: "", telefone: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("patients").insert({
      nome: form.nome,
      cpf: form.cpf,
      telefone: form.telefone,
    });
    setMsg(error ? `Erro: ${error.message}` : "Paciente criado!");
    setSaving(false);
  }

  return (
    <AppFrame>
      <Card>
        <CardHeader>
          <CardTitle>Novo paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3 max-w-md">
            <input
              className="border p-2 rounded w-full"
              placeholder="Nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
            <input
              className="border p-2 rounded w-full"
              placeholder="CPF"
              value={form.cpf}
              onChange={(e) => setForm({ ...form, cpf: e.target.value })}
            />
            <input
              className="border p-2 rounded w-full"
              placeholder="Telefone"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
            />
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando…" : "Salvar"}
            </Button>
            {msg && <div className="text-sm pt-2">{msg}</div>}
          </form>
        </CardContent>
      </Card>
    </AppFrame>
  );
}