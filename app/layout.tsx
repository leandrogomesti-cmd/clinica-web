// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KlinikIA",
  description: "Sistema de clínica — Next.js + Supabase",
  other: { "x-build": (process.env.VERCEL_GIT_COMMIT_SHA || "dev").slice(0, 7) },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}