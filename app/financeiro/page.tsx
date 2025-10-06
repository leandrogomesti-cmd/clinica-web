// app/financeiro/page.tsx
import requireRole from "@/lib/auth/requireRole";
import { serverSupabase } from "@/lib/supabase/server";

export default async function Financeiro() {
  await requireRole(["staff", "admin"]);

  const supabase = serverSupabase();
  const { data, error } = await supabase
    .from("v_financeiro_resumo")
    .select("*");

  if (error) {
    return <main>Erro ao carregar financeiro: {error.message}</main>;
  }

  return (
    <main>
      <h1 className="text-xl font-semibold mb-4">Financeiro</h1>
      {/* tabela/renderização que você já usa */}
    </main>
  );
}