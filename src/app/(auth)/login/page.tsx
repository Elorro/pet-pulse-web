import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { loginAction } from "@/lib/auth/actions";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string | string[];
    error?: string | string[];
  }>;
}) {
  const { next, error } = await searchParams;
  return (
    <AuthForm
      action={loginAction}
      kind="login"
      next={Array.isArray(next) ? next[0] : next}
      notice={
        error
          ? "This sign-in link could not be completed. Please try signing in again."
          : undefined
      }
    />
  );
}
