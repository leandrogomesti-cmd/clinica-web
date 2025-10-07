// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient as createSSRClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Libera estáticos e TODA API
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/images/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Rotas públicas
  if (pathname === "/" || pathname === "/login" || pathname === "/autocadastro") {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabase = createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          try { res.cookies.set({ name, value, ...options }); } catch {}
        },
        remove: (name: string, options: any) => {
          try { res.cookies.set({ name, value: "", ...options, maxAge: 0 }); } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const privatePrefixes = ["/dashboard", "/secretaria", "/agenda", "/pacientes", "/financeiro", "/cadastro"];
  const needsAuth = privatePrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (!user && needsAuth) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|assets/|images/|api/|public/).*)",
    "/login",
    "/autocadastro",
  ],
};