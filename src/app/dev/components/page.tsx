import { notFound } from "next/navigation";

import { DevComponentsShowcase } from "@/components/showpiece/dev-components-showcase";

export const dynamic = "force-dynamic";

export default function DevComponentsPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-5 py-10 sm:px-8">
      <header>
        <p className="text-muted-foreground text-sm">Development only</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Component review
        </h1>
        <p className="text-muted-foreground mt-2">
          Compare the installed libraries against both theme palettes.
        </p>
      </header>
      <DevComponentsShowcase />
    </main>
  );
}
