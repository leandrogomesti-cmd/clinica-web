"use client";

import { useMemo, useState } from "react";

type IntakeRow = {
  id: string;
  created_at: string | null;
  nome: string | null;
  cpf: string | null;
  telefone: string | null;
};

export default function SecretariaTableClient({ rows }: { rows: IntakeRow[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) => {
      const nome = (r.nome ?? "").toLowerCase();
      const cpf = r.cpf ?? "";
      const tel = r.telefone ?? "";
      return nome.includes(s) || cpf.includes(s) || tel.includes(s);
    });
  }, [q, rows]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome/CPF/telefone…"
          className="border rounded-xl px-3 py-2 w-72 outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>

      <div className="rounded-xl border overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs text-gray-500">
            <tr className="border-b">
              <th className="p-3">Criado em</th>
              <th className="p-3">Nome</th>
              <th className="p-3">CPF</th>
              <th className="p-3">Telefone</th>
              <th className="p-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="p-3">
                  {r.created_at
                    ? new Date(r.created_at).toLocaleString("pt-BR")
                    : "—"}
                </td>
                <td className="p-3">{r.nome || "—"}</td>
                <td className="p-3">{r.cpf || "—"}</td>
                <td className="p-3">{r.telefone || "—"}</td>
                <td className="p-3 text-right">
                  <button
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => alert(`Promover intake ${r.id}`)}
                  >
                    Promover
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-6 text-center text-gray-500" colSpan={5}>
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}