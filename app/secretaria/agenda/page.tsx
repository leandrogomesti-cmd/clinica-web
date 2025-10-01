// app/secretaria/agenda/page.tsx
import { createSupabaseServer } from "@/lib/supabase/server";
import { createSlot, deleteSlot } from "./actions";
import { redirect } from "next/navigation";

// ⬇️ ADICIONE estes tipos auxiliares no topo do arquivo:
type DoctorWithProfile = {
  id: string;
  profile_id: string;
  profiles: { full_name: string | null } | null; // 1:1 pelo profile_id
};

type SlotWithDoctor = {
  id: string;
  doctor_id: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  doctors: {
    profile_id: string;
    profiles: { full_name: string | null } | null;
  } | null;
};

export const dynamic = "force-dynamic";

export default async function Page() {
  const supabase = createSupabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();
  if (!profile || !["staff", "admin"].includes(profile.role)) redirect("/");

  // ⬇️ TIPAGEM explícita nos médicos
  const { data: doctors } = await supabase
    .from("doctors")
    .select("id, profile_id, profiles:profile_id(full_name)")
    .returns<DoctorWithProfile[]>();

  const now = new Date();
  const fromIso = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const toIso = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14).toISOString();

  // ⬇️ TIPAGEM explícita nos slots (com join do médico)
  const { data: slots } = await supabase
    .from("appointment_slots")
    .select(
      "id, doctor_id, starts_at, ends_at, capacity, doctors!inner(profile_id, profiles:profile_id(full_name))"
    )
    .gte("starts_at", fromIso)
    .lte("starts_at", toIso)
    .order("starts_at", { ascending: true })
    .returns<SlotWithDoctor[]>();

  function dtLocal(iso?: string) {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  }

  return (
    <main className="p-6 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Agenda — criar slots</h1>
        <p className="text-sm opacity-70">Olá, {profile.full_name ?? "Secretaria"}</p>
      </header>

      <form action={createSlot} className="grid gap-3 max-w-xl rounded-2xl p-4 border">
        <div className="grid gap-1">
          <label className="text-sm">Médico</label>
          <select name="doctor_id" required className="border rounded-lg p-2">
            <option value="">Selecione...</option>
            {doctors?.map((d) => (
              <option key={d.id} value={d.id}>
                {(d.profiles?.full_name ?? d.id)}
              </option>
            ))}
          </select>
        </div>
        {/* ... restante igual ... */}
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Próximos 14 dias</h2>
        <ul className="divide-y rounded-2xl border">
          {(slots ?? []).map((s) => (
            <li key={s.id} className="flex items-center justify-between p-3">
              <div className="space-y-1">
                <div className="font-medium">
                  {s.doctors?.profiles?.full_name ?? "Médico"}
                </div>
                <div className="text-sm opacity-75">
                  {new Date(s.starts_at).toLocaleString()} → {new Date(s.ends_at).toLocaleString()} • cap {s.capacity}
                </div>
              </div>
              <form action={deleteSlot}>
                <input type="hidden" name="id" value={s.id} />
                <button className="text-red-600 hover:underline">Excluir</button>
              </form>
            </li>
          ))}
          {(!slots || slots.length === 0) && (
            <li className="p-3 text-sm opacity-70">Sem slots no período.</li>
          )}
        </ul>
      </section>
    </main>
  );
}