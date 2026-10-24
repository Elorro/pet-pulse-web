import type { Metadata } from "next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";

type ProfilePageProps = { params: Promise<{ username: string }> };

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const name = `@${username}`;
  const description = `Pet Pulse profile for ${name}.`;
  return {
    title: name,
    description,
    openGraph: { title: `${name} · Pet Pulse`, description, type: "profile" },
  };
}

export default async function PublicProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const { data: profile, error } = await api.GET("/api/v1/auth/me");

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-5 pt-12 pb-20 sm:px-8">
        <Card>
          <CardHeader>
            <h1 className="text-base leading-snug font-medium">
              Profile unavailable
            </h1>
            <CardDescription>{errorMessage(error)}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Please refresh and try again.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (profile?.username === username) {
    // avatar_url is the optional profile photo field expected from the API.
    const avatarUrl = (
      profile as typeof profile & { avatar_url?: string | null }
    ).avatar_url;
    const initials = profile.username.slice(0, 2).toUpperCase();

    return (
      <main className="mx-auto max-w-4xl px-5 pt-12 pb-20 sm:px-8">
        <section className="bg-card rounded-3xl border p-8 sm:p-12">
          <Avatar className="size-24" size="lg">
            {avatarUrl ? (
              <AvatarImage
                alt={`${profile.username}'s profile photo`}
                keepMounted
                src={avatarUrl}
              />
            ) : null}
            <AvatarFallback seed={profile.id}>{initials}</AvatarFallback>
          </Avatar>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            {profile.username}
          </h1>
          <p className="text-muted-foreground mt-2">Your profile</p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-5 pt-12 pb-20 sm:px-8">
      <section className="bg-card rounded-3xl border p-8 sm:p-12">
        <div className="bg-secondary text-primary flex size-20 items-center justify-center rounded-full text-3xl font-semibold">
          {username.slice(0, 1).toUpperCase()}
        </div>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          @{username}
        </h1>
        <p className="text-muted-foreground mt-2">
          This public profile page is ready for profile data.
        </p>
        <p className="text-muted-foreground mt-6 max-w-lg text-sm">
          The current API only returns the signed-in user’s basic profile.
          Public profile lookup is not implemented yet.
        </p>
      </section>
    </main>
  );
}
