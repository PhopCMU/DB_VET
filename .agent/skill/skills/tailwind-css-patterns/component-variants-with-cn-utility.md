# Component Variants with cn() Utility

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อต้องการสร้าง component ที่มีหลาย visual variant  
และต้องการ merge Tailwind classes อย่างปลอดภัย (ป้องกัน class conflicts)

## 2. Preconditions

- Tailwind CSS v4
- **⚠️ TODO: `cn()` ยังไม่มีใน repo นี้** — ไม่มี `clsx` หรือ `tailwind-merge`

### ตัดสินใจก่อนใช้ skill นี้:

```
ถ้ายังไม่มี cn() utility:
→ ใช้ lookup object pattern (ดูขั้นที่ 3) — ไม่ต้องติดตั้ง dependency ใหม่

ถ้าต้องการ cn() จริงๆ:
→ ขออนุมัติติดตั้ง clsx + tailwind-merge ก่อน
→ แล้วทำตามขั้นที่ 4
```

## 3. Inputs

- `COMPONENT_NAME` — ชื่อ component
- `VARIANTS` — รายการ variant (เช่น `default, primary, danger, ghost`)
- `INSTALL_CN` — `yes` | `no` (ได้รับอนุมัติหรือไม่)

## 4. Outputs

- Component ที่มี variants ที่ type-safe
- ถ้า `INSTALL_CN=yes`: utils/cn.ts + component ที่ใช้ cn()

## 5. ขั้นตอน

### ขั้นที่ 1 — กำหนด Variant Types

```tsx
// ✅ Type-safe variants
type ButtonSize = "sm" | "md" | "lg";
type ButtonVariant = "default" | "primary" | "danger" | "ghost" | "outline";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}
```

### ขั้นที่ 2 — Base Classes

```tsx
// แยก base classes ออกจาก variant classes
const baseClasses =
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
```

### ขั้นที่ 3 — Lookup Object Pattern (ไม่ต้องการ cn())

```tsx
// ✅ Pattern นี้ใช้ได้โดยไม่ต้องติดตั้ง dependency ใหม่
const variantMap: Record<ButtonVariant, string> = {
  default: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
  primary: "bg-blue-600 border border-transparent text-white hover:bg-blue-700 focus:ring-blue-500",
  danger: "bg-red-600 border border-transparent text-white hover:bg-red-700 focus:ring-red-500",
  ghost: "bg-transparent border-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
  outline: "bg-transparent border border-current text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
};

const sizeMap: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

function Button({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${baseClasses} ${variantMap[variant]} ${sizeMap[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
```

### ขั้นที่ 4 — cn() Utility Pattern (ถ้าได้รับอนุมัติ)

```bash
# ติดตั้ง (ต้องได้รับอนุมัติก่อน)
npm install clsx tailwind-merge
```

```tsx
// utils/cn.ts — สร้างหลังจากติดตั้ง
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```tsx
// ✅ ใช้ cn() — แก้ class conflicts อัตโนมัติ
import { cn } from "@/utils/cn";

function Button({ variant = "default", className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        baseClasses,
        variantMap[variant],
        className // override จาก parent ได้
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

// การใช้งาน — cn() จัดการ conflict ให้
<Button variant="primary" className="w-full">  {/* w-full ไม่ conflict */}
```

### ขั้นที่ 5 — CVA Pattern (ถ้าต้องการ advanced variants)

```bash
# ติดตั้ง (ต้องได้รับอนุมัติก่อน)
npm install class-variance-authority
```

```tsx
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        danger: "bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({ variant, size, className, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...rest}
    />
  );
}
```

## 6. Guardrails

- ❌ ห้ามติดตั้ง clsx, tailwind-merge, cva โดยไม่ได้รับอนุมัติ
- ❌ ห้าม spread `className` prop โดยไม่ sanitize หาก user input เข้ามา (XSS risk)
- ❌ ห้ามใช้ string concatenation แบบ uncontrolled กับ user input
- ✅ ถ้าไม่มี cn() ให้ใช้ lookup object pattern — ปลอดภัยและไม่ต้องการ dependency

## 7. Validation

```bash
npm run lint
npm run build
```

## 8. Example Prompts

```
@workspace อ่าน component-variants-with-cn-utility.md แล้วสร้าง Button component ด้วย lookup object pattern (ไม่ต้อง cn())
```

```
@workspace ขออนุมัติติดตั้ง clsx + tailwind-merge แล้วสร้าง utils/cn.ts ตาม skill
```

## 9. Links

- [class-organization-and-variants.md](./class-organization-and-variants.md)
- [composition-patterns/component-api-design-patterns.md](../composition-patterns/component-api-design-patterns.md)
