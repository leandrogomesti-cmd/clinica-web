// components/app-frame.tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import BrandLogo from "@/components/brand-logo";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/secretaria", label: "Aprovação" },
  { href: "/cadastro", label: "Cadastro" },
  { href: "/pacientes", label: "Pacientes" },
  { href: "/agenda", label: "Agenda" },
  { href: "/financeiro", label: "Financeiro" },
];

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r bg-white/70 backdrop-blur md:block">
        <div className="flex h-16 items-center gap-2 px-4">
          <BrandLogo />
        </div>
        <nav className="px-2 py-3 space-y-1">
          {nav.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm hover:bg-muted"
              )}
            >
              {i.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="md:pl-56">
        <div className="mx-auto max-w-6xl p-6">{children}</div>
      </main>
    </div>
  );
}