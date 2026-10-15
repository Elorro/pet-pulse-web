import { NextResponse, type NextRequest } from "next/server";

import { env } from "@/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeDestination(destination: string | null) {
  return destination?.startsWith("/") && !destination.startsWith("//")
    ? destination
    : "/feed";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const destination = new URL(
    safeDestination(request.nextUrl.searchParams.get("next")),
    env.NEXT_PUBLIC_SITE_URL,
  );

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(destination);
  }

  const failure = new URL("/login", env.NEXT_PUBLIC_SITE_URL);
  failure.searchParams.set("error", "callback");
  return NextResponse.redirect(failure);
}
