// app/agenda/page.tsx
import requireRole from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const { supabase } = await requireRole(["staff", "doctor", "admin"]);

  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, start_time, status, payment_status, patients:patient_id ( full_name )"
    )
    .order("start_time", { ascending: true });

  if (error) {
    console.error(error);
  }

  const rows =
    data?.map((a) => ({
      id: a.id,
      start_time: a.start_time,
      patient: (a as any).patients?.full_name ?? "",
      status: (a as any).status ?? "",
      payment_status: (a as any).payment_status ?? "",
    })) ?? [];

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Agenda</h1>
      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">Data/Hora</th>
              <th className="p-3 text-left">Paciente</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Pagamento</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">
                  {r.start_time ? new Date(r.start_time).toLocaleString() : "—"}
                </td>
                <td className="p-3">{r.patient || "—"}</td>
                <td className="p-3">{r.status || "—"}</td>
                <td className="p-3">{r.payment_status || "—"}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={4}>
                  Nenhum agendamento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}