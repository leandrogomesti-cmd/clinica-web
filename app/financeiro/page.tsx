// app/financeiro/page.tsx
import requireRole from "@/lib/auth/requireRole";
import FinanceiroClient from "./_client";

export default async function Page() {
  await requireRole(["staff", "admin"]);
  return <FinanceiroClient />;
}