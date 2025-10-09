// app/secretaria/agenda/page.tsx
import requireRole from '@/lib/auth/requireRole';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SecretariaAgendaPage() {
  await requireRole(['staff', 'doctor', 'admin']);
  redirect('/agenda');
}