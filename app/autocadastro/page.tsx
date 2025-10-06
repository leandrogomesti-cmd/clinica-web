// app/autocadastro/page.tsx
}


return (
<div className="max-w-3xl mx-auto space-y-4">
<BrandLogo />
<div className="k-accent-bar" />
<Card>
<CardHeader><CardTitle>Autocadastro</CardTitle></CardHeader>
<CardContent className="space-y-4">
<form action={onSubmit} className="space-y-3">
<div className="grid grid-cols-2 gap-3">
<Input name="full_name" placeholder="Nome completo" className="col-span-2" required />
<Input name="cpf" placeholder="CPF" required />
<Input name="birth_date" type="date" placeholder="Data de Nascimento" />
<Select name="marital_status">
<SelectTrigger><SelectValue placeholder="Estado civil"/></SelectTrigger>
<SelectContent>
<SelectItem value="solteiro">Solteiro(a)</SelectItem>
<SelectItem value="casado">Casado(a)</SelectItem>
<SelectItem value="divorciado">Divorciado(a)</SelectItem>
<SelectItem value="viuvo">Viúvo(a)</SelectItem>
<SelectItem value="uniao_estavel">União estável</SelectItem>
</SelectContent>
</Select>
<Select name="sex">
<SelectTrigger><SelectValue placeholder="Sexo"/></SelectTrigger>
<SelectContent>
<SelectItem value="feminino">Feminino</SelectItem>
<SelectItem value="masculino">Masculino</SelectItem>
<SelectItem value="outro">Outro</SelectItem>
<SelectItem value="nao_informar">Prefiro não informar</SelectItem>
</SelectContent>
</Select>
<Input name="phone" placeholder="Telefone" />
<Input name="email" placeholder="Email (opcional)" className="col-span-2" />
<Input name="profession" placeholder="Profissão" className="col-span-2" />
</div>
<div className="grid grid-cols-2 gap-3">
<Input name="cep" placeholder="CEP" />
<Input name="uf" placeholder="UF" />
<Input name="city" placeholder="Cidade" />
<Input name="district" placeholder="Bairro" />
<Input name="address" placeholder="Logradouro" className="col-span-2" />
<Input name="address_number" placeholder="Número" />
<Input name="address_complement" placeholder="Complemento" />
</div>
<Textarea name="notes" placeholder="Observações" />
<Button disabled={loading}>{loading ? 'Enviando…' : 'Enviar'}</Button>
</form>
</CardContent>
</Card>
</div>
)
}