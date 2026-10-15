import type { Metadata } from "next";

type PostPageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { id } = await params;
  const title = "Community post";
  const description = `A Pet Pulse community post (${id}).`;
  return {
    title,
    description,
    openGraph: { title: `${title} · Pet Pulse`, description, type: "article" },
  };
}

export default async function PublicPostPage({ params }: PostPageProps) {
  const { id } = await params;
  return (
    <main className="mx-auto max-w-3xl px-5 pt-12 pb-20 sm:px-8">
      <article className="bg-card rounded-3xl border p-8 sm:p-12">
        <p className="text-primary text-sm font-semibold tracking-[0.16em] uppercase">
          Pet Pulse community
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          A community post
        </h1>
        <p className="text-muted-foreground mt-4">
          This page is ready for post details.
        </p>
        <p className="text-muted-foreground mt-6 text-xs">Post ID: {id}</p>
        <p className="text-muted-foreground mt-4 border-t pt-4 text-sm">
          The current API does not expose public post lookup yet.
        </p>
      </article>
    </main>
  );
}
