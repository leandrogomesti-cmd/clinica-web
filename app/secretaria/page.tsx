// app/secretaria/page.tsx
import AppFrame from "@/components/app-frame";
import requireRole from "@/lib/auth/requireRole";

export default async function Page() {
  const { supabase } = await requireRole(["staff","admin"]);

  // Prefira a view; se não existir, troque para "pacientes_intake"
  const { data: pendencias = [] } =
    await supabase.from("vw_pacientes_intake_ui")
      .select("id, nome, cpf, telefone, status, created_at")
      .order("created_at", { ascending: false });

  return (
    <AppFrame>
      <div className="rounded-xl border bg-white">
        <div className="p-4 border-b text-base font-semibold">Pendências de cadastro</div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">CPF</th>
                <th className="px-4 py-2">Telefone</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {(pendencias ?? []).map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-2">{p.nome}</td>
                  <td className="px-4 py-2">{p.cpf}</td>
                  <td className="px-4 py-2">{p.telefone ?? "-"}</td>
                  <td className="px-4 py-2">{p.status}</td>
                  <td className="px-4 py-2">
                    {p.created_at ? new Date(p.created_at).toLocaleString("pt-BR") : "-"}
                  </td>
                </tr>
              ))}
              {(pendencias?.length ?? 0) === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Nenhuma pendência.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppFrame>
  );
}