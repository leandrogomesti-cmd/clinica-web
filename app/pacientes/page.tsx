// app/pacientes/page.tsx
import AppFrame from "@/components/app-frame";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Select,
  Table,
  THead,
  TH,
  TRow,
  TD,
} from "@/components/ui/primitives";
import requireRole from "@/lib/auth/requireRole";

type Patient = {
  id: string;
  full_name: string | null;
  cpf: string | null;
  phone: string | null;
  email: string | null;
  created_at: string | null;
};

function maskCpf(cpf: string | null) {
  if (!cpf) return "—";
  const s = cpf.replace(/\D/g, "");
  if (s.length < 11) return "—";
  return `***.***.***-${s.slice(-2)}`;
}

export default async function Page() {
  const { supabase } = await requireRole(["staff", "doctor", "admin"]);

  const { data: patientsRaw, error } = await supabase
    .from("patients")
    .select("id, full_name, cpf, phone, email, created_at")
    .order("created_at", { ascending: false });

  // ✅ garante array (evita 'possibly null')
  const patients: Patient[] = patientsRaw ?? [];
  const first: Patient | null = patients[0] ?? null;

  return (
    <AppFrame>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Pacientes</CardTitle>
            <p className="text-sm text-gray-500">
              Lista com edição lateral e anexos
            </p>
          </div>
          <div className="flex gap-2 items-center">
            <Input placeholder="Buscar paciente" className="w-[220px]" />
            <Select className="w-[150px]">
              <option>Todos</option>
              <option>Novos</option>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="grid lg:grid-cols-[1fr_340px] gap-4">
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <THead>
                <TRow>
                  <TH>Nome</TH>
                  <TH>CPF</TH>
                  <TH>Telefone</TH>
                  <TH>Email</TH>
                  <TH />
                </TRow>
              </THead>
              <tbody>
                {patients.map((r) => (
                  <TRow key={r.id}>
                    <TD>{r.full_name || "—"}</TD>
                    <TD>{maskCpf(r.cpf)}</TD>
                    <TD>{r.phone || "—"}</TD>
                    <TD>{r.email || "—"}</TD>
                    <TD className="text-right">
                      <Button size="sm" variant="secondary">
                        Editar
                      </Button>
                    </TD>
                  </TRow>
                ))}
                {patients.length === 0 && (
                  <TRow>
                    <TD className="text-center text-gray-500" colSpan={5}>
                      Sem dados.
                    </TD>
                  </TRow>
                )}
              </tbody>
            </Table>
          </div>

          <div className="rounded-2xl border p-4 bg-gray-50 space-y-3">
            <p className="text-sm font-medium">Edição (Sheet)</p>
            <Input placeholder="Nome" defaultValue={first?.full_name ?? ""} />
            <Input placeholder="Telefone" defaultValue={first?.phone ?? ""} />
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Anexos</p>
              <div className="aspect-video rounded-lg border bg-white grid place-items-center text-gray-400">
                Arraste o arquivo aqui
              </div>
            </div>
            <div className="flex gap-2">
              <Button>Salvar</Button>
              <Button variant="outline">Cancelar</Button>
            </div>
            {error && (
              <div className="text-xs text-amber-700">
                Erro ao ler <code>patients</code>: {error.message}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </AppFrame>
  );
}