// app/agenda/page.tsx
import requireRole from "@/lib/auth/requireRole";
import AgendaClient from "./_client";

export default async function Page() {
  const { supabase } = await requireRole(["staff", "doctor", "admin"]);

  // Opcional: fetch no server (mantém RLS e evita piscada)
  const { data: appts = [] } = await supabase
    .from("appointments")
    .select("id, start_time, end_time, patient_name")
    .order("start_time", { ascending: true });

  return <AgendaClient appts={appts} />;
}