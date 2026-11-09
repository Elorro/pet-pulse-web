import type { Metadata } from "next";

import { Card, CardContent } from "@/components/ui/card";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { api } from "@/lib/api/client";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const { data: notifications, error } = await api.GET(
    "/api/v1/notifications/",
    {
      params: { query: { limit: 100, offset: 0 } },
    },
  );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <p className="text-primary text-sm font-semibold tracking-[0.16em] uppercase">
          Your activity
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Notifications
        </h1>
      </div>
      {error ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-muted-foreground text-sm">
              Notifications are temporarily unavailable. Check that the Pet
              Pulse API is running, then refresh.
            </p>
          </CardContent>
        </Card>
      ) : (
        <NotificationsList notifications={notifications ?? []} />
      )}
    </div>
  );
}
