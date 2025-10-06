// app/secretaria/page.tsx
import requireRole from "@/lib/auth/requireRole";
import { createSupabaseServer } from "@/lib/supabase/server";

// Se você tiver um layout/componente de moldura, importe-o.
// Aqui uso só HTML+Tailwind pra ficar plug-and-play.
export const dynamic = "force-dynamic";

type IntakeRow = {
  id: string;
  created_at: string | null;
  nome: string | null;
  cpf: string | null;
  telefone: string | null;
};

export default async function Page() {
  // Garante acesso
  await requireRole(["staff", "admin"]);

  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("pacientes_intake")
    .select("id, created_at, nome, cpf, telefone")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    // Deixe explodir para o Next mostrar a error page
    throw error;
  }

  const rows: IntakeRow[] = data ?? [];

  return (
    <div className="p-4 space-y-4">
      <div className="text-sm text-gray-500">
        build: <code>{process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local"}</code>
      </div>

      <h1 className="text-2xl font-semibold">Aprovação</h1>
      <p className="text-sm text-gray-500">{rows.length} registros</p>

      {/* Componente cliente recebe os dados prontos */}
      <SecretariaTableClient rows={rows} />
    </div>
  );
}

// Importa dinamicamente o componente client para não vazar "use client" aqui
import dynamic from "next/dynamic";
const SecretariaTableClient = dynamic(() => import("./secretaria-table.client"), {
  ssr: false,
});