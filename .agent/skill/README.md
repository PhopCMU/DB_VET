# Skill Pack — Dashboard Admin

## Skill Pack นี้คืออะไร?

Skill Pack คือชุดเอกสารขั้นตอนการทำงาน (playbook) สำหรับ GitHub Copilot Chat  
แต่ละ skill อธิบายวิธีทำงานที่ถูกต้องตาม stack จริงของโปรเจกต์นี้:

| ข้อมูลจริงของ repo | ค่า |
|---|---|
| Framework | Next.js 15 + App Router |
| ภาษา | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 |
| State Management | Zustand v5 |
| HTTP Client | axios |
| Package Manager | npm |
| Scripts | `dev`, `build`, `start`, `lint` |
| Test Framework | ไม่มี (ใช้ lint + build ตรวจสอบ) |

---

## วิธีใช้กับ Copilot Chat

เปิด Copilot Chat แล้วอ้างอิง skill ที่ต้องการ เช่น:

```
@workspace อ่าน /.agent/skill/skills/accessibility/a11y-audit-checklist.md แล้วตรวจสอบ component นี้ให้หน่อย
```

```
@workspace ทำตาม /.agent/skill/skills/react-best-practices/hooks-rules-and-deps.md และแก้ไข hook นี้
```

```
@workspace ใช้ /.agent/skill/skills/typescript-advanced-types/discriminated-unions-for-ui-states.md เพื่อสร้าง type สำหรับ loading state
```

```
@workspace ทำตาม /.agent/skill/skills/next-best-practices/performance-checklist.md ตรวจสอบหน้า dashboard
```

---

## Skill Selection Guide

| ต้องการทำอะไร | ใช้ skill category |
|---|---|
| ตรวจสอบ / ปรับปรุง accessibility | [accessibility](./skills/accessibility/INDEX.md) |
| ออกแบบ API ของ component | [composition-patterns](./skills/composition-patterns/INDEX.md) |
| สร้าง UI ที่มี design quality สูง | [frontend-design](./skills/frontend-design/INDEX.md) |
| ใช้ Next.js App Router ถูกต้อง | [next-best-practices](./skills/next-best-practices/INDEX.md) |
| ตัดสินใจเรื่อง caching | [next-cache-components](./skills/next-cache-components/INDEX.md) |
| อัปเกรด Next.js | [next-upgrade](./skills/next-upgrade/INDEX.md) |
| เขียน React ที่มีประสิทธิภาพ | [react-best-practices](./skills/react-best-practices/INDEX.md) |
| จัด Tailwind class ให้เป็นระเบียบ | [tailwind-css-patterns](./skills/tailwind-css-patterns/INDEX.md) |
| ออกแบบ TypeScript types | [typescript-advanced-types](./skills/typescript-advanced-types/INDEX.md) |

---

## สารบัญทุก Category

- [accessibility](./skills/accessibility/INDEX.md)
- [composition-patterns](./skills/composition-patterns/INDEX.md)
- [frontend-design](./skills/frontend-design/INDEX.md)
- [next-best-practices](./skills/next-best-practices/INDEX.md)
- [next-cache-components](./skills/next-cache-components/INDEX.md)
- [next-upgrade](./skills/next-upgrade/INDEX.md)
- [react-best-practices](./skills/react-best-practices/INDEX.md)
- [tailwind-css-patterns](./skills/tailwind-css-patterns/INDEX.md)
- [typescript-advanced-types](./skills/typescript-advanced-types/INDEX.md)

---

## กฎการใช้ Skill Pack

1. **อ่าน README.md ของ repo ก่อนเสมอ**
2. ใช้ skill เป็น reference ไม่ใช่ copy-paste โดยตรง
3. ปรับโค้ดตัวอย่างให้เข้ากับ pattern ที่มีอยู่แล้วใน repo
4. หากมี conflict ระหว่าง skill กับ README.md ของ repo — ให้ README.md ชนะ
