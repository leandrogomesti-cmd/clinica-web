// app/secretaria/page.tsx
import requireRole from "@/lib/auth/requireRole";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function promover(id: string) {
  "use server";
  const { supabase } = await requireRole(["staff", "admin"]);
  const { error } = await supabase.rpc("promover_intake_paciente", {
    intake_id: id,
  });
  if (error) {
    console.error(error);
  }
  revalidatePath("/secretaria");
}

export default async function SecretariaPage() {
  const { supabase } = await requireRole(["staff", "admin"]);

  const { data, error } = await supabase
    .from("pacientes_intake")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) console.error(error);

  const rows = data ?? [];

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Aprovação</h1>
      <p className="mb-3 text-sm text-muted-foreground">
        {rows.length} registros
      </p>

      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">Nome</th>
              <th className="p-3 text-left">CPF</th>
              <th className="p-3 text-left">Telefone</th>
              <th className="p-3 text-left">Criado em</th>
              <th className="p-3 text-left">Ação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: any) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.full_name ?? "—"}</td>
                <td className="p-3">{r.cpf ?? "—"}</td>
                <td className="p-3">{r.phone ?? "—"}</td>
                <td className="p-3">
                  {r.created_at
                    ? new Date(r.created_at).toLocaleString()
                    : "—"}
                </td>
                <td className="p-3">
                  <form action={promover.bind(null, r.id)}>
                    <button
                      type="submit"
                      className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:opacity-90"
                    >
                      Promover
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={5}>
                  Sem solicitações.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}