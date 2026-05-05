# Class Organization and Variants

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อ className ใน component ยาวเกินไปหรืออ่านยาก  
และเมื่อต้องการกำหนด pattern การจัดเรียง utility classes

## 2. Preconditions

- Tailwind CSS v4 (`@import "tailwindcss"` ใน `app/globals.css`)
- ไม่มี `tailwind.config.js`
- ไม่มี `cn()` / `clsx` / `tailwind-merge` — **TODO: พิจารณาติดตั้งถ้า codebase โต**

## 3. Inputs

- `COMPONENT_FILE` — path ของ component ที่ต้องการ organize

## 4. Outputs

- className ที่อ่านง่ายขึ้น
- Pattern ที่ consistent ทั้ง codebase

## 5. ขั้นตอน

### ขั้นที่ 1 — ลำดับการจัดเรียง Class (Recommended Order)

จัด class ตามหมวดหมู่ดังนี้:

```
1. Layout:      block flex grid hidden relative absolute fixed
2. Sizing:      w-* h-* min-* max-*
3. Spacing:     p-* px-* py-* m-* mx-* my-*
4. Typography:  text-* font-* leading-* tracking-*
5. Colors:      text-* bg-* border-*
6. Borders:     border rounded-*
7. Effects:     shadow-* opacity-* ring-*
8. Transitions: transition-* duration-* ease-*
9. States:      hover:* focus:* active:* disabled:*
10. Responsive: sm:* md:* lg:* xl:*
```

### ขั้นที่ 2 — Template สำหรับ Element ทั่วไป

```tsx
// Button
<button
  className="
    flex items-center justify-center gap-2
    px-4 py-2
    text-sm font-medium
    bg-blue-600 text-white
    rounded-md border border-transparent
    shadow-sm
    transition-colors duration-150
    hover:bg-blue-700
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    disabled:cursor-not-allowed disabled:opacity-50
  "
>
  บันทึก
</button>
```

### ขั้นที่ 3 — แยก className ยาวออกเป็น Variable

```tsx
// ✅ ถูกต้อง — ใช้ template literal string สำหรับ class ที่ยาว
const tableHeaderClass =
  "px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500";

const tableRowClass =
  "divide-x divide-gray-200 bg-white hover:bg-gray-50";

function DataTable() {
  return (
    <table>
      <thead>
        <tr>
          <th className={tableHeaderClass}>ชื่อ</th>
          <th className={tableHeaderClass}>ตำแหน่ง</th>
        </tr>
      </thead>
      <tbody>
        <tr className={tableRowClass}>...</tr>
      </tbody>
    </table>
  );
}
```

### ขั้นที่ 4 — Conditional Classes (ไม่มี cn() utility)

```tsx
// ✅ ถูกต้อง — template literal + ternary
<button
  className={`rounded px-4 py-2 text-sm font-medium transition-colors
    ${isActive ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}
    ${disabled ? "cursor-not-allowed opacity-50" : ""}
  `}
>

// ✅ ถูกต้อง — lookup object
const statusClasses = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-500",
  pending: "bg-yellow-100 text-yellow-700",
} satisfies Record<Status, string>;

<span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClasses[status]}`}>
  {statusText}
</span>
```

### ขั้นที่ 5 — Tailwind v4 Arbitrary Values (ใช้อย่างระมัดระวัง)

```tsx
// ✅ ใช้เมื่อจำเป็นจริงๆ และไม่มี utility ที่ตรง
<div className="h-[calc(100vh-64px)] w-[320px]">

// ❌ ห้ามใช้สำหรับค่าที่มี utility อยู่แล้ว
<div className="h-[16px]">  // ✅ ใช้ h-4 แทน
```

## 6. Guardrails

- ❌ ห้าม className เกิน 10 utility ใน JSX โดยไม่แยกออกเป็น variable
- ❌ ห้าม mix Tailwind กับ inline style (`style={{}}`) สำหรับค่าที่ Tailwind cover ได้
- ❌ ห้ามใช้ arbitrary values สำหรับค่าที่มี Tailwind utility อยู่แล้ว
- ❌ ห้ามสร้าง `tailwind.config.js` ใหม่ — ใช้ `@theme` ใน `globals.css`
- ✅ จัด class ตาม order ใน ขั้นที่ 1 เสมอ

## 7. Validation

```bash
npm run lint
npm run build
# ตรวจ build output ว่าไม่มี CSS warnings
```

## 8. Example Prompts

```
@workspace อ่าน class-organization-and-variants.md แล้วจัดระเบียบ className ใน components/Modal.tsx
```

```
@workspace ตรวจสอบว่า components/AlertMessage.tsx ใช้ lookup object สำหรับ status colors
```

## 9. Links

- [responsive-and-dark-mode-patterns.md](./responsive-and-dark-mode-patterns.md)
- [component-variants-with-cn-utility.md](./component-variants-with-cn-utility.md)
- [frontend-design/design-tokens-and-theming.md](../frontend-design/design-tokens-and-theming.md)
