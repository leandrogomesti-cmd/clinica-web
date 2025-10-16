// app/demo/relatorios/page.tsx
"use client";

function reais(n: number) { return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function pct(n: number) { return `${(n * 100).toFixed(0)}%`; }

const dias = Array.from({ length: 14 }).map((_, i) => {
  const dia = new Date(); dia.setDate(dia.getDate() + i);
  const label = dia.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const receita = 200 + Math.round(Math.sin(i / 2) * 120) + (i * 8);
  const pagamentos = 120 + Math.round(Math.cos(i / 3) * 60) + (i * 4);
  const lucro = Math.max(0, receita - pagamentos);
  return { dia: label, receita, pagamentos, lucro };
});

export default function RelatoriosDemoPage() {
  const kpis = { noshowDia: 0.08, noshowSemana: 0.12, ticketMedio: 250.0, confirmadas: 0.76, tempoMedioWhats: "2m40s" };
  const insights = [
    "Gargalo nas segundas de 14h–16h; redistribua slots para terça de manhã.",
    "A taxa de no-show da 1ª consulta é 2,1× maior que pacientes recorrentes.",
    "Tickets maiores em quintas à tarde (+18% vs média).",
    "Envio de lembrete D-0 reduz no-show em ~23% (últimas 6 semanas).",
    "Pacientes a >20 km têm 1,4× mais chance de faltar — inclua lembrete com rota.",
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Relatórios + IA (Demo)</h1>

      <div className="grid md:grid-cols-5 gap-4">
        <KpiCard title="No-show (hoje)" value={pct(kpis.noshowDia)} />
        <KpiCard title="No-show (semana)" value={pct(kpis.noshowSemana)} />
        <KpiCard title="Ticket médio" value={reais(kpis.ticketMedio)} />
        <KpiCard title="% confirmadas" value={pct(kpis.confirmadas)} />
        <KpiCard title="1º retorno (WhatsApp)" value={kpis.tempoMedioWhats} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Previsão Receita / Pagamentos (14 dias)">
          <div className="grid grid-cols-14 gap-2 items-end h-44">
            {dias.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-3 rounded-t bg-slate-900" style={{ height: `${(d.receita / 500) * 100}%` }} title={`Receita ${reais(d.receita)}`} />
                <div className="w-3 rounded-t bg-slate-400" style={{ height: `${(d.pagamentos / 500) * 100}%` }} title={`Pagamentos ${reais(d.pagamentos)}`} />
                <div className="text-[10px] text-slate-400">{d.dia}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Lucro previsto (14 dias)">
          <div className="flex items-end gap-2 h-44">
            {dias.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-4 rounded-t bg-slate-900" style={{ height: `${(d.lucro / 400) * 100}%` }} title={`Lucro ${reais(d.lucro)}`} />
                <div className="text-[10px] text-slate-400">{d.dia}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Simulador: lembrete extra no D-0">
        <p className="text-sm text-slate-600">
          Estimativa: adicionar 1 lembrete no dia da consulta pode reduzir o no-show em <b>~20–25%</b>. Impacto financeiro de 30 dias: <b>{reais(1800)}</b>.
        </p>
        <div className="flex gap-2 mt-2">
          <button className="px-3 py-2 rounded-xl border">Simular com 1 lembrete</button>
          <button className="px-3 py-2 rounded-xl border">Simular com 2 lembretes</button>
        </div>
      </Card>

      <Card title="Insights da IA">
        <ul className="list-disc pl-5 space-y-1 text-sm">
          {insights.map((t, i) => (<li key={i}>{t}</li>))}
        </ul>
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="font-semibold mb-3">{title}</h3>{children}</div>;
}
function KpiCard({ title, value }: { title: string; value: string }) {
  return <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-sm text-slate-500">{title}</div><div className="text-2xl font-bold mt-1">{value}</div></div>;
}