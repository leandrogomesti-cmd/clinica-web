"use client";

import React, { useMemo, useState } from "react";

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
    | "relatorios";
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
      <div className="mb-3 text-sm font-semibold text-slate-600">
        KlinikIA (Demo)
      </div>
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
  const [confirmDialog, setConfirmDialog] = useState<null | {
    nome: string;
    data: string;
    hora: string;
  }>(null);

  const agendadosHoje = [
    { nome: "Maria da Silva", hora: "14:00", confirmado: true, data: "12/10/2025" },
    { nome: "João Pereira", hora: "15:00", confirmado: false, data: "12/10/2025" },
    { nome: "Carlos Andrade", hora: "16:00", confirmado: true, data: "12/10/2025" },
  ];
  const pagamentosHoje = [
    { desc: "Consulta clínica · Maria da Silva", valor: 250 },
    { desc: "Retorno · João Pereira", valor: 0 },
    { desc: "Aluguel da clínica", valor: 3000 },
  ];

  const totalAg = agendadosHoje.length;
  const naoConf = agendadosHoje.filter((a) => !a.confirmado).length;

  function openConfirm(a: (typeof agendadosHoje)[number]) {
    setConfirmDialog({ nome: a.nome, data: a.data, hora: a.hora });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Dashboard (Demo)</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Kpi title="Pacientes do dia" value={String(totalAg)} />
        <Kpi
          title="Não confirmados"
          value={String(naoConf)}
          subtitle={<span className="text-blue-700">Enviar confirmação</span>}
        />
        <Kpi title="No-show (semana)" value="12%" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title={`Agendados hoje (${totalAg})`}>
          {agendadosHoje.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border p-3"
            >
              <div className="space-y-1">
                <b>{a.nome}</b>
                <div className="text-slate-500 text-xs">{a.hora}</div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-semibold rounded-full px-2 py-1 ${
                    a.confirmado
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {a.confirmado ? "Confirmado" : "Pendente"}
                </span>
                {!a.confirmado && (
                  <button
                    className="px-2 py-1 text-xs rounded-lg border"
                    onClick={() => openConfirm(a)}
                  >
                    Confirmar
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="pt-2 text-sm text-blue-600 underline cursor-pointer">
            Ir para Agenda
          </div>
        </Card>

        <Card title="Pagamentos de hoje">
          {pagamentosHoje.map((p, i) => (
            <Row
              key={i}
              left={<span>{p.desc}</span>}
              right={
                <b>
                  R$ {p.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </b>
              }
            />
          ))}
          <div className="pt-2 text-sm text-blue-600 underline cursor-pointer">
            Ir para Financeiro
          </div>
        </Card>
      </div>

      <Card title="Insights da IA">
        <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
          <li>
            Taxa de não-comparecimento estimada para amanhã: <b>10%</b> (2
            pacientes) · risco maior às 14h.
          </li>
          <li>
            Projeção de faturamento da semana: <b>R$ 12.400</b> com base nos
            agendamentos + histórico.
          </li>
          <li>3 pacientes pediram retorno nos últimos 7 dias. Agendar agora.</li>
        </ul>
      </Card>

      {/* Modal de confirmação */}
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
                  window.open(
                    `https://wa.me/5511999999999?text=${msg}`,
                    "_blank"
                  );
                  setConfirmDialog(null);
                }}
              >
                Confirmar manualmente (abrir WhatsApp)
              </button>
              <button
                className="w-full px-3 py-2 rounded-xl border"
                onClick={() => setConfirmDialog(null)}
              >
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
function Agenda() {
  type C = {
    id: string;
    paciente: string;
    medico: string;
    data: string;
    hora: string;
    status: "pendente" | "confirmada" | "atendida";
  };
  const seed: C[] = [
    { id: "1", paciente: "Maria da Silva", medico: "Dra. Paula", data: "12/10/2025", hora: "14:00", status: "confirmada" },
    { id: "2", paciente: "João Pereira",  medico: "Dra. Paula", data: "12/10/2025", hora: "15:00", status: "pendente" },
    { id: "3", paciente: "Carlos Andrade", medico: "Dra. Paula", data: "12/10/2025", hora: "16:00", status: "pendente" },
  ];
  const [items, setItems] = useState<C[]>(seed);
  const [form, setForm] = useState<C>({ id: "", paciente: "", medico: "Dra. Paula", data: "", hora: "", status: "pendente" });
  const [view, setView] = useState<"hoje" | "semana">("hoje");

  function reset() {
    setForm({ id: "", paciente: "", medico: "Dra. Paula", data: "", hora: "", status: "pendente" });
  }
  function salvar() {
    if (!form.paciente || !form.data || !form.hora) {
      alert("Preencha paciente/data/hora");
      return;
    }
    if (form.id) setItems((prev) => prev.map((x) => (x.id === form.id ? form : x)));
    else setItems((prev) => [...prev, { ...form, id: String(Date.now()) }]);
    reset();
  }
  function editar(id: string) { setForm(items.find((x) => x.id === id)!); }
  function excluir(id: string) { if (confirm("Excluir consulta?")) setItems((prev) => prev.filter((x) => x.id !== id)); }
  function confirmarWhatsApp(c: C) {
    const msg = encodeURIComponent(`Olá ${c.paciente}! Confirmamos sua consulta em ${c.data} às ${c.hora}.`);
    alert(`Abriria: https://wa.me/5511999999999?text=${msg}`);
  }
  function marcarConfirmada(id: string, v: boolean) {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status: v ? "confirmada" : "pendente" } : x)));
  }

  const hoje = "12/10/2025";
  const horas = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Agenda</h1>

      <div className="rounded-2xl border bg-white p-4 space-y-2">
        {items.map((c) => (
          <div
            key={c.id}
            className={`flex items-center justify-between rounded-xl border p-3 ${
              c.status === "atendida"
                ? "bg-red-50"
                : c.status === "confirmada"
                ? "bg-blue-50"
                : "bg-white"
            }`}
          >
            <div className="space-y-0.5">
              <div className="font-medium">{c.paciente}</div>
              <div className="text-xs text-slate-500">
                {c.data} • {c.hora} • {c.medico}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-2 py-1 text-xs rounded-lg border" onClick={() => editar(c.id)}>
                Editar
              </button>
              <button className="px-2 py-1 text-xs rounded-lg border" onClick={() => excluir(c.id)}>
                Excluir
              </button>
              <button className="px-2 py-1 text-xs rounded-lg border" onClick={() => confirmarWhatsApp(c)}>
                WhatsApp
              </button>
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
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.status === "confirmada"} onChange={(e) => setForm({ ...form, status: e.target.checked ? "confirmada" : "pendente" })}/>
          Confirmar consulta
        </label>
        <div className="flex gap-2">
          <button className="px-3 py-2 rounded-xl border" onClick={salvar}>{form.id ? "Salvar alterações" : "Adicionar"}</button>
          <button className="px-3 py-2 rounded-xl border" onClick={reset}>Limpar</button>
        </div>

        <hr className="my-4" />
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold mr-2">Visualização:</span>
          <button className={`px-2 py-1 rounded-lg border ${view === "hoje" ? "bg-slate-900 text-white" : "bg-white"}`} onClick={() => setView("hoje")}>Hoje</button>
          <button className={`px-2 py-1 rounded-lg border ${view === "semana" ? "bg-slate-900 text-white" : "bg-white"}`} onClick={() => setView("semana")}>Semanal</button>
        </div>

        {view === "hoje" ? (
          <div className="mt-3 border rounded-xl overflow-hidden">
            {horas.map((h) => {
              const ev = items.find((x) => x.data === hoje && x.hora === h);
              return (
                <div key={h} className="flex justify-between px-3 py-2 border-t first:border-t-0">
                  <div className="text-xs text-slate-500 w-16">{h}</div>
                  <div className="flex-1">
                    {ev ? (
                      <div className={`px-3 py-2 rounded-lg inline-flex items-center gap-3 ${ev.status === "confirmada" ? "bg-blue-50" : "bg-slate-100"}`}>
                        <span className="text-sm">{ev.paciente}</span>
                        <label className="text-xs flex items-center gap-1">
                          <input type="checkbox" checked={ev.status === "confirmada"} onChange={(e) => marcarConfirmada(ev.id, e.target.checked)} /> Confirmada
                        </label>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">— livre —</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-3">
            <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500 mb-2">
              {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map((d) => (<div key={d}>{d}</div>))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map((_, i) => (
                <div key={i} className="min-h-[120px] border rounded-xl p-2 text-xs space-y-1">
                  {items.filter((x) => x.data === hoje).map((x) => (
                    <div key={x.id} className={`px-2 py-1 rounded ${x.status === "confirmada" ? "bg-blue-50" : "bg-slate-100"}`}>
                      {x.hora} — {x.paciente}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
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
function Atendimento() {
  const seedPacientes = ["Maria da Silva", "João Pereira", "Carlos Andrade"];

  // ler paciente pré-selecionado ao clicar "Atender"
  const [preselect] = React.useState<string | null>(() =>
    typeof window !== "undefined"
      ? window.localStorage.getItem("klinikia.atendimento.paciente")
      : null
  );

  const pacientes = React.useMemo(() => {
    const arr = [...seedPacientes];
    if (preselect && !arr.includes(preselect)) arr.unshift(preselect);
    return arr;
  }, [preselect]);

  const [paciente, setPaciente] = useState(pacientes[0]);

  const [subjetivo, setSubjetivo] = useState("");
  const [exame, setExame] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [conduta, setConduta] = useState("");
  const [itens, setItens] = useState<string[]>([]);
  const [novoItem, setNovoItem] = useState("");
  const [historico, setHistorico] = useState<{ data: string; texto: string }[]>(
    [{ data: "05/10/2025", texto: "Consulta de rotina; sem alterações" }]
  );
  const medicamentos = [
    "Dipirona 500mg",
    "Ibuprofeno 400mg",
    "Colírio Lubrificante",
    "Prednisolona 20mg",
  ];

  function addItem() {
    if (!novoItem) return;
    setItens((prev) => [...prev, novoItem]);
    setNovoItem("");
  }
  function gerarPrescricao() {
    const meds = itens.map((m, i) => `${i + 1}. ${m}`).join("\n");
    alert(`Print da prescrição de ${paciente}:

${meds}`);
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

  // IA (demo)
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
    alert(
      `Condutas sugeridas (apoio, não substitui julgamento clínico): • ${lista}

Fonte: Diretriz fictícia SBO 2024`
    );
  }
  function sugerirRetorno() {
    const dias = diagnostico.toLowerCase().includes("blefarite") ? 15 : 30;
    alert(`Sugerir retorno automático para ${paciente} em ${dias} dias.`);
  }
  function ditadoParaReceita() {
    const falado =
      prompt(
        "Dite/cole sua receita (demo)",
        "Colírio lubrificante 1 gota 6/6h por 14 dias"
      ) || "";
    setItens((prev) => [...prev, falado]);
  }

  return (
    <div className="space-y-4">
      <Card title={`Atendimento — ${paciente}`}>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <Label>Paciente</Label>
              <select
                className="border rounded-xl px-3 py-2 w-full"
                value={paciente}
                onChange={(e) => setPaciente(e.target.value)}
              >
                {pacientes.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Subjetivo</Label>
              <textarea className="border rounded-xl p-3 min-h-[90px] w-full" value={subjetivo} onChange={(e) => setSubjetivo(e.target.value)} />
            </div>
            <div>
              <Label>Exame Oftalmológico</Label>
              <textarea className="border rounded-xl p-3 min-h-[90px] w-full" value={exame} onChange={(e) => setExame(e.target.value)} />
            </div>
            <div>
              <Label>Diagnóstico</Label>
              <textarea className="border rounded-xl p-3 min-h-[90px] w-full" value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} />
            </div>
            <div>
              <Label>Conduta</Label>
              <textarea className="border rounded-xl p-3 min-h-[90px] w-full" value={conduta} onChange={(e) => setConduta(e.target.value)} />
            </div>

            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-2 rounded-xl border" onClick={salvarAtendimento}>Salvar</button>
              <button className="px-3 py-2 rounded-xl border" onClick={sugerirResumoIA}>Sugerir resumo (IA)</button>
              <button className="px-3 py-2 rounded-xl border" onClick={sugerirCondutas}>Condutas sugeridas</button>
              <button className="px-3 py-2 rounded-xl border" onClick={sugerirRetorno}>Sugerir retorno</button>
            </div>
          </div>

          <Card title="Prescrição">
            <div className="flex gap-2">
              <input className="border rounded-xl px-3 py-2 w-full" list="med-list" placeholder="Buscar medicamento" value={novoItem} onChange={(e) => setNovoItem(e.target.value)} />
              <datalist id="med-list">
                {medicamentos.map((m) => (<option key={m} value={m} />))}
              </datalist>
              <button className="px-3 py-2 rounded-xl border" onClick={addItem}>Adicionar</button>
              <button className="px-3 py-2 rounded-xl border" onClick={ditadoParaReceita}>Dictar → Receita</button>
            </div>
            <ul className="list-disc pl-5 mt-3 text-sm">
              {itens.map((m, i) => (<li key={i}>{m}</li>))}
            </ul>
            <button className="mt-3 px-3 py-2 rounded-xl border" onClick={gerarPrescricao}>Imprimir prescrição</button>
          </Card>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <input
        className={`border rounded-xl px-3 py-2 w-full ${error ? "border-rose-400 bg-rose-50" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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