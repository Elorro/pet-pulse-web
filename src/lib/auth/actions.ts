"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthActionState = { error?: string; success?: string };
export type ProfileActionState = AuthActionState;

function value(formData: FormData, name: string) {
  const field = formData.get(name);
  return typeof field === "string" ? field : "";
}

function safeDestination(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/feed";
}

async function saveSession(session: {
  access_token: string;
  refresh_token: string;
}) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.setSession(session);
  return error;
}

export async function loginAction(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { data, error } = await api.POST("/api/v1/auth/login", {
    body: {
      email: value(formData, "email"),
      password: value(formData, "password"),
    },
  });

  if (error || !data) {
    const message = errorMessage(error);
    return {
      error: /email not confirmed/i.test(message)
        ? "Please confirm your email address before signing in."
        : message,
    };
  }

  const sessionError = await saveSession(data);
  if (sessionError)
    return { error: "We could not save your session. Please try again." };
  redirect(safeDestination(value(formData, "next")));
}

export async function signupAction(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { data, error } = await api.POST("/api/v1/auth/signup", {
    body: {
      email: value(formData, "email"),
      password: value(formData, "password"),
      username: value(formData, "username"),
    },
  });

  if (error || !data) return { error: errorMessage(error) };
  if (data.requires_email_confirmation || !data.session) {
    return {
      success: `We sent a confirmation link to ${data.email ?? "your email address"}. Confirm it before signing in.`,
    };
  }

  const sessionError = await saveSession(data.session);
  if (sessionError)
    return {
      error: "Your account was created, but we could not save the session.",
    };
  redirect(safeDestination(value(formData, "next")));
}

export async function updateProfileAction(
  _previous: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const username = value(formData, "username").trim();
  const fullName = value(formData, "full_name").trim();
  const photoUrl = value(formData, "photo_url").trim();

  if (!/^[A-Za-z0-9_]{3,50}$/.test(username)) {
    return {
      error:
        "Username must be 3–50 characters and use only letters, numbers, or underscores.",
    };
  }
  if (fullName.length > 120) {
    return { error: "Name must be 120 characters or fewer." };
  }
  if (photoUrl) {
    try {
      const parsedUrl = new URL(photoUrl);
      if (
        !["http:", "https:"].includes(parsedUrl.protocol) ||
        photoUrl.length > 2048
      ) {
        return { error: "Enter a valid HTTP or HTTPS photo URL." };
      }
    } catch {
      return { error: "Enter a valid HTTP or HTTPS photo URL." };
    }
  }

  const { data: currentProfile, error: currentProfileError } =
    await api.GET("/api/v1/auth/me");
  if (currentProfileError || !currentProfile) {
    return {
      error: "Your session could not be verified. Please sign in again.",
    };
  }

  const { error, response } = await api.PATCH("/api/v1/auth/me", {
    body: {
      username,
      full_name: fullName || null,
      photo_url: photoUrl || null,
    },
  });

  if (response.status === 401) redirect("/login?next=/settings");
  if (response.status === 409) {
    return { error: "That username is already taken. Choose another one." };
  }
  if (error) return { error: errorMessage(error) };

  revalidatePath("/settings");
  revalidatePath(`/${encodeURIComponent(currentProfile.username)}`);
  revalidatePath(`/${encodeURIComponent(username)}`);
  revalidatePath("/feed");

  return { success: "Profile updated." };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();

  try {
    if (data.session) await api.POST("/api/v1/auth/logout");
  } finally {
    await supabase.auth.signOut({ scope: "local" });
  }
  redirect("/");
}
