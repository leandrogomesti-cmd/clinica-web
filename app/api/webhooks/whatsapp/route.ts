import { NextResponse } from "next/server";
import { runAssistantWithTools } from "@/lib/server/assistant/agent";

const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN!;
const META_TOKEN = process.env.META_WHATSAPP_TOKEN!;
const META_PHONE_ID = process.env.META_WHATSAPP_PHONE_ID!;
const GRAPH = "https://graph.facebook.com/v19.0";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  if (sp.get("hub.mode")==="subscribe" && sp.get("hub.verify_token")===META_VERIFY_TOKEN) {
    return new NextResponse(sp.get("hub.challenge") ?? "OK", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

async function sendWA(to: string, text: string) {
  await fetch(`${GRAPH}/${META_PHONE_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${META_TOKEN}`, "Content-Type":"application/json" },
    body: JSON.stringify({ messaging_product:"whatsapp", to, type:"text", text:{ body:text } })
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const msgs = body?.entry?.[0]?.changes?.[0]?.value?.messages;
  if (!msgs?.length) return NextResponse.json({ ok: true });

  for (const m of msgs) {
    const from = m.from;
    const text = m.text?.body?.trim() || "(vazio)";
    const reply = await runAssistantWithTools(text, from);
    await sendWA(from, reply);
  }
  return NextResponse.json({ ok: true });
}