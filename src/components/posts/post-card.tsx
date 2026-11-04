import Image from "next/image";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PostLikeButton } from "@/components/posts/post-like-button";

type PostCardProps = {
  post: {
    id: string;
    content: string;
    created_at: string;
    media_url: string | null;
    like_count?: number;
    author?: {
      username: string;
      full_name: string | null;
      photo_url: string | null;
    };
  };
};

export function PostCard({ post }: PostCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">
          <Link className="hover:underline" href={`/post/${post.id}`}>
            {post.author ? (
              <>
                {post.author.full_name || `@${post.author.username}`}
                {post.author.full_name ? ` · @${post.author.username}` : null}
              </>
            ) : (
              "A Pet Pulse community post"
            )}
          </Link>
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
        <div className="mt-3 flex items-center justify-between border-t pt-2">
          <PostLikeButton
            postId={post.id}
            initialCount={post.like_count ?? 0}
          />
          <div className="flex items-center gap-3">
            <Link
              className="text-primary text-sm font-medium hover:underline"
              href={`/post/${post.id}#comment-content`}
            >
              Comment
            </Link>
            <Link
              className="text-muted-foreground text-sm hover:underline"
              href={`/post/${post.id}`}
            >
              View post and comments
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
