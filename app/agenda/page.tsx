// app/agenda/page.tsx
import { requireRole } from '@/lib/auth/requireRole'
import { createSupabaseServer } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'


export default async function Page() {
await requireRole(['staff','doctor','admin'])
const supabase = createSupabaseServer()
const { data: appts } = await supabase
.from('appointments')
.select('id, starts_at, ends_at, patient_id, notes')
.order('starts_at')


return (
<Card>
<CardHeader><CardTitle>Agenda</CardTitle></CardHeader>
<CardContent>
<pre className="text-xs">{JSON.stringify(appts, null, 2)}</pre>
</CardContent>
</Card>
)
}