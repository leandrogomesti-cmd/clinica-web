// app/autocadastro/page.tsx
"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

// mapeia selects da UI para enums do DB
function mapSexo(ui?: string) {
  switch (ui) {
    case "feminino": return "F";
    case "masculino": return "M";
    case "outro": return "OUTRO";
    case "nao_informar": return "NAO_INFORMADO";
    default: return undefined; // deixa default do DB
  }
}
function mapEstadoCivil(ui?: string) {
  switch (ui) {
    case "solteiro": return "SOLTEIRO";
    case "casado": return "CASADO";
    case "divorciado": return "DIVORCIADO";
    case "viuvo": return "VIUVO";
    case "uniao_estavel": return "UNIAO_ESTAVEL";
    default: return undefined; // deixa default do DB
  }
}

export default function Page() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const raw = Object.fromEntries(fd) as Record<string, any>;

    // normaliza telefone como string (pode ser vazio, mas NUNCA null)
    const tel = (raw.phone ?? "").toString().trim();

    const payload: Record<string, any> = {
      // Identificação
      ...(raw.full_name && { nome: raw.full_name }),
      ...(raw.cpf && { cpf: raw.cpf }),
      ...(raw.rg && { rg: raw.rg }),
      ...(raw.birth_date && { data_nascimento: raw.birth_date }),

      // Enums
      ...(raw.sex && { sexo: mapSexo(raw.sex) }),
      ...(raw.marital_status && { estado_civil: mapEstadoCivil(raw.marital_status) }),

      // Contatos
      telefone_whatsapp: tel,           // <- NOT NULL garantido
      ...(tel && { telefone: tel }),    // opcional: também grava em `telefone` se houver valor
      ...(raw.email && { email: raw.email }),

      // Profissão
      ...(raw.profession && { profissao: raw.profession }),

      // Endereço (mapeados para as colunas existentes)
      ...(raw.cep && { cep: raw.cep }),
      ...(raw.uf && { estado: raw.uf }),
      ...(raw.city && { cidade: raw.city }),
      ...(raw.district && { bairro: raw.district }),
      ...(raw.address && { logradouro: raw.address }),
      ...(raw.address_number && { numero: raw.address_number }),
      ...(raw.address_complement && { complemento: raw.address_complement }),

      // Observações é NOT NULL no DB
      observacoes: (raw.notes ?? "").toString(),

      // Status padrão
      status: "pendente",
    };

    const { error } = await supabase.from("pacientes_intake").insert(payload);
    setLoading(false);

    if (error) alert(error.message);
    else {
      alert("Cadastro enviado!");
      (e.currentTarget as HTMLFormElement).reset();
    }
  }

  async function handleOCR(file: File) {
    setOcrLoading(true);
    try {
      const imageBase64 = await fileToBase64(file);

      // 1ª tentativa: JSON (base64)
      let res = await fetch("/api/ocr/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      let data: any;
      try { data = await res.json(); } catch { data = null; }

      // Fallback: se a API exigir arquivo
      if (!res.ok && (data?.error?.includes?.("missing-url") || data?.error === "missing-url")) {
        const f = new FormData();
        f.append("file", file);
        res = await fetch("/api/ocr/vision", { method: "POST", body: f });
        data = await res.json();
      }

      if (!res.ok) throw new Error(data?.error || "Falha no OCR");

      const parsed = data?.parsed ?? {};
      const form = formRef.current!;
      const setVal = (name: string, v?: string) => {
        if (!v) return;
        const el = form.elements.namedItem(name) as HTMLInputElement | null;
        if (el) el.value = v;
      };

      setVal("full_name", parsed.full_name);
      setVal("cpf", parsed.cpf);
      setVal("birth_date", parsed.birth_date);
      setVal("rg", parsed.rg);

      alert("Dados lidos do documento. Confira os campos.");
    } catch (e: any) {
      alert(e?.message ?? "Falha ao ler documento");
    } finally {
      setOcrLoading(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      <Card>
        <CardHeader><CardTitle>Autocadastro</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Layout original preservado */}
          <form ref={formRef} onSubmit={onSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input name="full_name" placeholder="Nome completo" className="col-span-2" required />
              <Input name="cpf" placeholder="CPF" required />
              <Input name="birth_date" type="date" placeholder="Data de Nascimento" />
              <Input name="rg" placeholder="RG" className="col-span-2" />

              <Select name="marital_status">
                <SelectTrigger><SelectValue placeholder="Estado civil" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                  <SelectItem value="casado">Casado(a)</SelectItem>
                  <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                  <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                  <SelectItem value="uniao_estavel">União estável</SelectItem>
                </SelectContent>
              </Select>
              <Select name="sex">
                <SelectTrigger><SelectValue placeholder="Sexo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                  <SelectItem value="nao_informar">Prefiro não informar</SelectItem>
                </SelectContent>
              </Select>
              <Input name="phone" placeholder="Telefone" />
              <Input name="email" placeholder="Email (opcional)" className="col-span-2" />
              <Input name="profession" placeholder="Profissão" className="col-span-2" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input name="cep" placeholder="CEP" />
              <Input name="uf" placeholder="UF" />
              <Input name="city" placeholder="Cidade" />
              <Input name="district" placeholder="Bairro" />
              <Input name="address" placeholder="Logradouro" className="col-span-2" />
              <Input name="address_number" placeholder="Número" />
              <Input name="address_complement" placeholder="Complemento" />
            </div>

            <Textarea name="notes" placeholder="Observações" />

            <div className="flex gap-2">
              <Button disabled={loading}>{loading ? "Enviando…" : "Enviar"}</Button>
              <Button
                type="button"
                variant="outline"
                disabled={ocrLoading}
                onClick={() => fileRef.current?.click()}
              >
                {ocrLoading ? "Lendo…" : "Ler documento"}
              </Button>
            </div>

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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}