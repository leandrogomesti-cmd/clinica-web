// app/api/ocr/vision/route.ts
export const runtime = "nodejs";

function normalizeCPF(cpf: string) {
  return cpf.replace(/[^\d]/g, "").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
function isoFromBrDate(br: string) {
  // aceita 12/03/1980
  const m = br.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (!m) return undefined;
  const [, d, mm, y] = m;
  return `${y}-${mm.padStart(2, "0")}-${d.padStart(2, "0")}`;
}
function parseBrDoc(text: string) {
  const out: Record<string, string> = {};

  const cpf = text.match(/(\d{3}\.?\d{3}\.?\d{3}-?\d{2})/);
  if (cpf) out.cpf = normalizeCPF(cpf[1]);

  const dob = text.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
  if (dob) out.birth_date = isoFromBrDate(dob[1]) || "";

  const rg = text.match(/\b(\d{1,2}\.?\d{3}\.?\d{3}-?[0-9Xx])\b/);
  if (rg) out.rg = rg[1].replace(/[^\dX]/g, "").toUpperCase();

  // nome: heurística simples (maiúsculas com 2+ palavras)
  const name = text.match(/\b([A-ZÁ-Ú]{2,}(?:\s+[A-ZÁ-Ú]{2,}){1,})\b/);
  if (name) out.full_name = name[1].trim();

  return out;
}

async function readBase64FromRequest(req: Request): Promise<string> {
  const ct = req.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const body = await req.json().catch(() => ({} as any));
    let b64: string | undefined = body.imageBase64 || body.base64 || body.file;
    if (b64?.startsWith("data:")) b64 = b64.split(",")[1];
    if (!b64) throw new Error("missing-image");
    return b64;
  }
  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) throw new Error("file-missing");
    const buf = Buffer.from(await file.arrayBuffer());
    return buf.toString("base64");
  }
  // fallback: tenta texto cru como JSON
  try {
    const text = await req.text();
    const body = JSON.parse(text);
    let b64: string | undefined = body.imageBase64 || body.base64 || body.file;
    if (b64?.startsWith("data:")) b64 = b64.split(",")[1];
    if (!b64) throw new Error("missing-image");
    return b64;
  } catch {
    throw new Error("unsupported-content-type");
  }
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) return Response.json({ error: "GOOGLE_VISION_API_KEY not set" }, { status: 500 });

    const content = await readBase64FromRequest(req);

    const gRes = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            image: { content },
            features: [{ type: "TEXT_DETECTION" }],
          },
        ],
      }),
    });

    const gData = await gRes.json();
    const text =
      gData?.responses?.[0]?.fullTextAnnotation?.text ??
      gData?.responses?.[0]?.textAnnotations?.[0]?.description ??
      "";

    const parsed = parseBrDoc(String(text || ""));
    return Response.json({ parsed, rawText: text });
  } catch (err: any) {
    const msg = err?.message || "ocr-failed";
    return Response.json({ error: msg }, { status: msg.includes("missing") ? 400 : 500 });
  }
}