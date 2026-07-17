# Coding Standards

## Explicit project rules

- TypeScript strict mode is enabled in `tsconfig.json`; path alias `@/*` maps to repository root.
- README requires minimal changes, no new dependencies unless required, environment variables for secrets, safe error handling, no sensitive logs, and XSS prevention.
- UI conventions are Next.js App Router, Tailwind utility classes, React hooks, and Thai-facing text.
- Build is configured to ignore ESLint and TypeScript errors in `next.config.ts`; run checks separately before commit.

## Repository patterns

- API functions are grouped by domain and HTTP verb in `app/routers/**`.
- Interfaces are grouped in `app/model/**` and passed as Axios generic response types in many routers.
- Client-only modules explicitly use `"use client"` where they access browser state or hooks.
- Error handling commonly checks Axios errors and displays Toastify/SweetAlert2 feedback.

## Caveats

- `any` remains in several models/context/router signatures; do not interpret strict mode as complete runtime validation.
- `html` currently uses `lang="en"` while the UI is primarily Thai; this is an observed inconsistency, not a business rule.

