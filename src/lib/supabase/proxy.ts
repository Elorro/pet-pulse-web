import { createServerClient, type CookieMethodsServer } from "@supabase/ssr";
import createClient from "openapi-fetch";
import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/env";
import type { paths } from "@/lib/api/schema";

const refreshClient = createClient<paths>({
  baseUrl: env.API_BASE_URL,
  fetch: (request) => fetch(request, { cache: "no-store" }),
});

export async function refreshSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const cookies: CookieMethodsServer = {
    getAll: () => request.cookies.getAll(),
    setAll: (cookiesToSet) => {
      for (const { name, value } of cookiesToSet)
        request.cookies.set(name, value);
      response = NextResponse.next({ request });
      for (const { name, value, options } of cookiesToSet) {
        response.cookies.set(name, value, options);
      }
    },
  };

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: true,
      },
      cookies,
    },
  );

  const { data } = await supabase.auth.getSession();
  let hasSession = Boolean(
    data.session?.access_token && data.session.refresh_token,
  );
  const expiresAt = data.session?.expires_at;

  if (
    hasSession &&
    expiresAt &&
    expiresAt <= Math.floor(Date.now() / 1000) + 60
  ) {
    const { data: refreshed, error } = await refreshClient.POST(
      "/api/v1/auth/refresh",
      {
        body: { refresh_token: data.session!.refresh_token },
      },
    );

    if (refreshed) {
      const result = await supabase.auth.setSession({
        access_token: refreshed.access_token,
        refresh_token: refreshed.refresh_token,
      });
      hasSession = !result.error;
    } else if (error) {
      await supabase.auth.signOut({ scope: "local" });
      hasSession = false;
    }
  }

  const { pathname, search } = request.nextUrl;
  const protectedPaths = ["/feed", "/notifications", "/settings"];
  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isProtected && !hasSession) {
    const destination = new URL("/login", request.url);
    destination.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(destination);
  }

  return response;
}
