import type { Metadata } from "next";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">
        Notifications
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Notifications are coming soon</CardTitle>
          <CardDescription>
            This protected page is ready for the first notification feature.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
