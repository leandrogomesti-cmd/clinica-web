// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { AppFrame } from "@/components/app-frame";

export const metadata: Metadata = {
  title: "KlinikIA",
  description: "Sistema de clínica — Next.js + Supabase",
  other: { "x-build": (process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local") as any },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-background text-foreground antialiased">
        <div className="k-accent-bar" />
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-xs text-gray-500 py-2">
            build: {(process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local")}
          </div>
        </div>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}