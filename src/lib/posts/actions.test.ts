import { beforeEach, describe, expect, it, vi } from "vitest";

const { post, revalidatePath, redirect } = vi.hoisted(() => ({
  post: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({ api: { POST: post } }));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect }));

import { createPostAction } from "@/lib/posts/actions";

describe("createPostAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(["", "   \n "])(
    "rejects empty content %j without calling the API",
    async (content) => {
      const formData = new FormData();
      formData.set("content", content);

      const result = await createPostAction({}, formData);

      expect(result.error).toBeTruthy();
      expect(post).not.toHaveBeenCalled();
    },
  );

  it("revalidates the feed and redirects after a successful post", async () => {
    post.mockResolvedValue({
      data: { id: "post-1" },
      error: undefined,
      response: { status: 201 },
    });
    const formData = new FormData();
    formData.set("content", "  Hello, pets!  ");

    await createPostAction({}, formData);

    expect(post).toHaveBeenCalledWith("/api/v1/posts/", {
      body: { content: "Hello, pets!" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/feed");
    expect(redirect).toHaveBeenCalledWith("/feed");
  });

  it("redirects to login when the API returns 401", async () => {
    post.mockResolvedValue({
      error: { detail: "Unauthorized" },
      response: { status: 401 },
    });
    const formData = new FormData();
    formData.set("content", "Hello");

    await createPostAction({}, formData);

    expect(redirect).toHaveBeenCalledWith("/login?next=/post/new");
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("joins validation messages from a 422 response", async () => {
    post.mockResolvedValue({
      error: { detail: [{ msg: "Too short" }, { msg: "Try again" }] },
      response: { status: 422 },
    });
    const formData = new FormData();
    formData.set("content", "Hello");

    const result = await createPostAction({}, formData);

    expect(result.error).toBe("Too short. Try again");
  });
});
