"use server";

import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";

function apiError(error: unknown, status: number) {
  if (status === 400) return "You cannot follow your own profile.";
  if (status === 404) return "This profile could not be found.";
  if (status === 401) return "Please sign in to follow profiles.";
  return errorMessage(error);
}

export async function followAction(profileId: string) {
  const { data, error, response } = await api.PUT(
    "/api/v1/profiles/{profile_id}/follow",
    { params: { path: { profile_id: profileId } } },
  );
  return error || !data
    ? { error: apiError(error, response.status) }
    : { following: data.following };
}

export async function unfollowAction(profileId: string) {
  const { error, response } = await api.DELETE(
    "/api/v1/profiles/{profile_id}/follow",
    { params: { path: { profile_id: profileId } } },
  );
  return error
    ? { error: apiError(error, response.status) }
    : { following: false };
}
