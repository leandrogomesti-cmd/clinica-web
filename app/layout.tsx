// app/layout.tsx
import "./globals.css"
import { ReactNode } from "react"

export const metadata = {
  title: "KlinikIA",
  description: "Sistema de clínica — Next.js + Supabase",
  other: { "x-build": process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,7) },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const build = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,7) || "local"
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <div className="p-4 md:p-6 space-y-6">
          {/* barra sutil azul (nos pedimos) */}
          <div className="k-accent-bar" />
          {/* selo de build para diagnósticos */}
          <div className="text-xs text-gray-500">build: {build}</div>
          {children}
        </div>
      </body>
    </html>
  )
}