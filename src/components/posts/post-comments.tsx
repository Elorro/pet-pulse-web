"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  createPostCommentAction,
  type PostComment,
  type PostCommentActionState,
} from "@/lib/posts/actions";

type PostCommentsProps = {
  postId: string;
  initialComments: PostComment[];
  isAuthenticated: boolean;
  loadError?: string;
};

export function PostComments({
  postId,
  initialComments,
  isAuthenticated,
  loadError,
}: PostCommentsProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<
    PostCommentActionState,
    FormData
  >(createPostCommentAction.bind(null, postId), {});
  const returnTo = `/post/${postId}`;
  const comments = useMemo(() => {
    if (
      !state.comment ||
      initialComments.some((comment) => comment.id === state.comment?.id)
    ) {
      return initialComments;
    }
    return [...initialComments, state.comment];
  }, [initialComments, state.comment]);

  useEffect(() => {
    if (state.unauthorized)
      router.push(`/login?next=${encodeURIComponent(returnTo)}`);
  }, [returnTo, router, state]);

  useEffect(() => {
    if (state.comment) formRef.current?.reset();
  }, [state.comment]);

  return (
    <section aria-labelledby="comments-title" className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle id="comments-title">Comments</CardTitle>
          <CardDescription>
            Join the conversation with the Pet Pulse community.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {isAuthenticated ? (
            <form action={formAction} className="grid gap-3" ref={formRef}>
              <label className="text-sm font-medium" htmlFor="comment-content">
                Your comment
              </label>
              <Textarea
                id="comment-content"
                maxLength={5000}
                name="content"
                placeholder="Share a thoughtful comment…"
                required
              />
              {state.error ? (
                <p aria-live="polite" className="text-destructive text-sm">
                  {state.error}
                </p>
              ) : null}
              <Button
                className="justify-self-start"
                disabled={pending}
                type="submit"
              >
                {pending ? "Posting…" : "Post comment"}
              </Button>
            </form>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">
                Sign in to leave a comment.
              </p>
              <Link
                className={buttonVariants({ size: "sm" })}
                href={`/login?next=${encodeURIComponent(returnTo)}`}
              >
                Sign in
              </Link>
            </div>
          )}

          <div aria-live="polite" className="grid gap-4">
            {loadError ? (
              <div className="border-destructive/30 bg-destructive/5 rounded-lg border p-4">
                <p className="text-destructive text-sm">{loadError}</p>
                <Button
                  className="mt-3"
                  onClick={() => router.refresh()}
                  type="button"
                  variant="outline"
                >
                  Try again
                </Button>
              </div>
            ) : comments.length ? (
              comments.map((comment) => (
                <article
                  className="border-t pt-4 first:border-0 first:pt-0"
                  key={comment.id}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-medium">{comment.author.username}</p>
                    <time
                      className="text-muted-foreground text-xs"
                      dateTime={comment.created_at}
                    >
                      {new Date(comment.created_at).toLocaleString()}
                    </time>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm leading-6 whitespace-pre-wrap">
                    {comment.content ?? "This comment has no text."}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-muted-foreground border-t pt-4 text-sm">
                There are no comments yet. Start the conversation.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
