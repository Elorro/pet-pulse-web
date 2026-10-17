import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { toastError } = vi.hoisted(() => ({ toastError: vi.fn() }));

vi.mock("sonner", () => ({ toast: { error: toastError } }));
vi.mock("@/lib/posts/actions", () => ({
  createPostAction: vi.fn(async () => ({})),
  requestMediaUploadAction: vi.fn(async () => ({
    path: "user/photo.png",
    uploadUrl: "https://storage.test",
  })),
}));

import { PostComposer } from "@/components/posts/post-composer";
import {
  createPostAction,
  requestMediaUploadAction,
} from "@/lib/posts/actions";

describe("PostComposer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:preview"),
      revokeObjectURL: vi.fn(),
    });
  });

  it("updates the character counter while typing", () => {
    render(<PostComposer />);
    fireEvent.change(screen.getByRole("textbox", { name: "Your post" }), {
      target: { value: "Milo is napping" },
    });
    expect(screen.getByText("15 / 5000")).toBeInTheDocument();
  });

  it.each(["", "   "])("disables submit for value %j", (value) => {
    render(<PostComposer />);
    const textarea = screen.getByRole("textbox", { name: "Your post" });
    fireEvent.change(textarea, { target: { value } });
    expect(screen.getByRole("button", { name: "Post" })).toBeDisabled();
  });

  it("associates the label with the textarea", () => {
    render(<PostComposer />);
    expect(screen.getByLabelText("Your post")).toHaveAttribute("id", "content");
  });

  it("shows a selected photo preview and can remove it", () => {
    render(<PostComposer />);
    const input =
      document.querySelector<HTMLInputElement>('input[type="file"]');
    const file = new File(["image"], "photo.png", { type: "image/png" });
    fireEvent.change(input!, { target: { files: [file] } });

    expect(screen.getByAltText("Photo preview")).toHaveAttribute(
      "src",
      "blob:preview",
    );
    expect(
      screen.getByRole("button", { name: "Remove photo" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove photo" }));
    expect(screen.queryByAltText("Photo preview")).not.toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });

  it("shows an error and no preview for an invalid file", () => {
    render(<PostComposer />);
    const input =
      document.querySelector<HTMLInputElement>('input[type="file"]');
    fireEvent.change(input!, {
      target: {
        files: [new File(["text"], "notes.txt", { type: "text/plain" })],
      },
    });
    expect(toastError).toHaveBeenCalled();
    expect(screen.queryByAltText("Photo preview")).not.toBeInTheDocument();
  });

  it("attaches an image dropped on the composer", () => {
    render(<PostComposer />);
    const file = new File(["image"], "photo.webp", { type: "image/webp" });
    const card = document.querySelector('[data-slot="card"]')!;
    fireEvent.drop(card, {
      dataTransfer: { types: ["Files"], files: [file], items: [] },
    });
    expect(screen.getByAltText("Photo preview")).toBeInTheDocument();
  });

  it("uploads a photo once and posts it with the text", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<PostComposer />);
    fireEvent.change(screen.getByRole("textbox", { name: "Your post" }), {
      target: { value: "Milo at the park" },
    });
    const input =
      document.querySelector<HTMLInputElement>('input[type="file"]');
    fireEvent.change(input!, {
      target: {
        files: [new File(["image"], "photo.png", { type: "image/png" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Post" }));

    await waitFor(() => expect(createPostAction).toHaveBeenCalledTimes(1));
    const formData = vi.mocked(createPostAction).mock.calls[0][1];
    expect(formData.get("content")).toBe("Milo at the park");
    expect(formData.get("media_path")).toBe("user/photo.png");
    expect(requestMediaUploadAction).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
