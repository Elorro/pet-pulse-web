import { redirect } from "next/navigation";
import { Suspense } from "react";

import { SiteHeader } from "@/components/site-header";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/supabase/server";

async function CurrentUserMenu() {
  const user = await getCurrentUser();
  // The proxy already redirects signed-out users; this is a second check.
  if (!user) redirect("/login");
  return <UserMenu email={user.email ?? "?"} />;
}

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader>
        <Suspense fallback={<div className="size-8 rounded-full bg-muted" />}>
          <CurrentUserMenu />
        </Suspense>
      </SiteHeader>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {children}
      </main>
    </>
  );
}
