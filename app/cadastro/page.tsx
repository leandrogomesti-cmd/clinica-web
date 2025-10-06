// app/cadastro/page.tsx
import AppFrame from "@/components/app-frame";
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Select, Textarea } from "@/components/ui/primitives";
import requireRole from "@/lib/auth/requireRole";
import { revalidatePath } from "next/cache";

async function createPatient(formData: FormData) {
  "use server";
  const { supabase } = await requireRole(["staff", "admin"]);

  const payload = {
    full_name: String(formData.get("full_name") || ""),
    cpf: String(formData.get("cpf") || ""),
    birth_date: formData.get("birth_date") || null,
    marital_status: formData.get("marital_status") || null,
    gender: formData.get("gender") || null,
    phone: String(formData.get("phone") || ""),
    email: String(formData.get("email") || ""),
    job: String(formData.get("job") || ""),
    zip: String(formData.get("zip") || ""),
    state: String(formData.get("state") || ""),
    city: String(formData.get("city") || ""),
    district: String(formData.get("district") || ""),
    street: String(formData.get("street") || ""),
    number: String(formData.get("number") || ""),
    complement: String(formData.get("complement") || ""),
    notes: String(formData.get("notes") || ""),
  };

  const { error } = await supabase.from("patients").insert(payload);
  if (error) throw error;

  revalidatePath("/cadastro");
}

export default async function Page() {
  await requireRole(["staff", "admin"]);

  return (
    <AppFrame>
      <Card>
        <CardHeader><CardTitle>Cadastro de Paciente (Secretaria)</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <form action={createPatient} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input name="full_name" placeholder="Nome completo" className="col-span-2" />
              <Input name="cpf" placeholder="CPF" />
              <Input name="birth_date" type="date" placeholder="Data de Nascimento" />
              <Select name="marital_status"><option>Estado civil</option><option>Solteiro(a)</option><option>Casado(a)</option><option>Divorciado(a)</option><option>Viúvo(a)</option><option>União estável</option></Select>
              <Select name="gender"><option>Sexo</option><option>Feminino</option><option>Masculino</option><option>Outro</option><option>Prefiro não informar</option></Select>
              <Input name="phone" placeholder="Telefone" />
              <Input name="email" placeholder="Email" className="col-span-2" />
              <Input name="job" placeholder="Profissão" className="col-span-2" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input name="zip" placeholder="CEP" />
              <Input name="state" placeholder="UF" />
              <Input name="city" placeholder="Cidade" />
              <Input name="district" placeholder="Bairro" />
              <Input name="street" placeholder="Logradouro" className="col-span-2" />
              <Input name="number" placeholder="Número" />
              <Input name="complement" placeholder="Complemento" />
            </div>

            <Textarea name="notes" placeholder="Observações" />
            <div className="flex gap-2">
              <Button type="submit">Salvar em patients</Button>
              <Button type="reset" variant="outline">Limpar</Button>
            </div>
            <p className="text-xs text-gray-500">Fluxo cria direto em <code>patients</code> (sem aprovação).</p>
          </form>

          <div className="rounded-xl border p-4 bg-blue-50/40">
            <p className="text-sm font-medium mb-2">Sugestões de duplicidade</p>
            <div className="text-sm text-gray-500">Nenhum possível duplicado encontrado.</div>
          </div>
        </CardContent>
      </Card>
    </AppFrame>
  );
}