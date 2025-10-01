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
          <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
            <Link href="/dashboard" className="mx-auto flex items-center justify-center">
              {/* largura maior, responsivo */}
              <Image
                src="/logo_oficial.png"
                alt="KlinikIA"
                width={480}
                height={120}
                className="h-auto w-72 md:w-[420px]"
                priority
              />
            </Link>
            <div className="absolute right-4 top-3">
              <BackButton />
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
      </body>
    </html>
  );
}