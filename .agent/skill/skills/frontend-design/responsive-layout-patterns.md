# Responsive Layout Patterns

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อสร้าง layout ของ dashboard ที่ต้องรองรับหลาย viewport  
อิงตามโครงสร้าง `app/dashboard/layout.tsx` + `components/Sidedar/Sidebar.tsx`

## 2. Preconditions

- Tailwind CSS v4
- Next.js 15 App Router (`app/dashboard/layout.tsx` มีอยู่แล้ว)
- Sidebar component อยู่ใน `components/Sidedar/`

## 3. Inputs

- `LAYOUT_TYPE` — `sidebar-main` | `full-width` | `card-grid` | `split-panel`
- `BREAKPOINTS` — breakpoints ที่ต้องการรองรับ (default: `sm`, `md`, `lg`)

## 4. Outputs

- Layout component ที่ responsive
- ไม่เพิ่ม dependency ใหม่

## 5. ขั้นตอน

### ขั้นที่ 1 — Dashboard Sidebar Layout Pattern

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar — hidden on mobile, fixed on desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <Sidebar />
      </aside>

      {/* Main content — offset by sidebar width on desktop */}
      <main className="flex-1 lg:pl-64">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
```

### ขั้นที่ 2 — Card Grid Pattern

```tsx
// ✅ Responsive card grid
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map((item) => (
    <div key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
      {/* card content */}
    </div>
  ))}
</div>
```

### ขั้นที่ 3 — Stats/KPI Row Pattern

```tsx
// ✅ KPI cards ที่ responsive
<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
  <div className="rounded-lg bg-white p-4 shadow-sm">
    <p className="text-sm text-gray-500">จำนวนพนักงาน</p>
    <p className="mt-1 text-2xl font-bold text-gray-900">1,234</p>
  </div>
</div>
```

### ขั้นที่ 4 — Table Responsive Pattern

```tsx
// ✅ ห่อ table ด้วย overflow container
<div className="overflow-x-auto rounded-lg border bg-white">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          ชื่อ
        </th>
        {/* ... */}
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 bg-white">
      {/* rows */}
    </tbody>
  </table>
</div>
```

### ขั้นที่ 5 — Mobile Sidebar Overlay Pattern

```tsx
// Sidebar overlay สำหรับ mobile
{isMobileMenuOpen && (
  <div className="fixed inset-0 z-40 lg:hidden">
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-gray-600/75"
      onClick={() => setIsMobileMenuOpen(false)}
      aria-hidden="true"
    />
    {/* Drawer */}
    <div className="relative flex w-64 flex-col bg-white">
      <Sidebar />
    </div>
  </div>
)}
```

### ขั้นที่ 6 — Breakpoint Reference (Tailwind v4)

```
sm:  640px  — Tablet portrait
md:  768px  — Tablet landscape
lg:  1024px — Desktop
xl:  1280px — Large desktop
2xl: 1536px — Wide screen

Mobile-first: ไม่มี prefix = mobile, sm: = 640px+
```

## 6. Guardrails

- ❌ ห้าม fixed pixel width บน layout container — ใช้ `max-w-*` แทน
- ❌ ห้าม `vh` unit บน mobile ที่มี browser chrome — ใช้ `dvh` หรือ `min-h-screen`
- ❌ ห้ามซ่อน content ด้วย `hidden` บน mobile ถ้า content นั้น essential
- ✅ ตรวจสอบว่า table มี `overflow-x-auto` เสมอ
- ✅ ตรวจสอบ layout บน 375px (iPhone SE) และ 1280px (desktop)

## 7. Validation

```bash
npm run lint
npm run build
```

ตรวจด้วยตนเอง: ใช้ Chrome DevTools responsive mode ที่ 375px, 768px, 1280px

## 8. Example Prompts

```
@workspace อ่าน responsive-layout-patterns.md แล้วปรับ app/dashboard/layout.tsx ให้ sidebar collapse บน mobile
```

```
@workspace สร้าง KPI card grid สำหรับ app/dashboard/page.tsx ตาม responsive-layout-patterns
```

## 9. Links

- [design-tokens-and-theming.md](./design-tokens-and-theming.md)
- [loading-empty-error-states.md](./loading-empty-error-states.md)
- [tailwind-css-patterns/responsive-and-dark-mode-patterns.md](../tailwind-css-patterns/responsive-and-dark-mode-patterns.md)
