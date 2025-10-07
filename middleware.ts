// middleware.ts (na raiz do projeto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient as createSSRClient } from '@supabase/ssr';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: any) => {
          res.cookies.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Rotas privadas (ajuste se necessário)
  const protectedPaths = [
    '/dashboard',
    '/secretaria',
    '/agenda',
    '/pacientes',
    '/financeiro',
    '/cadastro',
  ];

  const path = req.nextUrl.pathname;
  const isProtected = protectedPaths.some((p) => path === p || path.startsWith(p + '/'));

  // Bloqueia apenas o que é privado
  if (!user && isProtected) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  // Usuário logado indo para /login → manda para /dashboard
  if (user && path === '/login') {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  // Exclui estáticos e **toda API** (OCR incluído), e deixa /login passar pelo middleware
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets/|images/|api/|public/).*)',
    '/login',
    '/autocadastro',
  ],
};