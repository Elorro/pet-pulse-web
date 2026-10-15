import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <>
      <SiteHeader>
        <Link href="/login" className={buttonVariants({ variant: "ghost" })}>
          Sign in
        </Link>
        <Link href="/signup" className={buttonVariants()}>
          Sign up
        </Link>
      </SiteHeader>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Pet Pulse</h1>
        <p className="max-w-md text-muted-foreground">
          The social network for pets: share posts, help rescues and find a home
          for every animal.
        </p>
        <Link href="/signup" className={buttonVariants({ size: "lg" })}>
          Join Pet Pulse
        </Link>
      </main>
    </>
  );
}
