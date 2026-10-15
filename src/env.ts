import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
});

const serverEnvSchema = z.object({
  API_BASE_URL: z.string().url(),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;

function parseEnvironment<T extends z.ZodType>(
  schema: T,
  values: unknown,
): z.infer<T> {
  const result = schema.safeParse(values);
  if (!result.success) {
    const missing = [
      ...new Set(result.error.issues.map((issue) => issue.path.join("."))),
    ];
    throw new Error(`Invalid environment variables: ${missing.join(", ")}`);
  }
  return result.data;
}

export const parsePublicEnv = (values: unknown): PublicEnv =>
  parseEnvironment(publicEnvSchema, values);
export const parseServerEnv = (values: unknown): ServerEnv =>
  parseEnvironment(serverEnvSchema, values);

const publicEnv = parsePublicEnv({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

const serverEnv =
  typeof window === "undefined"
    ? parseServerEnv({ API_BASE_URL: process.env.API_BASE_URL })
    : null;

export const env = {
  ...publicEnv,
  ...(serverEnv ?? {}),
};
