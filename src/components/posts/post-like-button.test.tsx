import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { post, push } = vi.hoisted(() => ({ post: vi.fn(), push: vi.fn() }));

vi.mock("@/lib/api/client", () => ({ api: { POST: post } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { PostLikeButton } from "@/components/posts/post-like-button";

describe("PostLikeButton", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends one like request and uses the API's returned count", async () => {
    let resolveRequest: (value: unknown) => void = () => {};
    post.mockReturnValue(new Promise((resolve) => (resolveRequest = resolve)));
    render(<PostLikeButton postId="post-1" initialCount={2} />);

    const button = screen.getByRole("button", { name: "Like, 2 likes" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith("/api/v1/posts/{id}/like", {
      params: { path: { id: "post-1" } },
    });
    resolveRequest({
      data: { like_count: 3 },
      error: undefined,
      response: { status: 200 },
    });

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Liked, 3 likes" }),
      ).toBeDisabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Liked, 3 likes" }));
    expect(post).toHaveBeenCalledTimes(1);
  });

  it("sends unauthenticated users to login", async () => {
    post.mockResolvedValue({
      error: { detail: "Unauthorized" },
      response: { status: 401 },
    });
    render(<PostLikeButton postId="post-1" initialCount={0} />);

    fireEvent.click(screen.getByRole("button", { name: "Like, 0 likes" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/login?next=%2F"));
  });
});
