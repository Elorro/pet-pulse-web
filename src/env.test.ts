import { describe, expect, it } from "vitest";

import { parsePublicEnv, parseServerEnv } from "@/env";

describe("environment validation", () => {
  it("accepts valid public and server values", () => {
    expect(
      parsePublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "public-key",
        NEXT_PUBLIC_SITE_URL: "https://petpulse.example",
        NEXT_PUBLIC_API_BASE_URL: "https://api.example",
      }).NEXT_PUBLIC_SITE_URL,
    ).toBe("https://petpulse.example");
    expect(
      parseServerEnv({ API_BASE_URL: "https://api.example" }).API_BASE_URL,
    ).toBe("https://api.example");
  });

  it("names missing variables in its startup error", () => {
    expect(() => parseServerEnv({})).toThrow("API_BASE_URL");
  });
});
