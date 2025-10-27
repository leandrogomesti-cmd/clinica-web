import OpenAI from "openai";
import { MemoryStore, KvStore, type DemoStore } from "@/lib/server/demo-store";
import { assistantConfigSchema, defaultAssistantConfig, type AssistantConfig } from "./config";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const KV_URL = process.env.VERCEL_KV_REST_API_URL;
const KV_TOK = process.env.VERCEL_KV_REST_API_TOKEN;

async function loadConfig(): Promise<AssistantConfig> {
  if (KV_URL && KV_TOK) {
    const r = await fetch(`${KV_URL}/get/assistant:config`, { headers:{ Authorization:`Bearer ${KV_TOK}` }});
    if (r.ok) {
      const j = await r.json().catch(()=>null);
      const parsed = assistantConfigSchema.safeParse(j?.result);
      if (parsed.success) return parsed.data;
    }
  }
  return defaultAssistantConfig;
}
function getStore(): DemoStore {
  if (KV_URL && KV_TOK) {
    const kv = {
      async get(k:string){ const r=await fetch(`${KV_URL}/get/${k}`,{headers:{Authorization:`Bearer ${KV_TOK}`}}); return (await r.json()).result; },
      async set(k:string,v:any){ await fetch(`${KV_URL}/set/${k}`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${KV_TOK}`},body:JSON.stringify({value:v})}); }
    };
    return KvStore(kv as any);
  }
  return MemoryStore;
}

const tools:any = [
  { type:"function", function:{ name:"get_availability", description:"Lista horários HH:mm livres para um médico na data YYYY-MM-DD.", parameters:{ type:"object", properties:{ doctorName:{type:"string"}, dateISO:{type:"string"} }, required:["doctorName","dateISO"] } } },
  { type:"function", function:{ name:"create_appointment", description:"Cria consulta (30min).", parameters:{ type:"object", properties:{ patientPhone:{type:"string"}, doctorName:{type:"string"}, serviceName:{type:"string"}, startsAtISO:{type:"string"} }, required:["patientPhone","doctorName","serviceName","startsAtISO"] } } },
  { type:"function", function:{ name:"reschedule_appointment", description:"Reagenda consulta.", parameters:{ type:"object", properties:{ appointmentId:{type:"string"}, newStartsAtISO:{type:"string"} }, required:["appointmentId","newStartsAtISO"] } } },
  { type:"function", function:{ name:"cancel_appointment", description:"Cancela consulta.", parameters:{ type:"object", properties:{ appointmentId:{type:"string"} }, required:["appointmentId"] } } },
  { type:"function", function:{ name:"confirm_appointment", description:"Confirma consulta.", parameters:{ type:"object", properties:{ appointmentId:{type:"string"} }, required:["appointmentId"] } } },
  { type:"function", function:{ name:"faq", description:"Retorna textos canônicos.", parameters:{ type:"object", properties:{ topic:{type:"string",enum:["address","plans","price"]}, question:{type:"string"} }, required:["topic"] } } },
];

async function runTool(name:string,args:any, fromPhone:string){
  const store=getStore();
  switch(name){
    case "get_availability": return { slots: await store.availability(args.doctorName, args.dateISO) };
    case "create_appointment": return await store.create({ patientPhone:fromPhone, doctorName:args.doctorName, serviceName:args.serviceName, startsAt:args.startsAtISO, endsAt:new Date(new Date(args.startsAtISO).getTime()+30*60000).toISOString() });
    case "reschedule_appointment": return await store.reschedule(args.appointmentId, args.newStartsAtISO);
    case "cancel_appointment": return { ok: await store.cancel(args.appointmentId) };
    case "confirm_appointment": return { ok: await store.confirm(args.appointmentId) };
    case "faq": {
      const cfg = await loadConfig();
      if (args.topic==="address") return { text: cfg.faq.address || process.env.CLINIC_ADDRESS || "Endereço não configurado." };
      if (args.topic==="plans")   return { text: cfg.faq.plans   || process.env.CLINIC_CONVENIOS || "Convênios não configurados." };
      if (args.topic==="price")   return { text: cfg.faq.price   || process.env.CLINIC_PRECO_CONSULTA || "Preço sob consulta." };
      return { text:"" };
    }
  }
  return {};
}

export async function runAssistantWithTools(userText:string, fromPhoneE164:string){
  const cfg = await loadConfig();
  const system = [
    cfg.system_preamble,
    `Tom: ${cfg.tone}.`,
    `Políticas: ${cfg.stop_phrases[0]??""}.`,
    `Atendimento: ${cfg.booking_policies.business_hours.join(", ")}.`
  ].join(" ");
  let messages:any[] = [
    { role:"system", content: system },
    { role:"user", content: `${userText}\n(Telefone: ${fromPhoneE164})` }
  ];
  while(true){
    const res = await openai.chat.completions.create({ model:"gpt-4o-mini", messages, tools, tool_choice:"auto" });
    const msg = res.choices[0].message;
    if (!msg?.tool_calls?.length) return msg?.content ?? "Certo!";
    for (const call of msg.tool_calls) {
      const name = call.function.name;
      const args = JSON.parse(call.function.arguments||"{}");
      const result = await runTool(name, args, fromPhoneE164);
      messages.push(msg);
      messages.push({ role:"tool", tool_call_id:call.id, content: JSON.stringify(result) });
    }
  }
}