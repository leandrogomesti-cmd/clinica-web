// app/api/ocr/vision/route.ts
export const runtime = "nodejs";

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

function pickAfterLabel(lines: string[], labels: string[]) {
  // procura uma linha contendo o label; devolve a parte após o label
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i].toUpperCase();
    if (isNoise(L)) continue;
    if (labels.some((lab) => L.includes(lab))) {
      // 1) mesmo verso após ":" ou label
      const same = lines[i].split(/[:\-]/).slice(1).join(":").trim();
      if (same) return same;
      // 2) próxima linha não vazia
      const next = clean(lines[i + 1] || "");
      if (next && !isNoise(next)) return next;
    }
  }
  return undefined;
}

function parseCNH(text: string) {
  // quebra em linhas legíveis
  const allLines = String(text || "")
    .split(/\r?\n/)
    .map((l) => clean(l))
    .filter(Boolean);

  const lines = allLines.filter((l) => !isNoise(l));

  const out: Record<string, string> = {};

  // ------ NOME ------
  const nomeRotulado =
    pickAfterLabel(lines, ["NOME"]) ||
    pickAfterLabel(lines, ["NOME COMPLETO"]);
  if (nomeRotulado) {
    // evita capturar coisas como "JOAO GOMES NETTO" (filiação) usando heurística: se existir outro bloco com "FILIA" próximo, preferir o primeiro valor depois de NOME
    out.full_name = clean(nomeRotulado.replace(/^NOME\s*/i, ""));
  } else {
    // fallback: primeira linha toda maiúscula com ≥2 palavras, ignorando ruído
    const cand = lines.find((l) => /^[A-ZÁ-Ú]{2,}(?:\s+[A-ZÁ-Ú]{2,})+$/u.test(l));
    if (cand && !isNoise(cand)) out.full_name = cand;
  }

  // ------ CPF ------
  // 1) tentar rótulo
  let cpfRaw = pickAfterLabel(lines, ["CPF"]);
  if (cpfRaw) cpfRaw = onlyDigits(cpfRaw);
  // 2) fallback: primeira ocorrência que pareça CPF, mas ignorar "Nº REGISTRO"
  if (!cpfRaw) {
    for (const l of lines) {
      if (/REGISTRO/i.test(l)) continue;
      const d = onlyDigits(l);
      if (d.length === 11) {
        cpfRaw = d;
        break;
      }
    }
  }
  const cpfFmt = formatCPF(cpfRaw || "");
  if (cpfFmt) out.cpf = cpfFmt;

  // ------ RG ------
  // Em muitas CNHs vem como "DOC. IDENTIDADE/ORG EMISSOR/UF" e o número fica na linha seguinte
  let rg = pickAfterLabel(lines, ["DOC", "IDENTIDADE", "RG"]);
  if (rg) {
    // pega só parte que parece número de RG (com X no dígito verificador às vezes)
    const m = rg.match(/\b([\d.\-Xx]{4,})\b/);
    rg = m ? m[1] : rg;
    out.rg = clean(rg.toUpperCase());
  } else {
    // fallback: sequência com 7–12 dígitos/letras típicas de RG
    const cand = lines
      .map((l) => (l.match(/\b(\d[\d.\-Xx]{6,})\b/) || [])[1])
      .find(Boolean);
    if (cand) out.rg = cand.toUpperCase();
  }

  // ------ DATA NASCIMENTO ------
  const dobLabeled =
    pickAfterLabel(lines, ["DATA NASCIMENTO", "DT NASC", "NASCIMENTO"]) ||
    // às vezes a data de nascimento e o CPF ficam na mesma linha
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
    // fallback: primeira data no formato BR que não seja "VALIDADE" ou "1ª HABILITAÇÃO"
    for (let i = 0; i < lines.length; i++) {
      if (/VALIDADE|1ª|1a|HABILITA|EMISS|REGISTRO/i.test(lines[i])) continue;
      const m = lines[i].match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
      if (m) {
        const iso = brToISODate(m[1]);
        if (iso) {
          out.birth_date = iso;
          break;
        }
      }
    }
  }

  return out;
}

async function readBase64FromRequest(req: Request): Promise<string> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const b = await req.json().catch(() => ({} as any));
    let base64: string | undefined = b.imageBase64 || b.base64 || b.file;
    if (base64?.startsWith("data:")) base64 = base64.split(",")[1];
    if (!base64) throw new Error("missing-image");
    return base64;
  }
  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) throw new Error("file-missing");
    const buf = Buffer.from(await file.arrayBuffer());
    return buf.toString("base64");
  }
  // fallback: tenta texto cru como JSON
  const txt = await req.text();
  try {
    const b = JSON.parse(txt);
    let base64: string | undefined = b.imageBase64 || b.base64 || b.file;
    if (base64?.startsWith("data:")) base64 = base64.split(",")[1];
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

    // DOCUMENT_TEXT_DETECTION tem melhor estrutura para documentos
    const gRes = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content },
            features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
          },
        ],
      }),
    });

    const gData = await gRes.json();
    const text =
      gData?.responses?.[0]?.fullTextAnnotation?.text ??
      gData?.responses?.[0]?.textAnnotations?.[0]?.description ??
      "";

    const parsed = parseCNH(text || "");
    return Response.json({ parsed, rawText: text });
  } catch (err: any) {
    const msg = err?.message || "ocr-failed";
    return Response.json({ error: msg }, { status: msg.includes("missing") ? 400 : 500 });
  }
}