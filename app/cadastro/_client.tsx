// app/cadastro/_client.tsx
"use client";

import AppFrame from "@/components/app-frame";
import { Card, CardHeader, CardTitle, CardContent, Button } from "@/components/ui/primitives";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result || "");
      resolve(s.includes(",") ? s.split(",")[1] : s);
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// OCR helpers (mesmos da outra página)
const pickCPF = (t: string) => t.match(/(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/)?.[1];
const pickBirth = (t: string) => t.match(/\b(\d{2}\/\d{2}\/\d{4})\b/)?.[1];
const pickName = (t: string) => t.match(/NOME[:\s]*([A-ZÀ-Ú\s]{3,})/i)?.[1]?.trim();

export default function CadastroClient() {
  const supabase = createClient();

  const [form, setForm] = useState<{ nome: string; cpf: string; telefone: string; birth_date?: string }>({
    nome: "",
    cpf: "",
    telefone: "",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [ocrLoading, setOcrLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    // patients NÃO tem coluna cpf; envia só o que existe
    const payload: Record<string, any> = {
      full_name: form.nome,
      phone: form.telefone,
    };
    if (form.birth_date) payload.birth_date = form.birth_date; // yyyy-mm-dd (o input da sua UI já envia como date)

    const { error } = await supabase.from("patients").insert(payload);
    setMsg(error ? `Erro: ${error.message}` : "Paciente criado!");
    setSaving(false);
  }

  async function handleOCR(file: File) {
    setOcrLoading(true);
    try {
      const imageBase64 = await fileToBase64(file);

      let res = await fetch("/api/ocr/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      let data: any;
      try { data = await res.json(); } catch { data = null; }

      if (!res.ok && (data?.error?.includes?.("missing-url") || data?.error === "missing-url")) {
        const fd = new FormData();
        fd.append("file", file);
        res = await fetch("/api/ocr/vision", { method: "POST", body: fd });
        data = await res.json();
      }

      if (!res.ok) throw new Error(data?.error || "Falha no OCR");

      const parsed = data?.parsed ?? {};
      const fullText: string = data?.text ?? "";

      setForm((prev) => ({
        ...prev,
        nome: parsed.full_name ?? pickName(fullText) ?? prev.nome,
        cpf: parsed.cpf ?? pickCPF(fullText) ?? prev.cpf,          // só UI
        birth_date: parsed.birth_date ?? pickBirth(fullText) ?? prev.birth_date,
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
          <form onSubmit={onSubmit} className="space-y-3 max-w-md">
            <input
              className="border p-2 rounded w-full"
              placeholder="Nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
            />
            <input
              className="border p-2 rounded w-full"
              placeholder="CPF (apenas exibição)"
              value={form.cpf}
              onChange={(e) => setForm({ ...form, cpf: e.target.value })}
            />
            <input
              className="border p-2 rounded w-full"
              type="date"
              value={form.birth_date || ""}
              onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
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

              <Button
                type="button"
                variant="outline"
                disabled={ocrLoading}
                onClick={() => fileRef.current?.click()}
              >
                {ocrLoading ? "Lendo…" : "Ler documento"}
              </Button>

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