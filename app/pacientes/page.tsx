'use client';


if (search.trim()){
const s = `%${search.trim()}%`;
query = query.or(`full_name.ilike.${s},cpf.ilike.${s},rg.ilike.${s}`);
}


const { data, error } = await query;
if (error) setError(error.message);
setRows(data || []);
setLoading(false);
}


useEffect(() => { load(''); }, []);


const filtered = rows; // já filtrado no banco; manter para futura paginação


return (
<main className="space-y-4">
<div className="flex items-center justify-between gap-2">
<h1 className="text-xl font-semibold">Pacientes</h1>
<Link href="/cadastro" className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">Adicionar</Link>
</div>


<div className="flex gap-2">
<input
value={q}
onChange={(e)=>setQ(e.target.value)}
onKeyDown={(e)=> e.key==='Enter' && load(q)}
placeholder="Buscar por nome, CPF ou RG"
className="w-full rounded border p-2"
/>
<button onClick={()=>load(q)} className="rounded border px-3 py-2 hover:bg-gray-100">Buscar</button>
<button onClick={()=>{ setQ(''); load(''); }} className="rounded border px-3 py-2 hover:bg-gray-100">Limpar</button>
</div>


{error && <p className="text-sm text-red-600">{error}</p>}


<table className="w-full border-collapse bg-white">
<thead>
<tr className="border-b bg-gray-50 text-left">
<th className="p-2">Nome</th>
<th className="p-2">Telefone</th>
<th className="p-2">CPF</th>
<th className="p-2">RG</th>
<th className="p-2">Criado</th>
<th className="p-2 w-24">Ações</th>
</tr>
</thead>
<tbody>
{filtered.map(p => (
<tr key={p.id} className="border-b">
<td className="p-2">{p.full_name || '—'}</td>
<td className="p-2">{p.phone || '—'}</td>
<td className="p-2">{p.cpf || '—'}</td>
<td className="p-2">{p.rg || '—'}</td>
<td className="p-2">{p.created_at ? new Date(p.created_at).toLocaleString() : '—'}</td>
<td className="p-2">
<Link href={`/pacientes/${p.id}/editar`} className="rounded border px-2 py-1 text-sm hover:bg-gray-100">Editar</Link>
</td>
</tr>
))}
{!filtered.length && !loading && (
<tr><td colSpan={6} className="p-6 text-center text-gray-500">Nenhum paciente encontrado</td></tr>
)}
</tbody>
</table>


{loading && <p className="text-sm text-gray-500">Carregando…</p>}
</main>
);
}