"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  getPostLikeStatusAction,
  likePostAction,
  unlikePostAction,
} from "@/lib/posts/actions";

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
  const [statusLoading, setStatusLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    getPostLikeStatusAction(postId)
      .then((result) => {
        if (!active || "error" in result || "unauthorized" in result) return;
        setCount(result.likeCount);
        setLiked(result.liked);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setStatusLoading(false);
      });
    return () => {
      active = false;
    };
  }, [postId]);

  async function toggleLike() {
    if (pending) return;
    setPending(true);
    try {
      const result = liked
        ? await unlikePostAction(postId)
        : await likePostAction(postId);
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
      setLiked((current) => !current);
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
      disabled={pending || statusLoading}
      onClick={toggleLike}
      size="sm"
      variant="ghost"
    >
      <Heart aria-hidden="true" className={liked ? "fill-current" : ""} />
      <span>{count}</span>
    </Button>
  );
}
