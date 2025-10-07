// app/cadastro/page.tsx
import requireRole from "@/lib/auth/requireRole";
import CadastroClient from "./_client";

export default async function Page() {
  await requireRole(["staff", "admin"]);
  return <CadastroClient />;
}