"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import type { components } from "@/lib/api/schema";

export type ImageContentType =
  "image/jpeg" | "image/png" | "image/webp" | "image/gif";

export type MediaUploadResult =
  { path: string; uploadUrl: string } | { error: string };

export type PostActionState = { error?: string };
export type PostComment = components["schemas"]["CommentResponse"];
export type PostCommentActionState = {
  comment?: PostComment;
  error?: string;
  unauthorized?: boolean;
};

function value(formData: FormData, name: string) {
  const field = formData.get(name);
  return typeof field === "string" ? field : "";
}

export async function createPostAction(
  _previous: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const content = value(formData, "content").trim();
  const mediaPath = value(formData, "media_path");
  if (!content) return { error: "Write something before posting." };
  if (content.length > 5000)
    return { error: "Posts must be 5000 characters or fewer." };

  const { error, response } = await api.POST("/api/v1/posts/", {
    body: { content, ...(mediaPath ? { media_path: mediaPath } : {}) },
  });

  if (response.status === 401) redirect("/login?next=/post/new");
  if (error) return { error: errorMessage(error) };

  revalidatePath("/feed");
  redirect("/feed");
}

export async function requestMediaUploadAction(
  contentType: ImageContentType,
): Promise<MediaUploadResult> {
  const { data, error, response } = await api.POST(
    "/api/v1/posts/media-uploads",
    { body: { content_type: contentType } },
  );

  if (response.status === 401) redirect("/login?next=/post/new");
  if (error || !data) return { error: errorMessage(error) };

  return { path: data.path, uploadUrl: data.upload_url };
}

export type LikePostResult =
  { likeCount: number } | { unauthorized: true } | { error: string };
export type PostLikeStatusResult =
  | { likeCount: number; liked: boolean }
  | { unauthorized: true }
  | { error: string };

export async function getPostLikeStatusAction(
  postId: string,
): Promise<PostLikeStatusResult> {
  const { data, error, response } = await api.GET("/api/v1/posts/{id}/like", {
    params: { path: { id: postId } },
  });

  if (response.status === 401) return { unauthorized: true };
  if (error || !data) return { error: errorMessage(error) };

  return { likeCount: data.like_count, liked: data.liked };
}

export async function likePostAction(postId: string): Promise<LikePostResult> {
  const { data, error, response } = await api.POST("/api/v1/posts/{id}/like", {
    params: { path: { id: postId } },
  });

  if (response.status === 401) return { unauthorized: true };
  if (error || !data) return { error: errorMessage(error) };

  return { likeCount: data.like_count };
}

export async function unlikePostAction(
  postId: string,
): Promise<LikePostResult> {
  const { data, error, response } = await api.DELETE(
    "/api/v1/posts/{id}/like",
    { params: { path: { id: postId } } },
  );

  if (response.status === 401) return { unauthorized: true };
  if (error || !data) return { error: errorMessage(error) };

  return { likeCount: data.like_count };
}

export async function createPostCommentAction(
  postId: string,
  _previous: PostCommentActionState,
  formData: FormData,
): Promise<PostCommentActionState> {
  const content = value(formData, "content").trim();
  if (!content) return { error: "Write something before commenting." };

  try {
    const { data, error, response } = await api.POST(
      "/api/v1/posts/{post_id}/comments",
      { params: { path: { post_id: postId } }, body: { content } },
    );

    if (response.status === 401) return { unauthorized: true };
    if (error || !data) return { error: errorMessage(error) };

    revalidatePath(`/post/${postId}`);
    return { comment: data };
  } catch {
    return { error: "We could not post your comment. Please try again." };
  }
}
