// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const PUBLIC_PATHS = [
  '/login',
  '/autocadastro',
  '/api/ocr/vision',
  '/api/auth/session',
  '/favicon.ico',
  '/robots.txt',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // libera rotas públicas
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
      pathname.startsWith('/_next') || pathname.startsWith('/images')) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  // cria supabase server atrelado aos cookies do request/response
  const supabase = createServerClient(url, key, {
    cookies: {
      get: (name) => req.cookies.get(name)?.value,
      set: (name, value, options) => {
        res.cookies.set({ name, value, ...options });
      },
      remove: (name, options) => {
        res.cookies.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });

  // chama getUser para sincronizar cookies de sessão
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const login = req.nextUrl.clone();
    login.pathname = '/login';
    login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }

  return res;
}

// protege tudo, exceto assets públicos
export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.(png|jpg|jpeg|svg|ico)).*)'],
};