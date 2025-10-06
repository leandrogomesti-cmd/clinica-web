// app/admin/whatsapp-templates/page.tsx
import { requireRole } from '@/lib/auth/requireRole'
import { createSupabaseServer } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'


export default async function Page() {
await requireRole(['admin'])
const supabase = createSupabaseServer()
const { data: templates } = await supabase
.from('whatsapp_templates')
.select('*')


return (
<Card>
<CardHeader><CardTitle>WhatsApp Templates</CardTitle></CardHeader>
<CardContent>
<pre className="text-xs">{JSON.stringify(templates, null, 2)}</pre>
</CardContent>
</Card>
)
}