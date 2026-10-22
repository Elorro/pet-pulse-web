import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  createPostCommentAction,
  requestCommentMediaUploadAction,
  refresh,
  push,
} = vi.hoisted(() => ({
  createPostCommentAction: vi.fn(),
  requestCommentMediaUploadAction: vi.fn(),
  refresh: vi.fn(),
  push: vi.fn(),
}));

vi.mock("@/lib/posts/actions", () => ({
  createPostCommentAction,
  requestCommentMediaUploadAction,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh, push }),
}));

import { PostComments } from "@/components/posts/post-comments";

const comment = {
  id: "comment-1",
  post_id: "post-1",
  content: "Hello from the community",
  media_url: null,
  created_at: "2026-10-22T12:00:00Z",
  author: { id: "user-1", username: "luis" },
};

describe("PostComments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:comment-preview"),
      revokeObjectURL: vi.fn(),
    });
  });

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

  it("uploads and publishes an attached GIF, then renders its returned URL", async () => {
    const attachedComment = {
      ...comment,
      content: "GIF time",
      media_url: "https://storage.test/comment.gif",
    };
    requestCommentMediaUploadAction.mockResolvedValue({
      path: "user-1/comment.gif",
      uploadUrl: "https://storage.test/upload",
    });
    createPostCommentAction.mockResolvedValue({ comment: attachedComment });
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    render(
      <PostComments initialComments={[]} isAuthenticated postId="post-1" />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Your comment" }), {
      target: { value: "GIF time" },
    });
    const input =
      document.querySelector<HTMLInputElement>('input[type="file"]');
    fireEvent.change(input!, {
      target: {
        files: [new File(["gif"], "comment.gif", { type: "image/gif" })],
      },
    });
    expect(screen.getByAltText("Comment image preview")).toHaveAttribute(
      "src",
      "blob:comment-preview",
    );
    fireEvent.click(screen.getByRole("button", { name: "Post comment" }));

    await waitFor(() =>
      expect(
        screen.getByAltText("Image attached to the comment"),
      ).toHaveAttribute("src", "https://storage.test/comment.gif"),
    );
    expect(requestCommentMediaUploadAction).toHaveBeenCalledWith(
      "image/gif",
      3,
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "https://storage.test/upload",
      expect.objectContaining({ method: "PUT" }),
    );
    const formData = vi.mocked(createPostCommentAction).mock.calls[0][2];
    expect(formData.get("media_path")).toBe("user-1/comment.gif");
  });

  it("rejects unsupported attachment files", () => {
    render(
      <PostComments initialComments={[]} isAuthenticated postId="post-1" />,
    );
    const input =
      document.querySelector<HTMLInputElement>('input[type="file"]');
    fireEvent.change(input!, {
      target: {
        files: [new File(["text"], "notes.txt", { type: "text/plain" })],
      },
    });
    expect(
      screen.getByText("Choose a JPEG, PNG, WebP, or GIF image."),
    ).toBeInTheDocument();
    expect(
      screen.queryByAltText("Comment image preview"),
    ).not.toBeInTheDocument();
    expect(requestCommentMediaUploadAction).not.toHaveBeenCalled();
  });

  it("shows an upload error and keeps the selected preview available", async () => {
    requestCommentMediaUploadAction.mockResolvedValue({
      path: "user-1/comment.gif",
      uploadUrl: "https://storage.test/upload",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 500 })),
    );
    render(
      <PostComments initialComments={[]} isAuthenticated postId="post-1" />,
    );
    const input =
      document.querySelector<HTMLInputElement>('input[type="file"]');
    fireEvent.change(input!, {
      target: {
        files: [new File(["gif"], "comment.gif", { type: "image/gif" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Post comment" }));

    expect(
      await screen.findByText(
        "The image could not be uploaded. Please try again.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByAltText("Comment image preview")).toBeInTheDocument();
    expect(createPostCommentAction).not.toHaveBeenCalled();
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
