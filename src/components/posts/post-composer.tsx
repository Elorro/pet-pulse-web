"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPostAction } from "@/lib/posts/actions";

export function PostComposer() {
  const [state, formAction, pending] = useActionState(createPostAction, {});
  const [content, setContent] = useState("");

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share with the community</CardTitle>
        <CardDescription>Tell everyone what your pet is up to.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="content">Your post</Label>
            <Textarea
              id="content"
              maxLength={5000}
              name="content"
              onChange={(event) => setContent(event.target.value)}
              placeholder="What's your pet up to?"
              required
              rows={5}
              value={content}
            />
            <p
              className="text-muted-foreground text-right text-xs"
              aria-live="polite"
            >
              {content.length} / 5000
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Link
              className="text-muted-foreground hover:text-foreground text-sm font-medium"
              href="/feed"
            >
              Cancel
            </Link>
            <Button disabled={pending || !content.trim()} type="submit">
              {pending ? "Posting…" : "Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
