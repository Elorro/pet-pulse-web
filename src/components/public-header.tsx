import Link from "next/link";

import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <Brand />
      <nav aria-label="Account" className="flex items-center gap-2">
        <ThemeToggle />
        <Link
          className={buttonVariants({ size: "sm", variant: "ghost" })}
          href="/login"
        >
          Sign in
        </Link>
        <Link className={buttonVariants({ size: "sm" })} href="/signup">
          Join
        </Link>
      </nav>
    </header>
  );
}
