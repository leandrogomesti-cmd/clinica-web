// app/demo/agenda/page.tsx
"use client";
import { useMemo, useState } from "react";

type C = { id: string; paciente: string; medico: string; data: string; hora: string; status: "pendente" | "confirmada" | "atendida" };
const seed: C[] = [
  { id: "1", paciente: "Maria da Silva", medico: "Dra. Paula", data: "12/10/2025", hora: "14:00", status: "confirmada" },
  { id: "2", paciente: "João Pereira", medico: "Dra. Paula", data: "12/10/2025", hora: "15:00", status: "pendente" },
  { id: "3", paciente: "Carlos Andrade", medico: "Dra. Paula", data: "12/10/2025", hora: "16:00", status: "pendente" },
];

export default function AgendaDemo() {
  const [items, setItems] = useState<C[]>(seed);
  const [form, setForm] = useState<C>({ id: "", paciente: "", medico: "Dra. Paula", data: "", hora: "", status: "pendente" });
  const hoje = useMemo(() => items.filter((i) => i.data === "12/10/2025"), [items]);

  function reset() { setForm({ id: "", paciente: "", medico: "Dra. Paula", data: "", hora: "", status: "pendente" }); }
  function salvar() {
    if (!form.paciente || !form.data || !form.hora) { alert("Preencha paciente/data/hora"); return; }
    if (form.id) setItems((prev) => prev.map((x) => (x.id === form.id ? form : x)));
    else setItems((prev) => [...prev, { ...form, id: String(Date.now()) }]);
    reset();
  }
  function editar(id: string) { setForm(items.find((x) => x.id === id)!); }
  function excluir(id: string) { if (confirm("Excluir consulta?")) setItems((prev) => prev.filter((x) => x.id !== id)); }
  function confirmarWhatsApp(c: C) {
    const msg = encodeURIComponent(`Olá ${c.paciente}! Confirmamos sua consulta em ${c.data} às ${c.hora}.`);
    window.open(`https://wa.me/5511999999999?text=${msg}`, "_blank");
  }
  function marcarConfirmada(id: string) { setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status: "confirmada" } : x))); }

  return (
    <div className="p-6 grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Agenda</h2>
        {items.map((c) => (
          <div
            key={c.id}
            className={`flex items-center justify-between rounded-xl border p-3 ${
              c.status === "atendida" ? "bg-red-50" : c.status === "confirmada" ? "bg-blue-50" : "bg-white"
            }`}
          >
            <div>
              <div className="font-medium">{c.paciente}</div>
              <div className="text-xs text-slate-500">{c.data} • {c.hora} • {c.medico}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-2 py-1 text-xs rounded-lg border" onClick={() => editar(c.id)}>Editar</button>
              <button className="px-2 py-1 text-xs rounded-lg border" onClick={() => excluir(c.id)}>Excluir</button>
              <button className="px-2 py-1 text-xs rounded-lg border" onClick={() => confirmarWhatsApp(c)}>WhatsApp</button>
              {c.status !== "confirmada" && (
                <button className="px-2 py-1 text-xs rounded-lg border" onClick={() => marcarConfirmada(c.id)}>Marcar como confirmada</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-white p-4 space-y-3">
        <h3 className="font-semibold">Adicionar/Editar consulta</h3>
        <input className="border rounded-xl px-3 py-2 w-full" placeholder="Paciente" value={form.paciente} onChange={(e) => setForm({ ...form, paciente: e.target.value })} />
        <input className="border rounded-xl px-3 py-2 w-full" placeholder="Médico" value={form.medico} onChange={(e) => setForm({ ...form, medico: e.target.value })} />
        <div className="flex gap-2">
          <input className="border rounded-xl px-3 py-2 w-full" placeholder="Data (dd/mm/aaaa)" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
          <input className="border rounded-xl px-3 py-2 w-full" placeholder="Hora (hh:mm)" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} />
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-xl border" onClick={salvar}>{form.id ? "Salvar alterações" : "Adicionar"}</button>
          <button className="px-3 py-2 rounded-xl border" onClick={reset}>Limpar</button>
        </div>

        <div className="mt-4 text-sm text-slate-600">
          <div className="font-semibold mb-1">Resumo de hoje</div>
          <div>Total: {hoje.length} • Confirmadas: {hoje.filter((x) => x.status === "confirmada").length} • Pendentes: {hoje.filter((x) => x.status === "pendente").length}</div>
        </div>
      </div>
    </div>
  );
}