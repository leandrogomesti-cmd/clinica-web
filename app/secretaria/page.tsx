// app/secretaria/page.tsx
import requireRole from "@/lib/auth/requireRole";
import { createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type IntakeRow = {
  id: string;
  created_at: string | null;
  nome: string | null;
  cpf: string | null;
  telefone: string | null;
};

export default async function Page() {
  // Permissões
  await requireRole(["staff", "admin"]);

  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("pacientes_intake")
    .select("id, created_at, nome, cpf, telefone")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;

  const rows: IntakeRow[] = data ?? [];

  return (
    <div className="p-4 space-y-4">
      <div className="text-sm text-gray-500">
        build: <code>{process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local"}</code>
      </div>

      <h1 className="text-2xl font-semibold">Aprovação</h1>
      <p className="text-sm text-gray-500">{rows.length} registros</p>

      {/* Tabela (client component) */}
      <SecretariaTableClient rows={rows} />
    </div>
  );
}

// ⚠️ Renomeie o import para evitar colisão com `export const dynamic`
import NextDynamic from "next/dynamic";
const SecretariaTableClient = NextDynamic(
  () => import("./secretaria-table.client"),
  { ssr: false }
);