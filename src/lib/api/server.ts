import "server-only";

import { serverEnv } from "@/env";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

import { createApiClient } from "./client";

/**
 * Client for Server Components, Server Actions and Route Handlers.
 * The proxy has already refreshed the session, and FastAPI verifies the token,
 * so reading it from the session cookie here is safe.
 */
export async function createServerApiClient() {
  const supabase = await createSupabaseClient();
  return createApiClient(serverEnv().API_BASE_URL, async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token;
  });
}
