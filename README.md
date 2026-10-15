# Pet Pulse Web

Next.js client for Pet Pulse. FastAPI remains the source of truth for profiles, posts, and authentication operations. The web app does not query Supabase Postgres or store service-role credentials.

## Requirements

- Node.js 22 or newer
- pnpm 11.1.3 (the version recorded in `package.json`)
- The Pet Pulse FastAPI repository for local API development
- A Supabase project URL and anon/publishable key

## Run locally

```sh
cp .env.example .env.local
```

Replace the Supabase placeholders in `.env.local`. Keep `API_BASE_URL` pointed at the FastAPI origin (normally `http://127.0.0.1:8000`). `NEXT_PUBLIC_API_BASE_URL` is the browser-side API origin; this scaffold performs its current protected page and auth requests on the Next.js server, but a future direct browser request requires that origin to be allowed by FastAPI CORS.

Start the backend from the `pet-pulse` repository:

```sh
uv sync --locked
uv run python -m uvicorn app.main:app --reload
```

Then install and start the web client:

```sh
pnpm install
pnpm dev
```

Open `http://localhost:3000`. The app validates required environment variables during startup and names any missing values. Build and CI also need public placeholder values even when no live Supabase project is used.

## Environment variables

Copy `.env.example` to `.env.local`; use Vercel project settings for deployed values.

| Variable                        | Scope  | Purpose                                                                                                                                 |
| ------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Public | Supabase project URL for the SSR cookie client and callback exchange.                                                                   |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon/publishable key. Never put a service-role key in this app.                                                                |
| `NEXT_PUBLIC_SITE_URL`          | Public | Canonical web origin for metadata and auth callback redirects.                                                                          |
| `API_BASE_URL`                  | Server | FastAPI origin used by server-rendered pages, server actions, session refresh, and API type generation.                                 |
| `NEXT_PUBLIC_API_BASE_URL`      | Public | FastAPI origin for typed browser-side requests, if/when used. Configure backend CORS for the web origin before enabling those requests. |

## Scripts

| Command             | Purpose                                                                      |
| ------------------- | ---------------------------------------------------------------------------- |
| `pnpm dev`          | Start the local Next.js development server.                                  |
| `pnpm build`        | Create a production build.                                                   |
| `pnpm start`        | Serve the production build.                                                  |
| `pnpm lint`         | Run ESLint.                                                                  |
| `pnpm typecheck`    | Run TypeScript with no output.                                               |
| `pnpm format`       | Format supported files with Prettier and sort Tailwind classes.              |
| `pnpm format:check` | Check formatting without changing files.                                     |
| `pnpm test`         | Run Vitest and React Testing Library tests.                                  |
| `pnpm gen:api`      | Fetch `${API_BASE_URL}/openapi.json` and regenerate the typed client schema. |

To regenerate API types, start FastAPI, ensure `API_BASE_URL` is set in `.env.local` or the shell, then run:

```sh
pnpm gen:api
```

The generated `src/lib/api/schema.d.ts` is committed. It was generated from the current FastAPI OpenAPI document. The API currently has no `/health` route; no placeholder schema is used.

## Authentication and API requests

Email/password signup and login go through `POST /api/v1/auth/signup` and `POST /api/v1/auth/login` on FastAPI. The returned Supabase access and refresh tokens are persisted by `@supabase/ssr` in cookies, rather than `localStorage`. The Next.js `proxy.ts` refreshes sessions through FastAPI's `POST /api/v1/auth/refresh`; the API client also uses that endpoint if a browser-side request encounters a token close to expiry. Protected routes make a real `GET /api/v1/auth/me` call, and the feed makes a typed `GET /api/v1/posts/` call. All FastAPI requests are routed through `src/lib/api/client.ts`.

When signup returns `requires_email_confirmation: true`, the UI asks the person to confirm their email and does not create a signed-in state. The backend currently does not accept a redirect URL for signup. To ensure confirmation links return to `/auth/callback` in local, production, and Vercel preview environments, the minimal backend change is to pass a configurable `email_redirect_to` to Supabase Auth during signup (and allow that URL in Supabase Auth URL Configuration). The callback route is implemented, but confirmation cannot reliably reach it until that backend setting is added. The callback exchanges Supabase's code server-side. The current API has no public-profile lookup or public-post lookup, so those routes intentionally show capability placeholders instead of fabricated profile/post content.

## UI components

The registries copy source code into this repository. Keep the interface cohesive by using each source only for its assigned role:

| Priority | Library                           | Use                                                                                  |
| -------- | --------------------------------- | ------------------------------------------------------------------------------------ |
| 1        | shadcn/ui with Base UI primitives | Core forms, dialogs, menus, tabs, sheets, and toasts.                                |
| 2        | Space UI                          | Richer Base UI components, deterministic generated avatars, and small visual extras. |
| 3        | Arc UI, free components only      | Product interactions that are not already covered by shadcn/ui.                      |
| 4        | Componentry                       | Showpiece effects on the landing page, onboarding, and empty states only.            |

Install only free components. Do not install Arc UI items marked Pro, or anything requiring payment, a license key, or an account. Read the component and library license before adding source. Licenses checked on 15 October 2026: [Space UI Status Badge](https://www.spaceui.one/components/status-badge) and [Space UI Avatars](https://github.com/usespaceui/avatars/blob/main/LICENSE) are MIT; [Arc UI](https://uiarc.dev/license) publishes its free source under MIT and separates paid Pro components; [Componentry](https://github.com/harshjdhv/componentry/blob/main/LICENSE) is MIT. Recheck licenses before future installs.

Current install examples:

```sh
pnpm dlx shadcn@latest add button input label card avatar dropdown-menu dialog sonner
pnpm dlx shadcn@latest add @spaceui/components-spaceui-status-badge
pnpm add @usespaceui/avatars
pnpm dlx shadcn@latest add @arc/command-palette
pnpm dlx shadcn@latest add @componentry/annotated-text
```

Space UI avatars are generated locally from the stable user UUID. The package is MIT and does not make network requests. Arc's command palette is a full searchable product action surface, while the shadcn command component remains the base primitive. Componentry's annotated text is dynamically imported on the landing page. Keep showpiece effects out of feeds and scrolling lists.

Keep files in these folders:

```text
src/components/ui/          shadcn/ui primitives
src/components/spaceui/     Space UI registry source
src/components/arc/         Arc UI registry source
src/components/showpiece/   Componentry source and dynamic wrappers
```

The Componentry registry currently targets `src/components/ui` in its manifest, so move newly installed files into `src/components/showpiece` and update imports. After every install, review the copied source, remove unused variants, and fix lint or type errors. Use existing CSS variables and Tailwind theme classes for colors, borders, radii, and fonts. If a component brings CSS modules, map every color, border, and radius to `--background`, `--foreground`, `--primary`, `--muted`, `--border`, and `--radius`. Animated components must respect `prefers-reduced-motion`; load Componentry effects with `next/dynamic` and keep them on landing/onboarding/empty-state surfaces only. Use one component per job and prefer shadcn/ui when it already covers the need.

Visit `/dev/components` in development to review the installed components in light and dark themes. The route returns 404 in production.

## Project structure

```text
.github/workflows/ci.yml       CI checks on pushes to main and pull requests
src/app/(public)/              Landing page and public profile/post placeholders
src/app/(auth)/                Signup and login pages
src/app/(app)/                 Protected feed, notifications, and settings
src/app/auth/callback/          Supabase auth callback route handler
src/components/ui/              shadcn-style UI primitives
src/components/spaceui/         Free Space UI registry source
src/components/arc/             Free Arc UI registry source
src/components/showpiece/       Componentry showpieces and dynamic wrappers
src/lib/api/                    Generated FastAPI schema and typed client
src/lib/supabase/                Supabase SSR/browser clients and session proxy
src/env.ts                      Zod environment validation
src/proxy.ts                    Session refresh and protected-route redirects
```

## Tests and CI

```sh
pnpm lint
pnpm typecheck
pnpm format:check
pnpm test
pnpm build
```

GitHub Actions runs the same checks for pull requests and pushes to `main`, using dummy public values for build-time environment validation.

## Deploy to Vercel

1. Import `Elorro/pet-pulse-web` as a Next.js project in Vercel.
2. Add all five variables from `.env.example` to the Vercel project for Production and Preview. Use the production API origin for Production and a reachable API origin for Preview. `NEXT_PUBLIC_*` values are embedded in client bundles at build time, so set them before building.
3. In Supabase Auth URL Configuration, set the Site URL to the production web origin. Add `http://localhost:3000/**`, the production callback URL, and the Vercel preview pattern `https://*-<team-or-account-slug>.vercel.app/**` to allowed redirect URLs. Ensure the signup backend passes the matching callback URL as described above.
4. If browser-side FastAPI requests are enabled, allow the production and Vercel preview origins in the backend CORS configuration. Server-to-server requests from Next.js use `API_BASE_URL` and do not depend on browser CORS.
5. Deploy from Vercel. This repository does not create or deploy a Vercel project automatically.
