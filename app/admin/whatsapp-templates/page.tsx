// app/admin/whatsapp-templates/page.tsx
import requireRole from '@/lib/auth/requireRole';

export const dynamic = 'force-dynamic';

export default async function WhatsTemplatesPage() {
  await requireRole(['admin']); // só admin acessa
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Templates do WhatsApp</h1>
      <p className="text-sm text-muted-foreground">Em breve…</p>
    </div>
  );
}