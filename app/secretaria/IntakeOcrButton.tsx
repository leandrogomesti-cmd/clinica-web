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
      // 1) Pede URL de upload assinada
      const upRes = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intake_id: intakeId, type: 'RG' }),
      });
      if (!upRes.ok) throw new Error(`Falha ao criar URL de upload (${upRes.status})`);
      const up = await upRes.json();
      if (!up?.url || !up?.storagePath) throw new Error(up?.error || 'Resposta inválida do upload-url');

      // 2) Faz o upload direto para o Storage
      const put = await fetch(up.url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      if (!put.ok) throw new Error(`Upload falhou (${put.status})`);

      // 3) Dispara OCR
      const ocrRes = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intake_id: intakeId, storagePath: up.storagePath }),
      });
      if (!ocrRes.ok) throw new Error(`Falha no OCR (${ocrRes.status})`);
      const ocr = await ocrRes.json();
      if (!ocr?.ok) throw new Error(ocr?.error |
