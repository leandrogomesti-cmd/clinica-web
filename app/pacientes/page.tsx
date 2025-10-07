// app/pacientes/page.tsx
import requireRole from "@/lib/auth/requireRole";
import PacientesClient from "./_client";

export default async function Page() {
  await requireRole(["staff", "admin"]);
  return <PacientesClient />;
}