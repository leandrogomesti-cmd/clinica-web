// app/financeiro/page.tsx
import requireRole from "@/lib/auth/requireRole";
import FinanceiroClient from "./_client";

export default async function Page() {
  // Gate no server como combinado
  await requireRole(["staff", "doctor", "admin"]);
  // Passo o timezone pra UI usar nos formatadores
  return <FinanceiroClient tz="America/Sao_Paulo" />;
}