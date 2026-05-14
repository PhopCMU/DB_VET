# Code Review: Architecture & Folder Placement (Next.js app/** and src/app/**)

## When to use
- Any PR that adds/moves files or introduces new concerns

## Routing roots supported
- Default: `src/app/**`
- Alternative (some projects): root `app/**`

Rules:
- Apply the same conventions regardless of whether the route lives under `src/app/**` or `app/**`.

## Checklist
- [ ] New routes -> `src/app/**` (preferred) or root `app/**` (allowed in some projects)
- [ ] Route UI stays thin; feature logic extracted to `src/features/**` when appropriate
- [ ] Shared UI -> `src/components/**` and primitives in `src/components/ui/**`
- [ ] Network calls -> `src/services/**` (preferred)
- [ ] API types/contracts only -> `src/api/**`
- [ ] Shared cross-cutting helpers -> `src/lib/**`
- [ ] Pure helpers only -> `src/utils/**` (no side effects)
- [ ] Route Handlers -> `src/app/api/**/route.ts` or `app/api/**/route.ts`
- [ ] New cross-cutting concern creates `src/<concern>/**` and updates skills/index

## Pitfalls
- Duplicating similar helpers across folders
- Putting “feature-specific” code into global `lib/` too early
- Importing server-only modules into Client Components via shared helpers

## Update notes
- (append new learnings here)
