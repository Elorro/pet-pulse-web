"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { followAction, unfollowAction } from "@/lib/profile/follow-actions";

export function FollowControls({
  profileId,
  following,
  followedBy,
}: {
  profileId: string;
  following: boolean;
  followedBy: boolean;
}) {
  const [isFollowing, setIsFollowing] = useState(following);
  const [isFollowedBy] = useState(followedBy);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function toggleFollow() {
    setError("");
    startTransition(async () => {
      const result = isFollowing
        ? await unfollowAction(profileId)
        : await followAction(profileId);
      if ("error" in result) {
        setError(result.error ?? "The request failed. Please try again.");
      } else {
        setIsFollowing(result.following);
      }
    });
  }

  return (
    <div className="mt-6 space-y-3">
      <Button disabled={pending} onClick={toggleFollow}>
        {pending ? "Updating…" : isFollowing ? "Unfollow" : "Follow"}
      </Button>
      {error ? <p className="text-destructive text-sm" role="alert">{error}</p> : null}
      {isFollowedBy ? <p className="text-muted-foreground text-sm">Follows you</p> : null}
    </div>
  );
}
