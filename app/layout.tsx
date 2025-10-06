// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "KlinikIA",
  description: "Sistema de clínica — Next.js + Supabase",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const build = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local";

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        {/* barra decorativa opcional */}
        <div className="k-accent-bar" />
        {/* selo de build para diagnóstico */}
        <div className="text-xs text-gray-500 p-2">build: {build}</div>
        {children}
      </body>
    </html>
  );
}