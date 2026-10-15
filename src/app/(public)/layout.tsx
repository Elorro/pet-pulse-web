import type { ReactNode } from "react";

import { PublicHeader } from "@/components/public-header";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="via-background to-background min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/70 dark:from-emerald-950/30">
      <PublicHeader />
      {children}
    </div>
  );
}
