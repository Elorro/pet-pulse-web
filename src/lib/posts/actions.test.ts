import { beforeEach, describe, expect, it, vi } from "vitest";

const { post, get, remove, revalidatePath, redirect } = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  remove: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  api: { POST: post, GET: get, DELETE: remove },
}));
vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("next/navigation", () => ({ redirect }));

import {
  createPostAction,
  createPostCommentAction,
  getPostLikeStatusAction,
  likePostAction,
  requestMediaUploadAction,
  unlikePostAction,
} from "@/lib/posts/actions";

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

  it("passes media_path only when it is set", async () => {
    post.mockResolvedValue({
      data: { id: "post-1" },
      error: undefined,
      response: { status: 201 },
    });
    const withMedia = new FormData();
    withMedia.set("content", "Hello");
    withMedia.set("media_path", "user-1/photo.png");
    await createPostAction({}, withMedia);
    expect(post).toHaveBeenCalledWith("/api/v1/posts/", {
      body: { content: "Hello", media_path: "user-1/photo.png" },
    });

    post.mockClear();
    post.mockResolvedValue({
      data: { id: "post-2" },
      error: undefined,
      response: { status: 201 },
    });
    const withoutMedia = new FormData();
    withoutMedia.set("content", "Hello");
    withoutMedia.set("media_path", "");
    await createPostAction({}, withoutMedia);
    expect(post).toHaveBeenCalledWith("/api/v1/posts/", {
      body: { content: "Hello" },
    });
  });
});

describe("requestMediaUploadAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("maps a successful upload response", async () => {
    post.mockResolvedValue({
      data: {
        path: "user-1/photo.png",
        upload_url: "https://storage.test/upload",
      },
      error: undefined,
      response: { status: 201 },
    });
    await expect(requestMediaUploadAction("image/png")).resolves.toEqual({
      path: "user-1/photo.png",
      uploadUrl: "https://storage.test/upload",
    });
    expect(post).toHaveBeenCalledWith("/api/v1/posts/media-uploads", {
      body: { content_type: "image/png" },
    });
  });

  it("redirects to login on 401", async () => {
    post.mockResolvedValue({
      error: { detail: "Unauthorized" },
      response: { status: 401 },
    });
    await requestMediaUploadAction("image/png");
    expect(redirect).toHaveBeenCalledWith("/login?next=/post/new");
  });

  it("returns API errors", async () => {
    post.mockResolvedValue({
      error: { detail: "Unsupported" },
      response: { status: 422 },
    });
    await expect(requestMediaUploadAction("image/png")).resolves.toEqual({
      error: "Unsupported",
    });
  });
});

describe("likePostAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("likes the post and returns the API's count", async () => {
    post.mockResolvedValue({
      data: { like_count: 3 },
      error: undefined,
      response: { status: 200 },
    });
    await expect(likePostAction("post-1")).resolves.toEqual({ likeCount: 3 });
    expect(post).toHaveBeenCalledWith("/api/v1/posts/{post_id}/like", {
      params: { path: { post_id: "post-1" } },
    });
  });

  it("reports unauthenticated users", async () => {
    post.mockResolvedValue({
      error: { detail: "Unauthorized" },
      response: { status: 401 },
    });
    await expect(likePostAction("post-1")).resolves.toEqual({
      unauthorized: true,
    });
  });

  it("returns API errors", async () => {
    post.mockResolvedValue({
      error: { detail: "Not found" },
      response: { status: 404 },
    });
    await expect(likePostAction("post-1")).resolves.toEqual({
      error: "Not found",
    });
  });
});

describe("post like status actions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the viewer's like status", async () => {
    get.mockResolvedValue({
      data: { like_count: 3, liked: true },
      error: undefined,
      response: { status: 200 },
    });
    await expect(getPostLikeStatusAction("post-1")).resolves.toEqual({
      likeCount: 3,
      liked: true,
    });
  });

  it("removes a like and returns the updated count", async () => {
    remove.mockResolvedValue({
      data: { like_count: 2 },
      error: undefined,
      response: { status: 200 },
    });
    await expect(unlikePostAction("post-1")).resolves.toEqual({ likeCount: 2 });
  });
});

describe("createPostCommentAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("posts trimmed content using the post_id route parameter", async () => {
    const comment = {
      id: "comment-1",
      post_id: "post-1",
      content: "Hello!",
      media: null,
      created_at: "2026-10-22T12:00:00Z",
      author: { id: "user-1", username: "luis" },
    };
    post.mockResolvedValue({
      data: comment,
      error: undefined,
      response: { status: 201 },
    });
    const formData = new FormData();
    formData.set("content", "  Hello!  ");

    await expect(
      createPostCommentAction("post-1", {}, formData),
    ).resolves.toEqual({ comment });
    expect(post).toHaveBeenCalledWith("/api/v1/posts/{post_id}/comments", {
      params: { path: { post_id: "post-1" } },
      body: { content: "Hello!" },
    });
    expect(revalidatePath).toHaveBeenCalledWith("/post/post-1");
  });

  it("rejects empty content without calling the API", async () => {
    const formData = new FormData();
    formData.set("content", "  ");
    await expect(
      createPostCommentAction("post-1", {}, formData),
    ).resolves.toEqual({
      error: "Write something before commenting.",
    });
    expect(post).not.toHaveBeenCalled();
  });

  it("returns unauthorized and API errors without redirecting away", async () => {
    const formData = new FormData();
    formData.set("content", "Hello");
    post.mockResolvedValueOnce({
      error: { detail: "Unauthorized" },
      response: { status: 401 },
    });
    await expect(
      createPostCommentAction("post-1", {}, formData),
    ).resolves.toEqual({
      unauthorized: true,
    });

    post.mockResolvedValueOnce({
      error: { detail: "Post not found" },
      response: { status: 404 },
    });
    await expect(
      createPostCommentAction("post-1", {}, formData),
    ).resolves.toEqual({
      error: "Post not found",
    });
  });

  it("includes the HTTP status when the API provides no readable error body", async () => {
    const formData = new FormData();
    formData.set("content", "Hello");
    post.mockResolvedValueOnce({
      response: { status: 500 },
      error: undefined,
      data: undefined,
    });

    await expect(
      createPostCommentAction("post-1", {}, formData),
    ).resolves.toEqual({
      error: "The comment could not be posted (HTTP 500).",
    });
  });
});
