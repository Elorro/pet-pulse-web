"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { publicEnv } from "@/env";
import { DEFAULT_AUTHED_PATH } from "@/lib/redirect";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    setPending(true);

    const callback = new URL("/auth/callback", publicEnv.NEXT_PUBLIC_SITE_URL);
    callback.searchParams.set("next", DEFAULT_AUTHED_PATH);

    const { data, error } = await createClient().auth.signUp({
      email,
      password: String(form.get("password")),
      options: {
        // FastAPI reads this to create the profile on the first /auth/me call.
        data: { username: String(form.get("username")).trim() },
        emailRedirectTo: callback.toString(),
      },
    });

    setPending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data.session) {
      // The Supabase project requires email confirmation.
      setConfirmEmail(email);
      return;
    }
    router.replace(DEFAULT_AUTHED_PATH);
    router.refresh();
  }

  if (confirmEmail) {
    return (
      <p className="text-sm">
        Check <strong>{confirmEmail}</strong> for a link to confirm your
        account.
      </p>
    );
  }

  // Limits mirror FastAPI's SignUpRequest so users get instant feedback.
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          autoComplete="username"
          minLength={3}
          maxLength={50}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Creating account…" : "Sign up"}
      </Button>
    </form>
  );
}
