import type { Metadata } from "next";
import Link from "next/link";

import { PostCard } from "@/components/posts/post-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";

type ProfilePageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const name = `@${username}`;
  const description = `Pet Pulse profile for ${name}.`;
  return {
    title: name,
    description,
    openGraph: { title: `${name} · Pet Pulse`, description, type: "profile" },
  };
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const [postsResult, ownProfileResult] = await Promise.all([
    api.GET("/api/v1/posts/by-username/{username}", {
      params: { path: { username }, query: { limit: 20, offset: 0 } },
    }),
    api.GET("/api/v1/auth/me"),
  ]);

  const posts = postsResult.data;
  if (postsResult.error || !posts) {
    return (
      <main className="mx-auto max-w-4xl px-5 pt-12 pb-20 sm:px-8">
        <Card>
          <CardHeader>
            <h1 className="text-base leading-snug font-medium">
              Profile unavailable
            </h1>
            <CardDescription>{errorMessage(postsResult.error)}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Please refresh and try again.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const author = posts[0]?.author;
  const ownProfile =
    ownProfileResult.data?.username === username
      ? ownProfileResult.data
      : undefined;
  const avatarUrl =
    author?.photo_url ??
    (
      ownProfile as
        (typeof ownProfile & { avatar_url?: string | null }) | undefined
    )?.avatar_url;
  const seed = author?.id ?? ownProfile?.id ?? username;
  const initials = (author?.full_name || username).slice(0, 2).toUpperCase();

  return (
    <main className="mx-auto max-w-4xl px-5 pt-12 pb-20 sm:px-8">
      <section className="bg-card rounded-3xl border p-8 sm:p-12">
        <Avatar className="size-24" size="lg">
          {avatarUrl ? (
            <AvatarImage
              alt={`${username}'s profile photo`}
              keepMounted
              src={avatarUrl}
            />
          ) : null}
          <AvatarFallback seed={seed}>{initials}</AvatarFallback>
        </Avatar>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          {author?.full_name || username}
        </h1>
        <p className="text-muted-foreground mt-2">@{username}</p>
      </section>

      <section aria-labelledby="profile-posts-heading" className="mt-8">
        <h2
          className="mb-4 text-xl font-semibold tracking-tight"
          id="profile-posts-heading"
        >
          Publications
        </h2>
        {posts.length ? (
          <div className="grid gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No publications yet</CardTitle>
              <CardDescription>
                @{username} has not shared any posts yet.
              </CardDescription>
            </CardHeader>
            {ownProfile ? (
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Ready to share a moment?{" "}
                  <Link
                    className="text-primary font-semibold hover:underline"
                    href="/post/new"
                  >
                    Write a post
                  </Link>
                </p>
              </CardContent>
            ) : null}
          </Card>
        )}
      </section>
    </main>
  );
}
