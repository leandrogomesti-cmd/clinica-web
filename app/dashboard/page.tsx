// app/dashboard/page.tsx
import Link from "next/link";
import requireRole from "@/lib/auth/requireRole";

export const dynamic = "force-dynamic";

const tiles = [
  {
    title: "Cadastro de Pacientes",
    desc: "Registrar novo paciente",
    href: "/cadastro",
  },
  {
    title: "Auto Cadastro",
    desc: "Link para pacientes",
    href: "/autocadastro",
  },
  {
    title: "Aprovar Auto Cadastro",
    desc: "Promover para patients",
    href: "/secretaria",
  },
  {
    title: "Pacientes",
    desc: "Listagem e busca",
    href: "/pacientes",
  },
  { title: "Agenda", desc: "Consultas e horários", href: "/agenda" },
  { title: "Financeiro", desc: "Resumo financeiro", href: "/financeiro" },
];

export default async function DashboardPage() {
  await requireRole(["staff", "doctor", "admin"]);

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.href} className="rounded-2xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">{t.title}</h2>
                <p className="text-sm text-muted-foreground">{t.desc}</p>
              </div>
              <Link
                href={t.href}
                className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Abrir
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}