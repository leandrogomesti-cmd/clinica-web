"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/primitives";

// Tipos
type ViewRow = {
  dia: string | null;
  total_pago_cents: number | null;
  total_a_receber_cents: number | null;
  total_consultas: number | null;
};

type RowUI = {
  key: string;        // YYYY-MM-DD
  label: string;      // DD/MM (sem Date)
  pago: number;
  aReceber: number;
  consultas: number;
};

// Helpers seguros (sem Date)
function normalizeYMD(input: string | null | undefined): string | null {
  if (!input) return null;
  const s = String(input);
  // aceita "2025-10-11", "2025-10-11T00:00:00Z", "2025-10-11 00:00:00+00"
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}
function labelBR(ymd: string | null): string {
  if (!ymd) return "-";
  const [y, m, d] = ymd.split("-");
  return d && m ? `${d}/${m}` : ymd;
}
function centsBRL(v: number) {
  return (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function FinanceiroClient() {
  const supabase = createClient();
  const [rows, setRows] = useState<RowUI[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<string | null>(null);

  // Período alvo (últimos 7 dias) — apenas pro filtro no banco
  const fromISO = useMemo(() => {
    // gera "YYYY-MM-DDT00:00:00Z" sem usar Date no render
    const now = new Date(); // só aqui, fora do render
    const d7 = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    const y = d7.getUTCFullYear();
    const m = String(d7.getUTCMonth() + 1).padStart(2, "0");
    const d = String(d7.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}T00:00:00Z`;
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setNote(null);

      // 1) tenta a view
      const { data: vdata, error: verror } = await supabase
        .from("v_financeiro_resumo")
        .select("*")
        .gte("dia", fromISO)
        .order("dia", { ascending: true });

      if (!verror && Array.isArray(vdata)) {
        const mapped: RowUI[] = vdata.map((r: ViewRow) => {
          const ymd = normalizeYMD(r.dia);
          return {
            key: ymd ?? `x-${Math.random()}`,
            label: labelBR(ymd),
            pago: Number(r.total_pago_cents ?? 0),
            aReceber: Number(r.total_a_receber_cents ?? 0),
            consultas: Number(r.total_consultas ?? 0),
          };
        });
        setRows(mapped);
        setLoading(false);
        return;
      }

      // 2) fallback local
      setNote("Usando cálculo local (appointments + payments). Crie a view v_financeiro_resumo para acelerar.");
      const { data: pays } = await supabase
        .from("payments")
        .select("amount_cents, paid_at, status")
        .gte("paid_at", fromISO);

      const { data: appts } = await supabase
        .from("appointments")
        .select("start_time, price_cents, payment_status")
        .gte("start_time", fromISO);

      const buckets = new Map<string, { pago: number; aReceber: number; consultas: number }>();

      (pays ?? []).forEach(p => {
        const ymd = normalizeYMD(p.paid_at);
        if (!ymd) return;
        if (!["paid", "refunded", "chargeback"].includes(String(p.status || "").toLowerCase())) return;
        const b = buckets.get(ymd) ?? { pago: 0, aReceber: 0, consultas: 0 };
        b.pago += Number(p.amount_cents) || 0;
        buckets.set(ymd, b);
      });

      (appts ?? []).forEach(a => {
        const ymd = normalizeYMD(a.start_time);
        if (!ymd) return;
        const b = buckets.get(ymd) ?? { pago: 0, aReceber: 0, consultas: 0 };
        b.consultas += 1;
        const st = String(a.payment_status || "unpaid").toLowerCase();
        if (st !== "paid") b.aReceber += Number(a.price_cents) || 0;
        buckets.set(ymd, b);
      });

      const mapped: RowUI[] = Array.from(buckets.entries())
        .sort((a, b) => (a[0] < b[0] ? -1 : 1))
        .map(([ymd, v]) => ({
          key: ymd,
          label: labelBR(ymd),
          pago: v.pago,
          aReceber: v.aReceber,
          consultas: v.consultas,
        }));

      setRows(mapped);
      setLoading(false);
    })();
  }, [supabase, fromISO]);

  const totais = useMemo(() => {
    const list = rows ?? [];
    return {
      pago: list.reduce((acc, r) => acc + r.pago, 0),
      aReceber: list.reduce((acc, r) => acc + r.aReceber, 0),
      consultas: list.reduce((acc, r) => acc + r.consultas, 0),
    };
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Total pago (7 dias)</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{centsBRL(totais.pago)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>A receber (7 dias)</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{centsBRL(totais.aReceber)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Consultas (7 dias)</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{totais.consultas}</CardContent>
        </Card>
      </div>

      {note && <div className="text-xs text-gray-500">{note}</div>}

      <Card>
        <CardHeader><CardTitle>Movimento por dia</CardTitle></CardHeader>
        <CardContent>
          {loading && <div className="text-sm text-gray-500">Carregando…</div>}
          {!loading && (!rows || rows.length === 0) && (
            <div className="text-sm text-gray-500">Sem dados no período.</div>
          )}
          {!loading && rows && rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Dia</th>
                    <th className="py-2 pr-4">Pago</th>
                    <th className="py-2 pr-4">A receber</th>
                    <th className="py-2">Consultas</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.key} className="border-b last:border-none">
                      <td className="py-2 pr-4">{r.label}</td>
                      <td className="py-2 pr-4">{centsBRL(r.pago)}</td>
                      <td className="py-2 pr-4">{centsBRL(r.aReceber)}</td>
                      <td className="py-2">{r.consultas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}