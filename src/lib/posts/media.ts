export const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const MAX_BYTES = 5 * 1024 * 1024;

export function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return "Choose a JPEG, PNG, WebP, or GIF image.";
  }
  if (file.size > MAX_BYTES) return "Images must be 5 MB or smaller.";
  return null;
}
