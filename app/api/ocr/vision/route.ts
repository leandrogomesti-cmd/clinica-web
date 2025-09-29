export const runtime = "nodejs";

type Parsed = { nome?: string; cpf?: string; rg?: string; data_nascimento?: string };

function parseBrDoc(text: string): Parsed {
  const t = (text || "").normalize("NFKD").replace(/\u0301|\u0303|\u0327/g, "");
  const cpf = (t.match(/\b(\d{3}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{2})\b/i)?.[1] || "")
    .replace(/[^\d]/g, "").slice(0, 11);
  const rg = (t.match(/\b(\d{1,2}[.\s]?\d{3}[.\s]?\d{3}[-\sXx]?\d)\b/)?.[1] || "")
    .replace(/[^\dxX]/g, "");
  const dt = t.match(/\b(\d{2})[\/\-](\d{2})[\/\-](\d{4})\b/);
  const data_nascimento = dt ? `${dt[3]}-${dt[2]}-${dt[1]}` : undefined;

  let nome = /NOME[:\s]*([A-ZÁÉÍÓÚÂÊÔÃÕÇ ]{3,})/.exec(t)?.[1];
  if (!nome) {
    const lines = t.split(/\r?\n/).map(s => s.trim());
    const candidates = lines.filter(s => /^[A-Z][A-Z\sÁÉÍÓÚÂÊÔÃÕÇ]{4,}$/.test(s) && s.length <= 70);
    nome = candidates.sort((a,b) => b.length - a.length)[0];
  }
  if (nome) nome = nome.replace(/\s{2,}/g, " ").trim();
  return { nome, cpf: cpf || undefined, rg: rg || undefined, data_nascimento };
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json() as { url?: string };
    if (!url) return new Response(JSON.stringify({ ok: false, error: "missing-url" }), { status: 400 });

    const fileResp = await fetch(url);
    if (!fileResp.ok) return new Response(JSON.stringify({ ok: false, error: "fetch-file-failed" }), { status: 400 });
    const arr = await fileResp.arrayBuffer();
    const base64 = Buffer.from(arr).toString("base64");

    const gv = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requests: [{ image: { content: base64 }, features: [{ type: "TEXT_DETECTION" }] }] })
    });
    if (!gv.ok) return new Response(JSON.stringify({ ok: false, error: "vision-failed" }), { status: 502 });

    const raw = await gv.json();
    const text: string =
      raw?.responses?.[0]?.fullTextAnnotation?.text ??
      raw?.responses?.[0]?.textAnnotations?.[0]?.description ?? "";

    const parsed = parseBrDoc(text);
    return new Response(JSON.stringify({ ok: true, parsed, raw }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || "error" }), { status: 500 });
  }
}