"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/primitives";

// ---------- Tipos ----------
type ResumoRow = {
  dia: string | null; // ISO string vindo da view
  total_pago_cents: number | null;
  total_a_receber_cents: number | null;
  total_consultas: number | null;
};

type Props = { tz?: string };

// ---------- Utils ----------
function parseISO(s: string | null) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

// YYYY-MM-DD na timezone informada (pra agrupar por dia local)
function ymdInTZ(d: Date, timeZone = "America/Sao_Paulo") {
  // en-CA => 2025-10-07
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function brlCents(v?: number | null) {
  const n = (v ?? 0) / 100;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function sum<T>(arr: T[], sel: (x: T) => number) {
  return arr.reduce((acc, it) => acc + (Number(sel(it)) || 0), 0);
}

function safeDateLabel(dia: string | null, tz: string) {
  const d = parseISO(dia);
  if (!d) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: tz,
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(d);
}

// ---------- Componente ----------
export default function FinanceiroClient({ tz = "America/Sao_Paulo" }: Props) {
  const supabase = createClient();
  const [rows, setRows] = useState<ResumoRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<string | null>(null);

  // período: últimos 7 dias incluindo hoje (na timezone do Brasil)
  const now = useMemo(() => new Date(), []);
  const fromISO = useMemo(() => {
    // começo de 7 dias atrás, 00:00 no TZ
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const parts = fmt.formatToParts(now);
    const y = parts.find(p => p.type === "year")?.value ?? "1970";
    const m = parts.find(p => p.type === "month")?.value ?? "01";
    const d = parts.find(p => p.type === "day")?.value ?? "01";
    // data local de hoje
    const todayLocal = new Date(`${y}-${m}-${d}T00:00:00`);
    const from = new Date(todayLocal.getTime() - 6 * 24 * 60 * 60 * 1000);
    return from.toISOString();
  }, [now, tz]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setNote(null);

      // 1) tenta view v_financeiro_resumo
      const { data: vdata, error: verror } = await supabase
        .from("v_financeiro_resumo")
        .select("*")
        .gte("dia", fromISO)
        .order("dia", { ascending: true });

      if (!verror && Array.isArray(vdata)) {
        // Normaliza tipos
        const norm = vdata.map((r: any) => ({
          dia: r.dia ?? null,
          total_pago_cents: r.total_pago_cents ?? 0,
          total_a_receber_cents: r.total_a_receber_cents ?? 0,
          total_consultas: r.total_consultas ?? 0,
        })) as ResumoRow[];
        setRows(norm);
        setLoading(false);
        return;
      }

      // 2) fallback se a view não existir: calcula no cliente
      setNote("View v_financeiro_resumo não encontrada. Usando cálculo local (appointments + payments).");

      // payments pagos (paid)
      const { data: pays } = await supabase
        .from("payments")
        .select("amount_cents, paid_at")
        .gte("paid_at", fromISO)
        .in("status", ["paid", "refunded", "chargeback"]); // pago e variações

      // appointments para a receber (payment_status != 'paid')
      const { data: appts } = await supabase
        .from("appointments")
        .select("start_time, price_cents, payment_status")
        .gte("start_time", fromISO);

      // agrupa por dia local
      const map = new Map<
        string,
        { pago: number; aReceber: number; consultas: number; diaISO: string }
      >();

      // pagamentos
      (pays ?? []).forEach(p => {
        const d = parseISO(p.paid_at);
        if (!d) return;
        const key = ymdInTZ(d, tz);
        const bucket = map.get(key) ?? { pago: 0, aReceber: 0, consultas: 0, diaISO: new Date(key).toISOString() };
        bucket.pago += Number(p.amount_cents) || 0;
        map.set(key, bucket);
      });

      // consultas
      (appts ?? []).forEach(a => {
        const d = parseISO(a.start_time);
        if (!d) return;
        const key = ymdInTZ(d, tz);
        const bucket = map.get(key) ?? { pago: 0, aReceber: 0, consultas: 0, diaISO: new Date(key).toISOString() };
        bucket.consultas += 1;
        const st = String(a.payment_status || "unpaid").toLowerCase();
        if (st !== "paid") bucket.aReceber += Number(a.price_cents) || 0;
        map.set(key, bucket);
      });

      const computed = Array.from(map.entries())
        .sort((a, b) => (a[0] < b[0] ? -1 : 1))
        .map(([_, v]) => ({
          dia: v.diaISO,
          total_pago_cents: v.pago,
          total_a_receber_cents: v.aReceber,
          total_consultas: v.consultas,
        })) as ResumoRow[];

      setRows(computed);
      setLoading(false);
    })();
  }, [supabase, fromISO, tz]);

  const totais = useMemo(() => {
    const list = rows ?? [];
    return {
      pago: sum(list, r => r.total_pago_cents ?? 0),
      aReceber: sum(list, r => r.total_a_receber_cents ?? 0),
      consultas: sum(list, r => r.total_consultas ?? 0),
    };
  }, [rows]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Total pago (7 dias)</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{brlCents(totais.pago)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>A receber (7 dias)</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{brlCents(totais.aReceber)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Consultas (7 dias)</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{totais.consultas}</CardContent>
        </Card>
      </div>

      {note && (
        <div className="text-xs text-gray-500">
          {note}
        </div>
      )}

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
                  {rows.map((r, i) => {
                    // evita “Invalid time value” no render
                    const label = safeDateLabel(r.dia, tz);
                    return (
                      <tr key={i} className="border-b last:border-none">
                        <td className="py-2 pr-4">{label}</td>
                        <td className="py-2 pr-4">{brlCents(r.total_pago_cents)}</td>
                        <td className="py-2 pr-4">{brlCents(r.total_a_receber_cents)}</td>
                        <td className="py-2">{r.total_consultas ?? 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}