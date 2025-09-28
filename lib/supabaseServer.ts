import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export function supabaseServer() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        /**
         * Em Next 14, set/remove usam cookieStore.set
         * Convertemos as opções para CookieOptions da lib.
         */
        set(name: string, value: string, options?: CookieOptions) {
          try {
            cookieStore.set(name, value, options as CookieOptions);
          } catch {
            // ignore em ambientes onde set não está disponível (ex.: build)
          }
        },
        remove(name: string, options?: CookieOptions) {
          try {
            cookieStore.set(name, "", { ...(options || {}), maxAge: 0 });
          } catch {
            // ignore em ambientes onde set não está disponível (ex.: build)
          }
        },
      },
    }
  );
}
