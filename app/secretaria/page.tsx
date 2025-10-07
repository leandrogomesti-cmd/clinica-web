// app/secretaria/page.tsx
import requireRole from "@/lib/auth/requireRole";
import SecretariaClient from "./_client";

export default async function Page() {
  await requireRole(["staff", "admin"]);
  return <SecretariaClient />;
}