// app/demo/atendimento/page.tsx
"use client";
import { useMemo, useState } from "react";

const pacientes = [
  { id: "p1", nome: "Maria da Silva", nascimento: "12/10/1977" },
  { id: "p2", nome: "João Pereira", nascimento: "08/08/1988" },
  { id: "p3", nome: "Carlos Andrade", nascimento: "03/02/1990" },
];
const medicamentos = [
  "Maleato de timolol 0,5%",
  "Latanoprosta 0,005%",
  "Acetazolamida 250 mg",
  "Colírio lubrificante (carboximetilcelulose)",
  "Ciprofloxacino 0,3% (colírio)"
];

function hojeBR() { return new Date().toLocaleDateString("pt-BR"); }

export default function AtendimentoDemoPage() {
  const [pacId, setPacId] = useState("p1");
  const paciente = useMemo(() => pacientes.find(p => p.id === pacId)!, [pacId]);

  const [subjetivo, setSubjetivo] = useState("");
  const [exame, setExame] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [conduta, setConduta] = useState("");

  const [resumoIA, setResumoIA] = useState("");
  const [condutasIA, setCondutasIA] = useState<string[]>([]);
  const [retornoSugerido, setRetornoSugerido] = useState<string>("");

  const [ditado, setDitado] = useState("");
  const [receita, setReceita] = useState("");

  function gerarResumoIA() {
    const r = [
      `Paciente: ${paciente.nome}.`,
      subjetivo && `Queixa principal: ${subjetivo}.`,
      exame && `Exame oftalmológico: ${exame}.`,
      diagnostico && `Diagnóstico: ${diagnostico}.`,
      conduta && `Conduta: ${conduta}.`,
      `Retorno sugerido: ${retornoSugerido || "30 dias"}.`
    ].filter(Boolean).join(" ");
    setResumoIA(r);
  }
  function sugerirCondutas() {
    setCondutasIA([
      "PAF + tonometria seriada por 1 semana",
      "Higiene palpebral + lágrimas artificiais 6/6h",
      "Reavaliar PIO e disco óptico em 30 dias",
      "Solicitar campo visual se persistir suspeita",
    ]);
  }
  function sugerirRetorno() {
    const base = /glaucoma/i.test(diagnostico) ? 30 : 60;
    setRetornoSugerido(`${base} dias`);
  }
  function gerarReceita() {
    const linhas = ditado
      ? ditado.split(/\n+/).map(s => s.trim()).filter(Boolean)
      : ["Latanoprosta 0,005% – 1 gota à noite, ambos os olhos, por 30 dias."];
    const texto =
`CLÍNICA DEMO – PRESCRIÇÃO MÉDICA
Paciente: ${paciente.nome} • Nasc.: ${paciente.nascimento}
Data: ${hojeBR()}

Medicamentos:
${linhas.map((l, i) => ` ${i + 1}. ${l}`).join("\n")}

Orientações:
- Retornar em ${retornoSugerido || "30 dias"} ou antes se necessário.
- Em caso de reação adversa, suspender e procurar o serviço.

______________________________
CRM 123456 – Dr(a). Exemplo`;
    setReceita(texto);
    setTimeout(() => window.print(), 50);
  }

  const [historico, setHistorico] = useState<{ data: string; texto: string }[]>([
    { data: "05/10/2025", texto: "Consulta de rotina; sem alterações" },
  ]);
  function salvarAtendimento() {
    setHistorico((prev) => [
      ...prev,
      { data: hojeBR(), texto: `Subjetivo: ${subjetivo}\nExame: ${exame}\nDiagnóstico: ${diagnostico}\nConduta: ${conduta}` },
    ]);
    alert("Atendimento salvo (demo)");
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <h1 className="text-2xl font-semibold">
            Atendimento — <span className="text-blue-700">{paciente.nome}</span>
          </h1>
          <p className="text-sm text-slate-500">Nasc.: {paciente.nascimento} • Data: {hojeBR()}</p>
        </div>
        <div className="w-full md:w-72">
          <label className="text-sm">Trocar paciente</label>
          <select className="mt-1 border rounded-xl px-3 py-2 w-full" value={pacId} onChange={e=>setPacId(e.target.value)}>
            {pacientes.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Subjetivo / Exame / Diagnóstico / Conduta">
          <div className="grid gap-3">
            <Label>Subjetivo</Label>
            <Textarea rows={4} value={subjetivo} onChange={(e)=>setSubjetivo(e.target.value)} />
            <Label>Exame Oftalmológico</Label>
            <Textarea rows={4} value={exame} onChange={(e)=>setExame(e.target.value)} />
            <Label>Diagnóstico</Label>
            <Input value={diagnostico} onChange={(e)=>setDiagnostico(e.target.value)} />
            <Label>Conduta</Label>
            <Textarea rows={3} value={conduta} onChange={(e)=>setConduta(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <button className="px-3 py-2 rounded-xl border" onClick={salvarAtendimento}>Salvar</button>
            <button className="px-3 py-2 rounded-xl border" onClick={gerarResumoIA}>Resumo IA</button>
            <button className="px-3 py-2 rounded-xl border" onClick={sugerirCondutas}>Condutas sugeridas</button>
            <button className="px-3 py-2 rounded-xl border" onClick={sugerirRetorno}>Sugerir retorno</button>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="Resumo automático">
            <Textarea rows={6} value={resumoIA} onChange={(e)=>setResumoIA(e.target.value)} placeholder="O resumo gerado aparecerá aqui…" />
            {retornoSugerido && <p className="text-sm text-slate-600 mt-2">Retorno sugerido: <b>{retornoSugerido}</b></p>}
            {condutasIA.length > 0 && (
              <ul className="list-disc pl-5 text-sm mt-2">
                {condutasIA.map((c,i)=> <li key={i}>{c}</li>)}
              </ul>
            )}
          </Card>

          <Card title="Prescrição — por “ditado”">
            <p className="text-xs text-slate-500 mb-2">Selecione rapidamente:</p>
            <div className="flex gap-2 flex-wrap">
              {medicamentos.map((m, i) => (
                <button key={i} className="px-2 py-1 text-xs rounded-lg border" onClick={()=>setDitado(d=> (d ? d + "\n" : "") + m)}>{m}</button>
              ))}
            </div>
            <Textarea rows={4} value={ditado} onChange={(e)=>setDitado(e.target.value)} placeholder="Ex.: Latanoprosta 0,005% – 1 gota à noite..." />
            <div className="flex gap-2 mt-2">
              <button className="px-3 py-2 rounded-xl border" onClick={gerarReceita}>Gerar & Imprimir</button>
              <button className="px-3 py-2 rounded-xl border" onClick={()=>setReceita("")}>Limpar</button>
            </div>
            {receita && (
              <>
                <div className="text-sm font-medium pt-2">Pré-visualização</div>
                <Textarea readOnly rows={10} value={receita} className="font-mono" />
              </>
            )}
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
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="rounded-2xl border bg-white p-5 shadow-sm"><h3 className="font-semibold mb-3">{title}</h3>{children}</div>;
}
function Label({ children }: { children: React.ReactNode }) { return <label className="text-sm text-slate-700">{children}</label>; }
function Input(props: any) { return <input {...props} className={`border rounded-xl px-3 py-2 w-full ${props.className || ""}`} />; }
function Textarea(props: any) { return <textarea {...props} className={`border rounded-xl p-3 w-full ${props.className || ""}`} />; }
