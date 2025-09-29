'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type Props = { className?: string; onDone?: () => void };

export default function LerDocumentoButton({ className, onDone }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setBusy(true);

    try {
      const form = e.currentTarget;
      const fileInput = form.elements.namedItem('file') as HTMLInputElement;
      const docTypeInput = form.elements.namedItem('docType') as HTMLInputElement;
      const phoneInput = form.elements.namedItem('phone') as HTMLInputElement;

      const file = fileInput.files?.[0];
      if (!file) throw new Error('Selecione um arquivo.');

      // 1) Checa sessão e role
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('Não autenticado.');
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (prof?.role !== 'staff') throw new Error('Apenas staff pode usar esta função.');

      // 2) Upload para o bucket privado patient_documents
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
      const path = `${user.id}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;

      const up = await supabase.storage.from('patient_documents').upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (up.error) throw up.error;

      // 3) Cria registro em patient_documents (status UPLOADED)
      const tipo = ['rg', 'cpf', 'cnh'].includes(docTypeInput.value.toLowerCase())
        ? docTypeInput.value.toLowerCase()
        : 'desconhecido';

      const insDoc = await supabase
        .from('patient_documents')
        .insert({
          intake_id: null,
          uploader_role: 'staff',
          type: tipo,
          storage_path: path,
          status: 'UPLOADED',
        })
        .select('id')
        .single();

      if (insDoc.error || !insDoc.data) throw insDoc.error || new Error('Falha ao registrar documento');
      const docId = insDoc.data.id as string;

      // 4) Tenta rodar OCR via API /api/ocr/vision (se não existir, segue com intake mínimo)
      let parsed: any = undefined;
      try {
        const signed = await supabase.storage.from('patient_documents').createSignedUrl(path, 60 * 5);
        if (!signed.error && signed.data?.signedUrl) {
          const ocrResp = await fetch('/api/ocr/vision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: signed.data.signedUrl }),
          });
          if (ocrResp.ok) {
            const ocr = await ocrResp.json();
            if (ocr?.ok) {
              parsed = ocr.parsed;
              await supabase.from('patient_documents').update({
                ocr_vendor: 'google_vision',
                ocr_raw: ocr.raw ?? null,
                status: 'OCR_DONE',
              }).eq('id', docId);
            } else {
              await supabase.from('patient_documents').update({ status: 'OCR_FAILED' }).eq('id', docId);
            }
          } else {
            await supabase.from('patient_documents').update({ status: 'OCR_FAILED' }).eq('id', docId);
          }
        }
      } catch {
        await supabase.from('patient_documents').update({ status: 'OCR_FAILED' }).eq('id', docId);
      }

      // 5) Cria intake pendente (usa OCR se existir; senão, mínimo)
      const tel = phoneInput.value ?? '';
      const nome = (parsed?.nome || 'A IDENTIFICAR') as string;
      const cpfRaw = (parsed?.cpf as string | undefined) || '';
      const cpf = /^\d{11}$/.test(cpfRaw) ? cpfRaw : null;
      const rg = (parsed?.rg as string | undefined) || null;
      const data_nascimento = (parsed?.data_nascimento as string | undefined) || null;

      const insIntake = await supabase.from('pacientes_intake').insert({
        nome,
        data_nascimento,
        cpf,
        rg,
        telefone_whatsapp: tel, // campo NOT NULL no seu schema
        status: 'pendente',
        observacoes: parsed ? 'Criado via OCR automático' : 'Criado via upload (sem OCR)',
      }).select('id').single();

      if (insIntake.error || !insIntake.data) throw insIntake.error || new Error('Falha ao criar intake');

      // 6) Vincula documento ao intake
      await supabase.from('patient_documents')
        .update({ intake_id: insIntake.data.id })
        .eq('id', docId);

      setOk('Documento processado. Pré-cadastro criado como pendente.');
      setOpen(false);
      onDone?.();
    } catch (e: any) {
      console.error(e);
      setErr(e?.message || 'Erro inesperado');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        className={`px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50 ${className ?? ''}`}
        onClick={() => setOpen(true)}
      >
        Ler Documento
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-xl p-4 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Enviar documento (RG/CPF/CNH)</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Por ora, imagens. PDF podemos tratar depois com fluxo async. */}
              <input type="file" name="file" accept="image/*" required />
              <input className="border p-2 rounded w-full" name="docType" placeholder="Tipo (rg/cpf/cnh) — opcional" />
              <input className="border p-2 rounded w-full" name="phone" placeholder="Telefone (opcional)" />
              {err && <div className="text-sm text-red-600">{err}</div>}
              {ok && <div className="text-sm text-green-700">{ok}</div>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-3 py-1 rounded border"
                  onClick={() => setOpen(false)}
                  disabled={busy}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
                  disabled={busy}
                >
                  {busy ? 'Processando…' : 'Enviar para leitura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}