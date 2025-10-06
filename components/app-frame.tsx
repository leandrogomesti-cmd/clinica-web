// components/app-frame.tsx
import Link from "next/link";
import BrandLogo from "@/components/brand-logo";

export default function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="rounded-2xl border p-3 shadow-sm flex items-center justify-between bg-gradient-to-r from-blue-50 to-transparent">
        <div className="flex items-center gap-2">
          <BrandLogo />
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100">MVP 2.0</span>
        </div>
        <div className="text-xs text-gray-500">
          build: {process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev"}
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-blue-500/70 to-cyan-400/70 rounded-full" />

      <div className="min-h-[70vh] grid md:grid-cols-[220px_1fr] gap-4">
        <aside className="hidden md:flex flex-col gap-1 rounded-2xl border p-4 sticky top-6 h-fit shadow-sm bg-gradient-to-b from-blue-50/60 to-transparent">
          <NavItem href="/dashboard" label="Dashboard" />
          <NavItem href="/secretaria" label="Aprovação" />
          <NavItem href="/cadastro" label="Cadastro" />
          <NavItem href="/pacientes" label="Pacientes" />
          <NavItem href="/agenda" label="Agenda" />
          <NavItem href="/financeiro" label="Financeiro" />
        </aside>

        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-xl hover:bg-blue-50 text-sm transition-colors"
    >
      {label}
    </Link>
  );
}