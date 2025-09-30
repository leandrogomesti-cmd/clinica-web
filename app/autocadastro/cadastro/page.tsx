'use client';
estado_civil: data.estado_civil || null,
cpf: onlyDigits(data.cpf),
rg: data.rg || null,
profissao: data.profissao || null,
phone: onlyDigits(data.telefone_whatsapp),
email: data.email || null,
cep: onlyDigits(data.cep),
logradouro: data.logradouro || null,
numero: data.numero || null,
complemento: data.complemento || null,
bairro: data.bairro || null,
city: data.cidade || null,
state: data.estado || null,
convenio: data.convenio || null,
numero_carteirinha: data.numero_carteirinha || null,
validade_carteirinha: data.validade_carteirinha || null,
titular_plano: data.titular_plano || null,
alergias: data.alergias || null,
medicamentos_uso: data.medicamentos_uso || null,
doencas_cronicas: data.doencas_cronicas || null,
historico_cirurgico: data.historico_cirurgico || null,
} as const;


const { error } = await supabase.from('patients').insert(payload);
if (error) {
setStatus({ ok: false, msg: error.message });
} else {
setStatus({ ok: true, msg: 'Paciente cadastrado com sucesso.' });
reset();
}
};


return (
<main className="space-y-4">
<h1 className="text-xl font-semibold">Cadastro de Paciente (Secretaria)</h1>
{status && (
<div className={`rounded border px-3 py-2 ${status.ok ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
{status.msg}
</div>
)}


{/* Copiar o mesmo formulário do /autocadastro e apontar os inputs para o react-hook-form */}
{/* Exemplo de alguns campos chave — os demais devem ser copiados idênticos ao /autocadastro */}
<form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
<div className="md:col-span-2">
<label className="mb-1 block text-sm">Nome completo *</label>
<input className="w-full rounded border px-3 py-2" {...register('nome')} />
{errors.nome && <p className="text-sm text-red-600">{errors.nome.message}</p>}
</div>


<div>
<label className="mb-1 block text-sm">Data de nascimento</label>
<input type="date" className="w-full rounded border px-3 py-2" {...register('data_nascimento')} />
</div>


<div>
<label className="mb-1 block text-sm">Telefone (WhatsApp) *</label>
<input className="w-full rounded border px-3 py-2" {...register('telefone_whatsapp')} />
{errors.telefone_whatsapp && <p className="text-sm text-red-600">{errors.telefone_whatsapp.message}</p>}
</div>


{/* ...copiar os demais campos do /autocadastro (CPF, RG, endereço, convênio, etc.) ... */}


<div className="md:col-span-2 mt-2">
<button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">Salvar</button>
</div>
</form>
</main>
);
}