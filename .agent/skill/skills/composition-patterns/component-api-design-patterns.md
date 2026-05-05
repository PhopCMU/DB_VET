# Component API Design Patterns (Props / Variants / Slots)

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อสร้าง component ใหม่หรือปรับปรุง component ที่มี props ยุ่งเหยิง  
เป้าหมาย: API ที่ใช้งานง่าย, ขยายได้, และ type-safe

## 2. Preconditions

- TypeScript 5 strict mode
- Tailwind CSS v4
- ไม่มี `cn()` utility (ไม่มี clsx/tailwind-merge ใน repo) — **TODO: พิจารณาติดตั้ง clsx ถ้าต้องการ**

## 3. Inputs

- `COMPONENT_PURPOSE` — จุดประสงค์ของ component
- `VARIANT_LIST` — รายการ variant ที่ต้องการ (เช่น `default, primary, danger`)

## 4. Outputs

- Component ที่มี props type-safe
- Variant สร้างจาก string literal union (ไม่ใช่ boolean ซ้อนกัน)
- ไม่เพิ่ม dependency ใหม่ (เว้นแต่ได้รับอนุมัติ)

## 5. ขั้นตอน

### ขั้นที่ 1 — ใช้ String Literal Union แทน Boolean Props ซ้อนกัน

```tsx
// ❌ ผิด — boolean props ซ้อนกัน
interface BadButtonProps {
  isPrimary?: boolean;
  isDanger?: boolean;
  isDisabled?: boolean;
}

// ✅ ถูกต้อง — string literal union
type ButtonVariant = "default" | "primary" | "danger" | "ghost";

interface ButtonProps {
  variant?: ButtonVariant;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

### ขั้นที่ 2 — Variant Map (ไม่มี cn() ใน repo นี้)

```tsx
// เนื่องจากไม่มี cn() ใน repo — ใช้ lookup object แทน
const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
  primary: "bg-blue-600 text-white hover:bg-blue-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
};

function Button({ variant = "default", disabled, children, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded px-4 py-2 text-sm font-medium transition-colors
        ${variantClasses[variant]}
        ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {children}
    </button>
  );
}
```

> **TODO:** ถ้าต้องการ `cn()` utility ให้ติดตั้ง `clsx` + `tailwind-merge` และขออนุมัติก่อน

### ขั้นที่ 3 — Slots Pattern (ผ่าน named children)

```tsx
// ใช้ children เฉพาะหรือ render prop สำหรับ slot
interface CardProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

function Card({ header, footer, children }: CardProps) {
  return (
    <div className="rounded-lg border bg-white shadow-sm">
      {header && <div className="border-b px-4 py-3">{header}</div>}
      <div className="px-4 py-4">{children}</div>
      {footer && <div className="border-t px-4 py-3">{footer}</div>}
    </div>
  );
}
```

### ขั้นที่ 4 — Extend Native HTML Props

```tsx
// ✅ ถูกต้อง — extend native props เพื่อรองรับ aria-*, data-* ฯลฯ
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

function Input({ label, error, id, ...rest }: InputProps) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} aria-describedby={error ? `${id}-error` : undefined} {...rest} />
      {error && <p id={`${id}-error`} role="alert">{error}</p>}
    </div>
  );
}
```

### ขั้นที่ 5 — ตัดสินใจว่า Prop ควรเป็น Required หรือ Optional

```
☐ Props ที่ไม่มีค่า default ที่สมเหตุสมผล → required
☐ Props ที่มี default ที่ชัดเจน → optional + default value
☐ Props ที่เป็น "เปิด/ปิด feature" → optional boolean หรือ string variant
☐ ห้ามใส่ defaultProps ใน React 19 — ใช้ destructuring default แทน
```

## 6. Guardrails

- ❌ ห้ามมี boolean prop มากกว่า 2 ตัวสำหรับ visual variant — ใช้ `variant` แทน
- ❌ ห้าม spread `...props` ลง DOM element โดยไม่ filter ก่อน (เสี่ยง XSS/ข้อมูลรั่ว)
- ❌ ห้ามใช้ `any` เป็น type ของ props
- ❌ ห้ามเพิ่ม clsx/tailwind-merge โดยไม่ได้รับอนุมัติ
- ✅ ตรวจสอบว่า component export type ด้วย (เพื่อให้ผู้ใช้ extend ได้)

## 7. Validation

```bash
npm run lint
npm run build
```

## 8. Example Prompts

```
@workspace อ่าน component-api-design-patterns.md แล้วปรับ components/AlertMessage.tsx ให้มี variant prop
```

```
@workspace ออกแบบ API ของ Button component ใหม่โดยใช้ pattern จาก component-api-design-patterns.md
```

```
@workspace ตรวจสอบว่า components/Input/InputField.tsx extend native HTML props ถูกต้องหรือเปล่า
```

## 9. Links

- [compound-components.md](./compound-components.md)
- [typescript-advanced-types/discriminated-unions-for-ui-states.md](../typescript-advanced-types/discriminated-unions-for-ui-states.md)
- [tailwind-css-patterns/component-variants-with-cn-utility.md](../tailwind-css-patterns/component-variants-with-cn-utility.md)
