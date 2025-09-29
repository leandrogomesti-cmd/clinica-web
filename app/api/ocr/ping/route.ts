export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function resp() {
  const hasKey = !!process.env.GOOGLE_VISION_API_KEY;
  console.log("[OCR/PING]", { hasKey, runtime: "nodejs" });
  return new Response(JSON.stringify({ ok: true, hasKey, runtime: "nodejs" }), {
    status: 200, headers: { "Content-Type": "application/json" },
  });
}
export async function GET()  { return resp(); }
export async function POST() { return resp(); }