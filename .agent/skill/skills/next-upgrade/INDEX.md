# Next.js Upgrade Skills — INDEX

## จุดประสงค์

ชุด skill สำหรับอัปเกรด Next.js อย่างปลอดภัยพร้อม rollback plan  
repo นี้ใช้ **Next.js 15** (ตรวจสอบจาก `package.json: "next": "^15.5.9"`)

## Stack ปัจจุบัน

```
next:       ^15.5.9
react:      ^19.0.0
typescript: ^5
tailwind:   ^4
```

## Skills ในหมวดนี้

| ไฟล์ | ใช้เมื่อ |
|---|---|
| [upgrade-playbook.md](./upgrade-playbook.md) | ต้องการ upgrade Next.js เป็น major/minor version ใหม่ |
| [codemods-and-breaking-changes-checklist.md](./codemods-and-breaking-changes-checklist.md) | ตรวจสอบ breaking changes และรัน codemods |
| [rollback-plan-and-verification.md](./rollback-plan-and-verification.md) | rollback เมื่อ upgrade มีปัญหา |

## Skills ที่เกี่ยวข้อง

- [next-best-practices](../next-best-practices/INDEX.md) — ตรวจสอบ pattern หลัง upgrade
- [react-best-practices](../react-best-practices/INDEX.md) — React 19 patterns
