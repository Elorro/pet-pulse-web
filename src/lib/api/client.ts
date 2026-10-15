import createFetchClient, { type Middleware } from "openapi-fetch";

import { publicEnv } from "@/env";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";

import type { paths } from "./schema";

type TokenGetter = () => Promise<string | null | undefined>;

/**
 * Typed FastAPI client. Every request carries the current Supabase access
 * token as `Authorization: Bearer <token>` when there is one.
 * Route every FastAPI call through a client built here.
 */
export function createApiClient(baseUrl: string, getToken: TokenGetter) {
  const client = createFetchClient<paths>({ baseUrl });

  const auth: Middleware = {
    async onRequest({ request }) {
      const token = await getToken();
      if (token) request.headers.set("Authorization", `Bearer ${token}`);
      return request;
    },
  };
  client.use(auth);

  return client;
}

/** Client for Client Components. Requires NEXT_PUBLIC_API_BASE_URL and CORS. */
export function createBrowserApiClient() {
  const baseUrl = publicEnv.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is required for browser calls");
  }
  const supabase = createSupabaseClient();
  return createApiClient(baseUrl, async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  });
}
