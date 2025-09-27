"use client";

import { useEffect, useState } from "react";

type Intake = {
  id: string;
  nome: string;
  telefone_whatsapp: string | null;
  email: string | null;
  cidade: string | null;
  estado: string | null;
  convenio: string | null;
  created_at: string;
  status: string;
};

export default function SecretariaPage() {
  const [token, setToken] = useState("");
  const [itens, setItens] = useState<Intake[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchItens = async () => {
    if (!token) return;
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/intake/list", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao listar");
      setItens(json.items || []);
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const aprovar = async (id: string) => {
    if (!token) return;
    setMsg(null);
    try {
      const res = await fetch("/api/intake/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Falha ao aprovar");
      setMsg("Cadastro aprovado com sucesso!");
      // Recarrega lista
      fetchItens();
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  useEffect(() => {
    // opcional: carregar automaticamente se já tiver token salvo no sessionStorage
    const saved = sessionStorage.getItem("ADMIN_API_TOKEN");
    if (saved) {
      setToken(saved);
    }
  }, []);

  useEffect(() => {
    if (token) {
      sessionStorage.setItem("ADMIN_API_TOKEN", token);
      fetchItens();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Secretaria – Pré-cadastros</h1>

      <div className="mb-4 flex items-center gap-3">
        <input
          type="password"
          placeholder="Cole o ADMIN_API_TOKEN"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-96"
        />
        <button
          onClick={fetchItens}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Atualizar
        </button>
      </div>

      {msg && <p className="mb-3 text-sm">{msg}</p>}

      {loading ? (
        <p>Carregando…</p>
      ) : itens.length === 0 ? (
        <p>Nenhum pré-cadastro pendente.</p>
      ) : (
        <div className="overflow-auto border rounded">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Nome</th>
                <th className="p-2">WhatsApp</th>
                <th className="p-2">E-mail</th>
                <th className="p-2">Cidade/UF</th>
                <th className="p-2">Convênio</th>
                <th className="p-2">Criado em</th>
                <th className="p-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((it) => (
                <tr key={it.id} className="border-t">
                  <td className="p-2">{it.nome}</td>
                  <td className="p-2">{it.telefone_whatsapp ?? "—"}</td>
                  <td className="p-2">{it.email ?? "—"}</td>
                  <td className="p-2">
                    {(it.cidade || "—")}/{it.estado || "—"}
                  </td>
                  <td className="p-2">{it.convenio || "—"}</td>
                  <td className="p-2">
                    {new Date(it.created_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => aprovar(it.id)}
                      className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Aprovar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
