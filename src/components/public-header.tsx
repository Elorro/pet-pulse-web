import Link from "next/link";

import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { buttonVariants } from "@/components/ui/button";
import { api } from "@/lib/api/client";

export async function PublicHeader() {
  const { data: profile } = await api.GET("/api/v1/auth/me");

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <Brand />
      <nav aria-label="Account" className="flex items-center gap-2">
        <ThemeToggle />
        {profile ? (
          <>
            <Link
              className={buttonVariants({ size: "sm", variant: "ghost" })}
              href="/feed"
            >
              Feed
            </Link>
            <UserMenu
              email={profile.email}
              userId={profile.id}
              username={profile.username}
            />
          </>
        ) : (
          <>
            <Link
              className={buttonVariants({ size: "sm", variant: "ghost" })}
              href="/login"
            >
              Sign in
            </Link>
            <Link className={buttonVariants({ size: "sm" })} href="/signup">
              Join
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
