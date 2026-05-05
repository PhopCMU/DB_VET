# a11y Audit Checklist

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อต้องการตรวจสอบ component หรือหน้าทั้งหน้าว่าผ่านมาตรฐาน WCAG 2.2 ระดับ AA  
เหมาะสำหรับขั้นตอน code review หรือก่อน deploy feature ใหม่

## 2. Preconditions (สิ่งที่ต้องมีใน repo นี้)

- Next.js 15 App Router (`app/` directory)
- Tailwind CSS v4 (ใช้ `@import "tailwindcss"` ใน `app/globals.css`)
- TypeScript 5 strict mode
- Component ที่ต้องการ audit อยู่ใน `components/` หรือ `app/`

## 3. Inputs (พารามิเตอร์ที่ผู้ใช้ระบุ)

- `TARGET_FILE` — path ของ component หรือ page ที่ต้องการ audit
- `AUDIT_SCOPE` — `component` | `page` | `form`

## 4. Outputs (สิ่งที่คาดว่าจะเปลี่ยนแปลง)

- รายการปัญหาที่พบพร้อมระดับความรุนแรง (Critical / Warning / Info)
- โค้ดที่แก้ไขแล้ว (หาก scope = `component` หรือ `form`)
- ไม่มีการสร้างไฟล์ใหม่ เว้นแต่จำเป็นจริงๆ

## 5. ขั้นตอน

### ขั้นที่ 1 — ตรวจ Semantic HTML

```
☐ ใช้ <button> สำหรับ action ไม่ใช่ <div onClick>
☐ ใช้ <a href> สำหรับ navigation ไม่ใช่ <span onClick>
☐ Heading hierarchy: <h1> → <h2> → <h3> ไม่ข้าม level
☐ Landmark roles: <main>, <nav>, <header>, <footer>, <section aria-label>
☐ List items อยู่ใน <ul> หรือ <ol>
```

### ขั้นที่ 2 — ตรวจ Images และ Icons

```
☐ <img> ทุกรูปมี alt ที่อธิบายเนื้อหา (ถ้าเป็น decorative ให้ alt="")
☐ Icon จาก lucide-react หรือ material-symbols ที่เป็น action button ต้องมี aria-label
☐ SVG ที่มีข้อความต้องมี <title> หรือ aria-label
```

```tsx
// ✅ ถูกต้อง
<button aria-label="ลบรายการ">
  <Trash2 aria-hidden="true" />
</button>

// ❌ ผิด — ไม่มี aria-label
<button>
  <Trash2 />
</button>
```

### ขั้นที่ 3 — ตรวจ Color Contrast

```
☐ Text ทั่วไป (ขนาด < 18px): contrast ratio ≥ 4.5:1
☐ Large text (≥ 18px หรือ bold ≥ 14px): contrast ratio ≥ 3:1
☐ UI component borders/focus indicators: contrast ratio ≥ 3:1
☐ ไม่ใช้สีเป็นเพียงสัญญาณเดียว (เพิ่ม icon หรือ text ประกอบ)
```

### ขั้นที่ 4 — ตรวจ Keyboard Navigation

```
☐ ทุก interactive element รับ focus ได้ด้วย Tab
☐ มี focus ring ที่มองเห็นได้ (ไม่ remove outline โดยไม่มีทางเลือก)
☐ Modal/dialog: focus trapped ภายใน, Escape ปิดได้
☐ Dropdown: ปิดได้ด้วย Escape, เลื่อนด้วย Arrow keys
```

### ขั้นที่ 5 — ตรวจ ARIA

```
☐ ใช้ aria-label / aria-labelledby เมื่อ element ไม่มี visible text
☐ ใช้ aria-describedby สำหรับ hint text หรือ error message
☐ ใช้ aria-live="polite" สำหรับ dynamic content (toast, status update)
☐ ไม่ใช้ role="button" บน <div> — ใช้ <button> แทน
☐ aria-hidden="true" บน decorative icon
```

### ขั้นที่ 6 — ตรวจ Forms

```
☐ ทุก <input> มี <label> ที่ associate กันด้วย htmlFor / id
☐ Error message ใช้ aria-describedby เชื่อมกับ input
☐ Required field มี aria-required="true"
☐ ดู skill: accessible-forms-and-errors.md
```

## 6. Guardrails (สิ่งที่ห้ามทำ)

- ❌ ห้าม remove `outline` หรือ `focus-visible` โดยไม่มีทางเลือกอื่น
- ❌ ห้ามใช้ `tabIndex={1}` หรือค่า positive tabindex — ใช้ `tabIndex={0}` หรือ `-1` เท่านั้น
- ❌ ห้ามซ่อน content ด้วย `display: none` โดยไม่ตรวจว่า screen reader ควรเข้าถึงได้ไหม
- ❌ ห้ามใช้ `aria-hidden="true"` บน element ที่ยังต้องการ keyboard focus
- ❌ ห้ามเพิ่ม dependency ใหม่สำหรับ a11y โดยไม่ได้รับอนุมัติ

## 7. Validation (คำสั่งที่ใช้ตรวจสอบ)

```bash
# ตรวจ type และ lint หลังแก้ไข
npm run lint

# ตรวจ build ไม่พัง
npm run build
```

> **หมายเหตุ:** repo นี้ไม่มี automated a11y testing tool (axe-core, jest-axe)  
> ใช้ browser extension axe DevTools หรือ Lighthouse ตรวจด้วยตนเอง

## 8. Example Prompts สำหรับ Copilot Chat

```
@workspace อ่าน /.agent/skill/skills/accessibility/a11y-audit-checklist.md แล้ว audit components/Modal.tsx
```

```
@workspace ทำตาม a11y-audit-checklist แล้วแก้ไขปัญหา accessibility ใน components/Sidebar/Sidebar.tsx
```

```
@workspace ตรวจสอบ app/dashboard/page.tsx ตาม a11y-audit-checklist ขั้น Semantic HTML และ ARIA
```

## 9. Links (Skills ที่เกี่ยวข้อง)

- [accessible-forms-and-errors.md](./accessible-forms-and-errors.md)
- [focus-management-and-keyboard-nav.md](./focus-management-and-keyboard-nav.md)
- [frontend-design/design-tokens-and-theming.md](../frontend-design/design-tokens-and-theming.md)
