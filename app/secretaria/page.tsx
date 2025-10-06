// app/secretaria/page.tsx
import requireRole from "@/lib/auth/requireRole";
import { serverSupabase } from "@/lib/supabase/server";

export default async function Secretaria() {
  await requireRole(["staff", "admin"]);

  const supabase = serverSupabase();
  const { data, error } = await supabase
    .from("pacientes_intake")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return <main>Erro ao carregar aprovações: {error.message}</main>;
  }

  return (
    <main>
      <h1 className="text-xl font-semibold mb-4">Aprovação</h1>
      <div className="text-sm text-muted-foreground mb-2">
        {data?.length ?? 0} registros
      </div>
      {/* renderize sua tabela como já tinha */}
    </main>
  );
}