"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionState } from "@/lib/auth/actions";

type FormAction = (
  state: AuthActionState,
  formData: FormData,
) => Promise<AuthActionState>;

type AuthFormProps = {
  action: FormAction;
  kind: "login" | "signup";
  next?: string;
  notice?: string;
};

export function AuthForm({
  action,
  kind,
  next = "/feed",
  notice,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignup = kind === "signup";

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success(state.success);
  }, [state]);

  useEffect(() => {
    if (notice) toast.error(notice);
  }, [notice]);

  return (
    <Card className="dark:bg-card w-full max-w-md border-white/70 bg-white/90 shadow-xl shadow-emerald-950/5 dark:border-white/10">
      <CardHeader>
        <p className="text-primary mb-2 text-xs font-semibold tracking-[0.18em] uppercase">
          Pet Pulse
        </p>
        <CardTitle>{isSignup ? "Join the pack" : "Welcome back"}</CardTitle>
        <CardDescription>
          {isSignup
            ? "Create your account and meet the community."
            : "Sign in to catch up with your community."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <input name="next" type="hidden" value={next} />
          {isSignup && (
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                autoComplete="username"
                id="username"
                maxLength={50}
                minLength={3}
                name="username"
                required
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              autoComplete="email"
              id="email"
              name="email"
              required
              type="email"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              autoComplete={isSignup ? "new-password" : "current-password"}
              id="password"
              maxLength={128}
              minLength={isSignup ? 8 : 1}
              name="password"
              required
              type="password"
            />
          </div>
          {state.error && (
            <p aria-live="polite" className="text-destructive text-sm">
              {state.error}
            </p>
          )}
          {state.success && (
            <p aria-live="polite" className="text-primary text-sm">
              {state.success}
            </p>
          )}
          <Button
            className="mt-1 w-full"
            disabled={pending}
            size="lg"
            type="submit"
          >
            {pending ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
          </Button>
        </form>
        <p className="text-muted-foreground mt-6 text-center text-sm">
          {isSignup ? "Already have an account? " : "New to Pet Pulse? "}
          <Link
            className="text-primary font-semibold hover:underline"
            href={isSignup ? "/login" : "/signup"}
          >
            {isSignup ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
