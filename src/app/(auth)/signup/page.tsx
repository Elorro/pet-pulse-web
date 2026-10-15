import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { signupAction } from "@/lib/auth/actions";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next } = await searchParams;
  return (
    <AuthForm
      action={signupAction}
      kind="signup"
      next={Array.isArray(next) ? next[0] : next}
    />
  );
}
