# Design Tokens and Theming

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อต้องการกำหนด color palette, spacing, typography ให้ consistent ทั้ง project  
Tailwind CSS v4 ใช้ CSS-first configuration — ไม่มี `tailwind.config.js`

## 2. Preconditions

- Tailwind CSS v4 (`@import "tailwindcss"` ใน `app/globals.css`)
- ไม่มี `tailwind.config.js` — configure ผ่าน `@theme` block ใน CSS
- NotoSansThai font ติดตั้งแล้ว (local font ใน `public/fonts/`)

## 3. Inputs

- `TOKEN_SCOPE` — `color` | `spacing` | `typography` | `all`
- `BRAND_COLORS` — ค่า hex ของสีหลัก (ถ้ามี)

## 4. Outputs

- เพิ่ม/แก้ไข `@theme` block ใน `app/globals.css`
- ไม่สร้างไฟล์ใหม่

## 5. ขั้นตอน

### ขั้นที่ 1 — กำหนด Design Tokens ใน Tailwind v4

ใน `app/globals.css` ใช้ `@theme` block (Tailwind v4 syntax):

```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-brand-50: #eff6ff;
  --color-brand-100: #dbeafe;
  --color-brand-500: #3b82f6;
  --color-brand-600: #2563eb;
  --color-brand-700: #1d4ed8;

  --color-surface: #ffffff;
  --color-surface-muted: #f8fafc;
  --color-border: #e2e8f0;

  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #94a3b8;

  /* Spacing scale */
  --spacing-layout: 1.5rem;

  /* Typography */
  --font-sans: "Noto Sans Thai", ui-sans-serif, system-ui, sans-serif;
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;

  /* Radius */
  --radius-card: 0.5rem;
  --radius-button: 0.375rem;
  --radius-input: 0.375rem;
}
```

### ขั้นที่ 2 — ใช้ Tokens ใน Component

```tsx
// ✅ ใช้ token ที่กำหนดไว้ — สอดคล้องทั้ง project
<div className="bg-surface rounded-card border-border text-text-primary">
  <h2 className="text-xl font-semibold">หัวข้อ</h2>
  <p className="text-text-secondary text-sm">คำอธิบาย</p>
</div>

// ❌ hardcode ค่าสี — ไม่ consistent
<div className="bg-white rounded-[8px] border-gray-200 text-[#0f172a]">
```

### ขั้นที่ 3 — Typography Scale สำหรับ Dashboard

```
h1 (page title):     text-2xl font-bold text-text-primary
h2 (section title):  text-xl font-semibold text-text-primary
h3 (card title):     text-lg font-medium text-text-primary
body (label):        text-base text-text-primary
caption:             text-sm text-text-secondary
hint:                text-xs text-text-muted
```

### ขั้นที่ 4 — Semantic Color Usage

```
Status colors:
- success:  text-green-700 / bg-green-50 / border-green-200
- warning:  text-yellow-700 / bg-yellow-50 / border-yellow-200
- error:    text-red-700 / bg-red-50 / border-red-200
- info:     text-blue-700 / bg-blue-50 / border-blue-200

ห้ามใช้ raw Tailwind color (เช่น blue-500) โดยตรงใน component
ให้ใช้ semantic token แทน
```

## 6. Guardrails

- ❌ ห้าม hardcode ค่า hex ใน className
- ❌ ห้ามสร้าง `tailwind.config.js` — Tailwind v4 ใช้ CSS-first config
- ❌ ห้ามเพิ่มสีใหม่โดยไม่เพิ่มใน `@theme` ก่อน
- ❌ ห้าม override `--font-sans` โดยไม่ทดสอบว่า NotoSansThai ยังแสดงผลถูกต้อง
- ✅ ตรวจสอบ contrast ratio ของสีที่เพิ่มใหม่ (เป้าหมาย ≥ 4.5:1 สำหรับ text)

## 7. Validation

```bash
npm run lint
npm run build
```

ตรวจด้วยตนเอง: เปิด browser แล้วดูว่า font NotoSansThai แสดงผลถูกต้อง

## 8. Example Prompts

```
@workspace อ่าน design-tokens-and-theming.md แล้วเพิ่ม @theme block ใน globals.css สำหรับ brand colors
```

```
@workspace ตรวจว่า components/Header.tsx ใช้ design token หรือ hardcode สีโดยตรง
```

## 9. Links

- [responsive-layout-patterns.md](./responsive-layout-patterns.md)
- [tailwind-css-patterns/class-organization-and-variants.md](../tailwind-css-patterns/class-organization-and-variants.md)
- [accessibility/a11y-audit-checklist.md](../accessibility/a11y-audit-checklist.md)
