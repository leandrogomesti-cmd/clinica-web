// app/cadastro/page.tsx
import requireRole from "@/lib/auth/requireRole";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function salvarPaciente(formData: FormData) {
  "use server";
  const { supabase } = await requireRole(["staff", "admin"]);

  const payload = {
    full_name: formData.get("full_name") || null,
    birth_date: formData.get("birth_date") || null,
    sex: formData.get("sex") || null,
    cpf: formData.get("cpf") || null,
    rg: formData.get("rg") || null,
    phone: formData.get("phone") || null,
    phone_home: formData.get("phone_home") || null,
    email: formData.get("email") || null,
    profession: formData.get("profession") || null,
    notes: formData.get("notes") || null,
    cep: formData.get("cep") || null,
    street: formData.get("street") || null,
    number: formData.get("number") || null,
    complement: formData.get("complement") || null,
    district: formData.get("district") || null,
    city: formData.get("city") || null,
    state: formData.get("state") || null,
  };

  const { error } = await supabase.from("patients").insert(payload as any);
  if (error) console.error(error);

  revalidatePath("/pacientes");
}

export default async function CadastroPage() {
  await requireRole(["staff", "admin"]);

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Cadastro de Paciente</h1>

      <form action={salvarPaciente} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm">Nome completo</span>
            <input
              name="full_name"
              className="h-10 w-full rounded-md border px-3"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm">Data de nascimento</span>
            <input
              type="date"
              name="birth_date"
              className="h-10 w-full rounded-md border px-3"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm">Sexo</span>
            <select name="sex" className="h-10 w-full rounded-md border px-3">
              <option value="">Não informado</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm">Estado civil</span>
            <select name="marital_status" className="h-10 w-full rounded-md border px-3">
              <option value="">Não informado</option>
              <option value="solteiro(a)">Solteiro(a)</option>
              <option value="casado(a)">Casado(a)</option>
              <option value="divorciado(a)">Divorciado(a)</option>
              <option value="viúvo(a)">Viúvo(a)</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm">CPF</span>
            <input name="cpf" className="h-10 w-full rounded-md border px-3" />
          </label>

          <label className="grid gap-2">
            <span className="text-sm">RG</span>
            <input name="rg" className="h-10 w-full rounded-md border px-3" />
          </label>

          <label className="grid gap-2">
            <span className="text-sm">Telefone (WhatsApp)</span>
            <input name="phone" className="h-10 w-full rounded-md border px-3" />
          </label>

          <label className="grid gap-2">
            <span className="text-sm">Telefone fixo</span>
            <input
              name="phone_home"
              className="h-10 w-full rounded-md border px-3"
            />
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm">E-mail</span>
            <input name="email" type="email" className="h-10 w-full rounded-md border px-3" />
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm">Profissão</span>
            <input name="profession" className="h-10 w-full rounded-md border px-3" />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <label className="grid gap-2">
            <span className="text-sm">CEP</span>
            <input name="cep" className="h-10 w-full rounded-md border px-3" />
          </label>
          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm">Logradouro</span>
            <input name="street" className="h-10 w-full rounded-md border px-3" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm">Número</span>
            <input name="number" className="h-10 w-full rounded-md border px-3" />
          </label>
          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm">Complemento</span>
            <input name="complement" className="h-10 w-full rounded-md border px-3" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm">Bairro</span>
            <input name="district" className="h-10 w-full rounded-md border px-3" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm">Cidade</span>
            <input name="city" className="h-10 w-full rounded-md border px-3" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm">UF</span>
            <input name="state" className="h-10 w-full rounded-md border px-3" />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm">Observações</span>
          <textarea
            name="notes"
            rows={3}
            className="w-full rounded-md border px-3 py-2"
          />
        </label>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          >
            Salvar em patients
          </button>
          <button
            type="reset"
            className="rounded-md border px-4 py-2 hover:bg-muted"
          >
            Limpar
          </button>
        </div>
      </form>
    </>
  );
}