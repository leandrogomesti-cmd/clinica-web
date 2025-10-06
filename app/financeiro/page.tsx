// app/financeiro/page.tsx
import AppFrame from "@/components/app-frame";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Select,
  Table,
  THead,
  TH,
  TRow,
  TD,
} from "@/components/ui/primitives";
import requireRole from "@/lib/auth/requireRole";

type Payment = {
  id?: string;
  date: string | null;
  patient_name: string | null;
  amount: number | null;
  status: string | null;
};

export default async function Page() {
  const { supabase } = await requireRole(["staff", "admin"]);

  // payments: date (timestamp/date), patient_name, amount (number), status ('paid' | 'pending' | etc)
  const { data: paymentsRaw, error } = await supabase
    .from("payments")
    .select("id, date, patient_name, amount, status")
    .order("date", { ascending: false });

  // ✅ garante array para evitar 'possibly null'
  const payments: Payment[] = paymentsRaw ?? [];

  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  // Resumo mensal simples (últimos 4 meses presentes nos dados)
  const summaryMap = new Map<string, number>();
  for (const p of payments) {
    const d = p.date ? new Date(p.date) : null;
    const key = d ? months[d.getMonth()] : "—";
    summaryMap.set(key, (summaryMap.get(key) || 0) + (Number(p.amount) || 0));
  }
  const summary = Array.from(summaryMap.entries()).slice(-4);
  const max = Math.max(1, ...summary.map(([, total]) => total));

  const totalPaid = payments.reduce(
    (acc, p) => acc + (p.status === "paid" ? Number(p.amount || 0) : 0),
    0
  );
  const totalAll = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const pctPaid = totalAll ? Math.round((totalPaid / totalAll) * 100) : 0;

  return (
    <AppFrame>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Resumo mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.length === 0 ? (
              <div className="text-sm text-gray-500">Sem dados.</div>
            ) : (
              <div className="grid grid-cols-4 gap-3 items-end h-56">
                {summary.map(([mes, total], i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-xl bg-blue-500/70"
                      style={{
                        height: `${Math.round((total / max) * 100)}%`,
                      }}
                    />
                    <span className="text-sm text-gray-600">{mes}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>KPIs</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Kpi
              label="Receitas (mês)"
              value={`R$ ${Number(
                summary.length ? summary[summary.length - 1][1] : 0
              ).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`}
            />
            <Kpi label="Pagos" value={`${pctPaid}%`} />
            <Kpi label="Pendentes" value={`${100 - pctPaid}%`} />
            <Kpi label="Consultas" value={`${payments.length}`} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Pagamentos</CardTitle>
            <div className="flex gap-2 items-center">
              <Input placeholder="Filtrar…" className="w-[220px]" />
              <Select className="w-[140px]">
                <option>Todos</option>
                <option>Pendentes</option>
                <option>Pagos</option>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <THead>
                  <TRow>
                    <TH>Data</TH>
                    <TH>Paciente</TH>
                    <TH>Valor</TH>
                    <TH>Status</TH>
                  </TRow>
                </THead>
                <tbody>
                  {payments.map((r) => (
                    <TRow key={r.id ?? `${r.date}-${r.patient_name}`}>
                      <TD>
                        {r.date
                          ? new Date(r.date).toLocaleDateString("pt-BR")
                          : "—"}
                      </TD>
                      <TD>{r.patient_name || "—"}</TD>
                      <TD>
                        {r.amount != null
                          ? `R$ ${Number(r.amount).toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}`
                          : "—"}
                      </TD>
                      <TD>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            r.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {r.status === "paid" ? "Pago" : r.status || "—"}
                        </span>
                      </TD>
                    </TRow>
                  ))}
                  {payments.length === 0 && (
                    <TRow>
                      <TD className="text-center text-gray-500" colSpan={4}>
                        Sem dados.
                      </TD>
                    </TRow>
                  )}
                </tbody>
              </Table>
            </div>
            {error && (
              <div className="mt-3 text-xs text-amber-700">
                Erro ao ler <code>payments</code>: {String(error.message)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppFrame>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-3 shadow-sm">
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{label}</span>
      </div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}