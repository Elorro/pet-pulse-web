"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";

export type PostActionState = { error?: string };

function value(formData: FormData, name: string) {
  const field = formData.get(name);
  return typeof field === "string" ? field : "";
}

export async function createPostAction(
  _previous: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const content = value(formData, "content").trim();
  if (!content) return { error: "Write something before posting." };
  if (content.length > 5000)
    return { error: "Posts must be 5000 characters or fewer." };

  const { error, response } = await api.POST("/api/v1/posts/", {
    body: { content },
  });

  if (response.status === 401) redirect("/login?next=/post/new");
  if (error) return { error: errorMessage(error) };

  revalidatePath("/feed");
  redirect("/feed");
}
