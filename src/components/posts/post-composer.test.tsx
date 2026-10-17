import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/posts/actions", () => ({
  createPostAction: vi.fn(async () => ({})),
}));

import { PostComposer } from "@/components/posts/post-composer";

describe("PostComposer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
