// app/cadastro/_components/ler-documento-button.tsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LerDocumentoButtonPublic({ onDone }: { onDone?: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      const file = (e.currentTarget.elements.namedItem('file') as HTMLInputElement).files?.[0];
      if (!file) throw new Error('Selecione um arquivo');

      // Upload para prefixo público:
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
      const path = `public_intake/${crypto.randomUUID()}.${ext}`;

      const up = await supabase.storage.from('patient_documents').upload(path, file, {
        contentType: file.type, upsert: false,
      });
      if (up.error) throw up.error;

      // Assina URL no client (anon tem select só no prefixo).
      const signed = await supabase.storage.from('patient_documents').createSignedUrl(path, 60 * 5);
      if (signed.error || !signed.data?.signedUrl) throw signed.error || new Error('Falha ao assinar URL');

      // Chama OCR
      const res = await fetch('/api/ocr/vision', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: signed.data.signedUrl }),
      });
      const ocr = await res.json();

      // Cria document + intake mínimos no banco (via client, respeitando RLS):
      const { data: doc, error: insDocErr } = await supabase
        .from('patient_documents')
        .insert({
          intake_id: null,
          uploader_role: 'public',
          type: 'desconhecido',
          storage_path: path,
          status: ocr?.ok ? 'OCR_DONE' : 'OCR_FAILED',
          ocr_vendor: ocr?.ok ? 'google_vision' : null,
          ocr_raw: ocr?.ok ? (ocr.raw ?? null) : null,
        })
        .select('id')
        .single();
      if (insDocErr) throw insDocErr;

      const parsed = ocr?.ok ? (ocr.parsed || {}) : {};
      const { data: intake, error: insIntakeErr } = await supabase
        .from('pacientes_intake')
        .insert({
          nome: parsed.nome || 'A IDENTIFICAR',
          data_nascimento: parsed.data_nascimento || null,
          cpf: parsed.cpf || null,
          rg: parsed.rg || null,
          telefone_whatsapp: null,  // o público pode preencher no formulário depois
          status: 'pendente',
          observacoes: ocr?.ok ? 'Criado via OCR público' : 'Criado via upload público (sem OCR)',
        })
        .select('id')
        .single();
      if (insIntakeErr) throw insIntakeErr;

      await supabase.from('patient_documents').update({ intake_id: intake.id }).eq('id', doc.id);

      setOpen(false);
      onDone?.();
    } catch (e:any) {
      setErr(e?.message || 'Erro inesperado');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => setOpen(true)}>
        Ler documento
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <form onSubmit={handle} className="bg-white p-4 rounded-xl w-full max-w-md space-y-3">
            <h3 className="text-lg font-semibold">Enviar RG/CPF/CNH</h3>
            <input type="file" name="file" accept="image/*" required />
            {err && <div className="text-red-600 text-sm">{err}</div>}
            <div className="flex justify-end gap-2">
              <button type="button" className="border px-3 py-1 rounded" onClick={() => setOpen(false)}>Cancelar</button>
              <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded" disabled={busy}>
                {busy ? 'Processando…' : 'Enviar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}