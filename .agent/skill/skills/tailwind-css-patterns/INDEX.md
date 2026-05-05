# Tailwind CSS Patterns Skills — INDEX

## จุดประสงค์

ชุด skill สำหรับใช้ Tailwind CSS v4 อย่างถูกต้องและ consistent ใน repo นี้

## Stack Reference

```
tailwindcss: ^4
@tailwindcss/postcss: ^4
syntax: @import "tailwindcss" (ใน app/globals.css)
ไม่มี tailwind.config.js — ใช้ CSS-first config ผ่าน @theme
ไม่มี cn() utility (ไม่มี clsx/tailwind-merge)
```

## Skills ในหมวดนี้

| ไฟล์ | ใช้เมื่อ |
|---|---|
| [class-organization-and-variants.md](./class-organization-and-variants.md) | จัดระเบียบ className ที่ยาวหรือซับซ้อน |
| [responsive-and-dark-mode-patterns.md](./responsive-and-dark-mode-patterns.md) | สร้าง responsive layout และ dark mode |
| [component-variants-with-cn-utility.md](./component-variants-with-cn-utility.md) | จัดการ variants (TODO: ไม่มี cn() ใน repo) |

## Skills ที่เกี่ยวข้อง

- [frontend-design/design-tokens-and-theming.md](../frontend-design/design-tokens-and-theming.md) — @theme tokens
- [composition-patterns/component-api-design-patterns.md](../composition-patterns/component-api-design-patterns.md)
