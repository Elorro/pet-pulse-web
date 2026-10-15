import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import { cookies } from "next/headers";

import { env } from "@/env";

export async function createSupabaseServerClient(
  cookieAdapter?: CookieMethodsServer,
) {
  const cookieStore = cookieAdapter ? null : await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: true,
      },
      cookies: cookieAdapter ?? {
        getAll() {
          return cookieStore!.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore!.set(name, value, options),
            );
          } catch {
            // Server components cannot mutate cookies; refresh is handled in proxy.ts.
          }
        },
      },
    },
  );
}
