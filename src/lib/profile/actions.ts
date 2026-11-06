"use server";

import { redirect } from "next/navigation";

import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import type { ImageContentType } from "@/lib/posts/actions";

export type ProfilePhotoUploadResult =
  { uploadUrl: string; publicUrl: string } | { error: string };

export async function requestProfilePhotoUploadAction(
  contentType: ImageContentType,
): Promise<ProfilePhotoUploadResult> {
  const { data, error, response } = await api.POST(
    "/api/v1/posts/media-uploads",
    { body: { content_type: contentType } },
  );

  if (response.status === 401) redirect("/login?next=/settings");
  if (error || !data) return { error: errorMessage(error) };

  if (typeof data.public_url !== "string") {
    return {
      error:
        "The connected API does not return a public photo URL yet. Point API_BASE_URL to the updated API branch and restart the web app.",
    };
  }

  try {
    const publicUrl = new URL(data.public_url);
    if (!["http:", "https:"].includes(publicUrl.protocol)) throw new Error();
  } catch {
    return { error: "The API returned an invalid public photo URL." };
  }

  return { uploadUrl: data.upload_url, publicUrl: data.public_url };
}
