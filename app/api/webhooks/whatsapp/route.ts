// app/api/webhooks/whatsapp/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// client sem sessão (não é o front), chama RPC SECURITY DEFINER
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

function verifyMetaSignature(appSecret: string, signature: string | null, rawBody: string) {
  if (!appSecret) return true;           // sem segredo → não valida
  if (!signature) return false;
  const expected = "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  // comparação segura
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return NextResponse.json({ ok: false }, { status: 403 });
}

export async function POST(req: NextRequest) {
  // pegar body cru p/ validar assinatura
  const raw = await req.text();
  const sig = req.headers.get("x-hub-signature-256");
  const ok = verifyMetaSignature(process.env.WHATSAPP_APP_SECRET ?? "", sig, raw);
  if (!ok) return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 401 });

  let payload: any;
  try { payload = JSON.parse(raw); } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  // persiste via função SECURITY DEFINER
  const { error } = await supabase.rpc("wa_ingest", { in_payload: payload });
  if (error) {
    // log básico
    console.error("wa_ingest error", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}