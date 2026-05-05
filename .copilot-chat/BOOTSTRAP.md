
---

## BOOTSRAP.md (Revised)

You are working inside this repository.

## Goal (Target Stack)
- Target framework: **Next.js (App Router)**
- Routing directory: **`app/`**
- Language: **TypeScript (strict)** — no `any`
- Styling: **Tailwind CSS**
- HTTP client: **axios** (use existing API client pattern)

> Note: The current codebase may still contain legacy Vite + react-router-dom code. Treat it as legacy and migrate only when explicitly asked, using minimal safe patches.

## Non-negotiables
- First, read **README.md** and follow it.
- Use ONLY allowed skills listed in README under `./.agents/skills/`.
- If anything is unclear, ask questions before coding.
- Prefer minimal safe patches. Ask before major refactors.
- Do not invent packages/APIs/endpoints. No new deps unless approved.
- Strict TypeScript. Avoid `any`.
- Never hardcode secrets/tokens; use env vars and update `.env.example`.

## Context discipline (minimize tokens)
Open only what you need, in this order:

1) **README.md**  
2) **Next.js routing entry points**
   - `app/layout.tsx`
   - `app/page.tsx`
   - `app/**/page.tsx` (only relevant routes)
3) **API layer (axios)**
   - `src/services/apiClient.ts` (or wherever the axios instance lives)
   - the specific service file(s) used by the feature
4) The component(s) directly involved

### Legacy (open ONLY if needed)
If the feature is still implemented in legacy Vite routing, then additionally inspect (only what is necessary):
- `src/main.tsx`
- `src/App.tsx`
- `src/pages/**`

## Before coding, confirm (must do)
1) Role: Builder or Reviewer  
2) The minimum file list you will inspect first (bullet list)  
3) Any questions required to avoid wrong assumptions  

Then wait for the task.

## Migration guardrails (important)
- Do **not** migrate Vite/react-router parts to Next.js unless the user explicitly requests it.
- If migration is requested, ask for approval before:
  - adding/removing dependencies,
  - changing build scripts,
  - restructuring many folders.

--- 