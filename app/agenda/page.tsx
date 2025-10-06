// app/agenda/page.tsx
import requireRole from "@/lib/auth/requireRole";
import { serverSupabase } from "@/lib/supabase/server";

export default async function Agenda() {
  await requireRole(["staff", "doctor", "admin"]);

  const supabase = serverSupabase();
  const { data, error } = await supabase
    .from("appointments")
    .select("id, start_time, status, payment_status, patients(full_name)")
    .order("start_time", { ascending: true })
    .limit(200);

  if (error) {
    return <main>Erro ao carregar agenda: {error.message}</main>;
  }

  return (
    <main>
      <h1 className="text-xl font-semibold mb-4">Agenda</h1>
      {/* tabela/renderização que você já usa */}
    </main>
  );
}