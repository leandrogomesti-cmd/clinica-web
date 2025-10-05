// app/pacientes/page.tsx
import { requireRole } from '@/lib/auth/requireRole'
import { createSupabaseServer } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'


export default async function Page() {
await requireRole(['staff','doctor','admin'])
const supabase = createSupabaseServer()
const { data: pacientes } = await supabase
.from('patients')
.select('id, full_name, cpf, phone, email')
.order('full_name')


return (
<Card>
<CardHeader><CardTitle>Pacientes</CardTitle></CardHeader>
<CardContent>
<pre className="text-xs">{JSON.stringify(pacientes, null, 2)}</pre>
</CardContent>
</Card>
)
}