import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Welcome back to Pet Pulse.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* useSearchParams reads request data, so it must sit in Suspense. */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        No account?&nbsp;
        <Link href="/signup" className="text-foreground underline">
          Sign up
        </Link>
      </CardFooter>
    </Card>
  );
}
