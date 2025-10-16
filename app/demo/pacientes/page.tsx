// app/demo/pacientes/page.tsx
"use client";
import { useMemo, useState } from "react";

export default function PacientesDemo() {
  const seed = [
    { id: "1", nome: "Maria da Silva", telefone: "11 91234-5678", nascimento: "12/10/1977", email: "maria@exemplo.com" },
    { id: "2", nome: "João Pereira", telefone: "11 99888-1122", nascimento: "08/02/1988", email: "joao@exemplo.com" },
    { id: "3", nome: "Carlos Andrade", telefone: "11 95555-3333", nascimento: "09/05/1985", email: "carlos@exemplo.com" },
    { id: "4", nome: "Ana Lima", telefone: "11 98888-7777", nascimento: "21/03/1992", email: "ana@exemplo.com" },
    { id: "5", nome: "Rita Souza", telefone: "11 97777-9999", nascimento: "30/11/1990", email: "rita@exemplo.com" },
  ];
  const [q, setQ] = useState("");
  const [items, setItems] = useState(seed);
  const list = useMemo(
    () => (q.trim() ? items.filter((p) => p.nome.toLowerCase().includes(q.toLowerCase())) : items).slice(0, 5),
    [q, items]
  );

  function editar(id: string) {
    const p = items.find((x) => x.id === id)!;
    const nome = window.prompt("Nome", p.nome) ?? p.nome;
    const telefone = window.prompt("Telefone", p.telefone) ?? p.telefone;
    const nascimento = window.prompt("Nascimento (dd/mm/aaaa)", p.nascimento) ?? p.nascimento;
    const email = window.prompt("E-mail", p.email) ?? p.email;
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, nome, telefone, nascimento, email } : x)));
  }
  function excluir(id: string) {
    if (!window.confirm("Excluir paciente?")) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Pacientes</h2>
        <div className="flex gap-2 max-w-md w-full">
          <input className="border rounded-xl px-3 py-2 w-full" placeholder="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="px-3 py-2 rounded-xl border bg-white">Buscar</button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-2xl bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left px-3 py-2 w-48">Ações</th>
              <th className="text-left px-3 py-2">Nome</th>
              <th className="text-left px-3 py-2">Telefone</th>
              <th className="text-left px-3 py-2">Nascimento</th>
              <th className="text-left px-3 py-2">E-mail</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-3 py-2 flex gap-2">
                  <button className="px-2 py-1 text-xs rounded-lg border" onClick={() => editar(p.id)}>Editar</button>
                  <button className="px-2 py-1 text-xs rounded-lg border" onClick={() => excluir(p.id)}>Excluir</button>
                  <a href={`/demo/atendimento?pid=${p.id}`} className="px-2 py-1 text-xs rounded-lg border">Atender</a>
                </td>
                <td className="px-3 py-2">{p.nome}</td>
                <td className="px-3 py-2">{p.telefone}</td>
                <td className="px-3 py-2">{p.nascimento}</td>
                <td className="px-3 py-2">{p.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <h3 className="font-semibold mb-2">Pendências (Autocadastro)</h3>
        <p className="text-sm text-slate-600">
          Na versão real: visualizar, editar, aprovar. Nesta demo, use <a className="underline" href="/autocadastro-demo">/autocadastro-demo</a>.
        </p>
      </div>
    </div>
  );
}