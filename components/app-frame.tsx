// components/app-frame.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/secretaria", label: "Aprovação" },
  { href: "/cadastro", label: "Cadastro" },
  { href: "/autocadastro", label: "Autocadastro" },
  { href: "/pacientes", label: "Pacientes" },
  { href: "/agenda", label: "Agenda" },
  { href: "/financeiro", label: "Financeiro" },
];

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-56 shrink-0 border-r bg-card/30">
          <div className="px-4 py-4">
            <BrandLogo />
          </div>
          <nav className="px-2 pb-6 space-y-1">
            {NAV.map((n) => {
              const active = pathname === n.href || pathname.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`block rounded-md px-3 py-2 text-sm ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Top bar (mobile) */}
          <div className="md:hidden sticky top-0 z-10 border-b bg-card/30 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="max-w-6xl mx-auto px-4 py-2">
              <BrandLogo />
            </div>
          </div>

          <div className="max-w-6xl mx-auto p-6 space-y-4">{children}</div>
        </main>
      </div>
    </div>
  );
}