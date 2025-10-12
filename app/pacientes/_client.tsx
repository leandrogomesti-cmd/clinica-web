"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/primitives";
import { toast } from "sonner";

import { PacientesTable } from "@/components/pacientes/PacientesTable";
import { IntakeTable } from "@/components/pacientes/IntakeTable";
import { PacienteSheet } from "@/components/pacientes/PacienteSheet";
import { IntakeSheet } from "@/components/pacientes/IntakeSheet";

export default function PacientesClient() {
  const supabase = createClient();

  // ----- PACIENTES (mantém items/loading) -----
  const [q, setQ] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadPacientes() {
    setLoading(true);
    let query = supabase
      .from("patients")
      .select("id, full_name, phone, birth_date, email, created_at")
      .order(q ? "full_name" : "created_at", { ascending: !q })
      .limit(q ? 50 : 5);
    if (q.trim()) query = query.ilike("full_name", `%${q.trim()}%`);
    const { data, error } = await query;
    if (error) toast.error("Erro ao buscar pacientes");
    setItems(data ?? []);
    setLoading(false);
  }

  // ----- PENDENTES (INTAKE) -----
  const [intakeLoading, setIntakeLoading] = useState(true);
  const [pendentes, setPendentes] = useState<any[]>([]);
  const [openIntake, setOpenIntake] = useState(false);
  const [intakeId, setIntakeId] = useState<string | null>(null);

  async function loadPendentes() {
    setIntakeLoading(true);
    const { data, error } = await supabase
      .from("vw_pacientes_intake_ui")
      .select("id, nome, cpf, telefone, status, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (!error && data) {
      setPendentes(data);
      setIntakeLoading(false);
      return;
    }
    const fb = await supabase
      .from("pacientes_intake")
      .select("id, nome, cpf, telefone, status, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (fb.error) toast.error("Erro ao carregar pendências");
    setPendentes(fb.data ?? []);
    setIntakeLoading(false);
  }

  useEffect(() => {
    loadPacientes();
    loadPendentes();
  }, []);

  function onEditPaciente(id: string) {
    setEditingId(id);
    setOpenEdit(true);
  }

  function onVisualizarIntake(id: string) {
    setIntakeId(id);
    setOpenIntake(true);
  }

  async function onAprovarIntake(id: string) {
    const tries = [
      supabase.rpc("promover_intake_paciente", { intake_id: id }),
      supabase.rpc("promover_intake_paciente", { id }),
      supabase.rpc("promover_intake_paciente", { uuid: id }),
    ];
    let err: any = null;
    for (const t of tries) {
      const r = await t;
      if (!r.error) {
        toast.success("Autocadastro aprovado");
        setOpenIntake(false);
        await loadPendentes();
        await loadPacientes();
        return;
      }
      err = r.error;
    }
    toast.error(err?.message ?? "Falha ao aprovar");
  }

  return (
    <div className="p-6 space-y-8">
      {/* Pacientes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>Pacientes</CardTitle>
          <div className="flex gap-2 w-full max-w-md md:ml-auto">
            <Input
              placeholder="Buscar"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadPacientes()}
            />
            <Button onClick={loadPacientes}>Buscar</Button>
          </div>
        </CardHeader>
        <CardContent>
          <PacientesTable data={items} loading={loading} onEdit={onEditPaciente} />
        </CardContent>
      </Card>

      {/* Pendências */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pendências (Autocadastro)</CardTitle>
          <Button variant="outline" onClick={loadPendentes}>Atualizar</Button>
        </CardHeader>
        <CardContent>
          <IntakeTable data={pendentes} loading={intakeLoading} onView={onVisualizarIntake} />
        </CardContent>
      </Card>

      {/* Sheet Paciente */}
      <Sheet open={openEdit} onOpenChange={setOpenEdit}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader><SheetTitle>Editar paciente</SheetTitle></SheetHeader>
          {editingId && (
            <PacienteSheet
              id={editingId}
              onSaved={async () => { setOpenEdit(false); await loadPacientes(); }}
              onDeleted={async () => { setOpenEdit(false); await loadPacientes(); }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Sheet Intake */}
      <Sheet open={openIntake} onOpenChange={setOpenIntake}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader><SheetTitle>Autocadastro</SheetTitle></SheetHeader>
          {intakeId && (
            <IntakeSheet
              id={intakeId}
              onApproved={() => onAprovarIntake(intakeId)}
              onClose={() => setOpenIntake(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}