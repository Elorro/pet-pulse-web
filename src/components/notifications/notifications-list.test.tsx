import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { markOne, markAll, refresh } = vi.hoisted(() => ({
  markOne: vi.fn(),
  markAll: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("@/lib/notifications/actions", () => ({
  markNotificationReadAction: markOne,
  markAllNotificationsReadAction: markAll,
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

import { NotificationsList } from "@/components/notifications/notifications-list";

const notification = {
  id: "notification-1",
  type: "comment" as const,
  created_at: "2026-11-09T12:00:00Z",
  read_at: null,
  actor: {
    id: "actor-1",
    username: "luna",
    full_name: "Luna",
    photo_url: null,
  },
  post: { id: "post-1", content: "A happy walk", media_url: null },
  comment_content: "What a lovely day!",
};

describe("NotificationsList", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows unread comments, links to the post, and marks one as read", async () => {
    markOne.mockResolvedValue({ success: true });
    render(<NotificationsList notifications={[notification]} />);

    expect(screen.getByText("1 unread")).toBeInTheDocument();
    expect(screen.getByText("“What a lovely day!”")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Luna commented on your post/i }),
    ).toHaveAttribute("href", "/post/post-1");
    fireEvent.click(
      screen.getByRole("button", { name: "Mark notification as read" }),
    );

    await waitFor(() => expect(markOne).toHaveBeenCalledWith("notification-1"));
    expect(
      await screen.findByText("You are all caught up"),
    ).toBeInTheDocument();
    expect(refresh).toHaveBeenCalled();
  });

  it("marks all unread notifications as read and reports failures", async () => {
    markAll.mockResolvedValueOnce({ success: true });
    render(
      <NotificationsList
        notifications={[
          notification,
          { ...notification, id: "notification-2" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Mark all as read" }));
    await waitFor(() => expect(markAll).toHaveBeenCalledOnce());
    expect(
      await screen.findByText("You are all caught up"),
    ).toBeInTheDocument();

    markOne.mockResolvedValueOnce({ error: "Try again" });
    render(<NotificationsList notifications={[notification]} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Mark notification as read" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Try again");
  });

  it("shows an empty state", () => {
    render(<NotificationsList notifications={[]} />);
    expect(screen.getByText("No notifications yet")).toBeInTheDocument();
  });
});
