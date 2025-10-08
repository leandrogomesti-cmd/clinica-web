// app/autocadastro/page.tsx — mapeado para pacientes_intake (corrigido)
"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

/** Util: arquivo -> base64 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result || ""));
    r.onerror = (e) => reject(e);
    r.readAsDataURL(file);
  });
}

/** Compressão/normalização para mobile (corrige EXIF, força JPEG)
 *  Faz passes progressivos até ficar < ~2.8MB de base64 (≈ 2.1MB binário)
 */
async function normalizeMobilePhoto(file: File, targetBytes = 2_800_000) {
  // 1ª passada (boa qualidade e 1800px)
  let out = await imageCompression(file, {
    maxWidthOrHeight: 1800,
    maxSizeMB: 1.5,
    initialQuality: 0.82,
    useWebWorker: true,
    fileType: "image/jpeg",
  });

  let base64 = await fileToBase64(out);
  let bytes = Math.ceil(base64.length * 0.75);

  // Passes adicionais, só se necessário
  const steps = [
    { max: 1600, q: 0.75 },
    { max: 1400, q: 0.70 },
    { max: 1200, q: 0.65 },
    { max: 1000, q: 0.60 },
  ];

  for (const s of steps) {
    if (bytes <= targetBytes) break;
    out = await imageCompression(file, {
      maxWidthOrHeight: s.max,
      maxSizeMB: 1,
      initialQuality: s.q,
      useWebWorker: true,
      fileType: "image/jpeg",
    });
    base64 = await fileToBase64(out);
    bytes = Math.ceil(base64.length * 0.75);
  }

  return { file: out, base64, bytes };
}

// Helpers de normalização/enum
function onlyDigits(s = "") { return s.replace(/\D+/g, ""); }
function mapSexo(v: string): "MASCULINO" | "FEMININO" | "OUTRO" | undefined {
  if (!v) return undefined;
  const x = v.toLowerCase();
  if (x === "masculino") return "MASCULINO";
  if (x === "feminino") return "FEMININO";
  if (x === "outro") return "OUTRO";
  return undefined; // nao_informar => omite p/ cair no DEFAULT do banco
}
function mapEstadoCivil(v: string): "SOLTEIRO" | "CASADO" | "DIVORCIADO" | "VIUVO" | "UNIAO_ESTAVEL" | undefined {
  if (!v) return undefined;
  const x = v.toLowerCase();
  if (x === "solteiro") return "SOLTEIRO";
  if (x === "casado") return "CASADO";
  if (x === "divorciado") return "DIVORCIADO";
  if (x === "viuvo") return "VIUVO";
  if (x === "uniao_estavel") return "UNIAO_ESTAVEL";
  return undefined; // nao_informar => omite p/ cair no DEFAULT do banco
}

export default function AutocadastroPage() {
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const input = fileRef.current;
    if (!input) return;
    input.removeAttribute("capture");
    input.click();
  };

  const [ocrLoading, setOcrLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    rg: "",
    data_nascimento: "", // ISO yyyy-mm-dd (mapeia p/ coluna data_nascimento)
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
      // Monta payload apenas com colunas existentes e valores definidos
      const payload: Record<string, any> = {};
      const cpfDigits = onlyDigits(form.cpf);
      if (form.nome) payload.nome = form.nome;
      if (cpfDigits.length === 11) payload.cpf = cpfDigits; // evita reprovação no CHECK
      if (form.rg) payload.rg = form.rg;
      if (form.data_nascimento) payload.data_nascimento = form.data_nascimento;
      const sexoDb = mapSexo(form.sexo);
      if (sexoDb) payload.sexo = sexoDb; // se não selecionar, cai no DEFAULT (NAO_INFORMADO)
      const ecDb = mapEstadoCivil(form.estado_civil);
      if (ecDb) payload.estado_civil = ecDb; // idem
      if (form.telefone) payload.telefone = form.telefone;
      if (form.email) payload.email = form.email;
      if (form.profissao) payload.profissao = form.profissao;
      if (form.cep) payload.cep = form.cep;
      if (form.cidade) payload.cidade = form.cidade;
      if (form.bairro) payload.bairro = form.bairro;
      if (form.logradouro) payload.logradouro = form.logradouro;
      if (form.numero) payload.numero = form.numero;
      if (form.complemento) payload.complemento = form.complemento;
      if (form.observacoes) payload.observacoes = form.observacoes;

      const { error } = await supabase.from("pacientes_intake").insert(payload);

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
      const normalized = await normalizeMobilePhoto(file);
      const imageBase64 = normalized.base64;

      let res = await fetch("/api/ocr/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64 }),
      });

      let data: any;
      try { data = await res.json(); } catch { data = null; }

      if (!res.ok && (data?.error?.includes?.("missing-url") || data?.error === "missing-url")) {
        const f = new FormData();
        f.append("file", normalized.file);
        res = await fetch("/api/ocr/vision", { method: "POST", body: f });
        data = await res.json();
      }

      if (data?.error) throw new Error(String(data.error));

      const parsed = data?.parsed ?? data;

      const nome = parsed?.nome ?? parsed?.name ?? parsed?.NOME;
      const cpf = parsed?.cpf ?? parsed?.CPF;
      const rg = parsed?.rg ?? parsed?.RG ?? parsed?.registro;
      const nasc = parsed?.birth_date ?? parsed?.data_nascimento ?? parsed?.nascimento;

      setForm((prev) => ({
        ...prev,
        nome: nome ?? prev.nome,
        cpf: cpf ?? prev.cpf,
        rg: rg ?? prev.rg,
        data_nascimento: nasc ? toISO(nasc) : prev.data_nascimento,
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
        {/* Cabeçalho com botão à direita */}
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Autocadastro</CardTitle>
          <div className="flex items-center gap-2">
            <Button type="button" onClick={openPicker} disabled={ocrLoading}>
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
                <Input type="date" value={form.data_nascimento} onChange={(e) => setField("data_nascimento", e.target.value)} />
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
                <select
                  className="w-full border rounded-md h-10 px-3 text-sm"
                  value={form.estado_civil}
                  onChange={(e) => setField("estado_civil", e.target.value)}
                >
                  <option value="" disabled>Selecione</option>
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="divorciado">Divorciado(a)</option>
                  <option value="viuvo">Viúvo(a)</option>
                  <option value="uniao_estavel">União estável</option>
                  <option value="nao_informar">Prefiro não informar</option>
                </select>
              </div>
              <div>
                <label className="text-sm">Sexo</label>
                <select
                  className="w-full border rounded-md h-10 px-3 text-sm"
                  value={form.sexo}
                  onChange={(e) => setField("sexo", e.target.value)}
                >
                  <option value="" disabled>Selecione</option>
                  <option value="feminino">Feminino</option>
                  <option value="masculino">Masculino</option>
                  <option value="outro">Outro</option>
                  <option value="nao_informar">Prefiro não informar</option>
                </select>
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
  if (/^\d{4}-\d{2}-\d{2}$/.test(x)) return x; // já em ISO
  const m = x.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/); // dd/mm/aaaa
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return "";
}