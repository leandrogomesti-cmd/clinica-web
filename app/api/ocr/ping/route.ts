// app/api/ocr/ping/route.ts
export const runtime = "nodejs";

export async function GET() {
  const hasKey = !!process.env.GOOGLE_VISION_API_KEY;
  console.log("[OCR/PING] runtime=nodejs hasKey=", hasKey);
  return new Response(JSON.stringify({ ok: true, runtime: "nodejs", hasKey }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}