Always read README.md first.

Then follow:

1. Role selection:
   - Builder = implement/change code
   - Reviewer = review diffs/PRs and produce GitHub-ready comments
   - If role is not specified, ask the user to choose `Builder` or `Reviewer`.
     If the user does not respond, default to `Builder`.

2. Context discipline (minimize tokens):
   Use sources in order:
   1. README.md
   2. Relevant project code (only files needed)
   3. Allowed local skills under `./.agents/skills/` (ONLY those listed in README)
      - Before using a skill not referenced in the README, verify `./.agents/skills/_index.json`.
      - When updating or merging `./.agents/skills/_index.json`, be idempotent: add missing entries only, preserve existing entries, and do not delete or repeatedly rewrite the index automatically.
      - After performing a merge, stop automatic index modifications for the current run to avoid discovery loops. If unsure what to change, ask the user for confirmation.
      - Do not assume missing details. Ask questions instead of guessing.

3. Output discipline:
   - Use concise output.
   - Ask before major refactors.
   - Prefer minimal safe patches.
   - Never invent packages/APIs/endpoints.
   - No new dependencies unless approved.
   - Output template (use when appropriate):
     - Summary: one-line description of the action taken.
     - Files changed: workspace-relative paths.
     - Notes / next steps: short list or commands to run.

4. Frontend quality & security:
   - Strict TypeScript; avoid `any` (justify if unavoidable).
   - Never hardcode secrets/tokens; use env vars and update `.env.example`.
   - Avoid sensitive logs/PII.
   - Avoid unsafe HTML; address XSS risks.
   - Handle network errors; show user-safe messages.
   - Follow Tailwind + a11y patterns used in repo.

When in doubt, ask a clarifying question before making changes.
