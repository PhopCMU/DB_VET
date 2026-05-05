# Routing, Layouts, and Metadata (App Router)

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อสร้าง route ใหม่, กำหนด layout, หรือตั้งค่า metadata  
repo นี้ใช้ **Next.js 15 App Router** — ไม่ใช่ Pages Router

## 2. Preconditions

- Next.js 15 + App Router (`app/` directory)
- TypeScript 5 strict mode
- โครงสร้างปัจจุบัน: `app/dashboard/`, `app/auth/`, `app/context/`

## 3. Inputs

- `ROUTE_PATH` — path ของ route ใหม่ (เช่น `/dashboard/reports`)
- `LAYOUT_SCOPE` — `root` | `dashboard` | `feature`

## 4. Outputs

- ไฟล์ `page.tsx` และ `layout.tsx` ที่ถูกต้อง
- Metadata ที่กำหนดครบถ้วน

## 5. ขั้นตอน

### ขั้นที่ 1 — โครงสร้าง App Router

```
app/
├── layout.tsx          ← Root layout (ใช้กับทุกหน้า)
├── page.tsx            ← หน้าแรก (/)
├── globals.css
├── auth/
│   └── page.tsx        ← /auth
└── dashboard/
    ├── layout.tsx      ← Dashboard layout (ใช้กับทุกหน้าใน /dashboard)
    ├── page.tsx        ← /dashboard
    └── reports/
        └── page.tsx    ← /dashboard/reports
```

### ขั้นที่ 2 — สร้าง Page Component

```tsx
// app/dashboard/reports/page.tsx
// Server Component by default — ไม่ต้องใส่ "use client"
export default function ReportsPage() {
  return (
    <main>
      <h1>รายงาน</h1>
    </main>
  );
}
```

### ขั้นที่ 3 — สร้าง Layout

```tsx
// app/dashboard/reports/layout.tsx
export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <nav aria-label="Reports navigation">{/* sub-nav */}</nav>
      {children}
    </section>
  );
}
```

### ขั้นที่ 4 — กำหนด Metadata

```tsx
// app/dashboard/reports/page.tsx
import type { Metadata } from "next";

// Static metadata
export const metadata: Metadata = {
  title: "รายงาน | Dashboard Admin",
  description: "หน้ารายงานของระบบ",
};

export default function ReportsPage() {
  return <main>...</main>;
}
```

```tsx
// Dynamic metadata (กรณีต้องการ param จาก route)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params; // Next.js 15 — params เป็น Promise
  return {
    title: `รายงาน #${id} | Dashboard Admin`,
  };
}
```

> **สำคัญ:** Next.js 15 — `params` และ `searchParams` เป็น **Promise** ต้อง `await`

### ขั้นที่ 5 — Route Groups (ไม่กระทบ URL)

```
app/
└── (dashboard)/         ← Route group — ไม่เป็นส่วนของ URL
    ├── layout.tsx       ← Layout ที่ใช้กับ group
    ├── analytics/
    │   └── page.tsx     ← /analytics (ไม่มี /dashboard/ นำหน้า)
    └── reports/
        └── page.tsx     ← /reports
```

### ขั้นที่ 6 — Protected Route Pattern

```tsx
// app/dashboard/layout.tsx — ตรวจสอบ auth ก่อน render
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ตรวจ session (ดู pattern ใน app/context/UserContext.tsx)
  // ถ้าไม่มี session → redirect
  // redirect("/auth"); // uncomment เมื่อมี auth check จริง

  return <div>{children}</div>;
}
```

## 6. Guardrails

- ❌ ห้ามใส่ `"use client"` ใน `layout.tsx` โดยไม่จำเป็น — layout ควรเป็น Server Component
- ❌ ห้าม access `params` โดยตรงโดยไม่ `await` ใน Next.js 15
- ❌ ห้ามสร้าง `pages/` directory ใหม่ — repo ใช้ App Router เท่านั้น
- ❌ ห้ามใช้ `getServerSideProps` / `getStaticProps` — เป็น Pages Router API
- ✅ ตรวจสอบว่า metadata มี `title` และ `description` ทุก page

## 7. Validation

```bash
npm run lint
npm run build
```

## 8. Example Prompts

```
@workspace อ่าน routing-layouts-and-metadata.md แล้วสร้าง route /dashboard/finance/reports พร้อม layout
```

```
@workspace ตรวจสอบว่า app/dashboard/layout.tsx ตั้ง metadata ถูกต้องสำหรับ Next.js 15
```

```
@workspace เพิ่ม dynamic metadata ใน app/dashboard/360/[id]/page.tsx
```

## 9. Links

- [data-fetching-and-rsc-boundaries.md](./data-fetching-and-rsc-boundaries.md)
- [performance-checklist.md](./performance-checklist.md)
- [next-cache-components/cache-decision-tree.md](../next-cache-components/cache-decision-tree.md)
