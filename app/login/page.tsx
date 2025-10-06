// app/login/page.tsx
"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page() {
  const [loading, setLoading] = useState(false)

  async function onSubmit(formData: FormData) {
    setLoading(true)
    const email = String(formData.get("email") || "")
    const password = String(formData.get("password") || "")
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) alert(error.message)
    else window.location.href = "/secretaria"
  }

  return (
    <div className="max-w-md space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Entrar no painel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form action={onSubmit} className="space-y-3">
            <Input name="email" placeholder="Email" type="email" required />
            <Input name="password" placeholder="Senha" type="password" required />
            <Button className="w-full" disabled={loading}>
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </form>
          <div className="text-sm text-muted-foreground">
            ou <a className="underline" href="/autocadastro">autocadastrar paciente</a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}