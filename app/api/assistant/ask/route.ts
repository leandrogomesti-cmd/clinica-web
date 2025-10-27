import { NextResponse } from "next/server";
import { runAssistantWithTools } from "@/lib/server/assistant/agent";

export async function POST(req: Request) {
  const { text, from } = await req.json();
  const reply = await runAssistantWithTools(String(text||""), String(from||"+5500000000000"));
  return NextResponse.json({ reply });
}