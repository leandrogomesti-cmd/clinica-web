// app/api/ocr/vision/route.ts
// Next.js App Router API (Edge)

export const runtime = "edge";
const VISION_ENDPOINT = "https://vision.googleapis.com/v1/images:annotate";

// ---- pega a key (prioriza o nome já usado no seu projeto) ----
function getVisionKey() {
  return (
    process.env.GOOGLE_VISION_API_KEY ||            // nome já configurado na Vercel
    process.env.GOOGLE_CLOUD_VISION_API_KEY ||      // fallback (docs)
    process.env.GOOGLE_API_KEY ||                   // fallback extra
    ""
  );
}

// ---------- tipos ----------
interface Ok {
  parsed: { nome?: string; cpf?: string; rg?: string; data_nascimento?: string };
  rawText: string;
  confidence?: number;
}
interface Err { error: string; details?: unknown }
type JsonIn = { imageBase64?: string; url?: string } | undefined;

// ---------- helpers ----------
function bad(body: Err, status = 400) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" }});
}
function ok(body: Ok) {
  return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/json; charset=utf-8" }});
}
function base64FromArrayBuffer(ab: ArrayBuffer) {
  let binary = ""; const bytes = new Uint8Array(ab); const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)) as unknown as number[]);
  }
  // eslint-disable-next-line no-undef
  return btoa(binary);
}
const onlyDigits = (s: string) => (s || "").replace(/\D+/g, "");
const normalizeSpaces = (s: string) => (s || "").replace(/[ \t]+/g, " ").trim();
const stripAccents = (s: string) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// ---------- CPF ----------
function isValidCPF(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (base: string, factorStart: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) sum += parseInt(base[i]) * (factorStart - i);
    const mod = (sum * 10) % 11; return mod === 10 ? 0 : mod;
  };
  const d1 = calc(cpf.slice(0, 9), 10);
  const d2 = calc(cpf.slice(0, 10), 11);
  return d1 === parseInt(cpf[9]) && d2 === parseInt(cpf[10]);
}
const formatCPF = (v: string) => {
  const d = onlyDigits(v).slice(0, 11); if (d.length !== 11) return d;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
};
function extractCPF(text: string) {
  const label = /(?:\bCPF\b|CADASTRO DE PESSOAS F[IÍ]SICAS|N[º°]?\s*DE\s*INSCRI[ÇC][AÃ]O)[^\d]{0,30}(\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2})/i;
  const m1 = text.match(label); if (m1 && isValidCPF(m1[1])) return formatCPF(m1[1]);
  const generic = /(\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2}|\b\d{11}\b)/g;
  const cs = text.match(generic) || [];
  for (const c of cs) if (isValidCPF(c)) return formatCPF(c);
  return undefined;
}

// ---------- RG (LEGACY permissivo, com bloqueio específico p/ cartão CPF) ----------
const formatRG = (v: string) => (v || "").toUpperCase().replace(/[^0-9X]/g, "");
function extractRG(text: string) {
  const lines = text.split(/\r?\n/).map((l) => normalizeSpaces(l));

  // rótulos típicos de RG/Identidade (mantém compatibilidade com CNH/identidade)
  const ctx = /\b(?:RG|R\.G\.|REGISTRO\s+GERAL|IDENTIDADE|CARTEIRA\s+DE\s+IDENTIDADE|ÓRG[ÃA]O\s+EMISSOR|ORGAO\s+EMISSOR|SSP(?:\/[A-Z]{2})?)\b/i;

  // 1) tenta com contexto (igual antes)
  for (let i = 0; i < lines.length; i++) {
    if (ctx.test(lines[i])) {
      const same = lines[i].match(/(\d{5,12}[0-9Xx]?|\d{1,2}\.?\d{3}\.?\d{3}-?[0-9Xx]?)/);
      if (same) return formatRG(same[1]);
      const next = (lines[i + 1] || "").match(/(\d{5,12}[0-9Xx]?|\d{1,2}\.?\d{3}\.?\d{3}-?[0-9Xx]?)/);
      if (next) return formatRG(next[1]);
    }
  }

  // 2) BLOQUEIO APENAS para cartão de CPF (Receita):
  // evita que o fallback capture "226815228" de "Nº de Inscrição 226815228-62"
  const isCpfCard =
    /(CADASTRO\s+DE\s+PESSOAS\s+F[IÍ]SICAS|N[º°]?\s*DE\s*INSCRI[ÇC][AÃ]O|SECRETARIA\s+DA\s+RECEITA\s+FEDERAL|MINIST[EÉ]RIO\s+DA\s+FAZENDA)/i.test(
      text
    );
  if (isCpfCard) return undefined;

  // 3) fallback permissivo (mantido) — só roda quando NÃO é cartão de CPF
  const any = text.match(/\b(\d{7,12}[Xx]?|\d{1,2}\.?\d{3}\.?\d{3}-?[0-9Xx]?)\b/);
  if (any) return formatRG(any[1]);

  return undefined;
}

// ---------- Data de nascimento ----------
function normalizeDate(d: string) {
  const digits = d.replace(/[^\d]/g, "");
  if (digits.length === 8) {
    const dd = digits.slice(0,2), mm = digits.slice(2,4);
    let yyyy = digits.slice(4);
    if (yyyy.length === 2) { const y = parseInt(yyyy,10); yyyy = y >= 30 ? `19${yyyy}` : `20${yyyy}`; }
    return `${dd}/${mm}/${yyyy}`;
  }
  return d;
}
function extractNascimento(text: string) {
  const r1 = /\b(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{2,4})\b/;
  const m1 = text.match(r1); if (m1) return normalizeDate(m1[1]);
  const meses = "jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez|janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro";
  const r2 = new RegExp(String.raw`(\b\d{1,2})\s+de\s+(${meses})\.?,?\s+de\s+(\d{2,4})\b`, "i");
  const m2 = text.match(r2);
  if (m2) {
    const dd = m2[1].padStart(2,"0");
    const mmMap: Record<string,string> = { jan:"01",janeiro:"01",fev:"02",fevereiro:"02",mar:"03","março":"03",marco:"03",abr:"04",abril:"04",mai:"05",maio:"05",jun:"06",junho:"06",jul:"07",julho:"07",ago:"08",agosto:"08",set:"09",setembro:"09",out:"10",outubro:"10",nov:"11",novembro:"11",dez:"12",dezembro:"12" };
    const mm = mmMap[stripAccents(m2[2].toLowerCase())] || "01";
    let yyyy = m2[3]; if (yyyy.length === 2) { const y = parseInt(yyyy,10); yyyy = y >= 30 ? `19${yyyy}` : `20${yyyy}`; }
    return `${dd}/${mm}/${yyyy}`;
  }
  return undefined;
}

// ---------- Nome ----------
function extractNome(text: string) {
  const labeled = text.match(/(?:\bNOME\b|^NOME\s*:?)\s*([A-ZÁ-ÚÂ-ÔÃ-ÕÇ\s]{2,})/m);
  if (labeled) {
    const n = labeled[1];
    return normalizeSpaces(n.replace(/\s+/g, " ").replace(/[^A-ZÁ-ÚÂ-ÔÃ-ÕÇ\s]/g, ""));
  }
  const lines = text.split(/\r?\n/).map((l) => normalizeSpaces(l));
  for (const l of lines) {
    if (/^[A-ZÁ-ÚÂ-ÔÃ-ÕÇ\s]{6,}$/.test(l) &&
        !/\b(CPF|CADASTRO|N[º°]\s*DE\s*INSCRI|SECRETARIA|REP[ÚU]BLICA|MINIST[EÉ]RIO|BRASIL)\b/i.test(l)) {
      return l;
    }
  }
  return undefined;
}

// ---------- confiança ----------
function avgConfidence(anno: any) {
  try {
    const blocks = anno?.fullTextAnnotation?.pages?.[0]?.blocks ?? [];
    const confs: number[] = []; for (const b of blocks) if (typeof b.confidence === "number") confs.push(b.confidence);
    if (!confs.length) return undefined;
    return confs.reduce((a, b) => a + b, 0) / confs.length;
  } catch { return undefined; }
}

// ---------- handler ----------
export async function POST(req: Request) {
  try {
    const apiKey = getVisionKey();
    if (!apiKey) return bad({ error: "missing-env: GOOGLE_VISION_API_KEY|GOOGLE_CLOUD_VISION_API_KEY" }, 500);

    let base64: string | undefined;
    let imageUri: string | undefined;

    const ctype = req.headers.get("content-type") || "";
    if (ctype.includes("application/json")) {
      const body = (await req.json()) as JsonIn;
      if (body?.imageBase64) base64 = body.imageBase64.replace(/^data:image\/\w+;base64,/, "");
      else if (body?.url) imageUri = body.url;
    } else if (ctype.includes("multipart/form-data")) {
      const form = await req.formData();
      const file =
        (form.get("file") ||
         form.get("image") ||
         form.get("document") ||
         form.get("photo") ||
         form.get("arquivo")) as File | null;
      if (!file) return bad({ error: "missing-file" });
      const ab = await file.arrayBuffer();
      base64 = base64FromArrayBuffer(ab); // aceita HEIC/JPEG/PNG (Vision decide)
    } else {
      const ab = await req.arrayBuffer();
      if (ab && ab.byteLength) base64 = base64FromArrayBuffer(ab);
    }

    if (!base64 && !imageUri) {
      return bad({ error: "missing-input: informe imageBase64, url ou multipart file" }, 400);
    }

    const payload = {
      requests: [
        {
          image: base64 ? { content: base64 } : { source: { imageUri } },
          features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          imageContext: { languageHints: ["pt", "pt-BR"] },
        },
      ],
    };

    const res = await fetch(`${VISION_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return bad({ error: "vision-error", details: await res.text() }, 502);
    }

    const data = await res.json();
    const anno = data?.responses?.[0];
    const text: string =
      anno?.fullTextAnnotation?.text ||
      anno?.textAnnotations?.[0]?.description ||
      "";

    if (!text) return bad({ error: "no-text-detected" }, 422);

    const parsed: Ok["parsed"] = {
      cpf: extractCPF(text),
      rg: extractRG(text), // agora não “vaza” RG em cartão CPF
      data_nascimento: extractNascimento(text),
      nome: extractNome(text),
    };

    return ok({ parsed, rawText: text, confidence: avgConfidence(anno) });
  } catch (e) {
    return bad({ error: "internal-error", details: String(e) }, 500);
  }
}