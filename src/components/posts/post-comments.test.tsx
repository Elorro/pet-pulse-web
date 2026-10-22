import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createPostCommentAction, refresh, push } = vi.hoisted(() => ({
  createPostCommentAction: vi.fn(),
  refresh: vi.fn(),
  push: vi.fn(),
}));

vi.mock("@/lib/posts/actions", () => ({ createPostCommentAction }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, push }),
}));

import { PostComments } from "@/components/posts/post-comments";

const comment = {
  id: "comment-1",
  post_id: "post-1",
  content: "Hello from the community",
  media: null,
  created_at: "2026-10-22T12:00:00Z",
  author: { id: "user-1", username: "luis" },
};

describe("PostComments", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows existing comments and the empty-list state", () => {
    const { container, rerender } = render(
      <PostComments
        initialComments={[comment]}
        isAuthenticated
        postId="post-1"
      />,
    );
    expect(screen.getByText("luis")).toBeInTheDocument();
    expect(screen.getByText("Hello from the community")).toBeInTheDocument();
    expect(container.querySelector("time")).toHaveAttribute(
      "dateTime",
      "2026-10-22T12:00:00Z",
    );

    rerender(
      <PostComments initialComments={[]} isAuthenticated postId="post-1" />,
    );
    expect(
      screen.getByText("There are no comments yet. Start the conversation."),
    ).toBeInTheDocument();
  });

  it("publishes and displays the returned comment", async () => {
    createPostCommentAction.mockResolvedValue({ comment });
    render(
      <PostComments initialComments={[]} isAuthenticated postId="post-1" />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Your comment" }), {
      target: { value: "Hello from the community" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Post comment" }));

    await waitFor(() =>
      expect(screen.getByText("Hello from the community")).toBeInTheDocument(),
    );
  });

  it("preserves the post path for sign-in and retries failed loads", () => {
    const { rerender } = render(
      <PostComments
        initialComments={[]}
        isAuthenticated={false}
        postId="post-1"
      />,
    );
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login?next=%2Fpost%2Fpost-1",
    );

    rerender(
      <PostComments
        initialComments={[]}
        isAuthenticated
        loadError="Unable to load comments"
        postId="post-1"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(refresh).toHaveBeenCalledOnce();
  });
});
