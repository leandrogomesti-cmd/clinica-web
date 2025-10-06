// app/financeiro/page.tsx
import requireRole from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

type Resumo = {
  dia: string | null;
  total_pago_cents: number | null;
  total_a_receber_cents: number | null;
  total_consultas: number | null;
};

export default async function FinanceiroPage() {
  const { supabase } = await requireRole(["staff", "admin"]);

  // tenta a view v_financeiro_resumo; se não existir, mostra aviso
  const { data, error } = await supabase
    .from("v_financeiro_resumo")
    .select("*")
    .order("dia", { ascending: false });

  const rows: Resumo[] = (!error && data) ? (data as any) : [];

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Financeiro</h1>
      {error && (
        <p className="mb-4 text-sm text-amber-700">
          Não foi possível ler <code>v_financeiro_resumo</code>. Se a view não
          existir, crie-a ou ajuste esta página para outra fonte.
        </p>
      )}
      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">Dia</th>
              <th className="p-3 text-left">Recebido</th>
              <th className="p-3 text-left">A receber</th>
              <th className="p-3 text-left">Consultas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-3">
                  {r.dia ? new Date(r.dia).toLocaleDateString() : "—"}
                </td>
                <td className="p-3">
                  R$ {(Number(r.total_pago_cents ?? 0) / 100).toFixed(2)}
                </td>
                <td className="p-3">
                  R$ {(Number(r.total_a_receber_cents ?? 0) / 100).toFixed(2)}
                </td>
                <td className="p-3">{r.total_consultas ?? 0}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={4}>
                  Sem dados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}