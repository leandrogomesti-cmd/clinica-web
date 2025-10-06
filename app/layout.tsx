// app/layout.tsx
import "./globals.css"
import type { ReactNode } from "react"
import { AppFrame } from "@/components/app-frame"


export const metadata = {
title: "KlinikIA",
description: "Sistema de clínica — Next.js + Supabase",
}


export default function RootLayout({ children }: { children: ReactNode }) {
return (
<html lang="pt-BR" suppressHydrationWarning>
<body className="bg-background text-foreground antialiased">
<AppFrame>{children}</AppFrame>
</body>
</html>
)
}