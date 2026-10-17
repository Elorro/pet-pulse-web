import { describe, expect, it } from "vitest";

import { ALLOWED_TYPES, MAX_BYTES, validateImage } from "@/lib/posts/media";

describe("validateImage", () => {
  it.each(ALLOWED_TYPES)("accepts %s", (type) => {
    expect(validateImage(new File(["image"], "photo", { type }))).toBeNull();
  });

  it("rejects unsupported types", () => {
    expect(
      validateImage(new File(["text"], "notes.txt", { type: "text/plain" })),
    ).toContain("JPEG");
  });

  it("rejects images larger than 5 MB", () => {
    const file = new File([new Uint8Array(MAX_BYTES + 1)], "large.png", {
      type: "image/png",
    });
    expect(validateImage(file)).toContain("5 MB");
  });
});
