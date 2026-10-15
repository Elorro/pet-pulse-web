import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "bg-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-11 w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
