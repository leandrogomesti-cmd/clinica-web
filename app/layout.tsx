// app/layout.tsx
import "./globals.css"
import { ReactNode } from "react"
import { AppFrame } from "@/components/app-frame"

export const metadata = {
  title: "KlinikIA",
  description: "Sistema de clínica — Next.js + Supabase",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const build = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local"
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        {/* selo de build para diagnóstico */}
        <div className="text-[10px] text-gray-500 fixed left-4 top-2 z-50">build: {build}</div>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  )
}
