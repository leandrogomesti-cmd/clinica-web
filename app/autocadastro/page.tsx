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
      // resultado vem como "data:...;base64,AAAA"; pegamos só o base64
      resolve(s.includes(",") ? s.split(",")[1] : s);
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
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

    // 🔁 Mapeamentos p/ colunas do DB (sem mudar seus inputs)
    const payload: Record<string, any> = { ...raw };

    // full_name (UI) -> nome (DB)
    if (raw.full_name && !raw.nome) {
      payload.nome = raw.full_name;
      delete payload.full_name;
    }

    // birth_date (UI) -> data_nascimento (DB)
    if (raw.birth_date && !raw.data_nascimento) {
      payload.data_nascimento = raw.birth_date; // já está em YYYY-MM-DD
      delete payload.birth_date;
    }

    // phone (UI) -> telefone (DB)
    if (raw.phone && !raw.telefone) {
      payload.telefone = raw.phone;
      delete payload.phone;
    }

    if (!payload.status) payload.status = "pendente";

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

      const res = await fetch("/api/ocr/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha no OCR");

      const parsed = data?.parsed ?? {};

      // preenche SOMENTE se o input existe
      const form = formRef.current!;
      const setVal = (name: string, v?: string) => {
        if (!v) return;
        const el = form.elements.namedItem(name) as HTMLInputElement | null;
        if (el) el.value = v;
      };

      setVal("full_name", parsed.full_name);
      setVal("cpf", parsed.cpf);
      // para o autocadastro o input é "birth_date" (UI),
      // a conversão para data_nascimento é feita no submit
      setVal("birth_date", parsed.birth_date);
      // se você tiver <Input name="rg" />, também será preenchido
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
          {/* Seu layout e campos permanecem iguais */}
          <form ref={formRef} onSubmit={onSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input name="full_name" placeholder="Nome completo" className="col-span-2" required />
              <Input name="cpf" placeholder="CPF" required />
              <Input name="birth_date" type="date" placeholder="Data de Nascimento" />
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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}