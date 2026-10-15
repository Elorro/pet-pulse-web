import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { publicEnv } from "@/env";
import { DEFAULT_AUTHED_PATH } from "@/lib/redirect";

/** Routes that require a session. Keep in sync with the (app) route group. */
const PROTECTED_PREFIXES = ["/feed", "/notifications", "/settings"];

/** Auth pages a signed-in user has no reason to see. */
const AUTH_PAGES = ["/login", "/signup"];

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Refreshes the session if expired. Do not run code between creating the
  // client and this call, and never trust getSession() here.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims);
  const { pathname, search } = request.nextUrl;

  let redirectTo: URL | null = null;
  if (!isSignedIn && matches(pathname, PROTECTED_PREFIXES)) {
    redirectTo = new URL("/login", request.url);
    redirectTo.searchParams.set("next", `${pathname}${search}`);
  } else if (isSignedIn && matches(pathname, AUTH_PAGES)) {
    redirectTo = new URL(DEFAULT_AUTHED_PATH, request.url);
  }

  if (!redirectTo) return supabaseResponse;

  // Carry refreshed cookies and cache headers over to the redirect.
  const redirect = NextResponse.redirect(redirectTo);
  supabaseResponse.cookies
    .getAll()
    .forEach((cookie) => redirect.cookies.set(cookie));
  ["cache-control", "expires", "pragma"].forEach((key) => {
    const value = supabaseResponse.headers.get(key);
    if (value) redirect.headers.set(key, value);
  });
  return redirect;
}

export const config = {
  matcher: [
    // Skip static assets and image optimization files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
