# Responsive and Dark Mode Patterns

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อสร้าง layout ที่ต้องทำงานบนหลาย viewport  
**Dark mode:** repo นี้ยังไม่มี dark mode configuration — section นี้มีแนวทางถ้าต้องการเพิ่มในอนาคต

## 2. Preconditions

- Tailwind CSS v4
- ไม่มี `tailwind.config.js` — configure ผ่าน `@theme` ใน `globals.css`
- Dark mode: **Unknown** — ต้องตรวจสอบว่า repo ต้องการหรือไม่

> **TODO:** ถ้าต้องการ dark mode ให้เพิ่ม `@media (prefers-color-scheme: dark)` ใน `@theme` หรือใช้ class strategy

## 3. Inputs

- `COMPONENT_FILE` — path ของ component ที่ต้องการ responsive
- `DARK_MODE` — `yes` | `no` | `unknown`

## 4. Outputs

- Component ที่ responsive สำหรับ mobile → desktop

## 5. ขั้นตอน

### ขั้นที่ 1 — Breakpoint Strategy (Mobile-first)

```
ไม่มี prefix = mobile (< 640px)
sm:  = 640px+   (tablet portrait)
md:  = 768px+   (tablet landscape)
lg:  = 1024px+  (desktop)
xl:  = 1280px+  (large desktop)
```

```tsx
// ✅ Mobile-first approach
<div className="
  grid grid-cols-1          {/* mobile */}
  sm:grid-cols-2            {/* tablet */}
  lg:grid-cols-4            {/* desktop */}
">
```

### ขั้นที่ 2 — Responsive Typography

```tsx
// ✅ ขนาด text ที่ scale ตาม viewport
<h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">
  หัวข้อหน้า
</h1>

<p className="text-sm sm:text-base">
  เนื้อหา
</p>
```

### ขั้นที่ 3 — Responsive Spacing

```tsx
// ✅ padding ที่ใหญ่ขึ้นใน desktop
<div className="px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
  {/* content */}
</div>
```

### ขั้นที่ 4 — Show/Hide บน Viewport ต่างๆ

```tsx
// ✅ แสดงเฉพาะ desktop
<div className="hidden lg:block">
  <FullSidebar />
</div>

// ✅ แสดงเฉพาะ mobile
<div className="lg:hidden">
  <MobileMenu />
</div>

// ✅ แสดงเฉพาะ tablet ขึ้นไป
<div className="hidden sm:flex items-center gap-2">
  <BreadcrumbNav />
</div>
```

### ขั้นที่ 5 — Responsive Table

```tsx
// ✅ ซ่อน column บน mobile
<table>
  <thead>
    <tr>
      <th>ชื่อ</th>
      <th className="hidden md:table-cell">แผนก</th>
      <th className="hidden lg:table-cell">วันที่เริ่มงาน</th>
      <th>สถานะ</th>
    </tr>
  </thead>
</table>
```

### ขั้นที่ 6 — Dark Mode (ถ้าต้องการเพิ่มในอนาคต)

```css
/* app/globals.css — เพิ่ม dark mode support ด้วย media query */
@theme {
  --color-bg: #ffffff;
  --color-text: #0f172a;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #0f172a;
    --color-text: #f1f5f9;
  }
}
```

```tsx
// Tailwind v4 dark mode class strategy (ถ้าต้องการ manual toggle)
// ต้องการ: เพิ่ม variant "dark" ใน @theme
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

> **TODO:** ตรวจสอบกับทีมว่า repo นี้ต้องการ dark mode หรือไม่ก่อนดำเนินการ

## 6. Guardrails

- ❌ ห้ามใช้ `max-sm:` (max-width modifier) เมื่อ mobile-first ทำได้
- ❌ ห้ามซ่อน content ที่ essential บน mobile ด้วย `hidden sm:block`
- ❌ ห้ามเพิ่ม dark mode โดยไม่ได้รับอนุมัติ
- ✅ ทดสอบทุก layout บน 375px, 768px, 1280px เสมอ

## 7. Validation

```bash
npm run lint
npm run build
```

ทดสอบด้วย Chrome DevTools responsive mode

## 8. Example Prompts

```
@workspace อ่าน responsive-and-dark-mode-patterns.md แล้วปรับ components/ReportTable.tsx ให้ responsive
```

```
@workspace ทำให้ sidebar ใน app/dashboard/layout.tsx ซ่อนบน mobile ตาม skill
```

## 9. Links

- [class-organization-and-variants.md](./class-organization-and-variants.md)
- [frontend-design/responsive-layout-patterns.md](../frontend-design/responsive-layout-patterns.md)
