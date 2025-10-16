// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Rotas públicas (não exigem sessão).
 * Inclui as páginas de DEMO e autocadastro-demo.
 */
const PUBLIC_PATHS = [
  "/login",
  "/demo",
  "/demo/",          // safety
  "/autocadastro-demo",
  "/favicon.ico",
];

// Prefixos sempre liberados (assets/build/etc.)
const PUBLIC_PREFIXES = [
  "/_next",          // assets do Next.js
  "/static",
  "/public",
  "/assets",
  "/images",
  "/fonts",
  "/api/health",     // se tiver healthcheck
];

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/demo/")) return true;                // subrotas demo
  if (pathname.startsWith("/autocadastro-demo/")) return true;   // subrotas autocadastro-demo
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // 1) Libera rotas públicas e assets
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 2) Checa sessão Supabase (cookies)
  //    Use o mesmo nome de cookies que você já usa no projeto.
  const hasSupaSession =
    req.cookies.get("sb-access-token") ||
    req.cookies.get("sb:token") ||
    req.cookies.get("supabase-auth-token");

  if (!hasSupaSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // mantém a navegação original (deep-link)
    url.searchParams.set("next", pathname + (search || ""));
    return NextResponse.redirect(url);
  }

  // 3) (Opcional) Se você tiver validação de perfil/role no middleware,
  //    mantenha aqui abaixo — a allowlist já garantiu que /demo não passe por isso.

  return NextResponse.next();
}

/**
 * Matcher padrão: aplica o middleware em tudo,
 * exceto arquivos estáticos (regex de exclusão).
 * Ajuste caso seu projeto já tenha um matcher específico.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|css|js|map)).*)"],
};