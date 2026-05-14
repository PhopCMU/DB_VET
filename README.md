# Dashboard Admin

## Stack
- **Next.js 15** (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- axios
- Zustand (state management)
- Deployed via PM2 (`ecosystem.config.js`) on port **4040**

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env.local
# edit .env.local with your values

# 3. Development
npm run dev        # http://localhost:4040

# 4. Production build
npm run build
npm run start      # http://localhost:4040
```

---

## Agent Skills

ชุด skill playbooks สำหรับ GitHub Copilot Chat ที่ adapt กับ stack จริงของ repo นี้

ดูรายละเอียดทั้งหมดที่ [/.agent/skill/README.md](.agent/skill/README.md)

| Category | ใช้เมื่อ |
|---|---|
| `accessibility` | ตรวจสอบ / ปรับปรุง a11y |
| `composition-patterns` | ออกแบบ component API |
| `frontend-design` | Design tokens, responsive, loading states |
| `next-best-practices` | App Router, metadata, data fetching |
| `next-cache-components` | Caching strategy |
| `next-upgrade` | Upgrade Next.js อย่างปลอดภัย |
| `react-best-practices` | Hooks, state, performance |
| `tailwind-css-patterns` | Class organization, variants |
| `typescript-advanced-types` | Types, guards, API contracts |

---

# Copilot Operating Manual (READ FIRST)

This repo uses 2 roles:
- **Builder** = implement/change code
- **Reviewer** = review diffs/PRs and produce GitHub-ready comments

## Required Knowledge Sources (MUST)
When making decisions, use sources in this order:
1) This README
2) Project code
3) Local skills in `./.agents/skills/` (**ONLY** the allowed ones below)
  - Before using or adding local skills, check `.agents/skills/_index.json`. If you need to add entries, perform an idempotent merge (add missing entries only; preserve existing entries). Avoid automatic repeated merges to prevent discovery loops; ask the user if unsure.

### Allowed Frontend Skills (ONLY)
- `./.agents/skills/next-best-practices/`
- `./.agents/skills/typescript-advanced-types/`
- `./.agents/skills/tailwind-css-patterns/`
- `./.agents/skills/accessibility/`
- `./.agents/skills/frontend-design/`

Do NOT use other skills unless explicitly asked.

## Global Rules (MUST)
- If requirements are unclear: ask questions before coding.
- Keep changes minimal and consistent with existing patterns.
- Strict TypeScript. Avoid `any`. If unavoidable, justify.
- No new dependencies unless required.
- Never hardcode secrets/keys/tokens. Use env vars and update `.env.example`.

## Security Rules (Frontend)
- Assume browser code is public. Never embed secrets.
- Do not log sensitive data (tokens/PII).
- Prevent XSS (avoid unsafe HTML; sanitize if required).
- Handle network errors; show user-safe error messages.

---

# ROLE: Builder (Coding)

## Builder Output Format (MANDATORY)
### Plan
- ...

### Files
- `path` - why

### Code
Minimal patches/snippets grouped by file.

### How to test
- Commands
- Manual steps

## Builder Conventions
- Follow patterns from the allowed skills:
  - Next.js App Router conventions (`next-best-practices`)
  - TypeScript advanced typing patterns (`typescript-advanced-types`)
  - Tailwind composition and class patterns (`tailwind-css-patterns`)
  - Accessible UI patterns (`accessibility`)
  - UI layout/UX principles (`frontend-design`)

---

# ROLE: Reviewer (PR Review)

## Reviewer Output Format (GitHub-ready Markdown)
## Summary
- What PR does
- Key risks (security/correctness/perf/a11y)

## Issues
### Blocker
- [ ] **File:** `...` **Lines:** ...
  **Issue:** ...
  **Why it matters:** ...
  **Fix suggestion:** ...
  **How to verify:** ...

### Major / Minor / Nit
(same format)

## Security & Quality Checklist (Frontend)
- No secrets in client bundle
- No sensitive logs
- XSS risks addressed
- a11y basics: labels, keyboard nav, contrast, aria usage where needed
- Tailwind usage consistent (no overly complex class strings if avoidable)
- Types safe (no unsafe `any`)

## Verdict
Approve / Request changes / Comment only

---

# Docker — Production

## Prerequisites
- Docker ≥ 24
- Docker Compose plugin ≥ 2.20 (`docker compose version`)

## Environment variables

All `NEXT_PUBLIC_*` values are **embedded into the JS bundle at build time**.  
Copy `.env.example` to `.env.local` and fill in every value before building:

```bash
cp .env.example .env.local
# edit .env.local
```

## Build

```bash
docker compose build --no-cache
```

## Run

```bash
docker compose up -d
```

The app is served by nginx on **port 3083** (mapped to container port 80).

## Logs

```bash
docker compose logs -f
```

## Stop / remove

```bash
docker compose down
```

## Health check

```bash
docker compose ps                  # look for (healthy)
curl -I http://localhost:3083/
```

## Docker debugging skill

When a build or runtime error occurs:

1. Open `.docker-skill/create-prompt.md`.
2. Fill in all sections (Dockerfile, logs, platform, lockfile type).
3. Paste the completed template into GitHub Copilot Chat.

Additional resources:
- `.docker-skill/troubleshooting.md` — common failure patterns and fixes
- `.docker-skill/prod-checklist.md` — pre-deployment checklist

---

# Copy/Paste Prompts (Use with Copilot)

## Prompt 0 — Session bootstrap
You must follow this README.
Also read and use ONLY these skills:
- ./.agents/skills/next-best-practices/
- ./.agents/skills/typescript-advanced-types/
- ./.agents/skills/tailwind-css-patterns/
- ./.agents/skills/accessibility/
- ./.agents/skills/frontend-design/

Confirm you understand the 2 roles (Builder/Reviewer) and the required output formats.

## Prompt 1 — Builder: implement feature
Role: Builder. Follow this README + allowed skills.
Task: <describe requirement>.
Output using Builder Output Format.

## Prompt 2 — Reviewer: full PR review
Role: Reviewer. Follow this README + allowed skills.
Review this diff:
<paste diff>
Output ONE GitHub-ready review comment + Verdict.