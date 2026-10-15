import type { Metadata } from "next";
import { api } from "@/lib/api/client";
import { SettingsCommandPalette } from "@/components/arc/settings-command-palette";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { data: profile } = await api.GET("/api/v1/auth/me");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your account</CardTitle>
          <CardDescription>
            Profile editing is not available in the API yet.
          </CardDescription>
        </CardHeader>
      </Card>
      {profile && (
        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">Quick actions</h2>
          <p className="text-muted-foreground text-sm">
            Search and open a Pet Pulse destination.
          </p>
          <SettingsCommandPalette username={profile.username} />
        </section>
      )}
    </div>
  );
}
