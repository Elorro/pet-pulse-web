import "server-only";

import createClient from "openapi-fetch";

import { env } from "@/env";
import type { paths } from "@/lib/api/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const api = createClient<paths>({
  baseUrl: env.API_BASE_URL,
  fetch: (request) => fetch(request, { cache: "no-store" }),
});

api.use({
  async onRequest({ request }) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      request.headers.set(
        "Authorization",
        `Bearer ${data.session.access_token}`,
      );
    }
    return request;
  },
});
