# Copilot Chat Instructions

## Stack Overview

- Next.js 15 App Router + React 19 + TypeScript 5
- Tailwind CSS v4 (`@import "tailwindcss"` — ไม่มี tailwind.config.js)
- Zustand v5 สำหรับ global state
- axios สำหรับ HTTP requests
- Deploy ด้วย PM2 port 4040

---

## Using /.agent Skills

Skill Pack อยู่ที่ `/.agent/skill/` — เป็น playbook สำหรับงานแต่ละประเภท

### วิธีใช้

อ้างอิง skill file ใน prompt:

```
@workspace อ่าน /.agent/skill/skills/react-best-practices/hooks-rules-and-deps.md
แล้วตรวจสอบ hooks/usePaymentSSE.tsx
```

```
@workspace ทำตาม /.agent/skill/skills/typescript-advanced-types/discriminated-unions-for-ui-states.md
แล้วสร้าง AsyncState type สำหรับ employee list
```

```
@workspace ใช้ /.agent/skill/skills/accessibility/a11y-audit-checklist.md
เพื่อ audit components/Modal.tsx
```

### เลือก Skill ที่เหมาะสม

| ต้องการทำอะไร | Skill |
|---|---|
| ตรวจสอบ / แก้ a11y | `accessibility/a11y-audit-checklist.md` |
| สร้าง accessible form | `accessibility/accessible-forms-and-errors.md` |
| Focus management / Modal keyboard | `accessibility/focus-management-and-keyboard-nav.md` |
| ออกแบบ component API | `composition-patterns/component-api-design-patterns.md` |
| Design tokens / theming | `frontend-design/design-tokens-and-theming.md` |
| Loading / Empty / Error states | `frontend-design/loading-empty-error-states.md` |
| App Router routing / metadata | `next-best-practices/routing-layouts-and-metadata.md` |
| Server vs Client components | `next-best-practices/data-fetching-and-rsc-boundaries.md` |
| Performance optimization | `next-best-practices/performance-checklist.md` |
| Cache strategy | `next-cache-components/cache-decision-tree.md` |
| Upgrade Next.js | `next-upgrade/upgrade-playbook.md` |
| useEffect / hooks deps | `react-best-practices/hooks-rules-and-deps.md` |
| State management choice | `react-best-practices/state-management-guidelines.md` |
| Tailwind class organization | `tailwind-css-patterns/class-organization-and-variants.md` |
| Component variants | `tailwind-css-patterns/component-variants-with-cn-utility.md` |
| TypeScript discriminated unions | `typescript-advanced-types/discriminated-unions-for-ui-states.md` |
| Type API contracts | `typescript-advanced-types/typed-api-contracts.md` |

### Index ของแต่ละ Category

ดู [/.agent/skill/README.md](../.agent/skill/README.md) สำหรับ skill selection guide ครบถ้วน

---

## ข้อควรระวัง

- Skills เป็น reference — ปรับให้เข้ากับโค้ดที่มีอยู่เสมอ
- ถ้า skill ขัดแย้งกับ pattern ที่ใช้อยู่ใน repo → ให้ถาม ไม่ใช่ override
- อ่าน README.md ก่อนใช้ skill ทุกครั้ง
