// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const PUBLIC_PATHS = [
  "/login",
  "/autocadastro",
  "/api/ocr/vision",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // libera caminhos públicos e assets
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  // Supabase SSR vinculado aos cookies do request/response
  const supabase = createServerClient(url, key, {
    cookies: {
      get: (name) => req.cookies.get(name)?.value,
      set: (name, value, options) => {
        res.cookies.set({ name, value, ...options });
      },
      remove: (name, options) => {
        res.cookies.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });

  // força refresh/sync da sessão (grava cookies no response quando necessário)
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const login = req.nextUrl.clone();
    login.pathname = "/login";
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return res;
}

// ✅ sem grupos que capturam
export const config = {
  matcher: [
    // protege tudo exceto assets do Next e arquivos comuns
    "/((?!_next/|images/|public/|favicon.ico|robots.txt|sitemap.xml|api/ocr/vision|login|autocadastro).*)",
  ],
};