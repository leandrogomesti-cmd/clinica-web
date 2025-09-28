import { supabaseServer } from "@/lib/supabaseServer";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getContext() {
  const sb = supabaseServer();

  // 1) exige sessão
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  // 2) exige perfil com role=staff (secretária)
  const { data: profile } = await sb
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "staff") redirect("/login");

  return { sb, user };
}

export default async function SecretariaPage() {
  const { sb } = await getContext();

  // Lista pendências diretamente via RLS
  const { data: itens, error } = await sb
    .from("pacientes_intake")
    .select("*")
    .eq("status", "PENDENTE")
    .order("created_at", { ascending: true });

  if (error) {
    return <main className="p-6">Erro: {error.message}</main>;
  }

  // Server Action de aprovação
  async function approveAction(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;

    const { sb } = await getContext();
    const { error } = await sb.rpc("promover_intake_paciente", {
      p_intake_id: id,
    });
    if (error) throw new Error(error.message);

    revalidatePath("/secretaria");
  }

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Secretaria – Pré-cadastros</h1>

      {!itens || itens.length === 0 ? (
        <p>Nenhum pré-cadastro pendente.</p>
      ) : (
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Nome</th>
                <th className="p-2">WhatsApp</th>
                <th className="p-2">E-mail</th>
                <th className="p-2">Cidade/UF</th>
                <th className="p-2">Convênio</th>
                <th className="p-2">Criado em</th>
                <th className="p-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="p-2">{it.nome}</td>
                  <td className="p-2">{it.telefone_whatsapp ?? "—"}</td>
                  <td className="p-2">{it.email ?? "—"}</td>
                  <td className="p-2">
                    {(it.cidade || "—")}/{it.estado || "—"}
                  </td>
                  <td className="p-2">{it.convenio || "—"}</td>
                  <td className="p-2">
                    {new Date(it.created_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="p-2">
                    <form action={approveAction}>
                      <input type="hidden" name="id" value={it.id} />
                      <button className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700">
                        Aprovar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
