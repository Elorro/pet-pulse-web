"use server";

import { revalidatePath } from "next/cache";

import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";

export type NotificationMutationResult = { success: true } | { error: string };

export async function markNotificationReadAction(
  notificationId: string,
): Promise<NotificationMutationResult> {
  const { error, response } = await api.PATCH(
    "/api/v1/notifications/{notification_id}/read",
    { params: { path: { notification_id: notificationId } } },
  );
  if (response.status === 401) return { error: "Please sign in again." };
  if (error) return { error: errorMessage(error) };
  revalidatePath("/notifications");
  return { success: true };
}

export async function markAllNotificationsReadAction(): Promise<NotificationMutationResult> {
  const { error, response } = await api.PATCH(
    "/api/v1/notifications/read-all",
    {},
  );
  if (response.status === 401) return { error: "Please sign in again." };
  if (error) return { error: errorMessage(error) };
  revalidatePath("/notifications");
  return { success: true };
}
