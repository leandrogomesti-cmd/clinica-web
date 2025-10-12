// app/pacientes/page.tsx
import AppFrame from "@/components/app-frame";
import requireRole from "@/lib/auth/requireRole";
import PacientesClient from "./_client";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requireRole(["staff", "admin", "doctor"]);
  return (
    <AppFrame>
      <PacientesClient />
    </AppFrame>
  );
}
