import { PawPrintIcon } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <PawPrintIcon className="size-5" />
          Pet Pulse
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {children}
        </div>
      </div>
    </header>
  );
}
