// app/demo/financeiro/page.tsx
"use client";
import { useState } from "react";

type Mov = { id: string; tipo: "receber" | "pagar"; desc: string; valor: number; data: string };
export default function FinanceiroDemo() {
  const [receber, setReceber] = useState<Mov[]>([
    { id: "r1", tipo: "receber", desc: "Consulta · Maria da Silva", valor: 250, data: "12/10/2025" },
    { id: "r2", tipo: "receber", desc: "Retorno · João Pereira", valor: 0, data: "12/10/2025" },
  ]);
  const [pagar, setPagar] = useState<Mov[]>([{ id: "p1", tipo: "pagar", desc: "Aluguel da clínica", valor: 3000, data: "12/10/2025" }]);
  const [novo, setNovo] = useState<Mov>({ id: "", tipo: "receber", desc: "", valor: 0, data: "" });

  function add() {
    if (!novo.desc || !novo.data) { alert("Preencha descrição e data"); return; }
    const item = { ...novo, id: String(Date.now()) };
    (novo.tipo === "receber" ? setReceber : setPagar)((prev) => [...prev, item]);
    setNovo({ id: "", tipo: "receber", desc: "", valor: 0, data: "" });
  }
  function del(tipo: Mov["tipo"], id: string) {
    (tipo === "receber" ? setReceber : setPagar)((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="p-6 grid gap-6 md:grid-cols-2">
      <Card title="Recebimentos (5)">
        {receber.map((m) => (
          <Row
            key={m.id}
            left={<><b>{m.desc}</b><div className="text-xs text-slate-500">{m.data}</div></>}
            right={
              <div className="flex items-center gap-3">
                <b>R$ {m.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</b>
                <button className="px-2 py-1 text-xs rounded-lg border" onClick={() => del("receber", m.id)}>Excluir</button>
              </div>
            }
          />
        ))}
      </Card>

      <Card title="Pagamentos (5)">
        {pagar.map((m) => (
          <Row
            key={m.id}
            left={<><b>{m.desc}</b><div className="text-xs text-slate-500">{m.data}</div></>}
            right={
              <div className="flex items-center gap-3">
                <b>R$ {m.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</b>
                <button className="px-2 py-1 text-xs rounded-lg border" onClick={() => del("pagar", m.id)}>Excluir</button>
              </div>
            }
          />
        ))}
      </Card>

      <div className="md:col-span-2 rounded-2xl border bg-white p-4">
        <h3 className="font-semibold mb-2">Novo lançamento</h3>
        <div className="grid gap-2 md:grid-cols-4">
          <select className="border rounded-xl px-3 py-2" value={novo.tipo} onChange={(e) => setNovo({ ...novo, tipo: e.target.value as any })}>
            <option value="receber">Receber</option>
            <option value="pagar">Pagar</option>
          </select>
          <input className="border rounded-xl px-3 py-2" placeholder="Descrição" value={novo.desc} onChange={(e) => setNovo({ ...novo, desc: e.target.value })} />
          <input className="border rounded-xl px-3 py-2" placeholder="Valor" type="number" value={novo.valor} onChange={(e) => setNovo({ ...novo, valor: Number(e.target.value) })} />
          <input className="border rounded-xl px-3 py-2" placeholder="Data (dd/mm/aaaa)" value={novo.data} onChange={(e) => setNovo({ ...novo, data: e.target.value })} />
        </div>
        <button className="mt-3 px-3 py-2 rounded-xl border" onClick={add}>Adicionar</button>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}
function Row({ left, right }: { left: React.ReactNode; right?: React.ReactNode }) {
  return <div className="flex items-center justify-between rounded-xl border p-3"><div className="space-y-1">{left}</div><div>{right}</div></div>;
}