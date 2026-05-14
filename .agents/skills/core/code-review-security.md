# Code Review: Security (Next.js)

## When to use
- Any PR touching auth, storage, API calls, rendering remote content, exports, deps
- Any PR changing Server/Client component boundaries

## Checklist
- [ ] No secrets committed (keys, tokens, credentials)
- [ ] No tokens/headers in logs
- [ ] No token in URL query params
- [ ] XSS safe: no `dangerouslySetInnerHTML` unless sanitized and justified
- [ ] Cookie auth: CSRF considerations documented (backend contract)
- [ ] Storage auth: sessionStorage preferred; localStorage only with clear policy
- [ ] Dependencies: new deps justified; lockfile reviewed; remote tarballs documented (xlsx tgz)
- [ ] No secrets leaked to client bundles (only `NEXT_PUBLIC_*` exposed)
- [ ] `"use client"` used minimally and appropriately

## Review references
- `.agents/skills/core/security-baseline.md`
- `.agents/skills/core/security-frontend-xss.md`
- `.agents/skills/core/security-axios-auth.md`
- `.agents/skills/core/security-crypto-js-usage.md`
- `.agents/skills/core/security-dependencies.md`

## Pitfalls
- “It’s frontend only” assumption
- Leaking PII via exports (PDF/Excel) by including hidden fields
- Accidentally importing server-only modules into Client Components

## Update notes
- (append new learnings here)
