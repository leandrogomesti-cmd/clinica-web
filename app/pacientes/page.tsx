// app/pacientes/page.tsx
import requireRole from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

export default async function PacientesPage() {
  const { supabase } = await requireRole(["staff", "doctor", "admin"]);

  const { data, error } = await supabase
    .from("patients")
    .select("id, full_name, phone, cpf, rg, created_at")
    .order("created_at", { ascending: false });

  if (error) console.error(error);
  const rows = data ?? [];

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Pacientes</h1>
      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">Telefone</th>
              <th className="p-3 text-left">CPF</th>
              <th className="p-3 text-left">RG</th>
              <th className="p-3 text-left">Criado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.full_name ?? "—"}</td>
                <td className="p-3">{r.phone ?? "—"}</td>
                <td className="p-3">{r.cpf ?? "—"}</td>
                <td className="p-3">{(r as any).rg ?? "—"}</td>
                <td className="p-3">
                  {r.created_at
                    ? new Date(r.created_at).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={5}>
                  Nenhum paciente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}