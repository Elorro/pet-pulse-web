import Link from "next/link";
import type { ReactNode } from "react";

import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-20">
      <div className="absolute top-4 right-5 flex items-center gap-2 sm:top-6 sm:right-8">
        <ThemeToggle />
        <Link
          className="text-muted-foreground hover:text-foreground text-sm"
          href="/"
        >
          Home
        </Link>
      </div>
      <Brand className="absolute top-6 left-5 sm:left-8" />
      {children}
    </main>
  );
}
