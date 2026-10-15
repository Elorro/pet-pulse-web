import type { Metadata } from "next";

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
