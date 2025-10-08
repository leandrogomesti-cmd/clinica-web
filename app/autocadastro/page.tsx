// app/autocadastro/page.tsx
"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/** Util: arquivo -> base64 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result || "");
      resolve(s);
    };
    r.onerror = (e) => reject(e);
    r.readAsDataURL(file);
  });
}

/** Compressão/normalização para mobile (corrige EXIF e força JPEG) */
async function normalizeMobilePhoto(file: File) {
  const out = await imageCompression(file, {
    maxWidthOrHeight: 1800,
    maxSizeMB: 1.5,
    initialQuality: 0.82,
    useWebWorker: true,
    fileType: "image/jpeg",
  });
  return out;
}

export default function AutocadastroPage() {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [ocrLoading, setOcrLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    rg: "",
    birth_date: "", // ISO yyyy-mm-dd
    estado_civil: "",
    sexo: "",
    telefone: "",
    email: "",
    profissao: "",
    cep: "",
    cidade: "",
    bairro: "",
    logradouro: "",
    numero: "",
    complemento: "",
    observacoes: "",
  });

  function setField<K extends keyof typeof form>(key: K, v: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: v }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    try {
      // Insere intake — RLS permite anon INSERT
      const { error } = await supabase.from("pacientes_intake").insert({
        nome: form.nome || null,
        cpf: form.cpf || null,
        rg: form.rg || null,
        birth_date: form.birth_date || null,
        estado_civil: form.estado_civil || null,
        sexo: form.sexo || null,
        telefone: form.telefone || null,
        email: form.email || null,
        profissao: form.profissao || null,
        cep: form.cep || null,
        cidade: form.cidade || null,
        bairro: form.bairro || null,
        logradouro: form.logradouro || null,
        numero: form.numero || null,
        complemento: form.complemento || null,
        observacoes: form.observacoes || null,
      });

      if (error) alert(error.message);
      else {
        alert("Cadastro enviado!");
        (e.currentTarget as HTMLFormElement).reset();
      }
    } finally {
      setSending(false);
    }
  }

  async function handleOCR(file: File) {
    setOcrLoading(true);
    try {
      // 1) Normaliza imagem (corrige orientação HEIC/EXIF e reduz tamanho)
      const normalized = await normalizeMobilePhoto(file);
      const imageBase64 = await fileToBase64(normalized);

      // 2) Tenta JSON (base64)
      let res = await fetch("/api/ocr/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      let data: any;
      try { data = await res.json(); } catch { data = null; }

      // 3) Fallback para multipart (caso servidor exija URL/arquivo)
      if (!res.ok && (data?.error?.includes?.("missing-url") || data?.error === "missing-url")) {
        const f = new FormData();
        f.append("file", normalized);
        res = await fetch("/api/ocr/vision", { method: "POST", body: f });
        data = await res.json();
      }

      if (data?.error) throw new Error(String(data.error));

      // O endpoint retorna { parsed, rawText }
      const parsed = data?.parsed ?? data;

      // Aceitar diferentes chaves (nome/name, data_nascimento/birth_date, etc.)
      const nome = parsed?.nome ?? parsed?.name ?? parsed?.NOME;
      const cpf = parsed?.cpf ?? parsed?.CPF;
      const rg = parsed?.rg ?? parsed?.RG ?? parsed?.registro;
      const nasc = parsed?.birth_date ?? parsed?.data_nascimento ?? parsed?.nascimento;

      setForm((prev) => ({
        ...prev,
        nome: nome ?? prev.nome,
        cpf: cpf ?? prev.cpf,
        rg: rg ?? prev.rg,
        birth_date: nasc ? toISO(nasc) : prev.birth_date,
      }));

      alert("Dados lidos do documento. Confira os campos.");
    } catch (e: any) {
      alert(e?.message ?? "Falha ao ler documento");
    } finally {
      setOcrLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Autocadastro</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Identificação */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="text-sm">Nome completo</label>
                <Input value={form.nome} onChange={(e) => setField("nome", e.target.value)} required />
              </div>
              <div>
                <label className="text-sm">CPF</label>
                <Input value={form.cpf} onChange={(e) => setField("cpf", e.target.value)} inputMode="numeric" />
              </div>
              <div>
                <label className="text-sm">RG</label>
                <Input value={form.rg} onChange={(e) => setField("rg", e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Data de nascimento</label>
                <Input type="date" value={form.birth_date} onChange={(e) => setField("birth_date", e.target.value)} />
              </div>
              <div className="flex items-end gap-2">
                <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()} disabled={ocrLoading}>
                  {ocrLoading ? "Lendo…" : "Ler do documento"}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,application/pdf"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleOCR(f);
                    e.currentTarget.value = "";
                  }}
                />
              </div>
            </div>

            {/* Contato */}
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Telefone</label>
                <Input value={form.telefone} onChange={(e) => setField("telefone", e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Email (opcional)</label>
                <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
              </div>
            </div>

            {/* Dados complementares */}
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm">Estado civil</label>
                <Select value={form.estado_civil} onValueChange={(v) => setField("estado_civil", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                    <SelectItem value="casado">Casado(a)</SelectItem>
                    <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                    <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                    <SelectItem value="uniao_estavel">União estável</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm">Sexo</label>
                <Select value={form.sexo} onValueChange={(v) => setField("sexo", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feminino">Feminino</SelectItem>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                    <SelectItem value="nao_informar">Prefiro não informar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Endereço */}
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm">CEP</label>
                <Input value={form.cep} onChange={(e) => setField("cep", e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Cidade</label>
                <Input value={form.cidade} onChange={(e) => setField("cidade", e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Bairro</label>
                <Input value={form.bairro} onChange={(e) => setField("bairro", e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Logradouro</label>
                <Input value={form.logradouro} onChange={(e) => setField("logradouro", e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Número</label>
                <Input value={form.numero} onChange={(e) => setField("numero", e.target.value)} />
              </div>
              <div>
                <label className="text-sm">Complemento</label>
                <Input value={form.complemento} onChange={(e) => setField("complemento", e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-sm">Profissão</label>
              <Input value={form.profissao} onChange={(e) => setField("profissao", e.target.value)} />
            </div>

            <div>
              <label className="text-sm">Observações</label>
              <Textarea value={form.observacoes} onChange={(e) => setField("observacoes", e.target.value)} />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={sending}>{sending ? "Enviando…" : "Enviar"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

/** Converte vários formatos de data BR/ISO para yyyy-mm-dd */
function toISO(x?: string) {
  if (!x) return "";
  // já em ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(x)) return x;
  // dd/mm/aaaa
  const m = x.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return "";
}