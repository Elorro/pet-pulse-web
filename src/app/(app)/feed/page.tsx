import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api/client";

export const metadata: Metadata = { title: "Community feed" };

export default async function FeedPage() {
  const { data: posts, error } = await api.GET("/api/v1/posts/", {
    params: { query: { limit: 20, offset: 0 } },
  });

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div>
        <p className="text-primary text-sm font-semibold tracking-[0.16em] uppercase">
          Your community
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">The feed</h1>
        <p className="text-muted-foreground mt-2">
          A little window into the lives of pets and their people.
        </p>
        <Link
          className="text-primary mt-4 inline-flex text-sm font-semibold hover:underline"
          href="/post/new"
        >
          Write a post
        </Link>
      </div>
      {error ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">
              The feed is temporarily unavailable. Check that the Pet Pulse API
              is running, then refresh.
            </p>
          </CardContent>
        </Card>
      ) : posts?.length ? (
        posts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                A Pet Pulse community post
              </CardTitle>
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
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>It is quiet for now</CardTitle>
            <CardDescription>There are no community posts yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Be the first to share a moment.{" "}
              <Link
                className="text-primary font-semibold hover:underline"
                href="/post/new"
              >
                Write a post
              </Link>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
