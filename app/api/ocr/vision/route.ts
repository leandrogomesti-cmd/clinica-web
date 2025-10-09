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
    data_nascimento?: string;
  };
  rawText: string;
  confidence?: number;
}

interface Err {
  error: string;
  details?: unknown;
}

type JsonIn =
  | {
      imageBase64?: string;
      url?: string;
    }
  | undefined;

// ---------- helpers ----------
function bad(body: Err, status = 400) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}
function ok(body: Ok) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function toBase64(ab: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(ab);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  // eslint-disable-next-line no-undef
  return btoa(binary);
}

function onlyDigits(s: string) {
  return (s || "").replace(/\D+/g, "");
}

function normalizeSpaces(s: string) {
  return (s || "").replace(/[ \t]+/g, " ").trim();
}

function stripAccents(s: string) {
  return (s || "").normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

// ---------- CPF ----------
function isValidCPF(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false; // todos iguais
  const calc = (base: string, factorStart: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i]) * (factorStart - i);
    }
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  const d1 = calc(cpf.slice(0, 9), 10);
  const d2 = calc(cpf.slice(0, 10), 11);
  return d1 === parseInt(cpf[9]) && d2 === parseInt(cpf[10]);
}

function formatCPF(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length !== 11) return d;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function extractCPF(text: string) {
  // 1) procure com rótulo
  const cpfLabelRegex =
    /(?:\bCPF\b|CADASTRO DE PESSOAS F[IÍ]SICAS|N[º°]?\s*DE\s*INSCRI[ÇC][AÃ]O)[^\d]{0,30}(\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2})/i;
  const m1 = text.match(cpfLabelRegex);
  if (m1 && isValidCPF(m1[1])) return formatCPF(m1[1]);

  // 2) fallback: qualquer 11 dígitos com máscara
  const generic =
    /(\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2}|\b\d{11}\b)/g;
  const candidates = text.match(generic) || [];
  for (const cand of candidates) {
    if (isValidCPF(cand)) return formatCPF(cand);
  }
  return undefined;
}

// ---------- RG (com contexto, evitando falsos positivos em CPF) ----------
function formatRG(value: string) {
  // RGs variam muito. Mantemos só dígitos + X e removemos lixo.
  const cleaned = (value || "").toUpperCase().replace(/[^0-9X]/g, "");
  return cleaned;
}

/**
 * Extrai RG somente quando houver contexto claro (RG/Identidade etc.).
 * Isso evita capturar a parte "226815228" do "Nº de Inscrição 226815228-62" do cartão de CPF.
 */
function extractRG(text: string) {
  const lines = text.split(/\r?\n/).map((l) => normalizeSpaces(l));

  const hasStrongCPFMarkers = /(?:\bCPF\b|CADASTRO DE PESSOAS F[IÍ]SICAS|N[º°]?\s*DE\s*INSCRI[ÇC][AÃ]O)/i.test(
    text
  );

  // Padrões de contexto para RG
  const ctx = /\b(?:RG|R\.G\.|REGISTRO\s+GERAL|IDENTIDADE|CARTEIRA\s+DE\s+IDENTIDADE|ÓRG[ÃA]O\s+EMISSOR|ORGAO\s+EMISSOR|SSP(?:\/[A-Z]{2})?)\b/i;

  // Padrão numérico típico de RG (permite X no final)
  const rgNum = /(\d{1,2}\.?\d{3}\.?\d{3}-?[0-9Xx}])|(\b\d{5,12}[Xx]?\b)/;

  // Percorre linhas: se houver contexto, tenta achar número nesta ou na próxima linha
  for (let i = 0; i < lines.length; i++) {
    if (ctx.test(lines[i])) {
      // Procura número na mesma linha
      const sameLine = lines[i].match(/(\d{5,12}[0-9Xx]?|\d{1,2}\.?\d{3}\.?\d{3}-?[0-9Xx]?)/);
      if (sameLine) return formatRG(sameLine[1]);

      // …ou na linha seguinte
      const next = lines[i + 1] || "";
      const nextLine = next.match(/(\d{5,12}[0-9Xx]?|\d{1,2}\.?\d{3}\.?\d{3}-?[0-9Xx]?)/);
      if (nextLine) return formatRG(nextLine[1]);
    }
  }

  // Sem contexto? então NÃO devolve RG (especialmente em cartões de CPF)
  if (hasStrongCPFMarkers) return undefined;

  // Opcional: como último recurso (desativado para evitar falsos-positivos)
  // return undefined;
  return undefined;
}

// ---------- Data de nascimento ----------
function normalizeDate(d: string) {
  // Retorna no formato dd/mm/aaaa
  const digits = d.replace(/[^\d]/g, "");
  if (digits.length === 8) {
    const dd = digits.slice(0, 2);
    const mm = digits.slice(2, 4);
    let yyyy = digits.slice(4);
    if (yyyy.length === 2) {
      const y = parseInt(yyyy, 10);
      yyyy = y >= 30 ? `19${yyyy}` : `20${yyyy}`;
    }
    return `${dd}/${mm}/${yyyy}`;
  }
  return d;
}

function extractNascimento(text: string) {
  // formatos: 08/02/1984 | 08-02-84 | 8 de fev. de 1984
  const r1 = /\b(\d{2}[\/\-\.]\d{2}[\/\-\.]\d{2,4})\b/;
  const m1 = text.match(r1);
  if (m1) return normalizeDate(m1[1]);

  const meses =
    "jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez|janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro";
  const r2 = new RegExp(
    String.raw`\b(\d{1,2})\s+de\s+(${meses})\.?,?\s+de\s+(\d{2,4})\b`,
    "i"
  );
  const m2 = text.match(r2);
  if (m2) {
    const dd = m2[1].padStart(2, "0");
    const mmMap: Record<string, string> = {
      jan: "01",
      janeiro: "01",
      fev: "02",
      fevereiro: "02",
      mar: "03",
      março: "03",
      marco: "03",
      abr: "04",
      abril: "04",
      mai: "05",
      maio: "05",
      jun: "06",
      junho: "06",
      jul: "07",
      julho: "07",
      ago: "08",
      agosto: "08",
      set: "09",
      setembro: "09",
      out: "10",
      outubro: "10",
      nov: "11",
      novembro: "11",
      dez: "12",
      dezembro: "12",
    };
    const mm = mmMap[stripAccents(m2[2].toLowerCase())] || "01";
    let yyyy = m2[3];
    if (yyyy.length === 2) {
      const y = parseInt(yyyy, 10);
      yyyy = y >= 30 ? `19${yyyy}` : `20${yyyy}`;
    }
    return `${dd}/${mm}/${yyyy}`;
  }
  return undefined;
}

// ---------- Nome ----------
function extractNome(text: string) {
  // Busca padrão "Nome <linha>"
  const m = text.match(/(?:\bNOME\b|^NOME\s*:?)\s*([A-ZÁ-ÚÂ-ÔÃ-ÕÇ\s]{2,})/m);
  if (m) {
    const n = m[1];
    return normalizeSpaces(n.replace(/\s+/g, " ").replace(/[^A-ZÁ-ÚÂ-ÔÃ-ÕÇ\s]/g, ""));
  }

  // fallback: primeira linha toda em CAPS que pareça nome
  const lines = text.split(/\r?\n/).map((l) => normalizeSpaces(l));
  for (const l of lines) {
    if (
      /^[A-ZÁ-ÚÂ-ÔÃ-ÕÇ\s]{6,}$/.test(l) &&
      !/\b(CPF|CADASTRO|N[º°]\s*DE\s*INSCRI|SECRETARIA|REPÚBLICA|MINIST[EÉ]RIO|BRASIL)\b/i.test(l)
    ) {
      return l;
    }
  }
  return undefined;
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

// ---------- handler ----------
export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    if (!apiKey) return bad({ error: "missing-env: GOOGLE_CLOUD_VISION_API_KEY" }, 500);

    let base64: string | undefined;
    let imageUri: string | undefined;

    const ctype = req.headers.get("content-type") || "";
    if (ctype.includes("application/json")) {
      const body = (await req.json()) as JsonIn;
      if (body?.imageBase64) base64 = body.imageBase64.replace(/^data:image\/\w+;base64,/, "");
      else if (body?.url) imageUri = body.url;
    } else if (ctype.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = (form.get("file") || form.get("image")) as File | null;
      if (!file) return bad({ error: "missing-file" });
      if (/heic|heif/i.test(file.type) || /\.heic$/i.test(file.name)) {
        return bad({ error: "heic-not-supported: envie JPEG/PNG" });
      }
      const ab = await file.arrayBuffer();
      base64 = toBase64(ab);
    }

    if (!base64 && !imageUri) {
      return bad({ error: "missing-input: informe imageBase64, url ou multipart file" });
    }

    // Guard-rail de tamanho (~3MB pós-base64)
    if (base64) {
      const approxBytes = Math.ceil(base64.length * 0.75);
      if (approxBytes > 3 * 1024 * 1024) {
        return bad({ error: "payload-too-large: compactar imagem (<=3MB)" });
      }
    }

    const body = {
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
      body: JSON.stringify(body),
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

    const rawText = text;
    const parsed: Ok["parsed"] = {
      cpf: extractCPF(text),
      rg: extractRG(text), // <- agora com contexto
      data_nascimento: extractNascimento(text),
      nome: extractNome(text),
    };

    return ok({
      parsed,
      rawText,
      confidence: avgConfidence(anno),
    });
  } catch (e) {
    return bad({ error: "internal-error", details: `${e}` }, 500);
  }
}