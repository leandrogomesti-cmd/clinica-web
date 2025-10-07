// app/pacientes/page.tsx
import AppFrame from "@/components/app-frame";
import requireRole from "@/lib/auth/requireRole";

export default async function Page() {
  const { supabase } = await requireRole(["staff","doctor","admin"]);

  const { data: pacs = [] } = await supabase
    .from("patients")
    .select("id, full_name, birth_date, phone, email, city, state")
    .order("full_name", { ascending: true });

  return (
    <AppFrame>
      <div className="rounded-xl border bg-white">
        <div className="p-4 border-b text-base font-semibold">Pacientes</div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">Nascimento</th>
                <th className="px-4 py-2">Telefone</th>
                <th className="px-4 py-2">E-mail</th>
                <th className="px-4 py-2">Cidade/UF</th>
              </tr>
            </thead>
            <tbody>
              {(pacs ?? []).map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-2">{p.full_name}</td>
                  <td className="px-4 py-2">{p.birth_date ?? "-"}</td>
                  <td className="px-4 py-2">{p.phone ?? "-"}</td>
                  <td className="px-4 py-2">{p.email ?? "-"}</td>
                  <td className="px-4 py-2">{[p.city, p.state].filter(Boolean).join(" / ") || "-"}</td>
                </tr>
              ))}
              {(pacs?.length ?? 0) === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Nenhum paciente.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppFrame>
  );
}