'use client';
import Link from 'next/link';

function Card({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded border bg-white p-5 text-center text-base hover:bg-gray-50"
    >
      {children}
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Linha 1 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card href="/cadastro">Cadastro de Pacientes</Card>
        <Card href="/autocadastro">Auto Cadastro</Card>
        <Card href="/secretaria">Aprovar Auto Cadastro</Card>
      </div>

      {/* Linha 2 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card href="/pacientes">Pacientes</Card>
      </div>
    </main>
  );
}