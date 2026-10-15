import type { ReactNode } from "react";
import Link from "next/link";
import { PawPrint } from "lucide-react";
import { redirect } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { api } from "@/lib/api/client";

const navigation = [
  { href: "/feed", label: "Feed" },
  { href: "/notifications", label: "Notifications" },
];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { data: profile, error } = await api.GET("/api/v1/auth/me");
  if (error || !profile) redirect("/login?next=/feed");

  return (
    <div className="bg-muted/40 min-h-screen">
      <header className="bg-background/90 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-8">
          <Link
            aria-label="Pet Pulse feed"
            className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-xl"
            href="/feed"
          >
            <PawPrint className="size-5" />
          </Link>
          <nav
            aria-label="Main navigation"
            className="flex flex-1 items-center gap-1"
          >
            {navigation.map(({ href, label }) => (
              <Link
                className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
          <UserMenu email={profile.email} username={profile.username} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8 sm:py-10">
        {children}
      </main>
    </div>
  );
}
