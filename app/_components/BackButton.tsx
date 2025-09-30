'use client';
import { useRouter, usePathname } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const hide = pathname === '/dashboard' || pathname === '/login' || pathname === '/';
  if (hide) return null;

  return (
    <button
      onClick={() => router.back()}
      className="rounded border px-3 py-1.5 text-sm hover:bg-gray-100"
      aria-label="Voltar"
    >
      Voltar
    </button>
  );
}