<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## UI component registry rules

- Prefer shadcn/ui with Base UI primitives for core forms, dialogs, menus, tabs, sheets, and toasts.
- Use Space UI for richer Base UI components, deterministic generated avatars, and visual extras.
- Use Arc UI only for free components that fill a product interaction gap. Never install anything marked Pro.
- Use Componentry only for showpiece effects on landing, onboarding, or empty states. Load effects with `next/dynamic`; never put them in feeds, lists, or scrolling content.
- Do not install paid components or anything requiring a purchase, license key, or account. Read the component/library license before each install; stop if it is not MIT or similarly permissive.
- Prefer shadcn/ui when it already covers the job. Install one component per job, not competing implementations.
- Registry source is owned code. Review it after installation, remove unused variants and dead code, and fix lint/type errors.
- Keep source in `src/components/ui`, `src/components/spaceui`, `src/components/arc`, or `src/components/showpiece`, respectively. Componentry's registry may place files in `ui`; move them to `showpiece` and update imports.
- Use theme CSS variables for color, border, radius, and font decisions. Do not leave registry-specific hardcoded colors or fonts.
- Every animated component must honor `prefers-reduced-motion`.
