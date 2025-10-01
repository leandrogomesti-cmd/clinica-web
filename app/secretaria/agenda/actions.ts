// app/secretaria/agenda/actions.ts
"use server";

import { z } from "zod";
import { createSupabaseServer } from "@/lib/supabase/server";

const SlotSchema = z.object({
  doctor_id: z.string().uuid(),
  starts_at: z.string().datetime(), // ISO de <input type="datetime-local"> convertido
  ends_at:   z.string().datetime(),
  capacity:  z.coerce.number().int().min(1).max(10),
});

async function requireStaff() {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Auth required");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || !["staff","admin"].includes(profile.role)) {
    throw new Error("Forbidden");
  }
  return supabase;
}

export async function createSlot(formData: FormData) {
  const supabase = await requireStaff();

  // receber como local e transformar para ISO em UTC
  const toISO = (v: string) => {
    // v: "2025-10-01T09:30" (sem timezone)
    const d = new Date(v);
    return d.toISOString();
  };

  const payload = {
    doctor_id: String(formData.get("doctor_id") || ""),
    starts_at: toISO(String(formData.get("starts_at") || "")),
    ends_at:   toISO(String(formData.get("ends_at") || "")),
    capacity:  Number(formData.get("capacity") || 1),
  };

  const parsed = SlotSchema.safeParse(payload);
  if (!parsed.success) throw new Error(parsed.error.issues.map(i => i.message).join(", "));

  const { error } = await supabase.from("appointment_slots").insert(parsed.data);
  if (error) throw error;
}

export async function deleteSlot(formData: FormData) {
  const supabase = await requireStaff();
  const id = String(formData.get("id") || "");
  if (!id) throw new Error("id is required");
  const { error } = await supabase.from("appointment_slots").delete().eq("id", id);
  if (error) throw error;
}
