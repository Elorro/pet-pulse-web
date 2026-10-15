import Link from "next/link";
import { ArrowRight, Heart, PawPrint, UsersRound } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { LandingAnnotation } from "@/components/showpiece/landing-annotation";

const highlights = [
  {
    icon: PawPrint,
    title: "A place for every pet",
    body: "A community made for the animals who make life brighter.",
  },
  {
    icon: Heart,
    title: "Share the little things",
    body: "Keep the moments, stories, and updates that bring us together.",
  },
  {
    icon: UsersRound,
    title: "Find your people",
    body: "Meet pet lovers who understand why they are family.",
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-16 px-5 pt-14 pb-20 sm:px-8 sm:pt-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      <section className="max-w-2xl">
        <p className="bg-card/80 text-muted-foreground mb-5 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm">
          <span className="bg-primary size-2 rounded-full" /> A happier corner
          of the internet
        </p>
        <h1 className="text-5xl leading-[1.05] font-semibold tracking-tight sm:text-7xl">
          Their world is better <LandingAnnotation />
        </h1>
        <p className="text-muted-foreground mt-6 max-w-xl text-lg leading-8">
          Pet Pulse brings pet people together to celebrate the everyday
          adventures, the goofy faces, and the love that makes a family.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className={buttonVariants({ size: "lg" })} href="/signup">
            Find your pack <ArrowRight className="size-4" />
          </Link>
          <Link
            className={buttonVariants({ size: "lg", variant: "outline" })}
            href="/login"
          >
            I have an account
          </Link>
        </div>
      </section>
      <aside
        aria-label="About Pet Pulse"
        className="bg-card/80 grid gap-3 rounded-[2rem] border p-5 shadow-xl shadow-emerald-950/5 sm:p-7"
      >
        <div className="mb-2 rounded-3xl bg-gradient-to-br from-emerald-100 via-amber-50 to-orange-100 p-7 dark:from-emerald-950 dark:via-amber-950/50 dark:to-orange-950/50">
          <div className="mx-auto flex aspect-square max-w-64 items-center justify-center rounded-full border border-white/80 bg-white/50 text-8xl dark:border-white/10 dark:bg-black/10">
            🐾
          </div>
          <p className="mt-5 text-center text-sm font-medium text-emerald-950/70 dark:text-emerald-100/70">
            Good days are better together.
          </p>
        </div>
        {highlights.map(({ icon: Icon, title, body }) => (
          <div className="flex gap-4 rounded-2xl p-3" key={title}>
            <span className="bg-secondary text-primary flex size-10 shrink-0 items-center justify-center rounded-xl">
              <Icon className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">{title}</h2>
              <p className="text-muted-foreground mt-1 text-sm">{body}</p>
            </div>
          </div>
        ))}
      </aside>
    </main>
  );
}
