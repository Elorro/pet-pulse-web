import { beforeEach, describe, expect, it, vi } from "vitest";

const { put, del } = vi.hoisted(() => ({ put: vi.fn(), del: vi.fn() }));
vi.mock("@/lib/api/client", () => ({ api: { PUT: put, DELETE: del } }));

import { followAction, unfollowAction } from "./follow-actions";

describe("profile follow actions", () => {
  beforeEach(() => { put.mockReset(); del.mockReset(); });

  it("follows a profile through the typed API", async () => {
    put.mockResolvedValue({ data: { profile_id: "p-2", following: true, created: true }, response: { status: 200 } });
    expect(await followAction("p-2")).toEqual({ following: true });
    expect(put).toHaveBeenCalledWith("/api/v1/profiles/{profile_id}/follow", { params: { path: { profile_id: "p-2" } } });
  });

  it("unfollows a profile through the typed API", async () => {
    del.mockResolvedValue({ response: { status: 204 } });
    expect(await unfollowAction("p-2")).toEqual({ following: false });
    expect(del).toHaveBeenCalledWith("/api/v1/profiles/{profile_id}/follow", { params: { path: { profile_id: "p-2" } } });
  });
});
