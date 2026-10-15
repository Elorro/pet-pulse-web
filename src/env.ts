import { z } from "zod";

/**
 * Validated environment. Read env vars only through this module.
 *
 * Public vars must be referenced as literal `process.env.NEXT_PUBLIC_*`
 * expressions so Next.js can inline them into the browser bundle.
 */

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_API_BASE_URL: z.url().optional(),
});

const serverSchema = z.object({
  API_BASE_URL: z.url(),
});

function formatIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

export function parsePublicEnv(source: Record<string, string | undefined>) {
  const result = publicSchema.safeParse(source);
  if (!result.success) {
    throw new Error(
      `Invalid public environment variables:\n${formatIssues(result.error)}`,
    );
  }
  return result.data;
}

export function parseServerEnv(source: Record<string, string | undefined>) {
  const result = serverSchema.safeParse(source);
  if (!result.success) {
    throw new Error(
      `Invalid server environment variables:\n${formatIssues(result.error)}`,
    );
  }
  return result.data;
}

export const publicEnv = parsePublicEnv({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || undefined,
});

/** Server-only vars. Throws if accessed from browser code. */
export function serverEnv() {
  if (typeof window !== "undefined") {
    throw new Error("serverEnv() was called in the browser");
  }
  return parseServerEnv({ API_BASE_URL: process.env.API_BASE_URL });
}
