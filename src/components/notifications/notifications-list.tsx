"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Bell, Heart, MessageCircle } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/notifications/actions";
import type { components } from "@/lib/api/schema";

type Notification = components["schemas"]["Notification"];

export function NotificationsList({
  notifications,
}: {
  notifications: Notification[];
}) {
  const [items, setItems] = useState(notifications);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const unreadCount = items.filter((item) => !item.read_at).length;

  function markRead(id: string) {
    setError("");
    startTransition(async () => {
      const result = await markNotificationReadAction(id);
      if ("error" in result) return setError(result.error);
      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, read_at: new Date().toISOString() }
            : item,
        ),
      );
      router.refresh();
    });
  }

  function markAllRead() {
    setError("");
    startTransition(async () => {
      const result = await markAllNotificationsReadAction();
      if ("error" in result) return setError(result.error);
      const readAt = new Date().toISOString();
      setItems((current) =>
        current.map((item) =>
          item.read_at ? item : { ...item, read_at: readAt },
        ),
      );
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex min-h-8 items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm" aria-live="polite">
          {unreadCount ? `${unreadCount} unread` : "You are all caught up"}
        </p>
        {unreadCount > 0 ? (
          <Button
            disabled={pending}
            onClick={markAllRead}
            size="sm"
            variant="outline"
          >
            Mark all as read
          </Button>
        ) : null}
      </div>
      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      ) : null}
      {items.length ? (
        items.map((notification) => {
          const actor = notification.actor;
          const Icon = notification.type === "like" ? Heart : MessageCircle;
          return (
            <Card
              key={notification.id}
              className={
                notification.read_at
                  ? ""
                  : "border-primary/30 bg-primary/[0.035]"
              }
            >
              <CardContent className="flex items-start gap-3 p-4">
                <div className="relative shrink-0">
                  <Avatar className="size-10">
                    {actor.photo_url ? (
                      <AvatarImage alt="" src={actor.photo_url} />
                    ) : null}
                    <AvatarFallback seed={actor.id}>
                      {actor.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="bg-background text-primary absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full">
                    <Icon aria-hidden="true" className="size-3.5" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    className="leading-6 hover:underline"
                    href={`/post/${notification.post.id}`}
                  >
                    <span className="font-semibold">
                      {actor.full_name || `@${actor.username}`}
                    </span>{" "}
                    {notification.type === "like"
                      ? "liked your post."
                      : "commented on your post."}
                  </Link>
                  {notification.type === "comment" &&
                  notification.comment_content ? (
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                      “{notification.comment_content}”
                    </p>
                  ) : null}
                  <p className="text-muted-foreground mt-1 text-xs">
                    <time dateTime={notification.created_at}>
                      {new Date(notification.created_at).toLocaleString()}
                    </time>
                  </p>
                  {notification.post.media_url ? (
                    <Link
                      className="mt-2 block w-fit"
                      href={`/post/${notification.post.id}`}
                      aria-label="Open related post"
                    >
                      <Image
                        alt="Photo from the post"
                        className="rounded-md object-cover"
                        height={72}
                        src={notification.post.media_url}
                        width={96}
                      />
                    </Link>
                  ) : null}
                </div>
                {!notification.read_at ? (
                  <Button
                    aria-label="Mark notification as read"
                    disabled={pending}
                    onClick={() => markRead(notification.id)}
                    size="icon-sm"
                    variant="ghost"
                  >
                    <Bell aria-hidden="true" />
                  </Button>
                ) : (
                  <span
                    className="text-primary mt-2 size-2 shrink-0 rounded-full"
                    aria-label="Read"
                  />
                )}
              </CardContent>
            </Card>
          );
        })
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <Bell className="text-muted-foreground size-8" aria-hidden="true" />
            <p className="font-medium">No notifications yet</p>
            <p className="text-muted-foreground text-sm">
              Likes and comments on your posts will show up here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
