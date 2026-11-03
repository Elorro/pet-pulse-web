"use client";

import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/lib/auth/actions";

export function UserMenu({
  userId,
  username,
}: {
  userId: string;
  username: string;
  email: string | null;
}) {
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open user menu"
        className="hover:bg-muted focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border border-transparent bg-clip-padding pr-3 pl-1.5 text-sm font-medium whitespace-nowrap outline-none transition-all focus-visible:ring-3"
      >
        <Avatar className="size-8">
          <AvatarFallback seed={userId}>{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-32 truncate sm:inline">{username}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          render={<Link href={`/${encodeURIComponent(username)}`} />}
        >
          <UserRound className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <button
            className="text-destructive hover:bg-muted flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none"
            type="submit"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
