// app/layout.tsx
import "./globals.css"
import { ReactNode } from "react"


export const metadata = {
title: "KlinikIA",
description: "Sistema de clínica — Next.js + Supabase",
}


export default function RootLayout({ children }: { children: ReactNode }) {
return (
<html lang="pt-BR" suppressHydrationWarning>
<body className="bg-background text-foreground antialiased">
<div className="p-4 md:p-6 space-y-6">
{children}
</div>
</body>
</html>
)
}