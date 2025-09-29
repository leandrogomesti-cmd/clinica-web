"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LerDocumentoButton({ className, onDone }: { className?: string; onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setBusy(true);

    try {
      const form = e.currentTarget;
      const fileInput = form.elements.namedItem("file") as HTMLInputElement;
      const docTypeInput = form.elements.namedItem("docType") as HTMLInputElement;
      const phoneInput = form.elements.namedItem("phone") as HTMLInputElement;

      const file = fileInput.files?.[0];
      if (!file) throw new Error("Selecione um arquivo.");

      // 1) staff?
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error("Não autenticado.");
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (prof?.role !== "staff") throw new Error("Apenas staff pode usar esta função.");

      // 2) upload seguro (bucket privado)
      const ext = (file.name.split(".").pop() || "bin").toLowerCase();
      const path = `${user.id}/${new Date().toISOString().slice(0,10)}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("patient_documents").upload(path, file, {
        contentType: file.type, upsert: false,
      });
      if (up.error) throw up.error;

      // 3) cria linha em patient_documents
      const tipo = ["rg","cpf","cnh"].includes(docTypeInput.value.toLowerCase())
        ? docTypeInput.value.toLowerCase() : "desconhecido";

      const ins = await supabase.from("patient_documents").insert({
        intake_id: null,
        uploader_role: "staff",
        type: tipo,
        storage_path: path,
        status: "UPLOADED",
      }).select("id").single();
      if (ins.error || !ins.data) throw ins.error || new Error("Falha ao registrar documento");
      const docId = ins.data.id as string;

      // 4) signed URL + OCR
      const signed = await supabase.storage.from("patient_documents").createSignedUrl(path, 60 * 5);
      if (signed.error || !signed.data?.signedUrl) throw signed.error || new Error("Falha ao gerar signed URL");

      const ocrResp = await fetch("/api/ocr/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: signed.data.signedUrl }),
      });
      if (!ocrResp.ok) throw new Error("Falha no OCR");
      const ocr = await ocrResp.json() as { ok: boolean; parsed?: any; raw?: any; error?: string };
      if (!ocr.ok) throw new Error(ocr.error || "OCR sem resposta");

      // 5) atualiza patient_documents com OCR
      await supabase.from("patient_documents").update({
        ocr_vendor: "google_vision",
        ocr_raw: ocr.raw ?? null,
        status: "OCR_DONE",
      }).eq("id", docId);

      // 6) cria intake pendente
      const nome = (ocr.parsed?.nome || "A IDENTIFICAR") as string;
      const data_nascimento = (ocr.parsed?.data_nascimento || null) as string | null;
      const cpf = (ocr.parsed?.cpf || null) as string | null;
      const rg = (ocr.parsed?.rg || null) as string | null;
      const tel = phoneInput.value ?? "";

      const insIntake = await supabase.from("pacientes_intake").insert({
        nome,
        data_nascimento,
        cpf,
        rg,
        telefone_whatsapp: tel,
        status: "pendente",
        observacoes: "Criado via OCR automático",
      }).select("id").single();
      if (insIntake.error || !insIntake.data) throw insIntake.error || new Error("Falha ao criar intake");

      // 7) vincula doc -> intake
      await supabase.from("patient_documents")
        .update({ intake_id: insIntake.data.id })
        .eq("id", docId);

      setOpen(false);
      onDone?.();
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || "Erro inesperado");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className={`px-3 py-1 rounded bg-blue-600 text-white ${className ?? ""}`} onClick={() => setOpen(true)}>
        Ler Documento
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-xl p-4 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Enviar documento (RG/CPF/CNH)</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="file" name="file" accept="image/*" required />
              <input className="border p-2 rounded w-full" name="docType" placeholder="Tipo (rg/cpf/cnh) — opcional" />
              <input className="border p-2 rounded w-full" name="phone" placeholder="Telefone (opcional)" />
              {err && <div className="text-sm text-red-600">{err}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" className="px-3 py-1 rounded border" onClick={() => setOpen(false)} disabled={busy}>Cancelar</button>
                <button type="submit" className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50" disabled={busy}>
                  {busy ? "Processando…" : "Enviar para leitura"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}