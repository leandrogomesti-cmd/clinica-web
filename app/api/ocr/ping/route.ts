export const runtime = "nodejs";

type Parsed = { nome?: string; cpf?: string; rg?: string; data_nascimento?: string };

function toISODate(s?: string) {
  if (!s) return undefined;
  const m = s.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : undefined;
}
function normalizeU(t: string) {
  return (t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\r/g, "");
}
function extractCPF(t: string) {
  const m = t.match(/\b(\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2})\b/);
  if (!m) return undefined;
  const cpf = m[1].replace(/[^\d]/g, "");
  return cpf.length === 11 ? cpf : undefined;
}
function extractRG(t: string) {
  const m1 = t.match(/DOC\.?\s*IDENTIDADE[^\dA-Z]*(\d{5,12})/i);
  if (m1) return m1[1];
  const m2 = t.match(/\b(\d{1,2}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{1}[Xx]?)\b/);
  return m2 ? m2[1].replace(/[^\dXx]/g, "") : undefined;
}
function extractDOB(t: string) {
  const m1 = t.match(/DATA\s*NASCIMENTO[^\d]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i);
  if (m1) return toISODate(m1[1]);
  const m2 = t.match(/\b(\d{2}[\/\-]\d{2}[\/\-]\d{4})\b/);
  return m2 ? toISODate(m2[1]) : undefined;
}
function extractNomeFromCNH(raw: string) {
  const lines = raw.split(/\n/).map(s => s.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    if (/^NOME\b/i.test(lines[i])) {
      const same = lines[i].replace(/^NOME[:\s]*/i, "").trim();
      if (same.length >= 3) return same.replace(/\s{2,}/g, " ");
      if (i + 1 < lines.length) {
        const next = lines[i + 1].trim();
        if (next.length >= 3) return next.replace(/\s{2,}/g, " ");
      }
    }
  }
  const stopIdx = lines.findIndex(l => /DOC\.?\s*IDENTIDADE/i.test(l));
  const search = (stopIdx > 0 ? lines.slice(0, stopIdx) : lines)
    .filter(s => /^[A-Z][A-Z\sÁÉÍÓÚÂÊÔÃÕÇ'.-]{4,}$/.test(s) && s.length <= 60)
    .sort((a, b) => b.length - a.length)[0];
  return search ? search.replace(/\s{2,}/g, " ") : undefined;
}
function parseBrDocCNH(text: string): Parsed {
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
    console.log("[OCR] start");
    const { url } = (await req.json()) as { url?: string };
    if (!url) {
      console.warn("[OCR] missing-url");
      return new Response(JSON.stringify({ ok: false, error: "missing-url" }), { status: 400 });
    }

    if (!process.env.GOOGLE_VISION_API_KEY) {
      console.error("[OCR] missing GOOGLE_VISION_API_KEY");
      return new Response(JSON.stringify({ ok: false, error: "missing-google-vision-api-key" }), { status: 500 });
    }

    console.log("[OCR] fetching signed URL…");
    const imgResp = await fetch(url);
    if (!imgResp.ok) {
      const txt = await imgResp.text().catch(() => "");
      console.error("[OCR] fetch-file-failed", imgResp.status, txt.slice(0, 200));
      return new Response(JSON.stringify({ ok: false, error: "fetch-file-failed", status: imgResp.status }), { status: 400 });
    }
    const arr = await imgResp.arrayBuffer();
    console.log("[OCR] got bytes:", (arr as ArrayBuffer).byteLength);

    console.log("[OCR] calling Vision…");
    const gv = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [{
          image: { content: Buffer.from(arr).toString("base64") },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          imageContext: { languageHints: ["pt", "pt-BR"] }
        }]
      })
    });

    if (!gv.ok) {
      const bodyTxt = await gv.text().catch(() => "");
      console.error("[OCR] vision-failed", gv.status, bodyTxt.slice(0, 200));
      return new Response(JSON.stringify({ ok: false, error: "vision-failed", status: gv.status, body: bodyTxt.slice(0, 500) }), { status: 502 });
    }

    const raw = await gv.json();
    const text: string =
      raw?.responses?.[0]?.fullTextAnnotation?.text ??
      raw?.responses?.[0]?.textAnnotations?.[0]?.description ?? "";

    const parsed = parseBrDocCNH(text);
    console.log("[OCR] parsed:", parsed);

    return new Response(JSON.stringify({ ok: true, parsed, raw }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[OCR] error:", e?.message || e);
    return new Response(JSON.stringify({ ok: false, error: e?.message || "error" }), { status: 500 });
  }
}