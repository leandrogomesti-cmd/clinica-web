// app/secretaria/agenda/page.tsx
import { requireRole } from '@/lib/auth/requireRole'
import { createSupabaseServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'

// Tipagem do retorno com relacionamento 1:1 (profiles via FK doctors_profile_id_fkey)
type DoctorRow = {
  id: string
  profiles: { full_name: string } | null
}

export default async function Page() {
  await requireRole(['staff', 'doctor', 'admin'])
  const supabase = createSupabaseServer()

  // Médicos com nome vindo de profiles (1:1 pelo FK)
  const { data: doctors } = await supabase
    .from('doctors')
    .select('id, profiles:profiles!doctors_profile_id_fkey(full_name)')
    .returns<DoctorRow[]>()
    .order('id', { ascending: true })

  // Agendamentos simples para listar (ajuste campos conforme seu schema)
  const { data: appts } = await supabase
    .from('appointments')
    .select('id, starts_at, ends_at, doctor_id, patient_id, notes')
    .order('starts_at', { ascending: true })

  // Server Action: criar agendamento rápido
  async function criarAgendamento(formData: FormData) {
    'use server'
    await requireRole(['staff', 'doctor', 'admin'])
    const supa = createSupabaseServer()

    const doctor_id = String(formData.get('doctor_id') || '')
    const starts_at = String(formData.get('starts_at') || '')
    const ends_at = String(formData.get('ends_at') || '')
    const notes = String(formData.get('notes') || '')

    if (!doctor_id || !starts_at || !ends_at) return

    const { error } = await supa.from('appointments').insert({
      doctor_id,
      starts_at,
      ends_at,
      notes,
    })
    if (error) throw error

    revalidatePath('/secretaria/agenda')
  }

  return (
    <div className="space-y-4">
      <div className="k-accent-bar" />
      <Card>
        <CardHeader>
          <CardTitle>Agenda — Secretaria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulário simples para criar agendamento */}
          <form action={criarAgendamento} className="grid gap-3 md:grid-cols-4">
            <div className="md:col-span-1">
              <Select name="doctor_id">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o médico" />
                </SelectTrigger>
                <SelectContent>
                  {doctors?.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.profiles?.full_name ?? d.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input name="starts_at" type="datetime-local" className="md:col-span-1" />
            <Input name="ends_at" type="datetime-local" className="md:col-span-1" />
            <Input name="notes" placeholder="Observações" className="md:col-span-1" />

            <div className="md:col-span-4">
              <Button type="submit">Criar agendamento</Button>
            </div>
          </form>

          {/* Lista de próximos agendamentos (temporário) */}
          <div className="rounded-xl border p-3">
            <div className="text-sm font-medium mb-2">Próximos agendamentos</div>
            <pre className="text-xs">{JSON.stringify(appts, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}