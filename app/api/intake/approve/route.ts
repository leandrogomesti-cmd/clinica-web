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

export async function POST(req: Request) {
  if (!assertAuth(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { id } = body as { id?: string };

  if (!id) {
    return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });
  }

  // Chama a função que você criou no SQL: promover_intake_paciente(uuid)
  const { data, error } = await supabaseAdmin
    .rpc("promover_intake_paciente", { p_intake_id: id });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, paciente_id: data });
}
