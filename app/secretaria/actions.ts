"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { createServerClient } from "@/lib/supabase/server";

type OcrParsed = {
  nome?: string;
  cpf?: string;
  rg?: string;
  data_nascimento?: string; // "YYYY-MM-DD"
};

export async function uploadAndOcrAction(formData: FormData) {
  const file = formData.get("file") as File | null;
  const docType = (formData.get("docType") as string | null)?.toLowerCase();
  const phone = (formData.get("phone") as string | null) ?? "";

  if (!file || file.size === 0) return { ok: false, error: "no-file" };

  const supabase = createServerClient(cookies());

  // 1) Auth + role
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "not-auth" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "staff") return { ok: false, error: "forbidden" };

  // 2) Upload no bucket privado
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${user.id}/${new Date().toISOString().slice(0,10)}/${randomUUID()}.${ext}`;

  const { error: upErr } = await supabase
    .storage.from("patient_documents")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (upErr) return { ok: false, error: "upload-failed" };

  // 3) Cria linha em patient_documents (status UPLOADED)
  const { data: docRow, error: docErr } = await supabase
    .from("patient_documents")
    .insert({
      intake_id: null,
      uploader_role: "staff",
      type: ["rg","cpf","cnh"].includes(String(docType)) ? docType : "desconhecido",
      storage_path: path,
      status: "UPLOADED"
    })
    .select()
    .single();

  if (docErr || !docRow) return { ok: false, error: "doc-row-failed" };

  // 4) OCR (Google Vision) — imagem em base64
  //    Obs.: PDFs exigem fluxo async/GCS; aqui tratamos imagens diretamente.
  const bytes = Buffer.from(await file.arrayBuffer());
  const base64 = bytes.toString("base64");

  const ocrResp = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [{
          image: { content: base64 },
          features: [{ type: "TEXT_DETECTION" }]
        }]
      })
    }
  );

  if (!ocrResp.ok) {
    // marca falha de OCR
    await supabase.from("patient_documents")
      .update({ status: "OCR_FAILED" }).eq("id", docRow.id);
    return { ok: false, error: "ocr-request-failed" };
  }

  const ocrJson = await ocrResp.json();
  const fullText: string =
    ocrJson?.responses?.[0]?.fullTextAnnotation?.text ??
    ocrJson?.responses?.[0]?.textAnnotations?.[0]?.description ?? "";

  // 5) Parse BR (heurística simples)
  const parsed = parseBrDoc(fullText);

  // 6) Atualiza patient_documents com ocr_raw/vendor/status
  await supabase.from("patient_documents").update({
    ocr_vendor: "google_vision",
    ocr_raw: ocrJson,
    status: "OCR_DONE"
  }).eq("id", docRow.id);

  // 7) Cria intake pendente (mínimo para NOT NULLs)
  const nome = parsed.nome?.trim() || "A IDENTIFICAR";
  const telefone_whatsapp = phone ?? "";
  let data_nascimento = parsed.data_nascimento ?? null;

  // valida YYYY-MM-DD simples
  if (data_nascimento && !/^\d{4}-\d{2}-\d{2}$/.test(data_nascimento)) data_nascimento = null;

  const { data: intake, error: intakeErr } = await supabase
    .from("pacientes_intake")
    .insert({
      nome,
      data_nascimento,
      cpf: parsed.cpf,
      rg: parsed.rg,
      telefone_whatsapp,
      status: "pendente",
      observacoes: "Criado via OCR automático"
    })
    .select("id")
    .single();

  if (intakeErr || !intake) return { ok: false, error: "intake-insert-failed" };

  // 8) Vínculo documento ↔ intake
  await supabase
    .from("patient_documents")
    .update({ intake_id: intake.id })
    .eq("id", docRow.id);

  revalidatePath("/secretaria");
  return { ok: true };
}

/** Heurísticas para RG/CPF/CNH + nome + data de nascimento */
function parseBrDoc(text: string): OcrParsed {
  const t = (text || "").normalize("NFKD").replace(/\u0301|\u0303|\u0327/g, "");
  const cpf = (t.match(/\b(\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2})\b/i)?.[1] || "")
    .replace(/[^\d]/g, "")
    .padStart(11, "0");
  const rg = (t.match(/\b(\d{1,2}[.\s]?\d{3}[.\s]?\d{3}[-\sXx]?\d)\b/)?.[1] || "").replace(/[^\dxX]/g, "");
  // Data DD/MM/AAAA ou DD-MM-AAAA
  const dt = t.match(/\b(\d{2})[\/\-](\d{2})[\/\-](\d{4})\b/);
  const data_nascimento = dt ? `${dt[3]}-${dt[2]}-${dt[1]}` : undefined;

  // Nome: heurística — pega linha com "NOME" ou a maior linha em caixa
  let nome = /NOME[:\s]*([A-ZÁÉÍÓÚÂÊÔÃÕÇ ]{3,})/.exec(t)?.[1];
  if (!nome) {
    const lines = t.split(/\r?\n/).map(s => s.trim());
    const candidates = lines.filter(s => /^[A-Z][A-Z\sÁÉÍÓÚÂÊÔÃÕÇ]{4,}$/.test(s) && s.length <= 70);
    nome = candidates.sort((a,b) => b.length - a.length)[0];
  }
  if (nome) nome = nome.replace(/\s{2,}/g, " ").trim();

  return { nome, cpf: cpf || undefined, rg: rg || undefined, data_nascimento };
}