# Pet Pulse Web

Web client for Pet Pulse. It is another client of the FastAPI backend in the
[`pet-pulse`](../pet-pulse) repo, which stays the single source of truth for
business logic and data. Supabase handles authentication.

Built so far: sign up, sign in, sign out, email-confirmation callback, and a
protected `/feed` page that calls FastAPI's `GET /api/v1/auth/me`.

## Prerequisites

- Node.js 20.9 or later
- pnpm 12 (`npm i -g pnpm`, or prefix commands with `npx pnpm@12.11.2`)
- The Supabase project the FastAPI backend uses
- The FastAPI backend running locally (default `http://localhost:8000`)

## Setup

```sh
cp .env.example .env.local   # then fill in the values
pnpm install
pnpm dev                     # http://localhost:3000
```

The app refuses to start if a required env var is missing or invalid, and the
error names the variable.

In the Supabase dashboard, go to **Authentication > URL Configuration** and
add `http://localhost:3000/auth/callback` to the allowed redirect URLs, so
email confirmation links work.

## Environment variables

| Variable                        | Scope  | Purpose                                                             |
| ------------------------------- | ------ | ------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Public | Supabase project URL                                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon (publishable) key; the same project as the backend    |
| `NEXT_PUBLIC_SITE_URL`          | Public | Canonical URL of this app, used for auth redirects and metadata     |
| `API_BASE_URL`                  | Server | FastAPI base URL, without `/api/v1`                                 |
| `NEXT_PUBLIC_API_BASE_URL`      | Public | Optional. FastAPI URL for browser-side calls; needs CORS on FastAPI |

Read env vars only through `src/env.ts`. Never add the Supabase service-role
key or any other secret to this app.

## Scripts

| Script              | What it does                                            |
| ------------------- | ------------------------------------------------------- |
| `pnpm dev`          | Start the dev server                                    |
| `pnpm build`        | Production build                                        |
| `pnpm start`        | Serve the production build                              |
| `pnpm lint`         | ESLint                                                  |
| `pnpm typecheck`    | Generate route types and run `tsc --noEmit`             |
| `pnpm format`       | Format with Prettier                                    |
| `pnpm format:check` | Check formatting                                        |
| `pnpm gen:api`      | Regenerate FastAPI types into `src/lib/api/schema.d.ts` |

## How auth works

1. The browser signs up or signs in directly with Supabase Auth
   (`@supabase/ssr`), which stores the session in cookies. The username goes
   into Supabase user metadata, where FastAPI reads it.
2. `src/proxy.ts` refreshes the session on every request, sends signed-out
   users from `/feed`, `/notifications` and `/settings` to
   `/login?next=<path>`, and sends signed-in users away from `/login` and
   `/signup`.
3. Calls to FastAPI go through `src/lib/api`, which attaches the Supabase
   access token as `Authorization: Bearer <token>`. FastAPI verifies it
   against the same Supabase project. The first `GET /api/v1/auth/me` call
   creates the user's profile.

## Regenerating the API client

With the backend running:

```sh
pnpm gen:api                         # uses ${API_BASE_URL}/openapi.json
pnpm gen:api ./path/to/openapi.json  # or a saved schema file
```

Commit the updated `src/lib/api/schema.d.ts`. Never hand-write API types.

## Folder structure

```
src/
  app/
    (public)/page.tsx          landing page
    (auth)/login, signup       auth pages
    (app)/                     protected; layout has the user menu
      feed/page.tsx
    auth/callback/route.ts     exchanges auth codes for a session
  components/                  app components; ui/ holds shadcn/ui
  lib/
    supabase/client.ts         browser Supabase client
    supabase/server.ts         server Supabase client, getCurrentUser()
    api/client.ts              typed FastAPI client (+ browser variant)
    api/server.ts              typed FastAPI client for server code
    api/schema.d.ts            generated, committed
    redirect.ts                safe `next` redirect handling
  env.ts                       zod-validated environment
  proxy.ts                     session refresh and route protection
```

## Deploying to Vercel

1. Import the repo in Vercel; it detects Next.js and pnpm.
2. Set every env var from the table above for Production and Preview.
   `NEXT_PUBLIC_SITE_URL` is the production domain.
3. In Supabase **Authentication > URL Configuration**, add
   `https://<your-domain>/auth/callback` and a wildcard for preview URLs, for
   example `https://*-<team>.vercel.app/auth/callback`.
4. Add the web origin to FastAPI's CORS origins if the browser will call
   FastAPI directly.
