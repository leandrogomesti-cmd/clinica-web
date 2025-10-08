// app/api/ocr/vision/route.ts
export const runtime = "nodejs";

// Limite de payload para evitar timeouts/lentidão do Vision (~2MB após base64)
const MAX_BASE64_BYTES = 2_000_000;

const CNH_NOISE = [
  "VALIDA EM TODO O TERRITORIO NACIONAL",
  "REPÚBLICA FEDERATIVA DO BRASIL",
  "DEPARTAMENTO NACIONAL DE TRÂNSITO",
  "CARTEIRA NACIONAL DE HABILITAÇÃO",
  "CARTERIA NACIONAL DE HABILITAÇÃO",
  "MINISTÉRIO DA INFRAESTRUTURA",
].map((s) => s.toUpperCase());

function clean(s = "") {
  return s.replace(/\s+/g, " ").trim();
}
function isNoise(line: string) {
  const u = line.toUpperCase();
  return CNH_NOISE.some((n) => u.includes(n));
}
function onlyDigits(s = "") {
  return s.replace(/\D+/g, "");
}
function formatCPF(digits: string) {
  if (digits.length !== 11) return undefined;
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
function brToISODate(br?: string) {
  if (!br) return undefined;
  const m = br.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (!m) return undefined;
  const [, d, mm, y] = m;
  return `${y}-${mm}-${d}`;
}

// ---------- RG helpers ----------
const RG_PATTERNS: RegExp[] = [
  /\b\d{2}\.?\d{3}\.?\d{3}-?[0-9Xx]\b/,   // 12.345.678-9 ou 12345678-9
  /\b\d{7,9}-?[0-9Xx]\b/,                 // 25099767-8
  /\b\d{8,9}\b/,                          // 8-9 dígitos (fallback)
];

function extractRG(text: string): string | undefined {
  for (const re of RG_PATTERNS) {
    const m = text.match(re);
    if (m) {
      const just = (m[0].match(/[\d.\-Xx]+/) || [])[0];
      return just?.toUpperCase();
    }
  }
  return undefined;
}

function pickAfterLabel(lines: string[], labels: string[]) {
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i].toUpperCase();
    if (isNoise(L)) continue;
    if (labels.some((lab) => L.includes(lab))) {
      const same = lines[i].split(/[:\-]/).slice(1).join(":").trim();
      if (same) return same;
      const next = clean(lines[i + 1] || "");
      if (next && !isNoise(next)) return next;
    }
  }
  return undefined;
}

function parseCNH(text: string) {
  const allLines = String(text || "")
    .split(/\r?\n/)
    .map((l) => clean(l))
    .filter(Boolean);

  const lines = allLines.filter((l) => !isNoise(l));
  const out: Record<string, string> = {};

  // ---- NOME ----
  const nomeRotulado =
    pickAfterLabel(lines, ["NOME"]) || pickAfterLabel(lines, ["NOME COMPLETO"]);
  if (nomeRotulado) {
    out.full_name = clean(nomeRotulado.replace(/^NOME\s*/i, ""));
  } else {
    const cand = lines.find((l) => /^[A-ZÁ-Ú]{2,}(?:\s+[A-ZÁ-Ú]{2,})+$/u.test(l));
    if (cand && !isNoise(cand)) out.full_name = cand;
  }

  // ---- CPF ----
  let cpfRaw = pickAfterLabel(lines, ["CPF"]);
  if (cpfRaw) cpfRaw = onlyDigits(cpfRaw);
  if (!cpfRaw) {
    for (const l of lines) {
      if (/REGISTRO/i.test(l)) continue;
      const d = onlyDigits(l);
      if (d.length === 11) { cpfRaw = d; break; }
    }
  }
  const cpfFmt = formatCPF(cpfRaw || "");
  if (cpfFmt) out.cpf = cpfFmt;

  // ---- RG (melhorado) ----
  // 1) ache o índice do rótulo
  const rgIdx = lines.findIndex((l) =>
    /DOC\.?\s*IDENTIDADE|IDENTIDADE\/ORG|RG\b/i.test(l)
  );
  if (rgIdx >= 0) {
    const look = lines.slice(rgIdx, rgIdx + 4).join(" "); // pega rótulo + 3 linhas seguintes
    const rg = extractRG(look);
    if (rg) out.rg = rg;
  }
  // 2) fallback: varrer tudo, ignorando palavras que não são RG
  if (!out.rg) {
    for (const l of lines) {
      if (/CPF|VALIDADE|HABILITA|REGISTRO|PERMISS|CATEG|EMISS/i.test(l)) continue;
      const rg = extractRG(l);
      if (rg) { out.rg = rg; break; }
    }
  }

  // ---- DATA NASCIMENTO ----
  const dobLabeled =
    pickAfterLabel(lines, ["DATA NASCIMENTO", "DT NASC", "NASCIMENTO"]) ||
    ((): string | undefined => {
      const idx = lines.findIndex((l) => /DATA.*NASC/i.test(l));
      if (idx >= 0) return clean(lines[idx + 1] || "");
      return undefined;
    })();
  const dobMatch = (dobLabeled && dobLabeled.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/)) || null;
  if (dobMatch) {
    const iso = brToISODate(dobMatch[1]);
    if (iso) out.birth_date = iso;
  } else {
    for (let i = 0; i < lines.length; i++) {
      if (/VALIDADE|1ª|1a|HABILITA|EMISS|REGISTRO/i.test(lines[i])) continue;
      const m = lines[i].match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
      if (m) {
        const iso = brToISODate(m[1]);
        if (iso) { out.birth_date = iso; break; }
      }
    }
  }

  return out;
}

function sanitizeDataUrl(s: string) {
  return s.startsWith("data:") ? s.split(",")[1] ?? "" : s;
}

async function readBase64FromRequest(req: Request): Promise<string> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const b = await req.json().catch(() => ({} as any));
    let base64: string | undefined = b.imageBase64 || b.base64 || b.file;
    base64 = sanitizeDataUrl(base64 || "");
    if (!base64) throw new Error("missing-image");
    return base64;
  }
  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) throw new Error("file-missing");
    // HEIC/HEIF costuma vir do iPhone e o Vision rejeita/perform mal
    if (/heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name)) {
      throw new Error("heic-not-supported");
    }
    const buf = Buffer.from(await file.arrayBuffer());
    return buf.toString("base64");
  }
  const txt = await req.text();
  try {
    const b = JSON.parse(txt);
    let base64: string | undefined = b.imageBase64 || b.base64 || b.file;
    base64 = sanitizeDataUrl(base64 || "");
    if (!base64) throw new Error("missing-image");
    return base64;
  } catch {
    throw new Error("unsupported-content-type");
  }
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) return Response.json({ error: "GOOGLE_VISION_API_KEY not set" }, { status: 500 });

    const content = await readBase64FromRequest(req);

    // Guard-rail de tamanho para não estourar o Vision
    const approxBytes = Math.ceil(content.length * 0.75);
    if (approxBytes > MAX_BASE64_BYTES) {
      return Response.json({ error: "payload-too-large" }, { status: 413 });
    }

    const gRes = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
            // Ajuda o OCR a priorizar português/BR
            imageContext: { languageHints: ["pt", "pt-BR"] },
          },
        ],
      }),
    });

    if (!gRes.ok) {
      const t = await gRes.text().catch(() => "");
      return Response.json({ error: `vision-failed:${gRes.status}:${t.slice(0,180)}` }, { status: 502 });
    }

    const gData = await gRes.json();
    const text =
      gData?.responses?.[0]?.fullTextAnnotation?.text ??
      gData?.responses?.[0]?.textAnnotations?.[0]?.description ??
      "";

    if (!text) {
      return Response.json({ parsed: {}, rawText: "" }, { status: 200 });
    }

    const confidence = avgConfidence(gData?.responses?.[0]);
    const parsedRaw = parseCNH(text || "");

    // Compatibilidade: expõe também "nome" e "data_nascimento"
    const parsed = {
      ...parsedRaw,
      nome: (parsedRaw as any).full_name ?? (parsedRaw as any).nome,
      data_nascimento: (parsedRaw as any).birth_date ?? (parsedRaw as any).data_nascimento,
    } as Record<string, string>;

    return Response.json({ parsed, rawText: text, confidence });
  } catch (err: any) {
    const msg = err?.message || "ocr-failed";
    return Response.json({ error: msg }, { status: msg.includes("missing") ? 400 : 500 });
  }
}

function avgConfidence(anno: any) {
  try {
    const blocks = anno?.fullTextAnnotation?.pages?.[0]?.blocks ?? [];
    const confs: number[] = [];
    for (const b of blocks) if (typeof b.confidence === "number") confs.push(b.confidence);
    if (!confs.length) return undefined;
    return confs.reduce((a, b) => a + b, 0) / confs.length;
  } catch { return undefined; }
}