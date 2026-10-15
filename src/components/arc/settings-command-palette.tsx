"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Bell, House, Settings2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandPalette,
  type CommandItem,
} from "@/components/arc/command-palette/command-palette";

const commands: CommandItem[] = [
  {
    id: "feed",
    label: "Open feed",
    description: "See recent posts",
    group: "Navigate",
    icon: <House />,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "View updates",
    group: "Navigate",
    icon: <Bell />,
  },
  {
    id: "profile",
    label: "Your profile",
    description: "View your public profile",
    group: "Navigate",
    icon: <UserRound />,
  },
  {
    id: "settings",
    label: "Settings",
    description: "Account settings",
    group: "Navigate",
    icon: <Settings2 />,
  },
];

export function SettingsCommandPalette({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function selectCommand(item: CommandItem) {
    const routes: Record<string, string> = {
      feed: "/feed",
      notifications: "/notifications",
      profile: `/${encodeURIComponent(username)}`,
      settings: "/settings",
    };
    const destination = routes[item.id];
    if (destination) router.push(destination);
    setOpen(false);
  }

  return (
    <div className="space-y-3">
      <Button onClick={() => setOpen((value) => !value)} variant="outline">
        <ArrowRight aria-hidden="true" />
        {open ? "Close actions" : "Open quick actions"}
      </Button>
      {open && (
        <CommandPalette
          items={commands}
          onClose={() => setOpen(false)}
          onSelect={selectCommand}
        />
      )}
    </div>
  );
}
