import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { likePostAction, push } = vi.hoisted(() => ({
  likePostAction: vi.fn(),
  push: vi.fn(),
}));

vi.mock("@/lib/posts/actions", () => ({ likePostAction }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { PostLikeButton } from "@/components/posts/post-like-button";

describe("PostLikeButton", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sends one like request and uses the API's returned count", async () => {
    let resolveRequest: (value: unknown) => void = () => {};
    likePostAction.mockReturnValue(
      new Promise((resolve) => (resolveRequest = resolve)),
    );
    render(<PostLikeButton postId="post-1" initialCount={2} />);

    const button = screen.getByRole("button", { name: "Like, 2 likes" });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(likePostAction).toHaveBeenCalledTimes(1);
    expect(likePostAction).toHaveBeenCalledWith("post-1");
    resolveRequest({ likeCount: 3 });

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Liked, 3 likes" }),
      ).toBeDisabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Liked, 3 likes" }));
    expect(likePostAction).toHaveBeenCalledTimes(1);
  });

  it("sends unauthenticated users to login", async () => {
    likePostAction.mockResolvedValue({ unauthorized: true });
    render(<PostLikeButton postId="post-1" initialCount={0} />);

    fireEvent.click(screen.getByRole("button", { name: "Like, 0 likes" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/login?next=%2F"));
  });
});
