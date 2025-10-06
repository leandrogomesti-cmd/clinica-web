// components/app-frame.tsx
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BrandLogo } from "@/components/brand-logo"

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/secretaria", label: "Aprovação" },
  { href: "/cadastro", label: "Cadastro" },
  { href: "/pacientes", label: "Pacientes" },
  { href: "/agenda", label: "Agenda" },
  { href: "/financeiro", label: "Financeiro" },
]

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="border-r bg-white/70 backdrop-blur">
        <div className="p-4 flex items-center gap-2">
          <BrandLogo />
        </div>
        <div className="k-accent-bar mx-4" />
        <nav className="p-3 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "block px-3 py-2 rounded-lg text-sm",
                  active ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50",
                ].join(" ")}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="p-4 md:p-6">{children}</main>
    </div>
  )
}