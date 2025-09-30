'use client';
<label className="mb-1 block text-sm">Cidade</label>
<input className="w-full rounded border px-3 py-2" value={data.city || ''} onChange={(e)=>setData({ ...data!, city: e.target.value })} />
</div>
<div>
<label className="mb-1 block text-sm">Estado (UF)</label>
<input className="w-full rounded border px-3 py-2" value={data.state || ''} onChange={(e)=>setData({ ...data!, state: e.target.value })} />
</div>
<div>
<label className="mb-1 block text-sm">Convênio</label>
<input className="w-full rounded border px-3 py-2" value={data.convenio || ''} onChange={(e)=>setData({ ...data!, convenio: e.target.value })} />
</div>
<div>
<label className="mb-1 block text-sm">Carteirinha</label>
<input className="w-full rounded border px-3 py-2" value={data.numero_carteirinha || ''} onChange={(e)=>setData({ ...data!, numero_carteirinha: e.target.value })} />
</div>
<div>
<label className="mb-1 block text-sm">Validade da carteirinha</label>
<input type="date" className="w-full rounded border px-3 py-2" value={data.validade_carteirinha || ''} onChange={(e)=>setData({ ...data!, validade_carteirinha: e.target.value })} />
</div>
<div>
<label className="mb-1 block text-sm">Titular do plano</label>
<input className="w-full rounded border px-3 py-2" value={data.titular_plano || ''} onChange={(e)=>setData({ ...data!, titular_plano: e.target.value })} />
</div>
<div className="md:col-span-2">
<label className="mb-1 block text-sm">Alergias</label>
<textarea className="w-full rounded border px-3 py-2" value={data.alergias || ''} onChange={(e)=>setData({ ...data!, alergias: e.target.value })} />
</div>
<div className="md:col-span-2">
<label className="mb-1 block text-sm">Medicamentos de uso</label>
<textarea className="w-full rounded border px-3 py-2" value={data.medicamentos_uso || ''} onChange={(e)=>setData({ ...data!, medicamentos_uso: e.target.value })} />
</div>
<div className="md:col-span-2">
<label className="mb-1 block text-sm">Doenças crônicas</label>
<textarea className="w-full rounded border px-3 py-2" value={data.doencas_cronicas || ''} onChange={(e)=>setData({ ...data!, doencas_cronicas: e.target.value })} />
</div>
<div className="md:col-span-2">
<label className="mb-1 block text-sm">Histórico cirúrgico</label>
<textarea className="w-full rounded border px-3 py-2" value={data.historico_cirurgico || ''} onChange={(e)=>setData({ ...data!, historico_cirurgico: e.target.value })} />
</div>
</div>


<div className="flex items-center gap-3">
<button onClick={salvar} disabled={saving} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">{saving ? 'Salvando…' : 'Salvar'}</button>


{!confirmDelete ? (
<button onClick={()=>setConfirmDelete(true)} className="rounded border px-4 py-2 hover:bg-gray-100">Excluir</button>
) : (
<div className="inline-flex items-center gap-2 rounded border px-3 py-2">
<span>Você tem certeza que deseja excluir o paciente?</span>
<button onClick={excluir} className="rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-700">Sim</button>
<button onClick={()=>setConfirmDelete(false)} className="rounded border px-3 py-1.5 hover:bg-gray-100">Não</button>
</div>
)}
</div>
</main>
);
}