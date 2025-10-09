// app/api/ocr/vision/health/route.ts
export const runtime = "edge";
export async function GET() {
  const ok = !!process.env.GOOGLE_CLOUD_VISION_API_KEY;
  const env = process.env.VERCEL_ENV || "unknown";
  return new Response(JSON.stringify({ ok, env }), {
    headers: { "content-type": "application/json; charset=utf-8" },
    status: ok ? 200 : 500,
  });
}