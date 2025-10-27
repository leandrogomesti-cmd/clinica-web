// app/api/assistant/ask/route.ts
import { NextResponse } from "next/server";
import { runAssistantWithTools } from "@/lib/server/assistant/agent";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Assistant desabilitado: defina OPENAI_API_KEY nas ENVs." },
      { status: 503 }
    );
  }

  try {
    const { text, fromPhoneE164 } = await req.json();
    const out = await runAssistantWithTools(String(text ?? ""), String(fromPhoneE164 ?? ""));
    return NextResponse.json({ reply: out });
  } catch (e:any) {
    return NextResponse.json(
      { error: e?.message ?? "Erro no assistant" },
      { status: 500 }
    );
  }
}