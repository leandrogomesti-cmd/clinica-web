// app/financeiro/_client.tsx
"use client";

import AppFrame from "@/components/app-frame";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useMemo, useState } from "react";

type DayRow = {
  dia: string;                    // YYYY-MM-DD (fuso America/Sao_Paulo)
  total_pago_cents: number;
  total_a_receber_cents: number;
  total_consultas: number;
};

const TZ = "America/Sao_Paulo";
const fmtBRL = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((cents || 0) / 100);

const fmtDia = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "short", day: "2-digit", month: "2-digit" }).format(
    new Date(iso + "T00:00:00")
  );

function toISODateInTZ(d: Date) {
  // ISO YYYY-MM-DD no fuso do Brasil
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(d)
    .reduce<Record<string, string>>((acc, { type, value }) => ((acc[type] = value), acc), {});
  return `${p.year}-${p.month}-${p.day}`;
}

function makeRange(days: number): string[] {
  const out: string[] = [];
  const end = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    out.push(toISODateInTZ(d));
  }
  return out;
}

export default function FinanceiroClient() {
  const supabase = createClient();
  const [rows, setRows] = useState<DayRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);

      // janelinha: últimos 7 dias no fuso do Brasil
      const days = makeRange(7);
      const startISO = days[0];
      const endISO = days[days.length - 1];

      // 1) tenta a view de resumo, se existir/estiver populada
      let viewRows: DayRow[] = [];
      const { data: vdata } = await supabase
        .from("v_financeiro_resumo")
        .select("dia,total_pago_cents,total_a_receber_cents,total_consultas")
        .gte("dia", startISO)
        .lte("dia", endISO)
        .order("dia", { ascending: true });

      if (Array.isArray(vdata) && vdata.length > 0) {
        viewRows = vdata as DayRow[];
      }

      // 2) fallback: computa no cliente a partir de payments e appointments
      const needFallback =
        viewRows.length === 0 ||
        viewRows.every((r) => (r.total_pago_cents || 0) === 0 && (r.total_a_receber_cents || 0) === 0 && (r.total_consultas || 0) === 0);

      if (!needFallback) {
        // garante grade com todos os dias (preenche zeros)
        const grid = new Map<string, DayRow>(days.map((d) => [d, { dia: d, total_pago_cents: 0, total_a_receber_cents: 0, total_consultas: 0 }]));
        for (const r of viewRows) grid.set(r.dia, { ...grid.get(r.dia)!, ...r });
        setRows(Array.from(grid.values()));
        setLoading(false);
        return;
      }

      // --- FALLBACK ---
      // payments: paid_at (timestamp), status ('paid' etc), net_amount_cents (gerada)
      const { data: pays = [] } = await supabase
        .from("payments")
        .select("paid_at, status, net_amount_cents")
        .gte("paid_at", startISO + "T00:00:00")
        .lte("paid_at", endISO + "T23:59:59");

      // appointments: start_time, price_cents, payment_status
      const { data: appts = [] } = await supabase
        .from("appointments")
        .select("start_time, price_cents, payment_status")
        .gte("start_time", startISO + "T00:00:00")
        .lte("start_time", endISO + "T23:59:59");

      const map = new Map<string, DayRow>(days.map((d) => [d, { dia: d, total_pago_cents: 0, total_a_receber_cents: 0, total_consultas: 0 }]));

      for (const p of pays as any[]) {
        if (p?.status === "paid" && p?.paid_at) {
          const dia = toISODateInTZ(new Date(p.paid_at));
          const row = map.get(dia);
          if (row) row.total_pago_cents += Number(p.net_amount_cents || 0);
        }
      }

      for (const a of appts as any[]) {
        if (!a?.start_time) continue;
        const dia = toISODateInTZ(new Date(a.start_time));
        const row = map.get(dia);
        if (!row) continue;
        row.total_consultas += 1;
        if (["unpaid", "pending"].includes(String(a.payment_status || ""))) {
          row.total_a_receber_cents += Number(a.price_cents || 0);
        }
      }

      setRows(Array.from(map.values()));
      setLoading(false);
    })();
  }, [supabase]);

  const totals = useMemo(
    () => ({
      pago: rows.reduce((s, r) => s + (r.total_pago_cents || 0), 0),
      aReceber: rows.reduce((s, r) => s + (r.total_a_receber_cents || 0), 0),
      consultas: rows.reduce((s, r) => s + (r.total_consultas || 0), 0),
    }),
    [rows]
  );

  return (
    <AppFrame>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle>Financeiro</CardTitle>
            <div className="text-xs text-gray-500">Fuso: Brasília (GMT-3)</div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-sm text-gray-500">Carregando…</div>
          ) : (
            <>
              {/* Resumo da semana (7 dias) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-gray-500">Recebido (7 dias)</div>
                  <div className="text-lg font-semibold">{fmtBRL(totals.pago)}</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-gray-500">A receber (7 dias)</div>
                  <div className="text-lg font-semibold">{fmtBRL(totals.aReceber)}</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-gray-500">Consultas (7 dias)</div>
                  <div className="text-lg font-semibold">{totals.consultas}</div>
                </div>
              </div>

              {/* Grade por dia */}
              {rows.length === 0 ? (
                <div className="text-sm text-gray-500">Sem dados.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[640px] w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="py-2 pr-4">Dia</th>
                        <th className="py-2 pr-4">Consultas</th>
                        <th className="py-2 pr-4">Recebido</th>
                        <th className="py-2 pr-4">A receber</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.dia} className="border-b last:border-b-0">
                          <td className="py-2 pr-4">{fmtDia(r.dia)}</td>
                          <td className="py-2 pr-4">{r.total_consultas}</td>
                          <td className="py-2 pr-4">{fmtBRL(r.total_pago_cents)}</td>
                          <td className="py-2 pr-4">{fmtBRL(r.total_a_receber_cents)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </AppFrame>
  );
}