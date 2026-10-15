import createClient from "openapi-fetch";

import { env } from "@/env";
import type { paths } from "@/lib/api/schema";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const baseUrl =
  typeof window === "undefined"
    ? env.API_BASE_URL
    : env.NEXT_PUBLIC_API_BASE_URL;
const refreshClient = createClient<paths>({
  baseUrl,
  fetch: (request) => fetch(request, { cache: "no-store" }),
});

export const api = createClient<paths>({
  baseUrl,
  fetch: (request) => fetch(request, { cache: "no-store" }),
});

api.use({
  async onRequest({ request }) {
    const supabase =
      typeof window === "undefined"
        ? await createSupabaseServerClient()
        : createSupabaseBrowserClient();
    let { data } = await supabase.auth.getSession();
    const session = data.session;

    if (
      typeof window !== "undefined" &&
      session?.expires_at &&
      session.expires_at <= Math.floor(Date.now() / 1000) + 60
    ) {
      const { data: refreshed } = await refreshClient.POST(
        "/api/v1/auth/refresh",
        {
          body: { refresh_token: session.refresh_token },
        },
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
