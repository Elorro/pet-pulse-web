import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/posts/post-like-button", () => ({
  PostLikeButton: () => <button type="button">Like</button>,
}));

import { PostCard } from "@/components/posts/post-card";

describe("PostCard", () => {
  it("links to the focused comment form and keeps the post link", () => {
    render(
      <PostCard
        post={{
          id: "post-1",
          content: "A community update",
          created_at: "2026-10-22T12:00:00Z",
          media_url: null,
        }}
      />,
    );

    expect(screen.getByRole("link", { name: "Comment" })).toHaveAttribute(
      "href",
      "/post/post-1#comment-content",
    );
    expect(
      screen.getByRole("link", { name: "View post and comments" }),
    ).toHaveAttribute("href", "/post/post-1");
  });
});
