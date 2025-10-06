// app/dashboard/page.tsx
import Link from "next/link"
import { requireRole } from "@/lib/auth/requireRole"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function Page() {
  await requireRole(["staff", "doctor", "admin"])

  const tiles = [
    { href: "/cadastro", title: "Cadastro de Pacientes", desc: "Registrar novo paciente" },
    { href: "/autocadastro", title: "Auto Cadastro", desc: "Link para pacientes" },
    { href: "/secretaria", title: "Aprovar Auto Cadastro", desc: "Promover para patients" },
    { href: "/pacientes", title: "Pacientes", desc: "Listagem e busca" },
    { href: "/agenda", title: "Agenda", desc: "Consultas e horários" },
    { href: "/financeiro", title: "Financeiro", desc: "Resumo financeiro" },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <Card key={t.href} className="group">
            <CardHeader>
              <CardTitle className="text-base">{t.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">{t.desc}</p>
              <Link href={t.href} className="shrink-0">
                <Button size="sm">Abrir</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}