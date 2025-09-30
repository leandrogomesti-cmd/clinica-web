import './globals.css';
import Image from 'next/image';
import Link from 'next/link';
import BackButton from './_components/BackButton';


export const metadata = { title: 'Clínica' };


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="pt-BR">
<body className="min-h-screen bg-gray-50 text-gray-900">
<header className="sticky top-0 z-10 border-b bg-white">
<div className="mx-auto flex max-w-5xl items-center justify-between p-3">
<Link href="/dashboard" className="flex items-center gap-2">
<Image src="/logo_oficial.png" alt="KlinikIA" width={150} height={40} priority />
</Link>
<BackButton />
</div>
</header>
<main className="mx-auto max-w-5xl p-4">{children}</main>
</body>
</html>
);
}