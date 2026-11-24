import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { follow, unfollow } = vi.hoisted(() => ({ follow: vi.fn(), unfollow: vi.fn() }));
vi.mock("@/lib/profile/follow-actions", () => ({ followAction: follow, unfollowAction: unfollow }));
import { FollowControls } from "./follow-controls";

describe("FollowControls", () => {
  beforeEach(() => { follow.mockReset(); unfollow.mockReset(); });

  it("shows the reciprocal status and updates to following after success", async () => {
    follow.mockResolvedValue({ following: true });
    render(<FollowControls profileId="p-2" following={false} followedBy />);
    expect(screen.getByText("Follows you")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Follow" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Unfollow" })).toBeInTheDocument());
  });

  it("unfollows and reports completion state", async () => {
    unfollow.mockResolvedValue({ following: false });
    render(<FollowControls profileId="p-2" following followedBy={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Unfollow" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Follow" })).toBeInTheDocument());
  });
});
