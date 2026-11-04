import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getProfile, routerPush } = vi.hoisted(() => ({
  getProfile: vi.fn(),
  routerPush: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  api: { GET: getProfile },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush }),
}));

import PublicProfilePage from "./page";

const postFor = (username: string, photoUrl: string | null = null) => ({
  id: "post-1",
  author_id: "user-1",
  content: `${username}'s post`,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  media_url: null,
  like_count: 2,
  author: {
    id: "user-1",
    username,
    full_name: null,
    photo_url: photoUrl,
  },
});

const signedInProfile = {
  id: "user-1",
  username: "luna",
  email: "luna@example.test",
  created_at: "2026-01-01T00:00:00Z",
  avatar_url: "https://images.test/luna.png",
};

function mockProfileRequests({
  postsResult,
  profile = signedInProfile,
}: {
  postsResult: { data?: unknown; error?: unknown };
  profile?: typeof signedInProfile | null;
}) {
  getProfile.mockImplementation((path: string) => {
    if (path === "/api/v1/posts/by-username/{username}") {
      return Promise.resolve(postsResult);
    }
    return Promise.resolve({ data: profile });
  });
}

describe("PublicProfilePage", () => {
  beforeEach(() => getProfile.mockReset());

  it("shows the requested profile and its posts with the author's photo", async () => {
    mockProfileRequests({
      postsResult: {
        data: [postFor("luna", "https://images.test/luna.png")],
      },
    });

    render(
      await PublicProfilePage({
        params: Promise.resolve({ username: "luna" }),
      }),
    );

    expect(screen.getByRole("heading", { name: "luna" })).toBeInTheDocument();
    expect(screen.getByText("luna's post")).toBeInTheDocument();
    expect(screen.getByAltText("luna's profile photo")).toHaveAttribute(
      "src",
      "https://images.test/luna.png",
    );
    expect(getProfile).toHaveBeenCalledWith(
      "/api/v1/posts/by-username/{username}",
      {
        params: {
          path: { username: "luna" },
          query: { limit: 20, offset: 0 },
        },
      },
    );
  });

  it("shows an avatar fallback when the profile has no photo", async () => {
    mockProfileRequests({
      postsResult: { data: [postFor("luna")] },
      profile: null,
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

  it("shows only the posts returned for the username in the route", async () => {
    mockProfileRequests({
      postsResult: { data: [postFor("someone-else")] },
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
      screen.getByRole("heading", { name: "someone-else" }),
    ).toBeInTheDocument();
    expect(screen.getByText("someone-else's post")).toBeInTheDocument();
  });

  it("shows an empty state when the profile has no posts", async () => {
    mockProfileRequests({ postsResult: { data: [] } });

    render(
      await PublicProfilePage({
        params: Promise.resolve({ username: "luna" }),
      }),
    );

    expect(screen.getByText("No publications yet")).toBeInTheDocument();
    expect(
      screen.getByText("@luna has not shared any posts yet."),
    ).toBeInTheDocument();
  });

  it("shows an error state when the profile posts request fails", async () => {
    mockProfileRequests({
      postsResult: { error: { detail: "Service unavailable" } },
    });

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
