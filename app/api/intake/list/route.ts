import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function assertAuth(req: Request) {
  const hdr = req.headers.get("authorization") || "";
  const token = hdr.replace(/^Bearer\s+/i, "");
  if (!token || token !== process.env.ADMIN_API_TOKEN) {
    return false;
  }
  return true;
}

export async function GET(req: Request) {
  if (!assertAuth(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("pacientes_intake")
    .select("*")
    .eq("status", "PENDENTE")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ items: data });
}
