import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getProfile } = vi.hoisted(() => ({ getProfile: vi.fn() }));

vi.mock("@/lib/api/client", () => ({
  api: { GET: getProfile },
}));

import PublicProfilePage from "./page";

describe("PublicProfilePage", () => {
  beforeEach(() => getProfile.mockReset());

  it("shows the signed-in user's name and optional profile photo", async () => {
    getProfile.mockResolvedValue({
      data: {
        id: "user-1",
        username: "luna",
        email: "luna@example.test",
        created_at: "2026-01-01T00:00:00Z",
        avatar_url: "https://images.test/luna.png",
      },
    });

    render(
      await PublicProfilePage({
        params: Promise.resolve({ username: "luna" }),
      }),
    );

    expect(screen.getByRole("heading", { name: "luna" })).toBeInTheDocument();
    expect(screen.getByAltText("luna's profile photo")).toHaveAttribute(
      "src",
      "https://images.test/luna.png",
    );
    expect(getProfile).toHaveBeenCalledWith("/api/v1/auth/me");
  });

  it("shows a generated avatar fallback when there is no photo", async () => {
    getProfile.mockResolvedValue({
      data: {
        id: "user-1",
        username: "luna",
        email: null,
        created_at: "2026-01-01T00:00:00Z",
      },
    });

    render(
      await PublicProfilePage({
        params: Promise.resolve({ username: "luna" }),
      }),
    );

    expect(screen.getByRole("heading", { name: "luna" })).toBeInTheDocument();
    expect(
      screen.queryByAltText("luna's profile photo"),
    ).not.toBeInTheDocument();
    expect(
      document.querySelector('[data-slot="avatar-fallback"]'),
    ).toBeInTheDocument();
  });

  it("does not show the authenticated user's data on another username route", async () => {
    getProfile.mockResolvedValue({
      data: {
        id: "user-1",
        username: "luna",
        email: null,
        created_at: "2026-01-01T00:00:00Z",
        avatar_url: "https://images.test/luna.png",
      },
    });

    render(
      await PublicProfilePage({
        params: Promise.resolve({ username: "someone-else" }),
      }),
    );

    expect(
      screen.queryByRole("heading", { name: "luna" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("This public profile page is ready for profile data."),
    ).toBeInTheDocument();
  });

  it("shows an error state when the profile request fails", async () => {
    getProfile.mockResolvedValue({ error: { detail: "Service unavailable" } });

    render(
      await PublicProfilePage({
        params: Promise.resolve({ username: "luna" }),
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Profile unavailable" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Service unavailable")).toBeInTheDocument();
  });
});
