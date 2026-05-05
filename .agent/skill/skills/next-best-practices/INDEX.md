# Next.js Best Practices Skills — INDEX

## จุดประสงค์

ชุด skill สำหรับใช้ Next.js 15 App Router อย่างถูกต้องและมีประสิทธิภาพ  
อิงตาม App Router (`app/` directory) ของ repo นี้

## Skills ในหมวดนี้

| ไฟล์ | ใช้เมื่อ |
|---|---|
| [routing-layouts-and-metadata.md](./routing-layouts-and-metadata.md) | กำหนด route, layout, metadata ใน App Router |
| [data-fetching-and-rsc-boundaries.md](./data-fetching-and-rsc-boundaries.md) | ตัดสินใจว่า component ไหนควรเป็น Server/Client |
| [performance-checklist.md](./performance-checklist.md) | ตรวจสอบ performance ก่อน deploy |

## Stack Reference

- Next.js 15 — App Router (`app/` directory)
- React 19 — Server Components เป็น default
- `"use client"` ต้องระบุชัดเจนสำหรับ interactive component

## Skills ที่เกี่ยวข้อง

- [next-cache-components](../next-cache-components/INDEX.md) — caching strategy
- [react-best-practices](../react-best-practices/INDEX.md) — React patterns
