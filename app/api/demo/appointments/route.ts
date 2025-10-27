import { NextResponse } from "next/server";
import { MemoryStore, KvStore } from "@/lib/server/demo-store";

function getStore(){
  if (process.env.VERCEL_KV_REST_API_URL && process.env.VERCEL_KV_REST_API_TOKEN) {
    const kv = {
      async get(k:string){ const r=await fetch(`${process.env.VERCEL_KV_REST_API_URL}/get/${k}`,{headers:{Authorization:`Bearer ${process.env.VERCEL_KV_REST_API_TOKEN}`}}); return (await r.json()).result; },
      async set(k:string,v:any){ await fetch(`${process.env.VERCEL_KV_REST_API_URL}/set/${k}`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.VERCEL_KV_REST_API_TOKEN}`},body:JSON.stringify({value:v})}); }
    };
    return KvStore(kv as any);
  }
  return MemoryStore;
}

export async function GET(){
  const items = await getStore().listUpcoming();
  const mapped = items.map(a=>({
    id:a.id, paciente:a.patientPhone, medico:a.doctorName, sala:"Sala 1",
    data:a.startsAt.slice(0,10), inicio:a.startsAt.slice(11,16), fim:a.endsAt.slice(11,16),
    status: a.status==="CONFIRMED" ? "confirmada" : "cancelada", tags:["demo"]
  }));
  return NextResponse.json({ items: mapped });
}