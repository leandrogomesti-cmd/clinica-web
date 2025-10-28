"use client";

import { SmartPredictTextarea } from '@/components/prescricao/SmartPredictTextarea';
import AssistantAdminPanel from "@/components/demo/AssistantAdminPanel";
import React, { useMemo, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  UserX,
  PieChart,
  Wallet,
  CircleDollarSign,
  CreditCard,
} from "lucide-react";

/**
 * AppDemoPreview (CLIENT)
 * Preview interativo (sem backend) com as rotas:
 * Dashboard, Pacientes, Agenda, Financeiro, Atendimento, Autocadastro, Relatórios + IA.
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
    | "relatorios"
    | "assistente";
}) {
  const [route, setRoute] = useState<typeof initialRoute>(initialRoute);

  // Navegação disparada por outros componentes (ex.: Pacientes -> Atendimento)
  React.useEffect(() => {
    function onSetRoute(e: any) {
      if (e?.detail?.route) setRoute(e.detail.route);
    }
    window.addEventListener("klinikia:setRoute", onSetRoute as any);
    return () => window.removeEventListener("klinikia:setRoute", onSetRoute as any);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-screen-2xl 2xl:max-w-[1600px] px-3 md:px-6 py-4">
        <div className="grid grid-cols-12 gap-4">
          <aside className="col-span-12 md:col-span-2 xl:col-span-2 md:sticky md:top-4 self-start">
            <Sidebar route={route} onNav={(r) => setRoute(r)} />
          </aside>

          <main className="col-span-12 md:col-span-10">
            {route === "dashboard" && <Dashboard />}
            {route === "pacientes" && <Pacientes />}
            {route === "agenda" && <Agenda />}
            {route === "financeiro" && <Financeiro />}
            {route === "atendimento" && <Atendimento />}
            {route === "autocadastro" && <Autocadastro />}
            {route === "relatorios" && <Relatorios />}
	    {route === "assistente" && <AssistantAdminPanel />}
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
    { id: "assistente", label: "Assistente" },
  ];
  return (
    <div className="rounded-2xl bg-white p-3 md:p-4 shadow-sm border">
    <div className="mb-2 text-xs md:text-sm font-semibold text-slate-600">KlinikIA (Demo)</div>
      <div className="space-y-2">
        {items.map((it) => (
          <button
            key={it.id}
            onClick={() => onNav(it.id)}
            className={`w-full text-left px-3 py-2 rounded-xl transition-colors border ${
              route === it.id
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white hover:bg-slate-100"
            }`}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ----------------- DASHBOARD ----------------- */
function Dashboard() {
  // ===== estado original (mantido) =====
  const [confirmDialog, setConfirmDialog] = useState<null | {
    nome: string;
    data: string;
    hora: string;
  }>(null);

  // ===== dados mock (mantidos) =====
  const agendadosHoje = [
    { nome: "Maria da Silva", hora: "14:00", confirmado: true,  data: "12/10/2025", tipo: "Particular", valor: 250, primeiraVez: true },
    { nome: "João Pereira",   hora: "15:00", confirmado: false, data: "12/10/2025", tipo: "Convênio",   valor: 0,   primeiraVez: false },
    { nome: "Carlos Andrade", hora: "16:00", confirmado: true,  data: "12/10/2025", tipo: "Particular", valor: 250, primeiraVez: false },
  ];
  const pagamentosHoje = [
    { desc: "Consulta clínica · Maria da Silva", valor: 250, tipo: "Particular" },
    { desc: "Retorno · João Pereira",            valor: 0,   tipo: "Convênio"   },
    { desc: "Aluguel da clínica",                valor: 3000, tipo: "Outros"    },
  ];

  // ===== métricas derivadas =====
  const totalAg        = agendadosHoje.length;
  const confirmados    = agendadosHoje.filter(a => a.confirmado).length;
  const pendentes      = totalAg - confirmados;
  const primeiraVezQtd = agendadosHoje.filter(a => a.primeiraVez).length;
  const naoCompareceuSemana = 3; // mock semanal
  const faturamentoHoje = pagamentosHoje.reduce((s, p) => s + p.valor, 0);

  const consultasPagas = pagamentosHoje.filter(p => p.valor > 0 && p.tipo !== "Outros");
  const ticketMedio = consultasPagas.length > 0
    ? Math.round(consultasPagas.reduce((s, p) => s + p.valor, 0) / consultasPagas.length)
    : 0;

  // ocupação/mix apenas para os donuts (não exibidos como KPI)
  const ocupacaoDia = Math.round((confirmados / Math.max(totalAg, 1)) * 100);
  const mixParticular = Math.round((agendadosHoje.filter(a => a.tipo === "Particular").length / Math.max(totalAg, 1)) * 100);
  const mixConvenio   = 100 - mixParticular;

  // ===== handlers originais (mantidos) =====
  function openConfirm(a: (typeof agendadosHoje)[number]) {
    setConfirmDialog({ nome: a.nome, data: a.data, hora: a.hora });
  }

  // ===== helper donuts (CSS puro, sem libs) =====
  const Donut = ({ percent, label }: { percent: number; label: string }) => {
    const p = Math.max(0, Math.min(100, percent));
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <div
          className="h-20 w-20 shrink-0 rounded-full grid place-items-center"
          style={{ background: `conic-gradient(rgb(30 64 175) ${p}%, #e5e7eb 0)` }}
        >
          <div className="h-12 w-12 rounded-full bg-white grid place-items-center text-sm font-semibold">
            {p}%
          </div>
        </div>
        <div className="text-xs text-slate-600 text-center leading-tight max-w-[9rem]">{label}</div>
      </div>
    );
  };

  // ===== UI =====
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Dashboard (Demo)</h1>

      {/* KPIs principais — cores/etiquetas ajustadas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi
          title="Agendados hoje"
          value={String(totalAg)}
          subtitle={
            <span className="inline-flex items-center gap-1 text-xs">
              <CalendarClock className="h-4 w-4 text-slate-600" />
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">Hoje</span>
            </span>
          }
        />
        <Kpi
          title="Confirmados"
          value={String(confirmados)}
          subtitle={
            <span className="inline-flex items-center gap-1 text-xs">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">OK</span>
            </span>
          }
        />
        <Kpi
          title="Pendentes"
          value={String(pendentes)}
          subtitle={
            <span className="inline-flex items-center gap-1 text-xs">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">Atenção</span>
            </span>
          }
        />
        <Kpi
          title="Não compareceu"
          value={String(naoCompareceuSemana)}
          subtitle={
            <span className="inline-flex items-center gap-1 text-xs">
              <UserX className="h-4 w-4 text-rose-600" />
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-700">Semana</span>
            </span>
          }
        />
        <Kpi
          title="Primeira vez"
          value={String(primeiraVezQtd)}
          subtitle={
            <span className="inline-flex items-center gap-1 text-xs">
              <PieChart className="h-4 w-4 text-indigo-600" />
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700">Hoje</span>
            </span>
          }
        />
      </div>

      {/* Cards principais */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Agendados hoje */}
        <Card title={`Agendados hoje (${totalAg})`}>
          <div className="space-y-2">
            {agendadosHoje.map((a, i) => (
              <div key={i} className="flex items-center justify-between rounded-xl border p-3">
                <div className="space-y-0.5">
                  <b>{a.nome}</b>
                  <div className="text-slate-500 text-xs">
                    {a.hora} · {a.tipo}{a.primeiraVez ? " · 1ª vez" : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold rounded-full px-2 py-1 ${
                      a.confirmado ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {a.confirmado ? "Confirmado" : "Pendente"}
                  </span>
                  {!a.confirmado && (
                    <button className="px-2 py-1 text-xs rounded-lg border" onClick={() => openConfirm(a)}>
                      Confirmar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="pt-3 text-sm text-blue-600 underline cursor-pointer">Ir para Agenda</div>
        </Card>

        {/* Indicadores de hoje (donuts + observação embaixo) */}
        <Card title="Indicadores de hoje">
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 justify-items-center">
            <Donut percent={ocupacaoDia} label="Ocupação de horários" />
            <Donut percent={mixParticular} label="Mix Particular" />
            <Donut percent={mixConvenio} label="Mix Convênio" />
            <div className="w-full md:col-span-3 rounded-xl border p-3 mt-2">
              <div className="text-xs text-slate-500">Observação</div>
              <div className="text-xs text-slate-600 mt-1">Indicadores baseados nos dados do dia.</div>
            </div>
          </div>
        </Card>

        {/* Indicadores Financeiros (faturamento, ticket, total de pagamentos) */}
        <Card title="Indicadores Financeiros">
          <div className="space-y-2">
            <Row
              left={
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <Wallet className="h-4 w-4" /> Faturamento (hoje)
                </span>
              }
              right={<b>R$ {faturamentoHoje.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</b>}
            />
            <Row
              left={
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <CircleDollarSign className="h-4 w-4" /> Ticket médio
                </span>
              }
              right={<b>R$ {ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</b>}
            />
            <Row
              left={
                <span className="inline-flex items-center gap-2 text-slate-600">
                  <CreditCard className="h-4 w-4" /> Total de pagamentos (hoje)
                </span>
              }
              right={<b>R$ {faturamentoHoje.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</b>}
            />
          </div>
          <div className="pt-3 text-sm text-blue-600 underline cursor-pointer">Ir para Financeiro</div>
        </Card>
      </div>

      {/* Insights da IA (com botões em destaque âmbar) */}
      <Card title="Insights da IA">
        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
          <li>
            <b>{pendentes} pendentes</b> de confirmação.{" "}
            <button className="text-amber-600 hover:text-amber-700 underline">
              Disparar mensagem agora
            </button>
          </li>
          <li>
            <b>{naoCompareceuSemana} não compareceram</b>.{" "}
            <button className="text-amber-600 hover:text-amber-700 underline">
              Disparar mensagem agora
            </button>
          </li>
          <li>
            Projeção da semana: <b>R$ 12.400</b> (agendamentos + histórico).
          </li>
          <li>
            3 pacientes com risco de abandono —{" "}
            <button className="underline">contatar</button>.
          </li>
        </ul>
      </Card>

      {/* Modal de confirmação — mantido */}
      {confirmDialog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-5 w-[520px] shadow-xl">
            <h3 className="font-semibold text-lg mb-2">Confirmar consulta</h3>
            <p className="text-sm text-slate-600 mb-4">
              {confirmDialog.nome} — {confirmDialog.data} às {confirmDialog.hora}
            </p>
            <div className="space-y-2">
              <button
                className="w-full px-3 py-2 rounded-xl border"
                onClick={() => {
                  alert(
                    "IA+WhatsApp (simulado): mensagem enviada automaticamente e a confirmação ocorrerá sem intervenção."
                  );
                  setConfirmDialog(null);
                }}
              >
                Confirmar automaticamente com IA
              </button>
              <button
                className="w-full px-3 py-2 rounded-xl border"
                onClick={() => {
                  const msg = encodeURIComponent(
                    `Olá ${confirmDialog.nome}! Confirmamos sua consulta em ${confirmDialog.data} às ${confirmDialog.hora}.`
                  );
                  window.open(`https://wa.me/5511999999999?text=${msg}`, "_blank");
                  setConfirmDialog(null);
                }}
              >
                Confirmar manualmente (abrir WhatsApp)
              </button>
              <button className="w-full px-3 py-2 rounded-xl border" onClick={() => setConfirmDialog(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------- PACIENTES (busca avançada + paginação + pendências) ----------------- */
type AutoForm = {
  nome: string;
  nascimento: string;
  telefone: string;
  email: string;
  rg: string;
  cpf: string;
  sexo: string;
  estado_civil: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  complemento: string;
  pais: string;
  profissao: string;
  observacoes: string;
};

type Pendencia = {
  id: string;
  nome: string;
  criadoEm: string;
  status: "PENDENTE" | "REVISADO";
  dados: AutoForm;
};

function readPendenciasLS(): Pendencia[] {
  try {
    const raw = localStorage.getItem("klinikia.autocadastro.pendencias");
    return raw ? (JSON.parse(raw) as Pendencia[]) : [];
  } catch {
    return [];
  }
}
function writePendenciasLS(p: Pendencia[]) {
  try {
    localStorage.setItem("klinikia.autocadastro.pendencias", JSON.stringify(p));
  } catch {}
}

function Pacientes() {
  type Consulta = {
    id: string;
    data: string;
    hora: string;
    medico: string;
    diagnostico?: string;
    status: "passada" | "futura" | "no_show";
  };
  type Interacao = {
    id: string;
    data: string;
    assunto: string;
    resolvido: boolean;
    reclamacao?: boolean;
  };
  type Endereco = {
    cep: string;
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    pais: string;
  };
  type P = {
    id: string;
    nome: string;
    telefone: string;
    nascimento: string;
    email: string;
    cpf?: string;
    rg?: string;
    sexo?: "FEMININO" | "MASCULINO" | "OUTRO" | "NAO_INFORMADO" | "";
    estado_civil?:
      | "SOLTEIRO"
      | "CASADO"
      | "DIVORCIADO"
      | "VIUVO"
      | "UNIAO_ESTAVEL"
      | "NAO_INFORMADO"
      | "";
    endereco?: Endereco;
    consultas_passadas?: Consulta[];
    consultas_futuras?: Consulta[];
    no_show_count?: number;
    diagnosticos_resumo?: string[];
    whatsapp_interacoes?: Interacao[];
  };

  const seed: P[] = [
    {
      id: "1",
      nome: "Maria da Silva",
      telefone: "11 91234-5678",
      nascimento: "12/10/1977",
      email: "maria@exemplo.com",
      cpf: "226.815.228-00",
      rg: "25.099.767-9",
      sexo: "FEMININO",
      estado_civil: "CASADO",
      endereco: {
        cep: "04000-000",
        rua: "Rua A",
        numero: "100",
        bairro: "Centro",
        cidade: "São Paulo",
        estado: "SP",
        pais: "Brasil",
      },
      consultas_passadas: [
        {
          id: "c1",
          data: "02/10/2025",
          hora: "14:00",
          medico: "Dra. Paula",
          diagnostico: "Blefarite",
          status: "passada",
        },
        { id: "c1_ns", data: "09/09/2025", hora: "14:00", medico: "Dra. Paula", status: "no_show" },
      ],
      consultas_futuras: [
        { id: "c2", data: "20/10/2025", hora: "10:30", medico: "Dra. Paula", status: "futura" },
      ],
      no_show_count: 1,
      diagnosticos_resumo: ["Blefarite leve em 02/10/2025"],
      whatsapp_interacoes: [
        { id: "w1", data: "01/10/2025", assunto: "Confirmação de consulta", resolvido: true },
        { id: "w2", data: "03/10/2025", assunto: "Dúvida sobre colírio", resolvido: true, reclamacao: false },
      ],
    },
    {
      id: "2",
      nome: "João Pereira",
      telefone: "11 99888-1122",
      nascimento: "08/02/1988",
      email: "joao@exemplo.com",
      cpf: "105.048.168-29",
      rg: "26.318.142-0",
      sexo: "MASCULINO",
      estado_civil: "SOLTEIRO",
      endereco: {
        cep: "04000-001",
        rua: "Rua B",
        numero: "55",
        bairro: "Jardins",
        cidade: "São Paulo",
        estado: "SP",
        pais: "Brasil",
      },
      consultas_passadas: [],
      consultas_futuras: [
        { id: "c3", data: "21/10/2025", hora: "15:00", medico: "Dr. Lucas", status: "futura" },
      ],
      no_show_count: 0,
      diagnosticos_resumo: [],
      whatsapp_interacoes: [{ id: "w3", data: "10/10/2025", assunto: "Reagendamento", resolvido: false }],
    },
    {
      id: "3",
      nome: "Carla Mendes",
      telefone: "11 98765-1001",
      nascimento: "21/03/1990",
      email: "carla.mendes@exemplo.com",
      cpf: "321.444.888-10",
      rg: "33.221.119-0",
      sexo: "FEMININO",
      estado_civil: "SOLTEIRO",
      endereco: { cep: "04012-000", rua: "Rua das Flores", numero: "12", bairro: "Paraíso", cidade: "São Paulo", estado: "SP", pais: "Brasil" },
      consultas_passadas: [
        { id: "c5", data: "15/09/2025", hora: "09:00", medico: "Dra. Paula", diagnostico: "Conjuntivite alérgica", status: "passada" },
      ],
      consultas_futuras: [{ id: "c6", data: "22/10/2025", hora: "09:30", medico: "Dra. Paula", status: "futura" }],
      no_show_count: 0,
      diagnosticos_resumo: ["Conjuntivite alérgica em 15/09/2025"],
      whatsapp_interacoes: [{ id: "w4", data: "14/09/2025", assunto: "Confirmação de consulta", resolvido: true }],
    },
    {
      id: "4",
      nome: "Bruno Carvalho",
      telefone: "11 99123-2202",
      nascimento: "05/11/1985",
      email: "bruno.carvalho@exemplo.com",
      cpf: "290.555.777-20",
      rg: "40.998.111-2",
      sexo: "MASCULINO",
      estado_civil: "CASADO",
      endereco: { cep: "04500-200", rua: "Av. Paulista", numero: "1000", bairro: "Bela Vista", cidade: "São Paulo", estado: "SP", pais: "Brasil" },
      consultas_passadas: [
        { id: "c7", data: "10/09/2025", hora: "16:00", medico: "Dr. Lucas", diagnostico: "Miopia estável", status: "passada" },
        { id: "c8", data: "02/08/2025", hora: "10:00", medico: "Dr. Lucas", status: "no_show" },
      ],
      consultas_futuras: [{ id: "c9", data: "24/10/2025", hora: "16:30", medico: "Dr. Lucas", status: "futura" }],
      no_show_count: 1,
      diagnosticos_resumo: ["Miopia estável em 10/09/2025"],
      whatsapp_interacoes: [{ id: "w5", data: "23/10/2025", assunto: "Lembrete de consulta", resolvido: false }],
    },
    {
      id: "5",
      nome: "Patrícia Gomes",
      telefone: "11 99666-3303",
      nascimento: "19/07/1992",
      email: "patricia.gomes@exemplo.com",
      cpf: "188.777.222-33",
      rg: "29.111.777-0",
      sexo: "FEMININO",
      estado_civil: "SOLTEIRO",
      endereco: { cep: "03010-040", rua: "Rua Verde", numero: "200", bairro: "Mooca", cidade: "São Paulo", estado: "SP", pais: "Brasil" },
      consultas_passadas: [
        { id: "c10", data: "18/09/2025", hora: "13:30", medico: "Dra. Paula", diagnostico: "Astigmatismo", status: "passada" },
      ],
      consultas_futuras: [{ id: "c11", data: "25/10/2025", hora: "13:00", medico: "Dra. Paula", status: "futura" }],
      no_show_count: 0,
      diagnosticos_resumo: ["Astigmatismo em 18/09/2025"],
      whatsapp_interacoes: [{ id: "w6", data: "17/09/2025", assunto: "Confirmação de consulta", resolvido: true }],
    },
    {
      id: "6",
      nome: "Ricardo Azevedo",
      telefone: "11 99555-4404",
      nascimento: "12/01/1979",
      email: "ricardo.azevedo@exemplo.com",
      cpf: "077.111.999-44",
      rg: "17.555.888-3",
      sexo: "MASCULINO",
      estado_civil: "DIVORCIADO",
      endereco: { cep: "05011-000", rua: "Rua Azul", numero: "45", bairro: "Perdizes", cidade: "São Paulo", estado: "SP", pais: "Brasil" },
      consultas_passadas: [
        { id: "c12", data: "30/08/2025", hora: "11:00", medico: "Dr. Lucas", diagnostico: "Catarata incipiente", status: "passada" },
      ],
      consultas_futuras: [{ id: "c13", data: "28/10/2025", hora: "11:30", medico: "Dr. Lucas", status: "futura" }],
      no_show_count: 0,
      diagnosticos_resumo: ["Catarata incipiente em 30/08/2025"],
      whatsapp_interacoes: [{ id: "w7", data: "27/10/2025", assunto: "Lembrete de consulta", resolvido: false }],
    },
    {
      id: "7",
      nome: "Fernanda Rocha",
      telefone: "11 99444-5505",
      nascimento: "03/06/1995",
      email: "fernanda.rocha@exemplo.com",
      cpf: "366.222.333-55",
      rg: "28.666.999-1",
      sexo: "FEMININO",
      estado_civil: "UNIAO_ESTAVEL",
      endereco: { cep: "06020-100", rua: "Rua das Palmeiras", numero: "77", bairro: "Pinheiros", cidade: "São Paulo", estado: "SP", pais: "Brasil" },
      consultas_passadas: [
        { id: "c14", data: "05/09/2025", hora: "08:30", medico: "Dra. Paula", diagnostico: "Olho seco", status: "passada" },
      ],
      consultas_futuras: [{ id: "c15", data: "26/10/2025", hora: "08:00", medico: "Dra. Paula", status: "futura" }],
      no_show_count: 0,
      diagnosticos_resumo: ["Olho seco em 05/09/2025"],
      whatsapp_interacoes: [{ id: "w8", data: "25/10/2025", assunto: "Confirmação de consulta", resolvido: true }],
    },
    {
      id: "8",
      nome: "Gustavo Nunes",
      telefone: "11 99333-6606",
      nascimento: "29/09/1982",
      email: "gustavo.nunes@exemplo.com",
      cpf: "255.444.666-77",
      rg: "21.333.444-5",
      sexo: "MASCULINO",
      estado_civil: "CASADO",
      endereco: { cep: "07030-300", rua: "Rua das Mangueiras", numero: "301", bairro: "Vila Mariana", cidade: "São Paulo", estado: "SP", pais: "Brasil" },
      consultas_passadas: [{ id: "c16", data: "07/09/2025", hora: "17:00", medico: "Dr. Lucas", status: "no_show" }],
      consultas_futuras: [{ id: "c17", data: "27/10/2025", hora: "17:30", medico: "Dr. Lucas", status: "futura" }],
      no_show_count: 1,
      diagnosticos_resumo: [],
      whatsapp_interacoes: [{ id: "w9", data: "26/10/2025", assunto: "Lembrete de consulta", resolvido: false }],
    },
    {
      id: "9",
      nome: "Luana Barros",
      telefone: "11 99222-7707",
      nascimento: "10/12/1998",
      email: "luana.barros@exemplo.com",
      cpf: "144.999.555-88",
      rg: "19.222.333-0",
      sexo: "FEMININO",
      estado_civil: "SOLTEIRO",
      endereco: { cep: "08040-400", rua: "Rua Ipê Amarelo", numero: "12A", bairro: "Tatuapé", cidade: "São Paulo", estado: "SP", pais: "Brasil" },
      consultas_passadas: [
        { id: "c18", data: "25/09/2025", hora: "12:30", medico: "Dra. Paula", diagnostico: "Hipermetropia", status: "passada" },
      ],
      consultas_futuras: [{ id: "c19", data: "29/10/2025", hora: "12:00", medico: "Dra. Paula", status: "futura" }],
      no_show_count: 0,
      diagnosticos_resumo: ["Hipermetropia em 25/09/2025"],
      whatsapp_interacoes: [{ id: "w10", data: "24/09/2025", assunto: "Dúvida sobre preparo", resolvido: true }],
    },
    {
      id: "10",
      nome: "Diego Martins",
      telefone: "11 99111-8808",
      nascimento: "14/04/1987",
      email: "diego.martins@exemplo.com",
      cpf: "233.111.000-66",
      rg: "30.111.222-6",
      sexo: "MASCULINO",
      estado_civil: "CASADO",
      endereco: { cep: "09050-500", rua: "Rua Cedro", numero: "450", bairro: "Santo Amaro", cidade: "São Paulo", estado: "SP", pais: "Brasil" },
      consultas_passadas: [
        { id: "c20", data: "12/09/2025", hora: "15:00", medico: "Dr. Lucas", diagnostico: "Pterígio leve", status: "passada" },
      ],
      consultas_futuras: [{ id: "c21", data: "30/10/2025", hora: "15:30", medico: "Dr. Lucas", status: "futura" }],
      no_show_count: 0,
      diagnosticos_resumo: ["Pterígio leve em 12/09/2025"],
      whatsapp_interacoes: [{ id: "w11", data: "29/10/2025", assunto: "Lembrete de consulta", resolvido: false }],
    },
  ];

  // estados existentes
  const [q, setQ] = useState("");
  const [items, setItems] = useState<typeof seed>(seed);
  const [editing, setEditing] = useState<typeof seed[number] | null>(null);
  const [prescricao, setPrescricao] = useState("");


  // NOVO: pendências de autocadastro
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);
  const [viewP, setViewP] = useState<Pendencia | null>(null);

  React.useEffect(() => {
    setPendencias(readPendenciasLS());
  }, []);

  function aprovarPendencia(p: Pendencia) {
    // cria paciente a partir dos dados da pendência
    const d = p.dados;
    const novo = {
      id: String(Date.now()),
      nome: d.nome,
      telefone: d.telefone || "",
      nascimento: d.nascimento || "",
      email: d.email || "",
      cpf: d.cpf || "",
      rg: d.rg || "",
      sexo:
        (d.sexo as any) || ("" as "FEMININO" | "MASCULINO" | "OUTRO" | "NAO_INFORMADO" | ""),
      estado_civil:
        (d.estado_civil as any) ||
        ("" as "SOLTEIRO" | "CASADO" | "DIVORCIADO" | "VIUVO" | "UNIAO_ESTAVEL" | "NAO_INFORMADO" | ""),
      endereco: {
        cep: d.cep,
        rua: d.logradouro,
        numero: d.numero,
        bairro: d.bairro,
        cidade: d.cidade,
        estado: d.estado,
        pais: d.pais || "Brasil",
      },
      consultas_passadas: [],
      consultas_futuras: [],
      no_show_count: 0,
      diagnosticos_resumo: [],
      whatsapp_interacoes: [],
    } as any;

    setItems((prev) => [novo, ...prev]);
    const rest = pendencias.filter((x) => x.id !== p.id);
    setPendencias(rest);
    writePendenciasLS(rest);
    alert("Autocadastro aprovado e movido para Pacientes.");
  }

  // NOVO: busca avançada
  const [showAdv, setShowAdv] = useState(false);
  const [cpf, setCpf] = useState("");
  const [rg, setRg] = useState("");
  const [tel, setTel] = useState("");

  // NOVO: paginação
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  // Helpers de ordenação por "Próxima consulta" DESC
  function parseBRDate(d: string | undefined): number | null {
    if (!d) return null;
    const [dd, mm, yyyy] = d.split("/");
    const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(dt.getTime()) ? null : dt.getTime();
  }
  function nextFutureDateMillis(p: typeof seed[number]): number | null {
    const fut = p.consultas_futuras || [];
    if (!fut.length) return null;
    const ms = fut
      .map((c) => parseBRDate(c.data))
      .filter((x): x is number => x !== null)
      .sort((a, b) => a - b)[0];
    return ms ?? null;
  }

  const filteredSorted = useMemo(() => {
    // texto livre por nome (já existente)
    let base = q.trim()
      ? items.filter((p) => p.nome.toLowerCase().includes(q.toLowerCase()))
      : items;

    // filtros avançados (contém)
    if (cpf.trim()) base = base.filter((p) => (p.cpf || "").includes(cpf));
    if (rg.trim()) base = base.filter((p) => (p.rg || "").includes(rg));
    if (tel.trim()) base = base.filter((p) => (p.telefone || "").includes(tel));

    // ordenação por próxima consulta DESC
    const sorted = [...base].sort((a, b) => {
      const da = nextFutureDateMillis(a);
      const db = nextFutureDateMillis(b);
      if (da === null && db === null) return 0;
      if (da === null) return 1;
      if (db === null) return -1;
      return db - da;
    });

    return sorted;
  }, [q, cpf, rg, tel, items]);

  // fatia paginada
  const total = filteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const list = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredSorted.slice(start, start + PAGE_SIZE);
  }, [filteredSorted, page]);

  React.useEffect(() => {
    // reset página quando filtros mudam
    setPage(1);
  }, [q, cpf, rg, tel]);

  function excluir(id: string) {
    if (!window.confirm("Excluir paciente?")) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Pacientes</h1>

      <div className="flex gap-2 items-center">
        <input
          className="border rounded-xl px-3 py-2 w-full"
          placeholder="Buscar por nome"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="px-3 py-2 rounded-xl border">Buscar</button>
        <button
          className={`px-3 py-2 rounded-xl border ${showAdv ? "bg-slate-900 text-white" : ""}`}
          onClick={() => setShowAdv((v) => !v)}
        >
          Busca avançada
        </button>
      </div>

      {showAdv && (
        <div className="rounded-2xl border bg-white p-4 grid md:grid-cols-3 gap-3">
          <div>
            <Label>CPF</Label>
            <input
              className="border rounded-xl px-3 py-2 w-full"
              placeholder="___.___.___-__"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            />
          </div>
          <div>
            <Label>RG</Label>
            <input
              className="border rounded-xl px-3 py-2 w-full"
              placeholder="__.___.___-_"
              value={rg}
              onChange={(e) => setRg(e.target.value)}
            />
          </div>
          <div>
            <Label>Telefone</Label>
            <input
              className="border rounded-xl px-3 py-2 w-full"
              placeholder="(11) 9____-____"
              value={tel}
              onChange={(e) => setTel(e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto border rounded-2xl bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left px-3 py-2 w-64">Ações</th>
              <th className="text-left px-3 py-2">Nome</th>
              <th className="text-left px-3 py-2">Telefone</th>
              <th className="text-left px-3 py-2">Nascimento</th>
              <th className="text-left px-3 py-2">E-mail</th>
              <th className="text-left px-3 py-2">No-show</th>
              <th className="text-left px-3 py-2">Próxima consulta</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => {
              const prox = (p.consultas_futuras || [])[0]?.data || "—";
              return (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2 flex gap-2">
                    <button
                      className="px-2 py-1 text-xs rounded-lg border"
                      onClick={() => setEditing({ ...p })}
                    >
                      Editar
                    </button>
                    <button
                      className="px-2 py-1 text-xs rounded-lg border"
                      onClick={() => excluir(p.id)}
                    >
                      Excluir
                    </button>
                    <button
                      className="px-2 py-1 text-xs rounded-lg border"
                      onClick={() => {
                        try {
                          localStorage.setItem("klinikia.atendimento.paciente", p.nome);
                          window.dispatchEvent(
                            new CustomEvent("klinikia:setRoute", {
                              detail: { route: "atendimento" },
                            })
                          );
                        } catch {}
                      }}
                    >
                      Atender
                    </button>
                  </td>
                  <td className="px-3 py-2">{p.nome}</td>
                  <td className="px-3 py-2">{p.telefone}</td>
                  <td className="px-3 py-2">{p.nascimento}</td>
                  <td className="px-3 py-2">{p.email}</td>
                  <td className="px-3 py-2">{p.no_show_count ?? 0}</td>
                  <td className="px-3 py-2">{prox}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* paginação */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-slate-600">
          Mostrando <b>{list.length}</b> de <b>{total}</b> pacientes
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 rounded-lg border"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Anterior
          </button>
          <span>
            Página <b>{page}</b> / {totalPages}
          </span>
          <button
            className="px-2 py-1 rounded-lg border"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Próxima →
          </button>
        </div>
      </div>

      {/* NOVO: Autocadastros pendentes */}
      <Card title="Autocadastros pendentes (simulado — secretaria)">
        {pendencias.length === 0 ? (
          <div className="text-sm text-slate-500">Sem pendências no momento.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left px-3 py-2">Paciente</th>
                  <th className="text-left px-3 py-2">Criado em</th>
                  <th className="text-left px-3 py-2">Status</th>
                  <th className="text-left px-3 py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {pendencias.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-3 py-2">{p.nome}</td>
                    <td className="px-3 py-2">{p.criadoEm}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs font-semibold rounded-full px-2 py-1 ${p.status === "PENDENTE" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 flex gap-2">
                      <button className="px-2 py-1 text-xs rounded-lg border" onClick={() => setViewP(p)}>Verificar Dados</button>
                      <button className="px-2 py-1 text-xs rounded-lg border" onClick={() => aprovarPendencia(p)}>Aprovar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Sheet de edição com abas */}
      {editing && (
        <EditSheet
          editing={editing}
          onCancel={() => setEditing(null)}
          onSave={(p) => {
            setItems((prev) => prev.map((x) => (x.id === p.id ? p : x)));
            setEditing(null);
          }}
        />
      )}

      {/* Modal Verificação de pendência (AGORA EDITÁVEL) */}
      {viewP && (
        <VerifyPendenciaModal
          pendencia={viewP}
          onClose={() => setViewP(null)}
          onSave={(updated) => {
            const next = pendencias.map((x) =>
              x.id === updated.id ? updated : x
            );
            setPendencias(next);
            writePendenciasLS(next);
            setViewP(updated); // mantém aberto com dados atualizados
          }}
        />
      )}
    </div>
  );
}

/* ----------------- AGENDA ----------------- */
/* ========= AGENDA — NOVA (UXPreview aprovado) ========= */
function Agenda() {
  // ---------- Tipos ----------
  type Status = "pendente" | "confirmada" | "aguardando" | "atendida" | "cancelada" | "no-show";
  type Tag = "retorno" | "primeira" | "procedimento";
  type BasicAppt = { data: string; inicio: string; fim: string };
  type Appt = BasicAppt & {
    id: string;
    paciente: string;
    phone?: string;
    medico: string;
    sala: string;
    status: Status;
    tags: Tag[];
    obs?: string;
  };

  // ---------- Helpers (prefixo ag_) ----------
  function ag_toMinutes(hhmm: string) { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; }
  function ag_fromMinutes(mins: number) { const h = Math.floor(mins / 60); const m = mins % 60; return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`; }
  function ag_addMinutes(hhmm: string, delta: number) { return ag_fromMinutes(ag_toMinutes(hhmm) + delta); }
  function ag_overlaps(a: BasicAppt, b: BasicAppt) {
    const s1 = ag_toMinutes(a.inicio), e1 = ag_toMinutes(a.fim);
    const s2 = ag_toMinutes(b.inicio), e2 = ag_toMinutes(b.fim);
    return s1 < e2 && s2 < e1; // adjacentes podem
  }
  function ag_range(start: string, end: string, stepMin: number) {
    const res: string[] = []; let t = ag_toMinutes(start), e = ag_toMinutes(end);
    while (t <= e) { res.push(ag_fromMinutes(t)); t += stepMin; } return res;
  }
  function ag_parseISODate(iso: string) { const [y,m,d] = iso.split("-").map(Number); return new Date(y!, m!-1, d!); }
  function ag_toISODateLocal(d: Date) { const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,"0"), day=String(d.getDate()).padStart(2,"0"); return `${y}-${m}-${day}`; }
  function ag_startOfWeek(iso: string) { const d=ag_parseISODate(iso); const diff=d.getDay()===0?-6:1-d.getDay(); const monday=new Date(d); monday.setDate(d.getDate()+diff); return monday; }
  function ag_getWeekDates(iso: string) { const mon=ag_startOfWeek(iso); return Array.from({length:7},(_,i)=>{ const d=new Date(mon); d.setDate(mon.getDate()+i); return ag_toISODateLocal(d);}); }
  function ag_fmtShort(iso: string) { const d=ag_parseISODate(iso); const dd=String(d.getDate()).padStart(2,"0"); const mm=String(d.getMonth()+1).padStart(2,"0"); const wk=["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"][d.getDay()]; return `${dd}/${mm} (${wk})`; }

  // ---------- Constantes/estado ----------
  const medicos = ["Dra. Paula", "Dr. Lucas", "Dr. Renato"] as const;
  const salas = ["Sala 1", "Sala 2", "Sala 3"] as const;
  const etiquetaOptions: Tag[] = ["retorno", "primeira", "procedimento"];
  const pacientesDemo = ["Maria da Silva","João Pereira","Carlos Andrade","Pedro Lima","Luiza Siqueira","Aline Costa","Camila Rocha","Bruno Nogueira"];

  const hojeISO = ag_toISODateLocal(new Date());
  const [view, setView] = React.useState<"dia" | "semana">("dia");
  const [groupBy, setGroupBy] = React.useState<"medico" | "sala">("medico");
  const [dataRef, setDataRef] = React.useState<string>(hojeISO);
  const [doctorSel, setDoctorSel] = React.useState<string>("todos");
  const [filterStatus, setFilterStatus] = React.useState<Status | "todos">("todos");
  const [search, setSearch] = React.useState("");
  const [confirmDlg, setConfirmDlg] = React.useState<null | { paciente: string; step: "ask" | "channel" }>(null);

  function appt(paciente: string, medico: string, sala: string, data: string, inicio: string, durMin: number, status: Status, tags: Tag[] = [], obs = ""): Appt {
    return { id: `${Date.now()}_${Math.random().toString(36).slice(2,6)}`, paciente, medico, sala, data, inicio, fim: ag_addMinutes(inicio, durMin), status, tags, obs, phone: "+55 11 99999-0000" };
  }
  const seed: Appt[] = React.useMemo(() => [
    appt("Maria da Silva","Dra. Paula","Sala 1",hojeISO,"14:00",30,"confirmada",["primeira"]),
    appt("João Pereira","Dra. Paula","Sala 1",hojeISO,"15:00",30,"pendente",["retorno"]),
    appt("Carlos Andrade","Dra. Paula","Sala 1",hojeISO,"16:00",30,"aguardando",[]),
    appt("Pedro Lima","Dr. Lucas","Sala 2",hojeISO,"09:00",30,"pendente",["retorno"]),
    appt("Luiza Siqueira","Dr. Lucas","Sala 2",hojeISO,"10:30",30,"confirmada",[]),
  ], []);

  const [items, setItems] = React.useState<Appt[]>(() => {
    const ls = typeof window !== "undefined" ? localStorage.getItem("ux_agenda_items") : null;
    return ls ? (JSON.parse(ls) as Appt[]) : seed;
  });
  React.useEffect(() => localStorage.setItem("ux_agenda_items", JSON.stringify(items)), [items]);

  const [espera, setEspera] = React.useState<{ id: string; paciente: string; preferencia?: { medico?: string; sala?: string; intervalo?: string } }[]>([
    { id: "w1", paciente: "Aline Costa", preferencia: { medico: "Dr. Lucas", intervalo: "14:00-16:30" } },
  ]);

  // Handoff: Pacientes -> Agenda
  React.useEffect(() => {
    function onNewWithPatient(e: CustomEvent<{ paciente: string }>) {
      setSelected({ id: "", paciente: e.detail.paciente, medico: doctorSel !== "todos" ? doctorSel : "Dra. Paula", sala: "Sala 1", data: dataRef, inicio: "14:00", fim: "14:30", status: "pendente", tags: [] } as any);
      document.getElementById("details-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.addEventListener("klinikia:agenda:new-with-patient", onNewWithPatient as any);
    return () => window.removeEventListener("klinikia:agenda:new-with-patient", onNewWithPatient as any);
  }, [doctorSel, dataRef]);

  // ---------- Derivados ----------
  const timeline = React.useMemo(() => ag_range("08:00","18:00",30), []);
  const colunasDia = React.useMemo(() => (groupBy === "medico" ? [...medicos] : [...salas]), [groupBy]);
  const weekDates = React.useMemo(() => ag_getWeekDates(dataRef), [dataRef]);
  const colunas = React.useMemo(() => {
    if (view === "dia") { if (groupBy === "medico" && doctorSel !== "todos") return [doctorSel]; return colunasDia; }
    return weekDates;
  }, [view, groupBy, doctorSel, colunasDia, weekDates]);

  const itensFiltrados = React.useMemo(() => {
    const base = items
      .filter((x) => (filterStatus === "todos" ? true : x.status === filterStatus))
      .filter((x) => (search ? x.paciente.toLowerCase().includes(search.toLowerCase()) : true));
    if (view === "dia") {
      return base.filter((x) => x.data === dataRef).sort((a,b) => ag_toMinutes(a.inicio) - ag_toMinutes(b.inicio));
    }
    return base.filter((x) => colunas.includes(x.data)).sort((a,b) => (a.data === b.data ? ag_toMinutes(a.inicio) - ag_toMinutes(b.inicio) : colunas.indexOf(a.data) - colunas.indexOf(b.data)));
  }, [items, dataRef, filterStatus, search, view, colunas]);

  const [selected, setSelected] = React.useState<Appt | null>(null);
  React.useEffect(() => { if (!selected) return; const still = items.find((i) => i.id === selected.id); setSelected(still || null); }, [items]);

  // ---------- Ações ----------
  function salvar(ap: Partial<Appt>) {
    if (!ap.paciente || !ap.medico || !ap.sala || !ap.data || !ap.inicio || !ap.fim) return;
    const novo: Appt = { ...(ap as Appt), id: ap.id || `${Date.now()}` };
    const conflito = items.some((x) => {
      if (x.id === novo.id) return false;
      const mesmoMedico = x.medico === novo.medico;
      const mesmaSala = x.sala === novo.sala;
      return (mesmoMedico || mesmaSala) && ag_overlaps(x, novo);
    });
    if (conflito) { alert("Conflito: sobreposição de horário para o mesmo médico/sala."); return; }
    setItems((prev) => (prev.some((x) => x.id === novo.id) ? prev.map((x) => (x.id === novo.id ? novo : x)) : [...prev, novo]));
    setSelected(novo);
  }
  function excluir(id: string) { if (!confirm("Excluir este agendamento?")) return; setItems((prev) => prev.filter((x) => x.id !== id)); }
  function mudarStatus(id: string, status: Status) {
    setItems((prev) => prev.map((x) => {
      if (x.id !== id) return x;
      if (status === "no-show") setEspera((w) => [...w, { id: `re_${Date.now()}`, paciente: x.paciente, preferencia: { medico: x.medico, intervalo: `${x.inicio}-${x.fim}` } }]);
      return { ...x, status };
    }));
  }
  function criarVago(col: string, when: string) {
    const data = /\d{4}-\d{2}-\d{2}/.test(col) ? col : dataRef;
    const medico = view === "dia" ? (groupBy === "medico" ? col : medicos[0]) : medicos[0];
    const sala = view === "dia" ? (groupBy === "sala" ? col : salas[0]) : salas[0];
    const novo = { id: `${Date.now()}`, paciente: "", medico, sala, data, inicio: when, fim: ag_addMinutes(when,30), status: "pendente" as Status, tags: [] as Tag[] };
    setSelected(novo as any);
  }

  const statusMap: Record<Status, { label: string; class: string }> = {
    pendente:   { label: "Agendado",        class: "bg-slate-100 text-slate-700 border" },
    confirmada: { label: "Confirmado",      class: "bg-blue-100 text-blue-800 border border-blue-300" },
    aguardando: { label: "Check-in",        class: "bg-amber-100 text-amber-800 border border-amber-300" },
    atendida:   { label: "Atendido",        class: "bg-green-100 text-green-800 border-green-300 border" },
    cancelada:  { label: "Cancelado",       class: "bg-zinc-100 text-zinc-600 border" },
    "no-show":  { label: "Não compareceu",  class: "bg-rose-100 text-rose-800 border border-rose-300" },
  };
  const tagClass = (t: Tag) => (t === "primeira" ? "bg-rose-100 border-rose-300 text-rose-700" : "bg-slate-100 border");

  const headerDoctor = doctorSel === "todos" ? "Todos os médicos" : doctorSel;
  const week = ag_getWeekDates(dataRef);
  const headerTitle = view === "dia" ? `Agenda — ${headerDoctor}` : `Agenda — Semana de ${ag_fmtShort(week[0])}`;
  const headerLabels = view === "dia" ? colunas : colunas.map(ag_fmtShort);

  // ---------- UI ----------
  return (
    <div className="mb-3">
      <AgendaHeaderBar
        titulo={headerTitle}
        dataRef={dataRef}
        setDataRef={setDataRef}
        view={view}
        setView={setView}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        doctorSel={doctorSel}
        setDoctorSel={setDoctorSel}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        search={search}
        setSearch={setSearch}
        onNovo={() =>
          setSelected({
            id: "",
            paciente: "",
            medico: doctorSel !== "todos" ? doctorSel : medicos[0],
            sala: salas[0],
            data: dataRef,
            inicio: "14:00",
            fim: "14:30",
            status: "pendente",
            tags: [],
          } as any)
        }
        medicos={["todos", ...medicos] as unknown as string[]}
      />

      {/* GRID PRINCIPAL: 12 colunas */}
      <div className="grid grid-cols-12 gap-4 overflow-visible">
        {/* ESQUERDA — Lista do dia */}
        <div className="col-span-12 lg:col-span-3 xl:col-span-3 2xl:col-span-3 min-w-0">
          <Card title={`Pacientes do dia (${itensFiltrados.filter((x) => x.data === dataRef).length})`}>
            <div className="space-y-2">
              {itensFiltrados
                .filter((x) => x.data === dataRef)
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className={`w-full text-left rounded-xl border p-3 hover:ring-2 ring-slate-200 transition ${selected?.id === c.id ? "bg-slate-50" : "bg-white"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{c.paciente || "(vago)"}</div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${statusMap[c.status].class}`}>
                        {statusMap[c.status].label}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {c.inicio}-{c.fim} • {c.medico} • {c.sala}
                    </div>
                    {c.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {c.tags.map((t) => (
                          <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full ${tagClass(t)}`}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              {itensFiltrados.filter((x) => x.data === dataRef).length === 0 && (
                <div className="text-sm text-slate-500">Nada para os filtros atuais.</div>
              )}
            </div>
          </Card>
        </div>

        {/* CENTRO — Grade (mais larga) */}
	<div className="col-span-12 lg:col-span-6 xl:col-span-6 2xl:col-span-6 min-w-0" id="grade-panel">
          <Card title={`Grade (${view === "dia" ? (groupBy === "medico" ? "por médico" : "por sala") : "por semana"})`}>
            <div className="h-full overflow-auto">
              <div className="overflow-x-auto">
                <AgendaScheduleGrid
                  headerLabels={headerLabels}
                  colunas={colunas}
                  timeline={timeline}
                  itens={itensFiltrados}
                  onCreateVago={criarVago}
                  onSelect={(c) => setSelected(c)}
                  filterBy={(item, col) =>
                    view === "dia" ? (groupBy === "medico" ? item.medico === col : item.sala === col) : item.data === col
                  }
                  toMinutes={ag_toMinutes}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* DIREITA — Detalhes + Lista de espera */}
	<div className="col-span-12 lg:col-span-3 xl:col-span-3 2xl:col-span-3 min-w-0 xl:min-w-[360px] self-start" id="details-panel">
          <div className="space-y-4">
            <div className="max-h-[60vh] xl:max-h-[70vh] overflow-auto">
              <AgendaDetailsPanel
                selected={selected}
                setSelected={setSelected}
                salvar={salvar}
                excluir={excluir}
                mudarStatus={mudarStatus}
                etiquetaOptions={etiquetaOptions}
                medicos={[...medicos] as unknown as string[]}
                salas={[...salas] as unknown as string[]}
                dataRef={dataRef}
                pacientes={pacientesDemo}
              />
            </div>
            <div className="max-h-[30vh] overflow-auto">
              <AgendaWaitlistPanel
                pacientes={pacientesDemo}
                espera={espera}
                setEspera={setEspera}
                onEncaixar={(w) => {
                  const candidatas = ["09:00","09:30","10:00","10:30","11:00","11:30","14:00","14:30","15:00","15:30","16:00"];
                  let added = false;
                  for (const h of candidatas) {
                    const candidate: Appt = {
                      id: `${Date.now()}`,
                      paciente: w.paciente,
                      medico: w.preferencia?.medico || medicos[0],
                      sala: salas[0],
                      data: dataRef,
                      inicio: h,
                      fim: ag_addMinutes(h, 30),
                      status: "pendente",
                      tags: ["retorno"],
                    };
                    const conflito = items.some((x) => (x.medico === candidate.medico || x.sala === candidate.sala) && ag_overlaps(x, candidate));
                    if (!conflito) {
                      setItems((prev) => [...prev, candidate]);
                      setEspera((prev) => prev.filter((x) => x.id !== w.id));
                      setConfirmDlg({ paciente: w.paciente, step: "ask" });
                      added = true;
                      break;
                    }
                  }
                  if (!added) alert("Sem horário livre no dia.");
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de confirmação pós-encaixe */}
      {confirmDlg && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            {confirmDlg.step === "ask" ? (
              <>
                <div className="text-lg font-semibold">Enviar confirmação ao paciente?</div>
                <div className="text-sm text-slate-600 mt-1">
                  {confirmDlg.paciente} foi encaixado. Deseja enviar aviso de confirmação?
                </div>
                <div className="mt-4 flex gap-2 justify-end">
                  <button className="px-3 py-2 rounded-xl border" onClick={() => setConfirmDlg(null)}>Não</button>
                  <button className="px-3 py-2 rounded-xl border bg-slate-900 text-white" onClick={() => setConfirmDlg({ ...confirmDlg, step: "channel" })}>Sim</button>
                </div>
              </>
            ) : (
              <>
                <div className="text-lg font-semibold">Como deseja enviar?</div>
                <div className="text-sm text-slate-600 mt-1">Escolha o canal de envio do aviso:</div>
                <div className="mt-4 grid gap-2">
                  <button className="px-3 py-3 rounded-xl border text-left hover:bg-slate-50" onClick={() => { alert("(DEMO) Envio automático via WhatsApp executado."); setConfirmDlg(null); }}>WhatsApp automático (template)</button>
                  <button className="px-3 py-3 rounded-xl border text-left hover:bg-slate-50" onClick={() => { const msg = encodeURIComponent("Olá! Sua consulta foi confirmada. Até breve."); window.open(`https://wa.me/?text=${msg}`, "_blank"); setConfirmDlg(null); }}>WhatsApp manual (abrir mensagem pronta)</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


/* ===== Subcomponentes da Agenda (isolados com prefixo) ===== */

function AgendaHeaderBar(props: {
  titulo: string;
  dataRef: string;
  setDataRef: (v: string) => void;
  view: "dia" | "semana";
  setView: (v: "dia" | "semana") => void;
  groupBy: "medico" | "sala";
  setGroupBy: (v: "medico" | "sala") => void;
  doctorSel: string;
  setDoctorSel: (v: string) => void;
  filterStatus: string;
  setFilterStatus: (v: any) => void;
  search: string;
  setSearch: (v: string) => void;
  onNovo: () => void;
  medicos: string[];
}) {
  const {
    titulo,
    dataRef,
    setDataRef,
    view,
    setView,
    groupBy,
    setGroupBy,
    doctorSel,
    setDoctorSel,
    filterStatus,
    setFilterStatus,
    search,
    setSearch,
    onNovo,
    medicos,
  } = props;
  return (
    <div className="sticky top-2 z-10 rounded-2xl border bg-white/90 backdrop-blur p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="text-lg font-semibold">{titulo}</div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={dataRef}
          onChange={(e) => setDataRef(e.target.value)}
          className="border rounded-xl px-3 py-2"
        />
        <div className="ml-1 flex rounded-xl border overflow-hidden">
          <button
            onClick={() => setView("dia")}
            className={`px-3 py-2 text-sm ${
              view === "dia" ? "bg-slate-900 text-white" : "bg-white"
            }`}
          >
            Dia
          </button>
          <button
            onClick={() => setView("semana")}
            className={`px-3 py-2 text-sm ${
              view === "semana" ? "bg-slate-900 text-white" : "bg-white"
            }`}
          >
            Semana
          </button>
        </div>
        <div className="ml-1 flex rounded-xl border overflow-hidden">
          <button
            onClick={() => setGroupBy("medico")}
            className={`px-3 py-2 text-sm ${
              groupBy === "medico" ? "bg-slate-100" : "bg-white"
            }`}
          >
            Por médico
          </button>
          <button
            onClick={() => setGroupBy("sala")}
            className={`px-3 py-2 text-sm ${
              groupBy === "sala" ? "bg-slate-100" : "bg-white"
            }`}
          >
            Por sala
          </button>
        </div>
        <select
          value={doctorSel}
          onChange={(e) => setDoctorSel(e.target.value)}
          className="ml-1 border rounded-xl px-3 py-2"
        >
          {medicos.map((m) => (
            <option key={m} value={m}>
              {m === "todos" ? "Todos os médicos" : m}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="ml-1 border rounded-xl px-3 py-2"
        >
          {[
            ["todos", "Todos"],
            ["pendente", "Agendado"],
            ["confirmada", "Confirmado"],
            ["aguardando", "Check-in"],
            ["atendida", "Atendido"],
            ["cancelada", "Cancelado"],
            ["no-show", "Não compareceu"],
          ].map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <div className="flex-1" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar paciente"
          className="border rounded-xl px-3 py-2 w-56"
        />
        <button className="ml-1 px-3 py-2 rounded-xl border bg-slate-900 text-white" onClick={onNovo}>
          + Novo
        </button>
      </div>
    </div>
  );
}

function AgendaScheduleGrid(props: {
  headerLabels: string[];
  colunas: string[];
  timeline: string[];
  itens: any[];
  onCreateVago: (col: string, when: string) => void;
  onSelect: (a: any) => void;
  filterBy: (item: any, col: string) => boolean;
  toMinutes: (hhmm: string) => number;
}) {
  const { headerLabels, colunas, timeline, itens, onCreateVago, onSelect, filterBy, toMinutes } =
    props;
  const PX_PER_30 = 26;
  const totalHeight = timeline.length * PX_PER_30;

  return (
    <div className="overflow-x-auto">
      <div className="grid" style={{ gridTemplateColumns: `80px repeat(${colunas.length}, 180px)` }}>
        <div />
        {headerLabels.map((c) => (
          <div key={c} className="p-2 font-medium text-slate-600 border-b bg-white sticky top-0 z-10">
            {c}
          </div>
        ))}
      </div>
      <div className="relative" style={{ height: totalHeight }}>
        <div className="absolute inset-0">
          {timeline.map((t, i) => (
            <div
              key={t}
              className="grid border-b"
              style={{
                height: PX_PER_30,
                gridTemplateColumns: `80px repeat(${colunas.length}, 180px)`,
                background: i % 2 === 0 ? "rgba(248,250,252,1)" : "transparent",
              }}
            >
              <div className="text-[11px] text-slate-500 px-2 pt-1">{t}</div>
              {colunas.map((c) => (
                <button
                  key={`${t}_${c}`}
                  className="border-l text-left text-[11px] px-2 hover:bg-slate-50"
                  onClick={() => onCreateVago(c, t)}
                >
                  <span className="text-slate-300">vago</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        <div
          className="absolute inset-0 grid pointer-events-none"
          style={{ gridTemplateColumns: `80px repeat(${colunas.length}, 180px)` }}
        >
          <div />
          {colunas.map((c) => {
            const colItems = itens.filter((x) => filterBy(x, c));
            return (
              <div key={c} className="relative border-l">
                {colItems.map((a) => {
                  const top = ((toMinutes(a.inicio) - toMinutes("08:00")) / 30) * PX_PER_30;
                  const height = Math.max(22, ((toMinutes(a.fim) - toMinutes(a.inicio)) / 30) * PX_PER_30 - 2);
                  const color =
                    a.status === "confirmada"
                      ? "bg-blue-100 border-blue-300"
                      : a.status === "aguardando"
                      ? "bg-amber-100 border-amber-300"
                      : a.status === "atendida"
                      ? "bg-green-100 border-green-300"
                      : a.status === "no-show"
                      ? "bg-rose-100 border-rose-300"
                      : a.status === "cancelada"
                      ? "bg-zinc-100 border-zinc-200"
                      : "bg-slate-100 border-slate-200";
                  return (
                    <button
                      key={a.id}
                      onClick={() => onSelect(a)}
                      className={`absolute left-2 right-2 rounded-lg border px-2 py-1 text-left shadow-sm pointer-events-auto overflow-hidden ${color}`}
                      style={{ top, height }}
                      title={`${a.paciente} • ${a.inicio}-${a.fim}`}
                    >
                      <div className="text-[11px] font-medium truncate leading-tight">
                        {a.paciente || "(vago)"}
                      </div>
                      <div className="text-[10px] text-slate-700 leading-tight">
                        {a.inicio}-{a.fim}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AgendaDetailsPanel(props: {
  selected: any | null;
  setSelected: (v: any | null) => void;
  salvar: (ap: any) => void;
  excluir: (id: string) => void;
  mudarStatus: (id: string, s: any) => void;
  etiquetaOptions: string[];
  medicos: string[];
  salas: string[];
  dataRef: string;
  pacientes: string[];
}) {
  const {
    selected,
    setSelected,
    salvar,
    excluir,
    mudarStatus,
    etiquetaOptions,
    medicos,
    salas,
    dataRef,
    pacientes,
  } = props;

  const [form, setForm] = React.useState<any>(
    () =>
      selected || {
        id: "",
        paciente: "",
        medico: medicos[0],
        sala: salas[0],
        data: dataRef,
        inicio: "14:00",
        fim: "14:30",
        status: "pendente",
        tags: [],
        obs: "",
      }
  );
  const [showPatients, setShowPatients] = React.useState(false);
  const filtered = React.useMemo(() => {
    const q = (form.paciente || "").toLowerCase();
    return pacientes.filter((p) => p.toLowerCase().includes(q)).slice(0, 6);
  }, [form.paciente, pacientes]);

  React.useEffect(() => {
    if (selected) setForm(selected);
    else
      setForm({
        id: "",
        paciente: "",
        medico: medicos[0],
        sala: salas[0],
        data: dataRef,
        inicio: "14:00",
        fim: "14:30",
        status: "pendente",
        tags: [],
        obs: "",
      });
  }, [selected, dataRef, medicos, salas]);

  return (
    <Card title={selected ? "Detalhes do agendamento" : "Novo agendamento"}>
      <div className="grid gap-3 text-sm">
        <div className="relative">
          <div className="text-xs text-slate-500 mb-1">Paciente</div>
          <input
            value={form.paciente}
            onChange={(e) => setForm({ ...form, paciente: e.target.value })}
            onFocus={() => setShowPatients(true)}
            onBlur={() => setTimeout(() => setShowPatients(false), 150)}
            placeholder="Buscar/selecionar paciente"
            className="w-full border rounded-xl px-3 py-2"
          />
          {showPatients && (
            <div className="absolute z-10 mt-1 w-full rounded-xl border bg-white shadow">
              {filtered.length === 0 && (
                <div className="px-3 py-2 text-xs text-slate-500">
                  Nenhum paciente encontrado
                </div>
              )}
              {filtered.map((p) => (
                <button
                  key={p}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setForm({ ...form, paciente: p })}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
	<AgendaSelect
	label="Médico"
	value={form.medico}
	onChange={(v: string) => setForm({ ...form, medico: v })}
	options={medicos}
	/>
	<AgendaSelect
	label="Sala"
	value={form.sala}
	onChange={(v: string) => setForm({ ...form, sala: v })}
	options={salas}
	/>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <AgendaInput label="Data" type="date" value={form.data} onChange={(v: string) => setForm({ ...form, data: v })} />
          <AgendaInput label="Início" value={form.inicio} onChange={(v: string) => setForm({ ...form, inicio: v })} placeholder="HH:mm" />
          <AgendaInput label="Fim" value={form.fim} onChange={(v: string) => setForm({ ...form, fim: v })} placeholder="HH:mm" />
        </div>

        <div>
          <div className="text-xs text-slate-500 mb-1">Etiquetas</div>
          <div className="flex flex-wrap gap-2">
            {etiquetaOptions.map((t) => (
              <label key={t} className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={form.tags?.includes(t)}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tags: e.target.checked
                        ? [...(form.tags || []), t]
                        : (form.tags || []).filter((x: string) => x !== t),
                    })
                  }
                />
                <span
                  className={`px-2 py-0.5 rounded-full ${
                    t === "primeira"
                      ? "bg-rose-100 border-rose-300 text-rose-700"
                      : "bg-slate-100 border"
                  }`}
                >
                  {t}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
	<AgendaSelect
	  label="Status"
	  value={form.status}
	  onChange={(v: string) => {
	    setForm({ ...form, status: v });
	    if (form.id) mudarStatus(form.id, v as any);
	  }}
	  options={["pendente","confirmada","aguardando","atendida","cancelada","no-show"]}
	/>
          <AgendaInput
            label="Observações"
            value={form.obs || ""}
            onChange={(v: string) => setForm({ ...form, obs: v })}
            placeholder="(opcional)"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            className="px-3 py-2 rounded-xl border bg-slate-900 text-white"
            onClick={() => salvar(form)}
          >
            {form.id ? "Salvar alterações" : "Adicionar"}
          </button>
          <button className="px-3 py-2 rounded-xl border" onClick={() => setSelected(null)}>
            Limpar
          </button>
          {form.id && (
            <button className="px-3 py-2 rounded-xl border" onClick={() => excluir(form.id)}>
              Excluir
            </button>
          )}
          <button
            className="ml-auto px-3 py-2 rounded-xl border"
            onClick={() => alert("(DEMO) Lembrete enviado via WhatsApp")}
          >
            WA Lembrete
          </button>
        </div>
      </div>
    </Card>
  );
}

function AgendaWaitlistPanel(props: {
  pacientes: string[];
  espera: { id: string; paciente: string; preferencia?: { medico?: string; sala?: string; intervalo?: string } }[];
  setEspera: (v: any) => void;
  onEncaixar: (w: any) => void;
}) {
  const { pacientes, espera, setEspera, onEncaixar } = props;
  const [novo, setNovo] = React.useState("");
  const [show, setShow] = React.useState(false);
  const sugestoes = React.useMemo(
    () => pacientes.filter((p) => p.toLowerCase().includes(novo.toLowerCase())).slice(0, 6),
    [novo, pacientes]
  );
  return (
    <Card title={`Lista de espera`}>
      <div className="space-y-2 text-sm">
        <div className="relative flex gap-2">
          <div className="flex-1">
            <input
              value={novo}
              onChange={(e) => setNovo(e.target.value)}
              onFocus={() => setShow(true)}
              onBlur={() => setTimeout(() => setShow(false), 150)}
              placeholder="Adicionar paciente à fila"
              className="border rounded-xl px-3 py-2 w-full"
            />
            {show && (
              <div className="absolute z-10 mt-1 w-[calc(100%-0px)] rounded-xl border bg-white shadow">
                {sugestoes.length === 0 && (
                  <div className="px-3 py-2 text-xs text-slate-500">
                    Nenhum paciente encontrado
                  </div>
                )}
                {sugestoes.map((p) => (
                  <button
                    key={p}
                    className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setNovo(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="px-3 py-2 rounded-xl border"
            onClick={() => {
              if (!novo.trim()) return;
              setEspera((prev: any[]) => [
                ...prev,
                { id: `w_${Date.now()}`, paciente: novo },
              ]);
              setNovo("");
            }}
          >
            + Incluir
          </button>
        </div>

        {espera.map((w) => (
          <div key={w.id} className="flex items-center justify-between border rounded-xl p-2">
            <div>
              <div className="font-medium">{w.paciente}</div>
              <div className="text-xs text-slate-500">
                Pref.: {w.preferencia?.medico || "(qualquer)"} •{" "}
                {w.preferencia?.intervalo || "(qualquer)"}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-2 py-1 rounded-lg border text-xs" onClick={() => onEncaixar(w)}>
                Encaixar
              </button>
              <button
                className="px-2 py-1 rounded-lg border text-xs"
                onClick={() =>
                  setEspera((p: any[]) => p.filter((x) => x.id !== w.id))
                }
              >
                Remover
              </button>
            </div>
          </div>
        ))}
        {espera.length === 0 && (
          <div className="text-xs text-slate-500">Sem pacientes aguardando.</div>
        )}
      </div>
    </Card>
  );
}

/* Primitivos locais (somente usados no painel da Agenda) */
function AgendaInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: any) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        className="w-full border rounded-xl px-3 py-2"
      />
    </div>
  );
}
function AgendaSelect({ label, value, onChange, options }: any) {
  return (
    <div>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-xl px-3 py-2"
      >
        {options.map((o: string) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ----------------- FINANCEIRO ----------------- */
function Financeiro() {
  type Mov = { id: string; tipo: "receber" | "pagar"; desc: string; valor: number; data: string };
  const [movs, setMovs] = useState<Mov[]>([
    { id: "r1", tipo: "receber", desc: "Consulta · Maria da Silva", valor: 250, data: "12/10/2025" },
    { id: "r2", tipo: "receber", desc: "Retorno · João Pereira", valor: 0, data: "12/10/2025" },
    { id: "p1", tipo: "pagar", desc: "Aluguel da clínica", valor: 3000, data: "12/10/2025" },
  ]);
  const [novo, setNovo] = useState<Mov>({ id: "", tipo: "receber", desc: "", valor: 0, data: "" });
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "receber" | "pagar">("todos");
  const [periodo, setPeriodo] = useState({ de: "01/10/2025", ate: "31/10/2025" });

  const lista = movs.filter((m) => (tipoFiltro === "todos" ? true : m.tipo === tipoFiltro));

  function add() {
    if (!novo.desc || !novo.data) {
      alert("Preencha descrição e data");
      return;
    }
    setMovs((prev) => [...prev, { ...novo, id: String(Date.now()) }]);
    setNovo({ id: "", tipo: "receber", desc: "", valor: 0, data: "" });
  }
  function del(id: string) {
    setMovs((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Financeiro</h1>

      <div className="rounded-2xl border bg-white p-4">
        <div className="grid gap-2 md:grid-cols-5 items-end">
          <div>
            <Label>Tipo</Label>
            <select className="border rounded-xl px-3 py-2 w-full" value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value as any)}>
              <option value="todos">Todos</option>
              <option value="receber">Recebimentos</option>
              <option value="pagar">Pagamentos</option>
            </select>
          </div>
          <div>
            <Label>De</Label>
            <input className="border rounded-xl px-3 py-2 w-full" value={periodo.de} onChange={(e) => setPeriodo({ ...periodo, de: e.target.value })}/>
          </div>
          <div>
            <Label>Até</Label>
            <input className="border rounded-xl px-3 py-2 w-full" value={periodo.ate} onChange={(e) => setPeriodo({ ...periodo, ate: e.target.value })}/>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <h3 className="font-semibold mb-2">Lançamentos</h3>
        {lista.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-xl border p-3 mb-2">
            <div>
              <div className="font-medium">{m.desc}</div>
              <div className="text-xs text-slate-500">{m.data}</div>
            </div>
            <div className="flex items-center gap-3">
              <b>R$ {m.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</b>
              <span className={`text-xs px-2 py-1 rounded-full ${m.tipo === "receber" ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"}`}>{m.tipo}</span>
              <button className="px-2 py-1 text-xs rounded-lg border" onClick={() => del(m.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <h3 className="font-semibold mb-2">Novo lançamento</h3>
        <div className="grid gap-2 md:grid-cols-4">
          <select className="border rounded-xl px-3 py-2" value={novo.tipo} onChange={(e) => setNovo({ ...novo, tipo: e.target.value as any })}>
            <option value="receber">Receber</option>
            <option value="pagar">Pagar</option>
          </select>
          <input className="border rounded-xl px-3 py-2" placeholder="Descrição" value={novo.desc} onChange={(e) => setNovo({ ...novo, desc: e.target.value })}/>
          <input className="border rounded-xl px-3 py-2" placeholder="Valor" type="number" value={novo.valor} onChange={(e) => setNovo({ ...novo, valor: Number(e.target.value) })}/>
          <input className="border rounded-xl px-3 py-2" placeholder="Data (dd/mm/aaaa)" value={novo.data} onChange={(e) => setNovo({ ...novo, data: e.target.value })}/>
        </div>
        <button className="mt-3 px-3 py-2 rounded-xl border" onClick={add}>Adicionar</button>
      </div>
    </div>
  );
}


/* ----------------- ATENDIMENTO ----------------- */
// --- Helper local (adicione acima do componente Atendimento) ---
function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        className="border rounded-xl px-3 py-2 w-full min-h-[88px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Atendimento() {
  // estado dos campos clínicos (demo)
  const [paciente, setPaciente] = useState("Maria da Silva");
  const [subjetivo, setSubjetivo] = useState("das");
  const [exame, setExame] = useState("ds");
  const [diagnostico, setDiagnostico] = useState("dsda");
  const [conduta, setConduta] = useState("sda da");
  const [prescricao, setPrescricao] = useState("");

  // prescrição (mantém UI existente)
  const [novoItem, setNovoItem] = useState("");
  const [itens, setItens] = useState<string[]>([]);
  const [historico, setHistorico] = useState<{ data: string; texto: string }[]>([
    { data: "05/10/2025", texto: "Consulta de rotina; sem alterações" },
  ]);

  function addItem() {
    if (!novoItem.trim()) return;
    setItens((prev) => [...prev, novoItem.trim()]);
    setNovoItem("");
  }
  function gerarPrescricao() {
    const meds = itens.map((m, i) => `${i + 1}. ${m}`).join("\n");
    alert(`Print da prescrição de ${paciente}:\n\n${meds}`);
  }
  function salvarAtendimento() {
    setHistorico((prev) => [
      ...prev,
      {
        data: new Date().toLocaleDateString("pt-BR"),
        texto: `Paciente: ${paciente}
Subjetivo: ${subjetivo}
Exame: ${exame}
Diagnóstico: ${diagnostico}
Conduta: ${conduta}`,
      },
    ]);
    alert("Atendimento salvo (demo)");
  }

  // ações IA (demo)
  function sugerirResumoIA() {
    const resumo = `Resumo (IA) — ${paciente}: paciente relata ${
      subjetivo || "sintomas leves"
    }. Exame compatível com ${exame || "achados discretos"}. Diagnóstico provável: ${
      diagnostico || "avaliar"
    }. Conduta: ${conduta || "medicação sintomática e retorno em 30 dias"}.`;
    alert(resumo);
  }
  function sugerirCondutas() {
    const lista = [
      "Lubrificação ocular 4x/dia por 14 dias",
      "Compressas mornas 2x/dia",
      "Revisão em 30 dias ou se piora",
    ].join(" • ");
    alert(`Condutas sugeridas (apoio, não substitui julgamento clínico): • ${lista}`);
  }
  function sugerirRetorno() {
    const dias = diagnostico.toLowerCase().includes("blefarite") ? 15 : 30;
    alert(`Sugerir retorno automático para ${paciente} em ${dias} dias.`);
  }
  function ditadoParaReceita() {
    const falado =
      prompt("Dite/cole sua receita (demo)", "Colírio lubrificante 1 gota 6/6h por 14 dias") || "";
    setItens((prev) => [...prev, falado]);
  }

  const medicamentos = ["Dipirona 500mg", "Ibuprofeno 400mg", "Colírio Lubrificante", "Prednisolona 20mg"];

  return (
    <div className="space-y-4">
      <Card title={`Atendimento — ${paciente}`}>
        <div className="grid md:grid-cols-2 gap-4">
          <TextInput label="Paciente" value={paciente} onChange={setPaciente} />

          <Textarea label="Subjetivo" value={subjetivo} onChange={setSubjetivo} />
          <Textarea label="Exame Oftalmológico" value={exame} onChange={setExame} />
          <Textarea label="Diagnóstico" value={diagnostico} onChange={setDiagnostico} />
          <Textarea label="Conduta" value={conduta} onChange={setConduta} />

          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button className="px-3 py-2 rounded-xl border" onClick={salvarAtendimento}>
              Salvar
            </button>
            <button className="px-3 py-2 rounded-xl border" onClick={sugerirResumoIA}>
              Sugerir resumo (IA)
            </button>
            <button className="px-3 py-2 rounded-xl border" onClick={sugerirCondutas}>
              Condutas sugeridas
            </button>
            <button className="px-3 py-2 rounded-xl border" onClick={sugerirRetorno}>
              Sugerir retorno
            </button>
          </div>

          {/* ---------- Prescrição ---------- */}
          <div className="md:col-span-2">
            <Card title="Prescrição">
              {/* Campo preditivo */}
              <SmartPredictTextarea
                id="prescricao"
                className="mb-3"
                value={prescricao}
                onChange={setPrescricao}
                context={`${diagnostico}; ${conduta}; ${subjetivo}`}
                maxSuggestions={3}
                mode="server"
              />
              <div className="flex gap-2">
                <input
                  className="border rounded-xl px-3 py-2 w-full"
                  list="med-list"
                  placeholder="Buscar medicamento"
                  value={novoItem}
                  onChange={(e) => setNovoItem(e.target.value)}
                />
                <datalist id="med-list">
                  {medicamentos.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
                <button className="px-3 py-2 rounded-xl border" onClick={addItem}>
                  Adicionar
                </button>
                <button className="px-3 py-2 rounded-xl border" onClick={ditadoParaReceita}>
                  Dictar → Receita
                </button>
              </div>

              <ul className="list-disc pl-5 mt-3 text-sm">
                {itens.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>

              <button className="mt-3 px-3 py-2 rounded-xl border" onClick={gerarPrescricao}>
                Imprimir prescrição
              </button>
            </Card>
          </div>
        </div>
      </Card>

      <Card title="Histórico">
        <div className="space-y-2 text-sm">
          {historico.map((h, i) => (
            <div key={i} className="rounded-xl border p-3">
              <div className="text-slate-500 text-xs">{h.data}</div>
              <pre className="whitespace-pre-wrap">{h.texto}</pre>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ----------------- AUTOCADASTRO (VALIDAÇÃO + UPLOAD + OCR SIMULADO) ----------------- */
type DocItem = {
  id: string;
  tipo: "RG" | "CPF" | "CNH";
  file?: File;
  nome: string;
  previewUrl?: string;
};

function Autocadastro() {
  const [form, setForm] = useState<AutoForm>({
    nome: "",
    nascimento: "",
    telefone: "",
    email: "",
    rg: "",
    cpf: "",
    sexo: "",
    estado_civil: "",
    cep: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    estado: "",
    complemento: "",
    pais: "Brasil",
    profissao: "",
    observacoes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [enviado, setEnviado] = useState(false);

  // Uploads (RG/CPF/CNH) — mock
  const [docs, setDocs] = useState<DocItem[]>([]);
  // Fila de pendências (simulada + persistida)
  const [pendencias, setPendencias] = useState<Pendencia[]>([]);

  React.useEffect(() => {
    setPendencias(readPendenciasLS());
  }, []);

  // --------- Máscaras / validações locais (mock) ---------
  function onChange<K extends keyof AutoForm>(k: K, v: string) {
    let value = v;
    if (k === "cpf") value = maskCPF(v);
    if (k === "telefone") value = maskTelefone(v);
    if (k === "cep") value = maskCEP(v);
    if (k === "nascimento") value = maskData(v);
    setForm((f) => ({ ...f, [k]: value }));
    setErrors((e) => ({ ...e, [k as string]: "" }));
    // Auto-completar endereço por CEP (mock)
    if (k === "cep") {
      const clean = value.replace(/\D/g, "");
      if (clean.length === 8) {
        const addr = cepLookup(value) || {
          logradouro: "Rua Exemplo",
          bairro: "Centro",
          cidade: "São Paulo",
          estado: "SP",
          pais: "Brasil",
        };
        setForm((f) => ({
          ...f,
          logradouro: f.logradouro || addr.logradouro,
          bairro: f.bairro || addr.bairro,
          cidade: f.cidade || addr.cidade,
          estado: f.estado || addr.estado,
          pais: f.pais || addr.pais,
        }));
      }
    }
  }

  function validateAll(): boolean {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = "Informe o nome completo";
    if (!cpfIsValid(form.cpf)) e.cpf = "CPF inválido";
    if (!rgIsValid(form.rg)) e.rg = "RG inválido";
    if (!isEmail(form.email)) e.email = "E-mail inválido";
    if (!isDataValida(form.nascimento)) e.nascimento = "Data inválida (dd/mm/aaaa)";
    if (form.cep.replace(/\D/g, "").length !== 8) e.cep = "CEP inválido";
    if (!form.logradouro.trim()) e.logradouro = "Informe o logradouro";
    if (!form.numero.trim()) e.numero = "Informe o número";
    if (!form.bairro.trim()) e.bairro = "Informe o bairro";
    if (!form.cidade.trim()) e.cidade = "Informe a cidade";
    if (!form.estado.trim()) e.estado = "Informe o estado";
    if (form.telefone.replace(/\D/g, "").length < 10) e.telefone = "Telefone inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function enviar() {
    if (!validateAll()) {
      alert("Há campos inválidos. Verifique os destaques em vermelho.");
      return;
    }
    const novo: Pendencia = {
      id: String(Date.now()),
      nome: form.nome,
      criadoEm: new Date().toLocaleString("pt-BR"),
      status: "PENDENTE",
      dados: form,
    };
    const next = [novo, ...pendencias];
    setPendencias(next);
    writePendenciasLS(next);
    setEnviado(true);
  }

  // --------- Uploads ---------
  function handleUpload(tipo: DocItem["tipo"], file?: File) {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setDocs((prev) => [
      ...prev,
      { id: String(Date.now() + Math.random()), tipo, file, nome: file.name, previewUrl },
    ]);
  }
  function removeDoc(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  // --------- OCR Simulado (corrigido: nome válido, ignora "frente/verso/cnh/r..." ) ---------
  function executarOCRSimulado() {
    if (docs.length === 0) {
      alert("Envie pelo menos um documento para simular o OCR.");
      return;
    }

    let possibleCPF = docs.find((d) => d.tipo === "CPF")?.nome || "";
    let possibleRG = docs.find((d) => d.tipo === "RG")?.nome || "";
    const cpfNumRaw = possibleCPF.match(/\d{11}/)?.[0] || "";
    const rgNum = possibleRG.match(/\d{7,9}/)?.[0] || "250997679";
    const cpfValidRaw = cpfIsValid(cpfNumRaw) ? cpfNumRaw : "52998224725";

    // monta lista de nomes de arquivo para tentar extrair um nome válido
    const stopWords =
      "(frente|verso|anverso|reverso|cnh|rg|cpf|documento|doc|imagem|foto|scan|id|identidade|cartao|frontal|traseira|back|lado|face)";
    const candidates = docs
      .map((d) =>
        d.nome
          .replace(/\.(pdf|png|jpg|jpeg|heic|webp)$/i, "")
          .replace(/[_\-]+/g, " ")
          .replace(/\d+/g, " ")
          .toLowerCase()
          .replace(new RegExp(`\\b${stopWords}\\b`, "gi"), "")
          .replace(/\s+/g, " ")
          .trim()
      )
      .filter(Boolean);

    // pega o primeiro candidato que parece um nome (>= 2 palavras, tamanho razoável)
    let best = candidates.find((c) => c.split(" ").length >= 2 && c.length >= 6) || "";

    // se não achar, tenta a parte antes de um hífen/underscore do primeiro arquivo
    if (!best && candidates.length > 0) {
      best = candidates[0];
    }

    // fallback confiável
    const fallback = [
      "Ana Souza",
      "Pedro Almeida",
      "Carla Nogueira",
      "Rafael Santos",
      "Luiza Carvalho",
      "Bruno Ribeiro",
      "Marina Costa",
      "Paulo Oliveira",
    ];
    const nomeDetectado =
      (best ? titleCase(best) : "") ||
      (form.nome && form.nome.length >= 4 ? form.nome : "") ||
      fallback[Math.floor(Math.random() * fallback.length)];

    const dataDetectada = form.nascimento || "12/10/1977"; // mock

    setForm((f) => ({
      ...f,
      nome: nomeDetectado,
      nascimento: maskData(dataDetectada),
      cpf: maskCPF(cpfValidRaw),
      rg: rgNum,
    }));
    alert("OCR simulado executado: campos preenchidos automaticamente.");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Autocadastro (Demo)</h1>

      {!enviado ? (
        <>
          <Card title="Leia e aceite para continuar:">
            <div className="bg-slate-100 rounded-xl p-3 text-sm">
              Termo de consentimento fictício…
            </div>
          </Card>

          <Card title="Dados do paciente">
            <div className="grid md:grid-cols-2 gap-3">
              <TextInput label="Nome completo" value={form.nome} onChange={(v) => onChange("nome", v)} error={errors.nome} className="md:col-span-2" />
              <TextInput label="Nascimento (dd/mm/aaaa)" value={form.nascimento} onChange={(v) => onChange("nascimento", v)} onBlur={() => !isDataValida(form.nascimento) && setErrors((e) => ({ ...e, nascimento: "Data inválida" }))} error={errors.nascimento} />
              <TextInput label="Telefone" value={form.telefone} onChange={(v) => onChange("telefone", v)} error={errors.telefone} />
              <TextInput label="E-mail" value={form.email} onChange={(v) => onChange("email", v)} onBlur={() => !isEmail(form.email) && setErrors((e) => ({ ...e, email: "E-mail inválido" }))} error={errors.email} className="md:col-span-2" />
              <TextInput label="RG" value={form.rg} onChange={(v) => onChange("rg", v)} onBlur={() => !rgIsValid(form.rg) && setErrors((e) => ({ ...e, rg: "RG inválido" }))} error={errors.rg} />
              <TextInput label="CPF" value={form.cpf} onChange={(v) => onChange("cpf", v)} onBlur={() => !cpfIsValid(form.cpf) && setErrors((e) => ({ ...e, cpf: "CPF inválido" }))} error={errors.cpf} />
              <Select label="Sexo" value={form.sexo} onChange={(v) => onChange("sexo", v)} options={[
                { label: "Sexo", value: "" },
                { label: "Feminino", value: "FEMININO" },
                { label: "Masculino", value: "MASCULINO" },
                { label: "Outro", value: "OUTRO" },
                { label: "Prefiro não informar", value: "NAO_INFORMADO" },
              ]} />
              <Select label="Estado civil" value={form.estado_civil} onChange={(v) => onChange("estado_civil", v)} options={[
                { label: "Estado civil", value: "" },
                { label: "Solteiro(a)", value: "SOLTEIRO" },
                { label: "Casado(a)", value: "CASADO" },
                { label: "Divorciado(a)", value: "DIVORCIADO" },
                { label: "Viúvo(a)", value: "VIUVO" },
                { label: "União estável", value: "UNIAO_ESTAVEL" },
                { label: "Prefiro não informar", value: "NAO_INFORMADO" },
              ]} />

              <TextInput label="CEP" value={form.cep} onChange={(v) => onChange("cep", v)} onBlur={() => form.cep.replace(/\D/g, "").length !== 8 && setErrors((e) => ({ ...e, cep: "CEP inválido" }))} error={errors.cep} />
              <TextInput label="Logradouro" value={form.logradouro} onChange={(v) => onChange("logradouro", v)} error={errors.logradouro} className="md:col-span-2" />
              <TextInput label="Número" value={form.numero} onChange={(v) => onChange("numero", v)} error={errors.numero} />
              <TextInput label="Bairro" value={form.bairro} onChange={(v) => onChange("bairro", v)} error={errors.bairro} />
              <TextInput label="Cidade" value={form.cidade} onChange={(v) => onChange("cidade", v)} error={errors.cidade} />
              <TextInput label="Estado" value={form.estado} onChange={(v) => onChange("estado", v)} error={errors.estado} />
              <TextInput label="País" value={form.pais} onChange={(v) => onChange("pais", v)} />
              <TextInput label="Complemento" value={form.complemento} onChange={(v) => onChange("complemento", v)} className="md:col-span-2" />
              <TextInput label="Profissão" value={form.profissao} onChange={(v) => onChange("profissao", v)} />
              <div className="md:col-span-2">
                <div className="text-xs text-slate-500 mb-1">Observações</div>
                <textarea className="border rounded-xl p-3 w-full min-h-[90px]" placeholder="Observações gerais" value={form.observacoes} onChange={(e) => onChange("observacoes", e.target.value)} />
              </div>
            </div>

            {/* Upload de documentos */}
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Documentos (upload)</h4>
              <div className="grid md:grid-cols-3 gap-3">
                <FileInput label="RG (imagem/PDF)" accept=".pdf,image/*" onFile={(f) => handleUpload("RG", f)} />
                <FileInput label="CPF (imagem/PDF)" accept=".pdf,image/*" onFile={(f) => handleUpload("CPF", f)} />
                <FileInput label="CNH (imagem/PDF)" accept=".pdf,image/*" onFile={(f) => handleUpload("CNH", f)} />
              </div>

              {docs.length > 0 && (
                <div className="mt-3 border rounded-xl p-3">
                  <div className="text-xs text-slate-500 mb-2">Arquivos enviados</div>
                  <div className="grid md:grid-cols-3 gap-2">
                    {docs.map((d) => (
                      <div key={d.id} className="border rounded-lg p-2 text-sm">
                        <div className="flex items-center justify-between">
                          <b>{d.tipo}</b>
                          <button className="text-xs underline" onClick={() => removeDoc(d.id)}>remover</button>
                        </div>
                        <div className="text-xs text-slate-500 break-all">{d.nome}</div>
                        {d.previewUrl && d.file && d.file.type.startsWith("image/") && (
                          <img src={d.previewUrl} className="mt-2 w-full h-28 object-cover rounded" alt={d.nome} />
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="mt-3 px-3 py-2 rounded-xl border" onClick={executarOCRSimulado}>
                    Ler documento e preencher (OCR simulado)
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button className="px-3 py-2 rounded-xl border" onClick={enviar}>Enviar</button>
              <span className="text-xs text-slate-500 self-center">
                * Validações/máscaras locais (DEMO). No-prod: via Zod + RLS/DB.
              </span>
            </div>
          </Card>

          {/* Fila de pendências (simulada) */}
          {pendencias.length > 0 && (
            <Card title="Fila de pendências (simulado — secretaria valida)">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left px-3 py-2">Paciente</th>
                    <th className="text-left px-3 py-2">Criado em</th>
                    <th className="text-left px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendencias.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="px-3 py-2">{p.nome}</td>
                      <td className="px-3 py-2">{p.criadoEm}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs font-semibold rounded-full px-2 py-1 ${p.status === "PENDENTE" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      ) : (
        <>
          <Card title="Enviado!">
            <p>
              Obrigado. Seus dados foram recebidos e estão na fila de pendência
              para revisão da secretaria.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}

/* ----------------- RELATÓRIOS ----------------- */
function Relatorios() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Relatórios + IA</h1>
      <Card title="KPIs (mock)">
        <div className="grid md:grid-cols-3 gap-3">
          <Kpi title="Receita prevista (14d)" value="R$ 12.400" />
          <Kpi title="Lucro previsto (14d)" value="R$ 6.900" />
          <Kpi title="No-show previsto (7d)" value="9%" />
        </div>
      </Card>
    </div>
  );
}

/* ----------------- COMPONENTES BÁSICOS ----------------- */
function Kpi({ title, value, subtitle }: { title: string; value: string; subtitle?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border p-4">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {subtitle && <div className="text-xs mt-1">{subtitle}</div>}
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border p-4">
      <div className="font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}
function Row({ left, right }: { left: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-t first:border-t-0">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-slate-500 mb-1">{children}</div>;
}
function TextInput({
  label,
  value,
  onChange,
  error,
  className,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  className?: string;
  onBlur?: () => void;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <input
        className={`border rounded-xl px-3 py-2 w-full ${error ? "border-rose-400 bg-rose-50" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
	onBlur={onBlur}
      />
      {error && <div className="text-[11px] text-rose-600 mt-1">{error}</div>}
    </div>
  );
}
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        className="border rounded-xl px-3 py-2 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
function FileInput({
  label,
  accept,
  onFile,
}: {
  label: string;
  accept: string;
  onFile: (f?: File) => void;
}) {
  return (
    <label className="border rounded-xl px-3 py-2 w-full text-sm cursor-pointer bg-slate-50">
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {label}
    </label>
  );
}

/* ----------------- EDIT SHEET (PACIENTE) ----------------- */
function EditSheet({
  editing,
  onCancel,
  onSave,
}: {
  editing: any;
  onCancel: () => void;
  onSave: (p: any) => void;
}) {
  const [tab, setTab] = useState<"dados" | "historico" | "whats">("dados");
  const [p, setP] = useState<any>(editing);

  function save() {
    onSave(p);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
      <div className="w-full max-w-2xl bg-white h-full p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Editar paciente</h3>
          <div className="flex gap-2">
            <button className={`px-2 py-1 rounded-lg border ${tab === "dados" ? "bg-slate-900 text-white" : ""}`} onClick={() => setTab("dados")}>
              Dados
            </button>
            <button className={`px-2 py-1 rounded-lg border ${tab === "historico" ? "bg-slate-900 text-white" : ""}`} onClick={() => setTab("historico")}>
              Histórico
            </button>
            <button className={`px-2 py-1 rounded-lg border ${tab === "whats" ? "bg-slate-900 text-white" : ""}`} onClick={() => setTab("whats")}>
              Interações (WhatsApp)
            </button>
          </div>
        </div>

        {tab === "dados" && (
          <div className="grid md:grid-cols-2 gap-3">
            <TextInput label="Nome completo" value={p.nome} onChange={(v) => setP({ ...p, nome: v })} className="md:col-span-2" />
            <TextInput label="Telefone" value={p.telefone} onChange={(v) => setP({ ...p, telefone: v })} />
            <TextInput label="Nascimento" value={p.nascimento} onChange={(v) => setP({ ...p, nascimento: v })} />
            <TextInput label="E-mail" value={p.email} onChange={(v) => setP({ ...p, email: v })} className="md:col-span-2" />
            <TextInput label="CPF" value={p.cpf || ""} onChange={(v) => setP({ ...p, cpf: v })} />
            <TextInput label="RG" value={p.rg || ""} onChange={(v) => setP({ ...p, rg: v })} />
            <Select label="Sexo" value={p.sexo || ""} onChange={(v) => setP({ ...p, sexo: v })} options={[
              { label: "Não informado", value: "" },
              { label: "Feminino", value: "FEMININO" },
              { label: "Masculino", value: "MASCULINO" },
              { label: "Outro", value: "OUTRO" },
              { label: "Prefiro não informar", value: "NAO_INFORMADO" },
            ]} />
            <Select label="Estado civil" value={p.estado_civil || ""} onChange={(v) => setP({ ...p, estado_civil: v })} options={[
              { label: "Não informado", value: "" },
              { label: "Solteiro(a)", value: "SOLTEIRO" },
              { label: "Casado(a)", value: "CASADO" },
              { label: "Divorciado(a)", value: "DIVORCIADO" },
              { label: "Viúvo(a)", value: "VIUVO" },
              { label: "União estável", value: "UNIAO_ESTAVEL" },
              { label: "Prefiro não informar", value: "NAO_INFORMADO" },
            ]} />
            <TextInput label="CEP" value={p.endereco?.cep || ""} onChange={(v) => setP({ ...p, endereco: { ...(p.endereco || {}), cep: v } })} />
            <TextInput label="Rua" value={p.endereco?.rua || ""} onChange={(v) => setP({ ...p, endereco: { ...(p.endereco || {}), rua: v } })} className="md:col-span-2" />
            <TextInput label="Número" value={p.endereco?.numero || ""} onChange={(v) => setP({ ...p, endereco: { ...(p.endereco || {}), numero: v } })} />
            <TextInput label="Bairro" value={p.endereco?.bairro || ""} onChange={(v) => setP({ ...p, endereco: { ...(p.endereco || {}), bairro: v } })} />
            <TextInput label="Cidade" value={p.endereco?.cidade || ""} onChange={(v) => setP({ ...p, endereco: { ...(p.endereco || {}), cidade: v } })} />
            <TextInput label="Estado" value={p.endereco?.estado || ""} onChange={(v) => setP({ ...p, endereco: { ...(p.endereco || {}), estado: v } })} />
            <TextInput label="País" value={p.endereco?.pais || ""} onChange={(v) => setP({ ...p, endereco: { ...(p.endereco || {}), pais: v } })} />
          </div>
        )}

        {tab === "historico" && (
          <div className="space-y-6">
            <div>
              <div className="font-medium mb-2">Próximas consultas</div>
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left px-3 py-2">Data</th>
                    <th className="text-left px-3 py-2">Hora</th>
                    <th className="text-left px-3 py-2">Médico</th>
                    <th className="text-left px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(p.consultas_futuras || []).map((c: any) => (
                    <tr key={c.id} className="border-t">
                      <td className="px-3 py-2">{c.data}</td>
                      <td className="px-3 py-2">{c.hora}</td>
                      <td className="px-3 py-2">{c.medico}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${c.status === "futura" ? "bg-slate-100 text-slate-700" : "bg-blue-100 text-blue-700"}`}>
                          {c.status === "futura" ? "Agendado" : "Confirmado"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <div className="font-medium mb-2">Consultas passadas</div>
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left px-3 py-2">Data</th>
                    <th className="text-left px-3 py-2">Hora</th>
                    <th className="text-left px-3 py-2">Médico</th>
                    <th className="text-left px-3 py-2">Diagnóstico</th>
                    <th className="text-left px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(p.consultas_passadas || []).map((c: any) => (
                    <tr key={c.id} className="border-t">
                      <td className="px-3 py-2">{c.data}</td>
                      <td className="px-3 py-2">{c.hora}</td>
                      <td className="px-3 py-2">{c.medico}</td>
                      <td className="px-3 py-2">{c.diagnostico || "—"}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${c.status === "no_show" ? "bg-rose-100 text-rose-700" : "bg-green-100 text-green-700"}`}>
                          {c.status === "no_show" ? "Não Comparecimento" : "Atendido"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-xs text-slate-500">
              * Sincronização com Agenda/Financeiro/WhatsApp será automática na
              versão integrada (simulado no DEMO).
            </div>
          </div>
        )}

        {tab === "whats" && (
          <div className="space-y-3">
            <div className="text-sm text-slate-600">
              Interações de WhatsApp (somente leitura, simuladas).
            </div>
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left px-3 py-2">Data</th>
                  <th className="text-left px-3 py-2">Assunto</th>
                  <th className="text-left px-3 py-2">Resolvido</th>
                  <th className="text-left px-3 py-2">Reclamação</th>
                </tr>
              </thead>
              <tbody>
                {(p.whatsapp_interacoes || []).map((w: any) => (
                  <tr key={w.id} className="border-t">
                    <td className="px-3 py-2">{w.data}</td>
                    <td className="px-3 py-2">{w.assunto}</td>
                    <td className="px-3 py-2">{w.resolvido ? "Sim" : "Não"}</td>
                    <td className="px-3 py-2">{w.reclamacao ? "Sim" : "Não"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-xs text-slate-500">
              * Esta aba será preenchida automaticamente por webhook do WhatsApp
              na versão integrada (DEMO não grava aqui).
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button className="px-3 py-2 rounded-xl border" onClick={save}>Salvar</button>
          <button className="px-3 py-2 rounded-xl border" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

/* ----------------- MODAL: Verificação da Pendência (editável) ----------------- */
function VerifyPendenciaModal({
  pendencia,
  onClose,
  onSave,
}: {
  pendencia: Pendencia;
  onClose: () => void;
  onSave: (p: Pendencia) => void;
}) {
  const [dados, setDados] = useState<AutoForm>(pendencia.dados);

  function set<K extends keyof AutoForm>(k: K, v: string) {
    setDados((prev) => ({ ...prev, [k]: v }));
  }
  function salvar() {
    const upd: Pendencia = { ...pendencia, dados, nome: dados.nome, status: pendencia.status };
    onSave(upd);
    alert("Alterações salvas na pendência.");
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-5 w-[780px] max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Autocadastro — Verificação de Dados</h3>
          <div className="flex gap-2">
            <button className="px-2 py-1 text-xs rounded-lg border" onClick={salvar}>Salvar alterações</button>
            <button className="px-2 py-1 text-xs rounded-lg border" onClick={onClose}>Fechar</button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-2 text-sm">
          <TextInput label="nome" value={dados.nome} onChange={(v)=>set("nome", v)} />
          <TextInput label="nascimento" value={dados.nascimento} onChange={(v)=>set("nascimento", maskData(v))} />
          <TextInput label="telefone" value={dados.telefone} onChange={(v)=>set("telefone", maskTelefone(v))} />
          <TextInput label="email" value={dados.email} onChange={(v)=>set("email", v)} />
          <TextInput label="rg" value={dados.rg} onChange={(v)=>set("rg", v)} />
          <TextInput label="cpf" value={dados.cpf} onChange={(v)=>set("cpf", maskCPF(v))} />
          <Select label="sexo" value={dados.sexo} onChange={(v)=>set("sexo", v)} options={[
            {label:"", value:""},
            {label:"FEMININO", value:"FEMININO"},
            {label:"MASCULINO", value:"MASCULINO"},
            {label:"OUTRO", value:"OUTRO"},
            {label:"NAO_INFORMADO", value:"NAO_INFORMADO"},
          ]}/>
          <Select label="estado_civil" value={dados.estado_civil} onChange={(v)=>set("estado_civil", v)} options={[
            {label:"", value:""},
            {label:"SOLTEIRO", value:"SOLTEIRO"},
            {label:"CASADO", value:"CASADO"},
            {label:"DIVORCIADO", value:"DIVORCIADO"},
            {label:"VIUVO", value:"VIUVO"},
            {label:"UNIAO_ESTAVEL", value:"UNIAO_ESTAVEL"},
            {label:"NAO_INFORMADO", value:"NAO_INFORMADO"},
          ]}/>
          <TextInput label="cep" value={dados.cep} onChange={(v)=>set("cep", maskCEP(v))} />
          <TextInput label="logradouro" value={dados.logradouro} onChange={(v)=>set("logradouro", v)} />
          <TextInput label="numero" value={dados.numero} onChange={(v)=>set("numero", v)} />
          <TextInput label="bairro" value={dados.bairro} onChange={(v)=>set("bairro", v)} />
          <TextInput label="cidade" value={dados.cidade} onChange={(v)=>set("cidade", v)} />
          <TextInput label="estado" value={dados.estado} onChange={(v)=>set("estado", v)} />
          <TextInput label="pais" value={dados.pais} onChange={(v)=>set("pais", v)} />
          <TextInput label="complemento" value={dados.complemento} onChange={(v)=>set("complemento", v)} className="md:col-span-2" />
          <TextInput label="profissao" value={dados.profissao} onChange={(v)=>set("profissao", v)} />
          <div className="md:col-span-2">
            <Label>observacoes</Label>
            <textarea className="border rounded-xl px-3 py-2 w-full min-h-[80px]" value={dados.observacoes} onChange={(e)=>set("observacoes", e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------- HELPERS ----------------- */
function maskCPF(v: string) {
  const n = v.replace(/\D/g, "").slice(0, 11);
  return n
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
}
function maskTelefone(v: string) {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 10)
    return n
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  return n
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}
function maskCEP(v: string) {
  const n = v.replace(/\D/g, "").slice(0, 8);
  return n.replace(/^(\d{5})(\d)/, "$1-$2");
}
function maskData(v: string) {
  const n = v.replace(/\D/g, "").slice(0, 8);
  return n.replace(/^(\d{2})(\d)/, "$1/$2").replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
}
function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isDataValida(d: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(d);
  if (!m) return false;
  const [_, dd, mm, yyyy] = m;
  const dt = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return dt.getFullYear() === Number(yyyy) && dt.getMonth() === Number(mm) - 1 && dt.getDate() === Number(dd);
}
function cpfIsValid(cpfMasked: string) {
  const cpf = cpfMasked.replace(/\D/g, "");
  if (!cpf || cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== Number(cpf[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  return rev === Number(cpf[10]);
}
function rgIsValid(rg: string) {
  return rg.replace(/\D/g, "").length >= 7; // mock
}
function cepLookup(_cep: string) {
  // mock simples
  return { logradouro: "Rua Exemplo", bairro: "Centro", cidade: "São Paulo", estado: "SP", pais: "Brasil" };
}
function titleCase(s: string) {
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}