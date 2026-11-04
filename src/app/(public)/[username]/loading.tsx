export default function ProfileLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading profile"
      className="mx-auto max-w-4xl px-5 pt-12 pb-20 sm:px-8"
    >
      <section className="bg-card animate-pulse rounded-3xl border p-8 motion-reduce:animate-none sm:p-12">
        <div className="bg-muted size-24 rounded-full" />
        <div className="bg-muted mt-6 h-9 w-48 rounded" />
      </section>
      <section aria-label="Loading publications" className="mt-8 grid gap-4">
        <div className="bg-muted h-7 w-40 animate-pulse rounded motion-reduce:animate-none" />
        <div className="bg-card h-48 animate-pulse rounded-2xl border motion-reduce:animate-none" />
      </section>
    </main>
  );
}
