# Architecture Overview

## Shape

เป็น Next.js App Router application: route entry points อยู่ใน `app/**/page.tsx`, shared layout/context อยู่ใน `app/layout.tsx`, `app/dashboard/layout.tsx`, และ `app/context/**`.

## Layers observed

1. Presentation: `app/**/page.tsx`, `components/**`, `app/globals.css`.
2. Client state and session: React Context (`UserContext`, `UsePermission`), hooks (`app/hooks/**`), Zustand store (`store/**`), and browser `localStorage`.
3. API client layer: domain-specific functions under `app/routers/**` plus shared services (`getService.tsx`, `postService.tsx`, `updateService.tsx`, `deleteService.tsx`).
4. Contracts: TypeScript interfaces under `app/model/**`.
5. External integrations: configured backend URL, CMU auth, SCB payment endpoints, WebSocket and SSE connections.

## Routing

Observed route groups include `/auth`, `/dashboard`, `/dashboard/360`, `/dashboard/register`, `/dashboard/finance`, `/dashboard/application`, `/dashboard/Database`, and `/dashboard/Loggers`.

The finance project database route is `/dashboard/finance/projectDatabase`. Its page wrapper uses `Suspense` for the client content component. The content component selects a project from `Project` and `Module` query parameters (with `localStorage` fallback), then renders the `anatomy`, `cmuvc`, or `vetrun` module. `vetrun` is loaded with `next/dynamic` and `ssr: false`.

## Not found

- No repository-owned Next.js `app/api/**` route handlers were found.
- No backend service implementation was found.
- A complete dependency diagram is not maintained in source.