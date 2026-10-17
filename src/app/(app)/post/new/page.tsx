import type { Metadata } from "next";

import { PostComposer } from "@/components/posts/post-composer";

export const metadata: Metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div>
        <p className="text-primary text-sm font-semibold tracking-[0.16em] uppercase">
          Your community
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Create a post
        </h1>
        <p className="text-muted-foreground mt-2">
          Share a moment from your pet’s day.
        </p>
      </div>
      <PostComposer />
    </div>
  );
}
