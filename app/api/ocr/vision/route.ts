// app/api/ocr/vision/route.ts — CPF fix forte (prioriza rótulo “CPF”, janela multi‑linha e ignora Nº REGISTRO)
// Next.js App Router API (Edge)
// - Aceita JSON (imageBase64 | url) ou multipart/form-data (file)
// - Usa Google Vision DOCUMENT_TEXT_DETECTION com hints pt/pt-BR
// - Retorna campos extraídos (nome, cpf, rg, data_nascimento) + rawText/confidence

export const runtime = "edge";

const VISION_ENDPOINT = "https://vision.googleapis.com/v1/images:annotate";

interface Ok {
  parsed: {
    nome?: string;
    cpf?: string;
    rg?: string;
    data_nascimento?: string; // dd/mm/aaaa
  };
  rawText: string;
  confidence?: number;
}
interface Err { error: string }

type JsonResp = Ok | Err;

export async function POST(req: Request): Promise<Response> {
  try {
    const contentType = req.headers.get("content-type") || "";

    let base64: string | null = null;

    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({} as any));
      const imageBase64: string | undefined = body?.imageBase64;
      const url: string | undefined = body?.url;

      if (imageBase64) {
        base64 = sanitizeDataUrl(imageBase64);
      } else if (url) {
        const fetched = await fetch(url);
        if (!fetched.ok) return bad({ error: `fetch-failed: ${fetched.status}` });
        const ab = await fetched.arrayBuffer();
        base64 = toBase64(ab);
      }
    } else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = (form.get("file") || form.get("image")) as File | null;
      if (!file) return bad({ error: "missing-file" });

      // Recusa HEIC/HEIF explícito (cliente deve converter p/ JPEG)
      if (/heic|heif/i.test(file.type) || /\.heic$/i.test(file.name)) {
        return bad({ error: "heic-not-supported: envie JPEG/PNG" });
      }
      const ab = await file.arrayBuffer();
      base64 = toBase64(ab);
    }

    if (!base64) return bad({ error: "missing-input: informe imageBase64, url ou multipart file" });

    // Guard-rail de tamanho (~3MB após base64)
    const approxBytes = Math.ceil(base64.length * 0.75);
    if (approxBytes > 3_000_000) return bad({ error: "payload-too-large" });

    const key = process.env.GOOGLE_VISION_API_KEY;
    if (!key) return bad({ error: "vision-key-missing" });

    const payload = {
      requests: [
        {
          image: { content: base64 },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          imageContext: { languageHints: ["pt", "pt-BR"] },
        },
      ],
    };

    const res = await fetch(`${VISION_ENDPOINT}?key=${key}`,
      { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return bad({ error: `vision-failed:${res.status}:${t.slice(0,180)}` }, 502);
    }

    const data = await res.json();
    const anno = data?.responses?.[0];
    const text: string | undefined = anno?.fullTextAnnotation?.text;
    const confidence = avgConfidence(anno);

    if (!text) return ok({ parsed: {}, rawText: "", confidence });

    const normalized = normalize(text);

    const parsed: Ok["parsed"] = {
      cpf: extractCPF(normalized) || undefined,
      rg: extractRG(normalized) || undefined,
      nome: extractNome(normalized) || undefined,
      data_nascimento: extractNascimento(normalized) || undefined,
    };

    return ok({ parsed, rawText: text, confidence });
  } catch (e: any) {
    return bad({ error: e?.message || "internal-error" }, 500);
  }
}

/* ----------------------- helpers ----------------------- */

function ok(body: Ok, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
function bad(body: Err, status = 400) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function sanitizeDataUrl(s: string) {
  return s.replace(/^data:([\w/+-]+);base64,/, "");
}

function toBase64(ab: ArrayBuffer) {
  const bytes = new Uint8Array(ab);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function normalize(s: string) {
  return s
    .replace(/\r/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/* ======= EXTRAÇÕES ESPECÍFICAS ======= */

function formatCPF(d: string) {
  const digits = d.replace(/\D/g, "");
  if (digits.length !== 11) return null;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

function extractCPF(text: string) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const cpfRe = /(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})/;
  const isRegistroish = (u: string) => /(REGIST|N[º°o.]?\s*REG|NO\s+REG)/i.test(u);

  // A) captura robusta: janela de até 40 chars após a palavra CPF (suporta quebra de linha)
  {
    const m = text.match(/CPF[\s\S]{0,40}(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11})/i);
    if (m) return formatCPF(m[1]);
  }

  // B) prioriza a(s) linha(s) do rótulo CPF, olhando até 2 linhas abaixo e pulando "REGISTRO"
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    const U = L.toUpperCase();
    if (/\bCPF\b/.test(U)) {
      for (let j = i; j <= Math.min(i + 2, lines.length - 1); j++) {
        const Lj = lines[j];
        const Uj = Lj.toUpperCase();
        if (isRegistroish(Uj)) continue; // evita Nº REGISTRO
        const m = Lj.match(cpfRe);
        if (m) return formatCPF(m[1]);
      }
    }
  }

  // C) fallback geral: scana todas as linhas, ignorando quaisquer linhas "registro"
  for (const L of lines) {
    const U = L.toUpperCase();
    if (isRegistroish(U)) continue;
    const m = L.match(cpfRe);
    if (m) return formatCPF(m[1]);
  }
  return null;
}

// ---------- RG ----------
const RG_PATTERNS: RegExp[] = [
  /\b\d{2}\.?\d{3}\.?\d{3}-?[0-9Xx}\b/,   // 12.345.678-9 ou 12345678-9
  /\b\d{7,9}-?[0-9Xx}\b/,                 // 25099767-8
  /\b\d{8,9}\b/,                          // 8-9 dígitos (fallback)
];

function _findRG(s: string): string | null {
  for (const re of RG_PATTERNS) {
    const m = s.match(re);
    if (m) {
      const just = (m[0].match(/[\d.\-Xx]+/) || [])[0];
      return just?.toUpperCase() || null;
    }
  }
  return null;
}

function extractRG(text: string) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  // 1) perto do rótulo
  const idx = lines.findIndex((l) => /DOC\.?\s*IDENTIDADE|IDENTIDADE\/ORG|\bRG\b/i.test(l));
  if (idx >= 0) {
    const look = lines.slice(idx, idx + 4).join(" ");
    const rg = _findRG(look);
    if (rg) return rg;
  }
  // 2) varredura ignorando linhas com termos que confundem
  for (const l of lines) {
    if (/CPF|VALIDADE|HABILITA|REGISTRO|PERMISS|CATEG|EMISS/i.test(l)) continue;
    const rg = _findRG(l);
    if (rg) return rg;
  }
  return null;
}

function extractNascimento(text: string) {
  const m1 = text.match(/data\s*nasc(?:imento)?\s*[:\-]?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i);
  if (m1) return m1[1].replace(/-/g, "/");
  const m2 = text.match(/\b(\d{2}[\/\-]\d{2}[\/\-]\d{4})\b/);
  return m2 ? m2[1].replace(/-/g, "/") : null;
}

function extractNome(text: string) {
  const m1 = text.match(/nome\s*[:\-]?\s*([A-Z ]{3,})/i);
  if (m1) return cleanupNome(m1[1]);
  // fallback: linha antes de CPF
  const m2 = text.match(/(?:\n|^)([A-Z ]{3,})\s*\n.*cpf/i);
  if (m2) return cleanupNome(m2[1]);
  return null;
}
function cleanupNome(n: string) { return n.replace(/\s+/g, " ").trim(); }

function avgConfidence(anno: any) {
  try {
    const blocks = anno?.fullTextAnnotation?.pages?.[0]?.blocks ?? [];
    const confs: number[] = [];
    for (const b of blocks) if (typeof b.confidence === "number") confs.push(b.confidence);
    if (!confs.length) return undefined;
    return confs.reduce((a, b) => a + b, 0) / confs.length;
  } catch {
    return undefined;
  }
}