# TypeScript Advanced Types Skills — INDEX

## จุดประสงค์

ชุด skill สำหรับใช้ TypeScript type system อย่างมีประสิทธิภาพ  
อิงตาม TypeScript 5 strict mode ของ repo นี้

## Stack Reference

```
typescript:  ^5 (strict mode)
ห้ามใช้ any โดยไม่มีเหตุผล
model/ directory มี TypeScript types: authModel.ts, projectModel.ts, roleModel.ts, ...
routers/ directory มี service layer: getService.tsx, postService.tsx, ...
```

## Skills ในหมวดนี้

| ไฟล์ | ใช้เมื่อ |
|---|---|
| [discriminated-unions-for-ui-states.md](./discriminated-unions-for-ui-states.md) | Model UI states (loading/error/success) |
| [utility-types-and-type-guards.md](./utility-types-and-type-guards.md) | Transform types และ runtime checks |
| [typed-api-contracts.md](./typed-api-contracts.md) | Type API requests/responses ใน model/ และ routers/ |

## Skills ที่เกี่ยวข้อง

- [composition-patterns/component-api-design-patterns.md](../composition-patterns/component-api-design-patterns.md)
- [react-best-practices/state-management-guidelines.md](../react-best-practices/state-management-guidelines.md)
