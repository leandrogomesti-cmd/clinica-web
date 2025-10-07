// app/agenda/page.tsx
import requireRole from "@/lib/auth/requireRole";
import AgendaClient from "./_client";

type Appt = { id: string; start_time: string; end_time: string; patient_name: string | null };

export default async function Page() {
  const { supabase } = await requireRole(["staff", "doctor", "admin"]);

  const { data: apptsData } = await supabase
    .from("appointments")
    .select("id, start_time, end_time, patient_name")
    .order("start_time", { ascending: true });

  const appts = (apptsData ?? []) as Appt[];

  return <AgendaClient appts={appts} />;
}