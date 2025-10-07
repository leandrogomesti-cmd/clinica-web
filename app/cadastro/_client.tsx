// app/cadastro/_client.tsx
"use client";

import AppFrame from "@/components/app-frame";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui/primitives";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CadastroClient() {
  const supabase = createClient();

  const [form, setForm] = useState({ nome: "", cpf: "", telefone: "" });
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // OCR
  const [ocrLoading, setOcrLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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

  async function handleOCR(file: File) {
    setOcrLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/ocr/vision", { method: "POST", body: fd });
      const { parsed, error } = await res.json();
      if (error) throw new Error(error);

      // Preenche os campos controlados que você já tem (nome, cpf)
      setForm((prev) => ({
        ...prev,
        nome: parsed?.full_name ?? prev.nome,
        cpf: parsed?.cpf ?? prev.cpf,
        // telefone não vem de OCR normalmente; preserva o atual
      }));

      alert("Dados lidos do documento. Confira os campos.");
    } catch (e: any) {
      alert(e?.message ?? "Falha ao ler documento");
    } finally {
      setOcrLoading(false);
    }
  }

  return (
    <AppFrame>
      <Card>
        <CardHeader>
          <CardTitle>Novo paciente</CardTitle>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={onSubmit} className="space-y-3 max-w-md">
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

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando…" : "Salvar"}
              </Button>

              {/* Botão "Ler documento" adicionado sem alterar seu layout */}
              <Button
                type="button"
                variant="outline"
                disabled={ocrLoading}
                onClick={() => fileRef.current?.click()}
              >
                {ocrLoading ? "Lendo…" : "Ler documento"}
              </Button>

              {/* input de arquivo escondido */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleOCR(f);
                  e.currentTarget.value = "";
                }}
              />
            </div>

            {msg && <div className="text-sm pt-2">{msg}</div>}
          </form>
        </CardContent>
      </Card>
    </AppFrame>
  );
}