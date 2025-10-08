// app/api/ocr/vision/route.ts
// Next.js App Router API (Edge)
// - Aceita JSON (imageBase64 | url) ou multipart/form-data (file)
// - Usa Google Vision DOCUMENT_TEXT_DETECTION com hints pt/pt-BR
// - Retorna campos extraídos (nome, cpf, rg, data_nascimento) + rawText/confidence

export const runtime = "edge";

const VISION_ENDPOINT = "https://vision.googleapis.com/v1/images:annotate";

// ---------- tipos ----------
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

// ---------- handler ----------
export async function POST(req: Request): Promise<Response> {
  try {
    const ct = req.headers.get("content-type") || "";
    let base64: string | null = null;

    if (ct.includes("application/json")) {
      const body = await req.json().catch(() => ({} as any));
      const imageBase64: string | undefined = body?.imageBase64;
      const url: string | undefined = body?.url;
      if (imageBase64) {
        base64 = sanitizeDataUrl(imageBase64);
      } else if (url) {
        const r = await fetch(url);
        if (!r.ok) return bad({ error: `fetch-failed:${r.status}` });
        const ab = await r.arrayBuffer();
        base64 = toBase64(ab);
      }
    } else if (ct.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = (form.get("file") || form.get("image")) as File | null;
      if (!file) return bad({ error: "missing-file" });
      if (/heic|heif/i.test(file.type) || /\.heic$/i.test(file.name)) {
        return bad({ error: "heic-not-supported: envie JPEG/PNG" });
      }
      const ab = await file.arrayBuffer();
      base64 = toBase64(ab);
    }

    if (!base64) return bad({ error: "missing-input: informe imageBase64, url ou multipart file" });

    // Guard-rail de tamanho (~3MB pós-base64)
    const approxBytes = Math.ceil(base64.length * 0.75);
    if (approxBytes > 3_000_000) return bad({ error: "payload-too-large" });

    const key = process.env.GOOGLE_VISION_API_KEY;
    if (!key) return bad({ error: "vision-key-missing" });

    const payload = {
      requests: [{
        image: { content: base64 },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
        imageContext: { languageHints: ["pt", "pt-BR"] },
      }],
    };

    const g = await fetch(`${VISION_ENDPOINT}?key=${key}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!g.ok) {
      const t = await g.text().catch(() => "");
      return bad({ error: `vision-failed:${g.status}:${t.slice(0,180)}` }, 502);
    }

    const data = await g.json();
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

/* ---------------- util http ---------------- */
function ok(body: Ok, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
function bad(body: Err, status = 400) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

/* ---------------- util base64/normalize ---------------- */
function sanitizeDataUrl(s: string) {
  return s.replace(/^data:([\w/+-]+);base64,/, "");
}
function toBase64(ab: ArrayBuffer) {
  const bytes = new Uint8Array(ab);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin); // disponível no runtime Edge
}
function normalize(s: string) {
  return s
    .replace(/\r/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/* ================== EXTRAÇÕES ================== */

// ---------- CPF ----------
const CPF_DOTTED = /\d{3}\.\d{3}\.\d{3}-\d{2}/;
const CPF_PLAIN = /\b\d{11}\b/;
const CPF_SHORT = /\b\d{9}-\d{2}\b/; // cartão do CPF

function formatCPF(any: string) {
  const d = any.replace(/\D/g, "");
  if (d.length !== 11) return null;
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
function isRegistroish(u: string) {
  return /(REGIST|N[º°o.]?\s*REG|NO\s+REG)/i.test(u);
}
function isInscricaoish(u: string) {
  return /(INSCRICAO|INSCRI[ÇC][AÃ]O|N[º°o.]?\s*DE\s*INSCRI)/i.test(u);
}
function extractCPF(text: string) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  // A) janela pós-rótulo (CPF ou Nº de Inscrição)
  {
    const m1 = text.match(/CPF[\s\S]{0,80}(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11}|\d{9}-\d{2})/i);
    if (m1) return formatCPF(m1[1])!;
    const m2 = text.match(/(N[º°o.]?\s*DE\s*INSCRI[ÇC][AÃ]O|INSCRI[ÇC][AÃ]O)[\s\S]{0,60}(\d{3}\.\d{3}\.\d{3}-\d{2}|\d{11}|\d{9}-\d{2})/i);
    if (m2) return formatCPF(m2[2])!;
  }

  // B) linhas com CPF/INSCRIÇÃO (até 2 linhas abaixo), ignorando “REGISTRO”
  for (let i = 0; i < lines.length; i++) {
    const U = lines[i].toUpperCase();
    if (/\bCPF\b/.test(U) || isInscricaoish(U)) {
      for (let j = i; j <= Math.min(i + 2, lines.length - 1); j++) {
        const Lj = lines[j], Uj = Lj.toUpperCase();
        if (isRegistroish(Uj)) continue;
        const m = Lj.match(CPF_DOTTED) || Lj.match(CPF_SHORT) || Lj.match(CPF_PLAIN);
        if (m) return formatCPF(m[0])!;
      }
    }
  }

  // C) fallback geral — scana todas as linhas, pulando “REGISTRO”
  for (const L of lines) {
    const U = L.toUpperCase();
    if (isRegistroish(U)) continue;
    const m = L.match(CPF_DOTTED) || L.match(CPF_SHORT) || L.match(CPF_PLAIN);
    if (m) return formatCPF(m[0])!;
  }
  return null;
}

// ---------- RG ----------
const RG_PATTERNS: RegExp[] = [
  /\b\d{2}\.?\d{3}\.?\d{3}-?[0-9Xx]\b/, // 12.345.678-9 / 12345678-9
  /\b\d{7,9}-?[0-9Xx]\b/,               // 25099767-8
  /\b\d{8,9}\b/,                        // 8–9 dígitos (fallback)
];
function extractRG(text: string) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  // 1) perto do rótulo
  const idx = lines.findIndex((l) => /DOC\.?\s*IDENTIDADE|IDENTIDADE\/ORG|\bRG\b/i.test(l));
  if (idx >= 0) {
    const look = lines.slice(idx, idx + 4).join(" ");
    const rg = findRG(look);
    if (rg) return rg;
  }

  // 2) varredura — ignorar linhas com CPF/INSCRIÇÃO/Cadastro PF/Registro
  for (const l of lines) {
    const U = l.toUpperCase();
    if (/CPF/i.test(U) || isInscricaoish(U) || /CADASTRO\s+DE\s+PESSOAS\s+FISICAS/i.test(U) || isRegistroish(U)) continue;
    if (/VALIDADE|HABILITA|PERMISS|CATEG|EMISS/i.test(U)) continue;
    const rg = findRG(l);
    if (rg) return rg;
  }
  return null;
}
function findRG(s: string): string | null {
  for (const re of RG_PATTERNS) {
    const m = s.match(re);
    if (m) {
      const just = (m[0].match(/[\d.\-Xx]+/) || [])[0];
      return just?.toUpperCase() || null;
    }
  }
  return null;
}

// ---------- Nascimento (dd/mm/aaaa ou dd/mm/aa) ----------
function extractNascimento(text: string) {
  // 1) com rótulo
  const m1 = text.match(/data\s*(?:de\s*)?nasc(?:imento)?\s*[:\-]?\s*(\d{2}[\/\-]\d{2}[\/\-](\d{2}|\d{4}))/i);
  if (m1) return normalizeBrDate(m1[1]);

  // 2) primeiro padrão de data encontrado
  const m2 = text.match(/\b(\d{2}[\/\-]\d{2}[\/\-](\d{2}|\d{4}))\b/);
  return m2 ? normalizeBrDate(m2[1]) : null;
}
function normalizeBrDate(s: string) {
  const m = s.replace(/-/g, "/").match(/^(\d{2})\/(\d{2})\/(\d{2}|\d{4})$/);
  if (!m) return s;
  const [, dd, mm, yy] = m;
  let yyyy = yy.length === 4 ? parseInt(yy, 10) : twoToFourDigitYear(parseInt(yy, 10));
  return `${dd}/${mm}/${yyyy}`;
}
function twoToFourDigitYear(yy: number) {
  // Pivot: 00–29 => 2000–2029; 30–99 => 1930–1999
  return yy <= 29 ? 2000 + yy : 1900 + yy;
}

// ---------- Nome ----------
function extractNome(text: string) {
  const m1 = text.match(/nome\s*[:\-]?\s*([A-Z ]{3,})/i);
  if (m1) return cleanupNome(m1[1]);
  const m2 = text.match(/(?:\n|^)([A-Z ]{3,})\s*\n.*cpf/i);
  if (m2) return cleanupNome(m2[1]);
  return null;
}
function cleanupNome(n: string) {
  return n.replace(/\s+/g, " ").trim();
}

// ---------- confiança ----------
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