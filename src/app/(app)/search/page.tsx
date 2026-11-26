import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";

const PAGE_SIZE = 20;
type Props = { searchParams: Promise<{ q?: string; offset?: string }> };

export default async function ProfileSearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q?.trim().slice(0, 120) ?? "";
  const parsedOffset = Number(params.offset ?? 0);
  const offset = Number.isInteger(parsedOffset) && parsedOffset >= 0 ? parsedOffset : 0;
  const result = query
    ? await api.GET("/api/v1/profiles/search", {
        params: { query: { q: query, limit: PAGE_SIZE, offset } },
      })
    : undefined;
  const profiles = result?.data;

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Find people</h1>
        <p className="text-muted-foreground mt-2">Search by username or name.</p>
      </div>
      <form action="/search" className="flex gap-2">
        <Input aria-label="Search profiles" maxLength={120} name="q" defaultValue={query} placeholder="Search people…" required />
        <Button type="submit">Search</Button>
      </form>
      {result?.error ? <Card><CardHeader><CardTitle>Search unavailable</CardTitle><CardDescription>{errorMessage(result.error)}</CardDescription></CardHeader></Card> : null}
      {query && profiles?.length === 0 ? <Card><CardContent className="py-8 text-center"><p className="font-medium">No profiles found</p><p className="text-muted-foreground mt-1 text-sm">Try another name or username.</p></CardContent></Card> : null}
      {profiles?.map((profile) => (
        <Card key={profile.id}><CardContent className="flex items-center gap-4 p-4">
          <Avatar className="size-12"><AvatarImage alt="" src={profile.photo_url ?? undefined} /><AvatarFallback seed={profile.id}>{(profile.full_name || profile.username).slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
          <div className="min-w-0 flex-1"><p className="truncate font-semibold">{profile.full_name || `@${profile.username}`}</p><p className="text-muted-foreground truncate text-sm">@{profile.username}</p></div>
          <Button render={<Link href={`/${encodeURIComponent(profile.username)}`} />} variant="outline">View profile</Button>
        </CardContent></Card>
      ))}
      {query && profiles && profiles.length === PAGE_SIZE ? <nav aria-label="Search pages" className="flex justify-between"><Button disabled={offset === 0} render={<Link href={`/search?q=${encodeURIComponent(query)}&offset=${Math.max(0, offset - PAGE_SIZE)}`} />} variant="outline">Previous</Button><Button render={<Link href={`/search?q=${encodeURIComponent(query)}&offset=${offset + PAGE_SIZE}`} />} variant="outline">Next</Button></nav> : null}
    </div>
  );
}
