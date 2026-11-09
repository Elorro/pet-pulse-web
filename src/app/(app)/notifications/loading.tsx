import { Card, CardContent } from "@/components/ui/card";

export default function NotificationsLoading() {
  return (
    <div
      aria-label="Loading notifications"
      className="mx-auto grid max-w-2xl gap-4"
    >
      <div className="bg-muted h-10 w-56 animate-pulse rounded-md motion-reduce:animate-none" />
      {[0, 1, 2].map((item) => (
        <Card key={item}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="bg-muted size-10 animate-pulse rounded-full motion-reduce:animate-none" />
            <div className="grid flex-1 gap-2">
              <div className="bg-muted h-4 w-3/4 animate-pulse rounded motion-reduce:animate-none" />
              <div className="bg-muted h-3 w-1/3 animate-pulse rounded motion-reduce:animate-none" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
