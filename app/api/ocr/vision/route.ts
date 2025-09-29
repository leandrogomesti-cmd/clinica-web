// app/api/ocr/vision/route.ts
export const runtime = "nodejs";

type Parsed = { nome?: string; cpf?: string; rg?: string; data_nascimento?: string };

function toISODate(ddmmyyyy: string | undefined): string | undefined {
  if (!ddmmyyyy) return undefined;
  const m = ddmmyyyy.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (!m) return undefined;
  return `${m[3]}-${m[2]}-${m[1]}`; // YYYY-MM-DD
}

function normalizeU(text: string) {
  return (text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\r/g, "");
}

function extractCPF(t: string): string | undefined {
  const m = t.match(/\b(\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2})\b/);
  if (!m) return undefined;
  const cpf = m[1].replace(/[^\d]/g, "");
  return cpf.length === 11 ? cpf : undefined;
}

function extractRG(t: string): string | undefined {
  // Preferir o bloco "DOC. IDENTIDADE" da CNH
  const m1 = t.match(/DOC\.?\s*IDENTIDADE[^\dA-Z]*(\d{5,12})/i);
  if (m1) return m1[1];

  // Padrões RG comuns (com/sem pontos, podendo terminar em X)
  const m2 = t.match(/\b(\d{1,2}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{1}[Xx]?)\b/);
  if (m2) return m2[1].replace(/[^\dXx]/g, "");
  return undefined;
}

function extractDOB(t: string): string | undefined {
  // CNH tem label "DATA NASCIMENTO"
  const m1 = t.match(/DATA\s*NASCIMENTO[^\d]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i);
  if (m1) return toISODate(m1[1]);

  // genérico
  const m2 = t.match(/\b(\d{2}[\/\-]\d{2}[\/\-]\d{4})\b/);
  if (m2) return toISODate(m2[1]);
  return undefined;
}

function extractNomeFromCNH(raw: string): string | undefined {
  // Procura label "NOME" e pega a linha seguinte/mesma linha
  const lines = raw.split(/\n/).map(s => s.trim()).filter(Boolean);

  // 1) Linha após "NOME"
  for (let i = 0; i < lines.length; i++) {
    if (/^NOME\b/i.test(lines[i])) {
      const sameLine = lines[i].replace(/^NOME[:\s]*/i, "").trim();
      if (sameLine.length >= 3) return sameLine.replace(/\s{2,}/g, " ");
      if (i + 1 < lines.length) {
        const next = lines[i + 1].trim();
        if (next.length >= 3) return next.replace(/\s{2,}/g, " ");
      }
    }
  }

  // 2) Fallback: maior linha em CAIXA ALTA antes de "DOC. IDENTIDADE"
  const stopIdx = lines.findIndex(l => /DOC\.?\s*IDENTIDADE/i.test(l));
  const search = (stopIdx > 0 ? lines.slice(0, stopIdx) : lines)
    .filter(s => /^[A-Z][A-Z\sÁÉÍÓÚÂÊÔÃÕÇ'.-]{4,}$/.test(s) && s.length <= 60)
    .sort((a, b) => b.length - a.length)[0];
  if (search) return search.replace(/\s{2,}/g, " ");

  return undefined;
}

function parseBrDocCNH(text: string): Parsed {
  // Importante: usar texto "cru" e também normalizado
  const raw = (text || "").replace(/\r/g, "");
  const t = normalizeU(raw);

  const cpf = extractCPF(raw) || extractCPF(t);
  const rg = extractRG(raw) || extractRG(t);
  const data_nascimento = extractDOB(raw) || extractDOB(t);
  const nome = extractNomeFromCNH(raw) || extractNomeFromCNH(t);

  return { nome, cpf, rg, data_nascimento };
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json() as { url?: string };
    if (!url) {
      return new Response(JSON.stringify({ ok: false, error: "missing-url" }), { status: 400 });
    }

    // 1) Baixa bytes da signed URL do Supabase Storage
    const imgResp = await fetch(url);
    if (!imgResp.ok) {
      return new Response(JSON.stringify({ ok: false, error: "fetch-file-failed" }), { status: 400 });
    }
    const arr = await imgResp.arrayBuffer();
    const base64 = Buffer.from(arr).toString("base64");

    // 2) Google Vision — usar DOCUMENT_TEXT_DETECTION e languageHints pt/pt-BR
    const gv = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [{
          image: { content: base64 },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          imageContext: { languageHints: ["pt", "pt-BR"] }
        }]
      })
    });

    if (!gv.ok) {
      return new Response(JSON.stringify({ ok: false, error: "vision-failed" }), { status: 502 });
    }

    const raw = await gv.json();

    const text: string =
      raw?.responses?.[0]?.fullTextAnnotation?.text ??
      raw?.responses?.[0]?.textAnnotations?.[0]?.description ??
      "";

    const parsed = parseBrDocCNH(text);

    return new Response(JSON.stringify({ ok: true, parsed, raw }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || "error" }), { status: 500 });
  }
}