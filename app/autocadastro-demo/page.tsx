// app/autocadastro-demo/page.tsx
"use client";
import { useState } from "react";

export default function AutoCadastroDemo(){
  const [form, setForm] = useState({ nome: "", nascimento: "", telefone: "", email: "" });
  const [enviado, setEnviado] = useState(false);

  function enviar(){
    if(!form.nome){ alert("Informe o nome"); return; }
    setEnviado(true);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h2 className="text-xl font-semibold">Autocadastro (Demo)</h2>
      {!enviado ? (
        <>
          <div className="rounded-2xl border bg-white p-4">
            <p className="text-sm text-slate-600 mb-3">Leia e aceite para continuar:</p>
            <div className="text-xs bg-slate-50 p-3 rounded-xl border">Termo de consentimento fictício...</div>
          </div>
          <div className="rounded-2xl border bg-white p-4 grid gap-2">
            <input className="border rounded-xl px-3 py-2" placeholder="Nome" value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})} />
            <input className="border rounded-xl px-3 py-2" placeholder="Nascimento (dd/mm/aaaa)" value={form.nascimento} onChange={e=>setForm({...form, nascimento:e.target.value})} />
            <input className="border rounded-xl px-3 py-2" placeholder="Telefone" value={form.telefone} onChange={e=>setForm({...form, telefone:e.target.value})} />
            <input className="border rounded-xl px-3 py-2" placeholder="E-mail" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
            <button className="mt-2 px-3 py-2 rounded-xl border" onClick={enviar}>Enviar</button>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border bg-white p-4">
          <p>Obrigado, <b>{form.nome}</b>! Seu cadastro foi enviado para a secretaria.</p>
        </div>
      )}
    </div>
  );
}