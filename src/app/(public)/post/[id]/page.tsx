import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { PostLikeButton } from "@/components/posts/post-like-button";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";

async function CommentsAvailability({ postId }: { postId: string }) {
  const { data: profile } = await api.GET("/api/v1/auth/me");
  const returnTo = `/post/${postId}`;

  return (
    <section aria-labelledby="comments-title" className="mt-6">
      <Card>
        <CardHeader>
          <CardTitle id="comments-title">Comments</CardTitle>
          <CardDescription>
            Comments are not available yet because the API does not provide
            comment data or publishing support.
          </CardDescription>
        </CardHeader>
        {!profile ? (
          <CardContent>
            <Link
              className={buttonVariants({ size: "sm" })}
              href={`/login?next=${encodeURIComponent(returnTo)}`}
            >
              Sign in to comment
            </Link>
          </CardContent>
        ) : null}
      </Card>
    </section>
  );
}

type PostPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const title = "Community post";
  const description = `A Pet Pulse community post (${id}).`;
  return {
    title,
    description,
    openGraph: { title: `${title} · Pet Pulse`, description, type: "article" },
  };
}

export default async function PublicPostPage({ params }: PostPageProps) {
  const { id } = await params;
  const {
    data: post,
    error,
    response,
  } = await api.GET("/api/v1/posts/{id}", {
    params: { path: { id } },
  });
  if (response.status === 401)
    redirect(`/login?next=${encodeURIComponent(`/post/${id}`)}`);

  if (error || !post) {
    return (
      <main className="mx-auto max-w-3xl px-5 pt-12 pb-20 sm:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Post unavailable</CardTitle>
            <CardDescription>{errorMessage(error)}</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 pt-12 pb-20 sm:px-8">
      <Card>
        <CardHeader>
          <p className="text-primary text-sm font-semibold tracking-[0.16em] uppercase">
            Pet Pulse community
          </p>
          <CardTitle>A community post</CardTitle>
          <CardDescription>
            {new Date(post.created_at).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {post.media_url ? (
            <div className="relative mb-4 aspect-video overflow-hidden rounded-lg">
              <Image
                alt="Photo shared with the post"
                className="object-cover"
                fill
                sizes="(max-width: 672px) 100vw, 672px"
                src={post.media_url}
              />
            </div>
          ) : null}
          <p className="leading-7 whitespace-pre-wrap">{post.content}</p>
          <div className="mt-3 border-t pt-2">
            <PostLikeButton postId={post.id} initialCount={post.like_count} />
          </div>
        </CardContent>
      </Card>
      <CommentsAvailability postId={post.id} />
    </main>
  );
}
