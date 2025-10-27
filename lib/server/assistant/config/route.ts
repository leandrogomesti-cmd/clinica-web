import { NextResponse } from "next/server";
import { assistantConfigSchema, defaultAssistantConfig, type AssistantConfig } from "@/lib/server/assistant/config";

const KEY="assistant:config"; const URL=process.env.VERCEL_KV_REST_API_URL; const TOK=process.env.VERCEL_KV_REST_API_TOKEN;
const mem:{cfg?:AssistantConfig} = {};

async function kvGet(){ if(!URL||!TOK) return mem.cfg;
  const r = await fetch(`${URL}/get/${KEY}`, { headers:{ Authorization:`Bearer ${TOK}` }});
  if (!r.ok) return mem.cfg;
  const j = await r.json().catch(()=>null);
  return j?.result as AssistantConfig|undefined;
}
async function kvSet(cfg:AssistantConfig){ mem.cfg = cfg;
  if(!URL||!TOK) return;
  await fetch(`${URL}/set/${KEY}`, { method:"POST", headers:{ "Content-Type":"application/json", Authorization:`Bearer ${TOK}` }, body: JSON.stringify({ value: cfg }) });
}

export async function GET(){ return NextResponse.json((await kvGet()) ?? defaultAssistantConfig); }
export async function POST(req:Request){
  const body = await req.json().catch(()=>null);
  const parsed = assistantConfigSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  await kvSet(parsed.data);
  return NextResponse.json({ ok: true });
}