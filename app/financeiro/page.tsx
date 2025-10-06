// app/financeiro/page.tsx
import { requireRole } from "@/lib/auth/requireRole"
import { createSupabaseServer } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Page() {
  await requireRole(["staff", "admin"])
  const supabase = createSupabaseServer()
  const { data: resumo } = await supabase
    .from("v_financeiro_resumo")
    .select("mes, total_cents")
    .order("mes", { ascending: true })

  return (
    <Card>
      <CardHeader><CardTitle>Financeiro</CardTitle></CardHeader>
      <CardContent>
        <pre className="text-xs">{JSON.stringify(resumo, null, 2)}</pre>
      </CardContent>
    </Card>
  )
}