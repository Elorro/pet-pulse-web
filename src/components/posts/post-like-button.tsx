"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/browser-client";
import { errorMessage } from "@/lib/api/errors";

export function PostLikeButton({
  postId,
  initialCount,
}: {
  postId: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function likePost() {
    if (pending || liked) return;
    setPending(true);
    try {
      const { data, error, response } = await api.POST(
        "/api/v1/posts/{id}/like",
        { params: { path: { id: postId } } },
      );
      if (response.status === 401) {
        router.push(
          `/login?next=${encodeURIComponent(window.location.pathname)}`,
        );
        return;
      }
      if (error || !data) {
        toast.error(errorMessage(error));
        return;
      }
      setCount(data.like_count);
      setLiked(true);
    } catch {
      toast.error("We could not complete that request. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      aria-label={liked ? `Liked, ${count} likes` : `Like, ${count} likes`}
      aria-pressed={liked}
      disabled={pending || liked}
      onClick={likePost}
      size="sm"
      variant="ghost"
    >
      <Heart aria-hidden="true" className={liked ? "fill-current" : ""} />
      <span>{count}</span>
    </Button>
  );
}
