# Code Review: React + TypeScript (Next.js)

## When to use
- Reviewing React components, hooks, pages, and TS utilities
- Reviewing Client Components and their interactions with Server Components

## Checklist
### React correctness
- [ ] Components are pure; side effects are in hooks (`useEffect`) with correct deps
- [ ] Avoid state duplication; derived data computed via memo/selectors when needed
- [ ] Event handlers and async flows handle loading/error states

### TypeScript quality
- [ ] Public functions/components have typed inputs/outputs
- [ ] No `any` unless justified (and commented)
- [ ] Narrow `unknown` safely; avoid unsafe casts
- [ ] Types live feature-scoped unless truly global

### Next.js boundaries
- [ ] Only add `"use client"` when needed (state, effects, browser APIs, event handlers)
- [ ] Do not import server-only modules into Client Components
- [ ] Server Components do not pass secrets to Client Components

### Maintainability
- [ ] Small components; avoid mega-components
- [ ] Reusable UI in `src/components/ui/**`
- [ ] Business logic not embedded in pages/routes

## Pitfalls
- Missing dependency arrays in useEffect
- Overuse of `useMemo/useCallback` without measurable need
- Unstable keys in lists
- Accidentally turning large trees into Client Components

## Update notes
- (append new learnings here)
