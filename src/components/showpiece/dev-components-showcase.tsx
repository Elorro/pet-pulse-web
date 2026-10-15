"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  CommandPalette,
  type CommandItem,
} from "@/components/arc/command-palette/command-palette";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/spaceui/status-badge";
import { LandingAnnotation } from "@/components/showpiece/landing-annotation";

const commands: CommandItem[] = [
  { id: "feed", label: "Open feed", group: "Navigate" },
  { id: "profile", label: "View profile", group: "Navigate" },
];

function ThemeSamples() {
  const [showPalette, setShowPalette] = useState(false);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>shadcn/ui · Base UI</CardTitle>
          <CardDescription>
            Foundation components and theme tokens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => toast.success("Theme tokens are active.")}>
              Show toast
            </Button>
            <Dialog>
              <DialogTrigger render={<Button variant="outline" />}>
                Open dialog
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Base UI dialog</DialogTitle>
                  <DialogDescription>
                    This dialog uses the shared shadcn theme.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="secondary" />}>
                Open menu
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Example action</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="showcase-input">Label and input</Label>
            <Input id="showcase-input" placeholder="A themed input" />
          </div>
          <Avatar>
            <AvatarFallback seed="pet-pulse-dev-user" />
          </Avatar>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Space UI</CardTitle>
          <CardDescription>
            Status component and deterministic avatar fallback.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <StatusBadge
            status="available"
            primaryText="Available"
            animated={false}
          />
          <Avatar>
            <AvatarFallback seed="pet-pulse-dev-user" />
          </Avatar>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Arc UI</CardTitle>
          <CardDescription>
            Searchable command palette for product navigation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => setShowPalette((open) => !open)}
            variant="outline"
          >
            {showPalette ? "Close palette" : "Open palette"}
          </Button>
          {showPalette && (
            <CommandPalette
              items={commands}
              onClose={() => setShowPalette(false)}
            />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Componentry</CardTitle>
          <CardDescription>
            Landing-page annotation effect (reduced-motion aware).
          </CardDescription>
        </CardHeader>
        <CardContent className="text-xl font-semibold">
          A happy place <LandingAnnotation />
        </CardContent>
      </Card>
    </div>
  );
}

export function DevComponentsShowcase() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Light theme</h2>
        <div className="bg-background text-foreground rounded-2xl border p-4 sm:p-6">
          <ThemeSamples />
        </div>
      </section>
      <section className="dark bg-background text-foreground space-y-4 rounded-2xl p-4 sm:p-6">
        <h2 className="text-xl font-semibold">Dark theme</h2>
        <ThemeSamples />
      </section>
    </div>
  );
}
