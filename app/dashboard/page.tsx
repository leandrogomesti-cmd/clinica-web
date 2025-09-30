'use client';
import Link from 'next/link';


export default function DashboardPage(){
return (
<main className="space-y-4">
<h1 className="text-2xl font-semibold">Dashboard</h1>
<div className="grid gap-3 md:grid-cols-3">
<Link href="/agenda" className="rounded border p-4 hover:bg-gray-50">Agenda</Link>
<Link href="/pacientes" className="rounded border p-4 hover:bg-gray-50">Pacientes</Link>
<Link href="/financeiro" className="rounded border p-4 hover:bg-gray-50">Financeiro</Link>
</div>
<div className="grid gap-3 md:grid-cols-2">
<Link href="/cadastro" className="rounded border p-4 hover:bg-gray-50">Cadastro de Pacientes</Link>
<Link href="/secretaria" className="rounded border p-4 hover:bg-gray-50">Aprovar Auto Cadastro</Link>
</div>
</main>
);
}