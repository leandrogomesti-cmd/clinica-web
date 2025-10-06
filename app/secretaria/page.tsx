// app/secretaria/page.tsx
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
import { revalidatePath } from "next/cache";

type IntakeRow = {
  id: string;
  created_at: string | null;
  nome: string | null;
  cpf: string | null;
  phone?: string | null;     // alguns bancos usam 'phone'
  telefone?: string | null;  // outros usam 'telefone'
};

async function promover(id: string) {
  "use server";
  const { supabase } = await requireRole(["staff", "admin"]);
  await supabase.rpc("promover_intake_paciente", { intake_id: id });
  revalidatePath("/secretaria");
}

async function rejeitar(id: string) {
  "use server";
  const { supabase } = await requireRole(["staff", "admin"]);
  await supabase.from("pacientes_intake").delete().eq("id", id);
  revalidatePath("/secretaria");
}

export default async function Page() {
  const { supabase } = await requireRole(["staff", "admin"]);

  // leitura segura (data: T[] | null) -> garante array
  const { data: rowsRaw, error } = await supabase
    .from("pacientes_intake")
    .select("id, created_at, nome, cpf, phone, telefone")
    .order("created_at", { ascending: false });

  const rows: IntakeRow[] = rowsRaw ?? [];

  const mask = (cpf: string | null | undefined) =>
    !cpf ? "—" : `***.***.***-${cpf.replace(/\D/g, "").slice(-2)}`;

  return (
    <AppFrame>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Pendências de Intake</CardTitle>
            <p className="text-sm text-gray-500">
              Aprove ou rejeite cadastros enviados
            </p>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Buscar…" className="w-[220px]" />
            <Select className="w-[150px]">
              <option>Todas</option>
              <option>Hoje</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <THead>
                <TRow>
                  <TH>Criado</TH>
                  <TH>Nome</TH>
                  <TH>CPF</TH>
                  <TH>Telefone</TH>
                  <TH className="text-right">Ações</TH>
                </TRow>
              </THead>
              <tbody>
                {rows.map((r) => (
                  <TRow key={r.id}>
                    <TD>
                      {r.created_at
                        ? new Date(r.created_at).toLocaleString("pt-BR")
                        : "—"}
                    </TD>
                    <TD>{r.nome || "—"}</TD>
                    <TD>{mask(r.cpf)}</TD>
                    <TD>{r.phone ?? r.telefone ?? "—"}</TD>
                    <TD className="text-right space-x-2">
                      <form
                        action={promover.bind(null, r.id)}
                        className="inline"
                      >
                        <Button size="sm">Aprovar</Button>
                      </form>
                      <form
                        action={rejeitar.bind(null, r.id)}
                        className="inline"
                      >
                        <Button size="sm" variant="outline">
                          Rejeitar
                        </Button>
                      </form>
                    </TD>
                  </TRow>
                ))}
                {rows.length === 0 && (
                  <TRow>
                    <TD className="text-center text-gray-500" colSpan={5}>
                      Sem registros
                    </TD>
                  </TRow>
                )}
              </tbody>
            </Table>
          </div>

          {error && (
            <div className="mt-3 text-xs text-amber-700">
              Erro ao ler <code>pacientes_intake</code>: {error.message}
            </div>
          )}
        </CardContent>
      </Card>
    </AppFrame>
  );
}