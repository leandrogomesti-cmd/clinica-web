"use client";

import React, { useMemo, useState, useEffect } from "react";

/**
 * AppDemoPreview (CLIENT)
 * Preview interativo (sem backend) com as rotas:
 * Dashboard, Pacientes, Agenda, Financeiro, Atendimento, Autocadastro, Relatórios + IA.
 *
 * IMPORTANTE (Regra ZERO):
 * - Mantém export default, props e layout geral.
 * - Sem dependências externas novas; só Tailwind.
 * - Tudo simulado no front (local state/LocalStorage) — NENHUM service role.
 */
export default function AppDemoPreview({
  initialRoute = "dashboard",
}: {
  initialRoute?:
    | "dashboard"
    | "pacientes"
    | "agenda"
    | "financeiro"
    | "atendimento"
    | "autocadastro"
    | "relatorios";
}) {
  const [route, setRoute] = useState<typeof initialRoute>(initialRoute);

  // Navegação disparada por outros componentes (ex.: Pacientes -> Atendimento)
  useEffect(() => {
    function onSetRoute(e: any) {
      if (e?.detail?.route) setRoute(e.detail.route);
    }
    window.addEventListener("klinikia:setRoute", onSetRoute as any);
    return () => window.removeEventListener("klinikia:setRoute", onSetRoute as any);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-4">
        <div className="grid grid-cols-12 gap-4">
          <aside className="col-span-12 md:col-span-3">
            <Sidebar route={route} onNav={(r) => setRoute(r)} />
          </aside>

          <main className="col-span-12 md:col-span-9">
            {route === "dashboard" && <Dashboard />}
            {route === "pacientes" && <Pacientes />}
            {route === "agenda" && <Agenda />}
            {route === "financeiro" && <Financeiro />}
            {route === "atendimento" && <Atendimento />}
            {route === "autocadastro" && <Autocadastro />}
            {route === "relatorios" && <Relatorios />}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ----------------- SIDEBAR ----------------- */
function Sidebar({
  route,
  onNav,
}: {
  route: string;
  onNav: (r: any) => void;
}) {
  const items = [
    { id: "dashboard", label: "Dashboard" },
    { id: "pacientes", label: "Pacientes" },
    { id: "agenda", label: "Agenda" },
    { id: "financeiro", label: "Financeiro" },
    { id: "atendimento", label: "Atendimento" },
    { id: "autocadastro", label: "Autocadastro" },
    { id: "relatorios", label: "Relatórios + IA" },
  ];
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm border">
      <div className="mb-3 text-sm font-semibold text-slate-600">KlinikIA (Demo)</div>
      <div className="space-y-2">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => onNav(it.id)}
            className={`w-full text-left px-3 py-2 rounded-xl transition-colors border ${
              route === it.id ? "bg-slate-900 text-white border-slate-900" : "bg-white hover:bg-slate-100"
            }`}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ----------------- DASHBOARD (placeholder compat) ----------------- */
function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Dashboard (Demo)</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Kpi title="Pacientes do dia" value={"3"} />
        <Kpi title="Não confirmados" value={"1"} subtitle={<span className="text-blue-700">Enviar confirmação</span>} />
        <Kpi title="No-show (semana)" value="12%" />
      </div>
      <Card title="Insights da IA">
        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
          <li>Taxa de não-comparecimento estimada para amanhã: <b>10%</b> (2 pacientes).</li>
          <li>Projeção de faturamento da semana: <b>R$ 12.400</b>.</li>
          <li>3 pacientes pediram retorno nos últimos 7 dias. Agendar agora.</li>
        </ul>
      </Card>
    </div>
  );
}

/* ----------------- AGENDA ----------------- */
function Agenda() {
  type Status = "pendente" | "confirmada" | "atendida" | "cancelada" | "no-show";
  type Tag = "retorno" | "primeira" | "procedimento";
  type Log = { ts: number; via: "template" | "texto"; message: string; status: "sent" | "delivered" | "read" | "failed" };
  type Appt = {
    id: string;
    paciente: string;
    medico: string;
    sala: string;
    data: string; // dd/mm/yyyy (demo)
    inicio: string; // HH:mm
    fim: string; // HH:mm
    status: Status;
    tags: Tag[];
    noshowCount?: number;
    logs?: Log[];
  };

  const hoje = "12/10/2025";
  const horas = [
    "08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"
  ];
  const medicos = ["Dra. Paula", "Dr. Lucas", "Dr. Renato"] as const;
  const salas = ["Sala 1", "Sala 2", "Sala 3"] as const;
  const etiquetaOptions: Tag[] = ["retorno", "primeira", "procedimento"];

  // Seed inicial (mantém compat)
  const seed: Appt[] = [
    { id: "1", paciente: "Maria da Silva", medico: "Dra. Paula", sala: "Sala 1", data: hoje, inicio: "14:00", fim: "14:30", status: "confirmada", tags: ["primeira"], logs: [] },
    { id: "2", paciente: "João Pereira",   medico: "Dra. Paula", medico2: undefined as any, sala: "Sala 1", data: hoje, inicio: "15:00", fim: "15:30", status: "pendente", tags: ["retorno"], logs: [] } as any,
    { id: "3", paciente: "Carlos Andrade",  medico: "Dra. Paula", sala: "Sala 1", data: hoje, inicio: "16:00", fim: "16:30", status: "pendente", tags: [], logs: [] },
  ];

  // Estado base
  const [items, setItems] = useState<Appt[]>(() => {
    const fromLS = localStorage.getItem("demo_agenda_items");
    return fromLS ? (JSON.parse(fromLS) as Appt[]) : seed;
  });
  const [espera, setEspera] = useState<{ id: string; paciente: string; preferencia: { medico?: string; intervalo?: string; sala?: string } }[]>(() => {
    const ls = localStorage.getItem("demo_agenda_espera");
    return ls ? JSON.parse(ls) : [
      { id: "w1", paciente: "Aline Costa", preferencia: { medico: "Dr. Lucas", intervalo: "14:00-16:00" } },
      { id: "w2", paciente: "Pedro Lima",  preferencia: { medico: "Dra. Paula", intervalo: "15:00-17:00" } },
    ];
  });
  const [filtros, setFiltros] = useState<{ data: string; medicos: string[]; sala?: string; status?: Status | "todos" }>({
    data: hoje,
    medicos: [],
    sala: undefined,
    status: "todos",
  });

  const [form, setForm] = useState<Appt>({
    id: "",
    paciente: "",
    medico: medicos[0],
    sala: salas[0],
    data: hoje,
    inicio: "14:00",
    fim: "14:30",
    status: "pendente",
    tags: [],
    logs: [],
  });

  // Persistência demo
  useEffect(() => localStorage.setItem("demo_agenda_items", JSON.stringify(items)), [items]);
  useEffect(() => localStorage.setItem("demo_agenda_espera", JSON.stringify(espera)), [espera]);

  // Helpers
  const overlaps = (a: Appt, b: Appt) => {
    if (a.data !== b.data) return false;
    const [ah, am] = a.inicio.split(":").map(Number);
    const [bh, bm] = b.inicio.split(":").map(Number);
    const [aeh, aem] = a.fim.split(":").map(Number);
    const [beh, bem] = b.fim.split(":").map(Number);
    const s1 = ah * 60 + am;
    const e1 = aeh * 60 + aem;
    const s2 = bh * 60 + bm;
    const e2 = beh * 60 + bem;
    return s1 < e2 && s2 < e1; // intersecção estrita
  };

  function salvar() {
    if (!form.paciente || !form.data || !form.inicio || !form.fim) {
      alert("Preencha paciente/data/horário");
      return;
    }
    // (1) BLOQUEIO DE SOBREPOSIÇÃO por médico OU sala
    const conflito = items.some((x) => {
      if (form.id && x.id === form.id) return false;
      const mesmoMedico = x.medico === form.medico;
      const mesmaSala = x.sala === form.sala;
      return (mesmoMedico || mesmaSala) && overlaps(x, form);
    });
    if (conflito) {
      alert("Conflito de horário: existe sobreposição para o mesmo médico/sala.");
      return;
    }

    // Salvar/atualizar
    setItems((prev) => {
      if (form.id) return prev.map((x) => (x.id === form.id ? { ...form } : x));
      return [...prev, { ...form, id: String(Date.now()) }];
    });
    setForm((f) => ({ ...f, id: "", paciente: "", tags: [] }));
  }

  function editar(id: string) {
    const ap = items.find((x) => x.id === id)!;
    setForm({ ...ap });
  }
  function excluir(id: string) {
    if (!confirm("Excluir consulta?")) return;
    const removido = items.find((x) => x.id === id);
    setItems((prev) => prev.filter((x) => x.id !== id));
    // Ao liberar um slot, sugerir ENCAIXE da lista de espera
    if (removido) sugerirEncaixe(removido);
  }

  function sugerirEncaixe(slot: Appt) {
    const candidatos = espera.filter((w) => {
      const [ini, fim] = (w.preferencia.intervalo || "").split("-");
      const okIntervalo = !ini || !fim || (slot.inicio >= ini && slot.fim <= fim);
      const okMedico = !w.preferencia.medico || w.preferencia.medico === slot.medico;
      const okSala = !w.preferencia.sala || w.preferencia.sala === slot.sala;
      return okIntervalo && okMedico && okSala;
    });
    if (candidatos.length > 0) {
      const w = candidatos[0];
      if (confirm(`Encaixar ${w.paciente} no horário liberado de ${slot.inicio}-${slot.fim} com ${slot.medico}?`)) {
        setItems((prev) => [
          ...prev,
          {
            id: `encaixe_${Date.now()}`,
            paciente: w.paciente,
            medico: slot.medico,
            sala: slot.sala,
            data: slot.data,
            inicio: slot.inicio,
            fim: slot.fim,
            status: "pendente",
            tags: ["retorno"],
            logs: [],
          },
        ]);
        setEspera((prev) => prev.filter((x) => x.id !== w.id));
      }
    }
  }

  function marcarStatus(id: string, novo: Status) {
    setItems((prev) =>
      prev.map((x) => {
        if (x.id !== id) return x;
        // Auto-flag de no-show
        if (novo === "no-show") {
          const count = (x.noshowCount || 0) + 1;
          // Reengajamento: empilha na fila com preferência semelhante
          setEspera((prev) => [
            ...prev,
            { id: `reeng_${Date.now()}`, paciente: x.paciente, preferencia: { medico: x.medico, intervalo: `${x.inicio}-${x.fim}` } },
          ]);
          return { ...x, status: novo, noshowCount: count };
        }
        return { ...x, status: novo };
      })
    );
  }

  // WhatsApp (simulado)
  type Template = { name: string; preview: string };
  const templates: Template[] = [
    { name: "appointment_confirm", preview: "Confirmação de consulta em {{data}} às {{hora}}." },
    { name: "appointment_reminder", preview: "Lembrete: amanhã {{hora}} com {{medico}}." },
    { name: "no_show_reengage", preview: "Notamos sua ausência. Reagendamos?" },
  ];
  function enviarWhatsApp(ap: Appt, via: "template" | "texto", tpl?: Template) {
    const message = via === "template" && tpl
      ? tpl.preview
          .replace("{{data}}", ap.data)
          .replace("{{hora}}", ap.inicio)
          .replace("{{medico}}", ap.medico)
      : `Olá ${ap.paciente}, segue confirmação da sua consulta em ${ap.data} às ${ap.inicio}.`;
    const log: Log = { ts: Date.now(), via, message, status: "sent" };
    setItems((prev) => prev.map((x) => (x.id === ap.id ? { ...x, logs: [...(x.logs || []), log] } : x)));
    alert(`(Demo) Enviado via WhatsApp: ${message}`);
  }

  // Filtros
  const itensFiltrados = useMemo(() => {
    return items.filter((x) => {
      if (filtros.data && x.data !== filtros.data) return false;
      if (filtros.medicos.length > 0 && !filtros.medicos.includes(x.medico)) return false;
      if (filtros.sala && x.sala !== filtros.sala) return false;
      if (filtros.status && filtros.status !== "todos" && x.status !== filtros.status) return false;
      return true;
    });
  }, [items, filtros]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Agenda</h1>

      {/* Filtros por profissional/sala/status (multi) */}
      <div className="rounded-2xl border bg-white p-4 grid md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="text-xs text-slate-500">Data</label>
          <input
            type="text"
            value={filtros.data}
            onChange={(e) => setFiltros((f) => ({ ...f, data: e.target.value }))}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="dd/mm/aaaa"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Médicos</label>
          <select
            multiple
            value={filtros.medicos}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, medicos: Array.from(e.target.selectedOptions).map((o) => o.value) }))
            }
            className="w-full border rounded-xl px-3 py-2 h-[42px]"
          >
            {medicos.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500">Sala</label>
          <select
            value={filtros.sala || ""}
            onChange={(e) => setFiltros((f) => ({ ...f, sala: e.target.value || undefined }))}
            className="w-full border rounded-xl px-3 py-2"
          >
            <option value="">Todas</option>
            {salas.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500">Status</label>
          <select
            value={filtros.status || "todos"}
            onChange={(e) => setFiltros((f) => ({ ...f, status: e.target.value as any }))}
            className="w-full border rounded-xl px-3 py-2"
          >
            <option value="todos">Todos</option>
            {(["pendente", "confirmada", "atendida", "cancelada", "no-show"] as Status[]).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-12">
        {/* Coluna esquerda: lista do dia + grade horária */}
        <div className="md:col-span-7 space-y-4">
          <Card title={`Pacientes do dia (${itensFiltrados.length})`}>
            {itensFiltrados.map((c) => (
              <div
                key={c.id}
                className={`flex items-center justify-between rounded-xl border p-3 ${
                  c.status === "atendida"
                    ? "bg-green-50"
                    : c.status === "confirmada"
                    ? "bg-blue-50"
                    : c.status === "no-show"
                    ? "bg-rose-50"
                    : "bg-white"
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-medium">{c.paciente}</div>
                  <div className="text-xs text-slate-500">
                    {c.data} • {c.inicio}-{c.fim} • {c.medico} • {c.sala}
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {c.tags.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={c.status}
                    onChange={(e) => marcarStatus(c.id, e.target.value as Status)}
                    className="border rounded-lg px-2 py-1 text-xs"
                  >
                    {(["pendente", "confirmada", "atendida", "cancelada", "no-show"] as Status[]).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button className="px-2 py-1 text-xs rounded-lg border" onClick={() => editar(c.id)}>
                    Editar
                  </button>
                  <button className="px-2 py-1 text-xs rounded-lg border" onClick={() => excluir(c.id)}>
                    Excluir
                  </button>
                  <button
                    className="px-2 py-1 text-xs rounded-lg border"
                    onClick={() => enviarWhatsApp(c, "template", templates[0])}
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            ))}
            {itensFiltrados.length === 0 && (
              <div className="text-sm text-slate-500">Nenhum item para os filtros atuais.</div>
            )}
          </Card>

          {/* Grade simplificada do dia */}
          <Card title="Grade do dia (por sala)">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2 w-24">Hora</th>
                    {salas.map((s) => (
                      <th key={s} className="text-left p-2">{s}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {horas.map((h) => (
                    <tr key={h} className="border-t">
                      <td className="p-2 font-medium">{h}</td>
                      {salas.map((s) => {
                        const ap = itensFiltrados.find((x) => x.sala === s && x.inicio === h);
                        return (
                          <td key={`${h}_${s}`} className="p-2">
                            {ap ? (
                              <div className="rounded-lg border px-2 py-1">
                                <div className="font-medium text-xs">{ap.paciente}</div>
                                <div className="text-[10px] text-slate-500">{ap.medico}</div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400">vago</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Logs de WhatsApp (simples) */}
          <Card title="Logs de WhatsApp (últimos envios)">
            <div className="space-y-2 text-xs">
              {items
                .flatMap((x) => (x.logs || []).map((l) => ({ ...l, paciente: x.paciente })))
                .sort((a, b) => b.ts - a.ts)
                .slice(0, 8)
                .map((l, i) => (
                  <div key={i} className="flex items-center justify-between border rounded-lg px-2 py-1">
                    <span>
                      <b>{l.paciente}</b> — {new Date(l.ts).toLocaleTimeString()} · {l.via}
                    </span>
                    <span className="text-slate-500 truncate max-w-[60%]">{l.message}</span>
                  </div>
                ))}
              {items.every((x) => !x.logs || x.logs.length === 0) && (
                <div className="text-slate-500">Sem envios no período.</div>
              )}
            </div>
          </Card>
        </div>

        {/* Coluna direita: formulário + lista de espera */}
        <div className="md:col-span-5 space-y-4">
          <Card title={form.id ? "Editar consulta" : "Nova consulta"}>
            <div className="grid gap-3">
              <div>
                <label className="text-xs text-slate-500">Paciente</label>
                <input
                  value={form.paciente}
                  onChange={(e) => setForm((f) => ({ ...f, paciente: e.target.value }))}
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="Nome completo"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Médico</label>
                  <select
                    value={form.medico}
                    onChange={(e) => setForm((f) => ({ ...f, medico: e.target.value }))}
                    className="w-full border rounded-xl px-3 py-2"
                  >
                    {medicos.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Sala</label>
                  <select
                    value={form.sala}
                    onChange={(e) => setForm((f) => ({ ...f, sala: e.target.value }))}
                    className="w-full border rounded-xl px-3 py-2"
                  >
                    {salas.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-500">Data</label>
                  <input
                    value={form.data}
                    onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="dd/mm/aaaa"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Início</label>
                  <input
                    value={form.inicio}
                    onChange={(e) => setForm((f) => ({ ...f, inicio: e.target.value }))}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="HH:mm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500">Fim</label>
                  <input
                    value={form.fim}
                    onChange={(e) => setForm((f) => ({ ...f, fim: e.target.value }))}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="HH:mm"
                  />
                </div>
              </div>

              {/* Etiquetas */}
              <div>
                <div className="text-xs text-slate-500 mb-1">Etiquetas</div>
                <div className="flex flex-wrap gap-2">
                  {etiquetaOptions.map((t) => (
                    <label key={t} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={form.tags.includes(t)}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            tags: e.target.checked ? [...f.tags, t] : f.tags.filter((x) => x !== t),
                          }))
                        }
                      />
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 border">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={salvar} className="px-3 py-2 rounded-xl border">
                  {form.id ? "Salvar" : "Adicionar"}
                </button>
                <button onClick={() => setForm((f) => ({ ...f, id: "", paciente: "", tags: [] }))} className="px-3 py-2 rounded-xl border">
                  Limpar
                </button>
                <button onClick={() => enviarWhatsApp(form, "template", templates[1])} className="px-3 py-2 rounded-xl border">
                  Enviar lembrete (WA)
                </button>
              </div>
            </div>
          </Card>

          {/* Lista de espera */}
          <Card title={`Lista de espera (${espera.length})`}>
            <div className="space-y-2">
              {espera.map((w) => (
                <div key={w.id} className="flex items-center justify-between border rounded-xl p-2 text-sm">
                  <div>
                    <b>{w.paciente}</b>
                    <div className="text-xs text-slate-500">
                      Pref.: {w.preferencia.medico || "(qualquer)"} • {w.preferencia.intervalo || "(qualquer)"}
                    </div>
                  </div>
                  <button
                    className="px-2 py-1 text-xs rounded-lg border"
                    onClick={() => {
                      // Cria consulta rápida hoje na primeira janela disponível (demo)
                      const primeiraSala = salas[0];
                      const primeiraHoraLivre = horas.find((h) =>
                        !items.some((x) => x.data === hoje && x.inicio === h && (x.medico === (w.preferencia.medico || medicos[0]) || x.sala === primeiraSala))
                      );
                      if (!primeiraHoraLivre) return alert("Sem horários disponíveis hoje.");
                      setItems((prev) => [
                        ...prev,
                        {
                          id: `encaixe_${Date.now()}`,
                          paciente: w.paciente,
                          medico: w.preferencia.medico || medicos[0],
                          sala: primeiraSala,
                          data: hoje,
                          inicio: primeiraHoraLivre,
                          fim: `${String(Number(primeiraHoraLivre.split(":")[0])).padStart(2, "0")}:${String((Number(primeiraHoraLivre.split(":")[1]) + 30) % 60).padStart(2, "0")}`,
                          status: "pendente",
                          tags: ["retorno"],
                          logs: [],
                        },
                      ]);
                      setEspera((prev) => prev.filter((x) => x.id !== w.id));
                    }}
                  >
                    Encaixar
                  </button>
                </div>
              ))}
              {espera.length === 0 && <div className="text-xs text-slate-500">Sem pacientes aguardando.</div>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ----------------- OUTRAS TELAS (placeholders compat) ----------------- */
function Pacientes() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Pacientes (Demo)</h1>
      <Card title="Lista">
        <div className="text-sm text-slate-500">Placeholder compatível — sem mudanças.</div>
      </Card>
    </div>
  );
}
function Financeiro() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Financeiro (Demo)</h1>
      <Card title="Resumo"><div className="text-sm text-slate-500">Placeholder.</div></Card>
    </div>
  );
}
function Atendimento() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Atendimento (Demo)</h1>
      <Card title="Ficha"><div className="text-sm text-slate-500">Placeholder.</div></Card>
    </div>
  );
}
function Autocadastro() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Autocadastro (Demo)</h1>
      <Card title="Formulário público"><div className="text-sm text-slate-500">Placeholder.</div></Card>
    </div>
  );
}
function Relatorios() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Relatórios + IA (Demo)</h1>
      <Card title="Relatórios"><div className="text-sm text-slate-500">Placeholder.</div></Card>
    </div>
  );
}

/* ----------------- UI PRIMITIVES ----------------- */
function Kpi({ title, value, subtitle }: { title: string; value: string; subtitle?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && <div className="mt-1 text-xs">{subtitle}</div>}
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-3 font-semibold">{title}</div>
      {children}
    </div>
  );
}