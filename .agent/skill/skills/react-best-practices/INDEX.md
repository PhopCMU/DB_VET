# React Best Practices Skills — INDEX

## จุดประสงค์

ชุด skill สำหรับเขียน React component ที่มีประสิทธิภาพ, maintainable, และ bug-free  
อิงตาม React 19 + TypeScript 5 ใน repo นี้

## Stack Reference

- React 19 (ไม่มี `reactStrictMode` — ปิดไว้ใน next.config.ts)
- Zustand v5 สำหรับ global state
- framer-motion สำหรับ animation
- ไม่มี test framework

## Skills ในหมวดนี้

| ไฟล์ | ใช้เมื่อ |
|---|---|
| [hooks-rules-and-deps.md](./hooks-rules-and-deps.md) | เขียน custom hooks หรือ fix hook dependency issues |
| [state-management-guidelines.md](./state-management-guidelines.md) | เลือก tool สำหรับ manage state |
| [rendering-performance-memoization.md](./rendering-performance-memoization.md) | ป้องกัน unnecessary re-renders |

## Skills ที่เกี่ยวข้อง

- [composition-patterns/context-provider-boundaries.md](../composition-patterns/context-provider-boundaries.md)
- [next-cache-components/client-vs-server-state-boundary.md](../next-cache-components/client-vs-server-state-boundary.md)
