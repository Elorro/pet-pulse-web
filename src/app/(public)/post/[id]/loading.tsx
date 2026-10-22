import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PostLoading() {
  return (
    <main
      aria-label="Loading post"
      className="mx-auto max-w-3xl space-y-6 px-5 pt-12 pb-20 sm:px-8"
    >
      <Card>
        <CardHeader className="gap-3">
          <div className="bg-muted h-4 w-36 rounded motion-safe:animate-pulse" />
          <div className="bg-muted h-6 w-56 rounded motion-safe:animate-pulse" />
          <div className="bg-muted h-4 w-44 rounded motion-safe:animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-muted h-4 w-full rounded motion-safe:animate-pulse" />
          <div className="bg-muted h-4 w-4/5 rounded motion-safe:animate-pulse" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="gap-3">
          <div className="bg-muted h-5 w-28 rounded motion-safe:animate-pulse" />
          <div className="bg-muted h-4 w-64 rounded motion-safe:animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="bg-muted h-24 rounded-lg motion-safe:animate-pulse" />
          <div className="bg-muted h-4 w-full rounded motion-safe:animate-pulse" />
          <div className="bg-muted h-4 w-3/4 rounded motion-safe:animate-pulse" />
        </CardContent>
      </Card>
    </main>
  );
}
