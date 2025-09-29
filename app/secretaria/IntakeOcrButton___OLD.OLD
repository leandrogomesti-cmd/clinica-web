'use client';
import { useRef, useState } from 'react';

export default function IntakeOcrButton({ intakeId, onDone }: { intakeId: string; onDone?: () => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setMsg(null);
    try {
      const upRes = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intake_id: intakeId, type: 'RG' }),
      });
      if (!upRes.ok) throw new Error(`Falha ao criar URL de upload (${upRes.status})`);
      const up = await upRes.json();
      if (!up?.url || !up?.storagePath) throw new Error(up?.error || 'Resposta inválida do upload-url');

      const put = await fetch(up.url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      if (!put.ok) throw new Error(`Upload falhou (${put.status})`);

      const ocrRes = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intake_id: intakeId, storagePath: up.storagePath }),
      });
      if (!ocrRes.ok) throw new Error(`Falha no OCR (${ocrRes.status})`);
      const ocr = await ocrRes.json();
      if (!ocr?.ok) throw new Error(ocr?.error || 'Falha no OCR');

      setMsg('OCR concluído ✓');
      onDone?.();
    } catch (e: any) {
      setMsg(e?.message || 'Erro no OCR');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.currentTarget.value = '';
        }}
      />
      <button
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="border px-3 py-1 rounded disabled:opacity-50"
        title="Anexar documento e rodar OCR"
      >
        {busy ? 'Processando…' : 'Anexar doc + OCR'}
      </button>
      {msg && <span className="text-xs text-gray-500">{msg}</span>}
    </div>
  );
}
