"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { likePostAction } from "@/lib/posts/actions";

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
      const result = await likePostAction(postId);
      if ("unauthorized" in result) {
        router.push(
          `/login?next=${encodeURIComponent(window.location.pathname)}`,
        );
        return;
      }
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setCount(result.likeCount);
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
