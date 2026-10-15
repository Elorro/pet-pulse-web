import Link from "next/link";

import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      className={cn(
        "inline-flex items-center gap-2 font-bold tracking-tight",
        className,
      )}
      href="/"
    >
      <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-xl">
        p
      </span>
      <span>pet pulse</span>
    </Link>
  );
}
