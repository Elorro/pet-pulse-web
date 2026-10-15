import type { Metadata } from "next";
import { Suspense } from "react";

import { createServerApiClient } from "@/lib/api/server";

export const metadata: Metadata = { title: "Feed" };

async function Welcome() {
  const api = await createServerApiClient();
  // Also creates the FastAPI profile on the user's first visit.
  const { data, error } = await api.GET("/api/v1/auth/me");

  if (error || !data) {
    return (
      <p className="text-sm text-destructive">
        Could not load your profile from the API.
      </p>
    );
  }
  return (
    <p className="text-muted-foreground">
      Signed in as <span className="text-foreground">@{data.username}</span>.
    </p>
  );
}

export default function FeedPage() {
  return (
    <div className="grid gap-2">
      <h1 className="text-2xl font-semibold">Feed</h1>
      <Suspense fallback={<p className="text-muted-foreground">Loading…</p>}>
        <Welcome />
      </Suspense>
      <p className="text-sm text-muted-foreground">Posts will appear here.</p>
    </div>
  );
}
