// app/secretaria/page.tsx
'use server'
await requireRole(['staff','admin'])
const supabase = createSupabaseServer()
const id = formData.get('intake_id') as string
const { error } = await supabase.rpc('promover_intake_paciente', { intake_id: id })
if (error) throw error
revalidatePath('/secretaria')
}


return (
<div className="space-y-4">
<div className="k-accent-bar" />
<Card>
<CardHeader><CardTitle>Aprovação de Cadastro</CardTitle></CardHeader>
<CardContent className="space-y-3">
<div className="flex gap-2 items-center">
<Input placeholder="Buscar…" className="w-[240px]" />
</div>
<div className="space-y-2">
{pendentes?.map((p) => (
<form key={p.id} action={aprovar} className="flex items-center justify-between border rounded-xl p-3">
<div>
<div className="font-medium">{p.full_name}</div>
<div className="text-sm text-muted-foreground">CPF {p.cpf} · {p.phone}</div>
</div>
<input type="hidden" name="intake_id" value={p.id} />
<Button>Aprovar</Button>
</form>
))}
</div>
</CardContent>
</Card>
</div>
)
}