"use client";

import createClient from "openapi-fetch";

import { env } from "@/env";
import type { paths } from "@/lib/api/schema";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const refreshClient = createClient<paths>({
  baseUrl: env.NEXT_PUBLIC_API_BASE_URL,
  fetch: (request) => fetch(request, { cache: "no-store" }),
});

export const api = createClient<paths>({
  baseUrl: env.NEXT_PUBLIC_API_BASE_URL,
  fetch: (request) => fetch(request, { cache: "no-store" }),
});

api.use({
  async onRequest({ request }) {
    const supabase = createSupabaseBrowserClient();
    let { data } = await supabase.auth.getSession();
    const session = data.session;

    if (
      session?.expires_at &&
      session.expires_at <= Math.floor(Date.now() / 1000) + 60
    ) {
      const { data: refreshed } = await refreshClient.POST(
        "/api/v1/auth/refresh",
        { body: { refresh_token: session.refresh_token } },
      );
      if (refreshed) {
        await supabase.auth.setSession({
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token,
        });
        ({ data } = await supabase.auth.getSession());
      }
    }

    if (data.session?.access_token) {
      request.headers.set(
        "Authorization",
        `Bearer ${data.session.access_token}`,
      );
    }
    return request;
  },
});
