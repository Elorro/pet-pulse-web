export const DEFAULT_AUTHED_PATH = "/feed";

/**
 * Returns `next` if it is a same-site path, otherwise the fallback.
 * Blocks open redirects such as `//evil.com` or `https://evil.com`.
 */
export function safeNextPath(
  next: string | null | undefined,
  fallback = DEFAULT_AUTHED_PATH,
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  if (next.includes("\\")) return fallback;
  return next;
}
