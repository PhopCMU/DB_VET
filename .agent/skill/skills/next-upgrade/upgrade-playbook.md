# Upgrade Playbook

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อต้องการ upgrade Next.js เป็น version ใหม่  
**ทำ upgrade บน branch แยก เสมอ — ห้าม upgrade บน main/production branch โดยตรง**

## 2. Preconditions

- Git repository มี working tree clean
- `npm run build` ผ่านก่อน upgrade
- มี rollback plan (ดู [rollback-plan-and-verification.md](./rollback-plan-and-verification.md))

## 3. Inputs

- `CURRENT_VERSION` — version ปัจจุบัน (เช่น `15.5.9`)
- `TARGET_VERSION` — version ที่ต้องการ upgrade ไป

## 4. Outputs

- `package.json` ที่ update dependencies
- โค้ดที่แก้ไขจาก breaking changes

## 5. ขั้นตอน

### ขั้นที่ 1 — เตรียมก่อน Upgrade

```bash
# 1. ตรวจสอบ git status ต้อง clean
git status

# 2. สร้าง upgrade branch
git checkout -b upgrade/next-{TARGET_VERSION}

# 3. Build ปัจจุบันต้องผ่าน
npm run build

# 4. บันทึก version ปัจจุบัน
node -e "const p = require('./package.json'); console.log('next:', p.dependencies.next)"
```

### ขั้นที่ 2 — ตรวจสอบ Release Notes

ก่อน upgrade เสมอ:
1. อ่าน [Next.js CHANGELOG](https://github.com/vercel/next.js/releases)
2. ตรวจหา breaking changes ที่เกี่ยวกับ:
   - App Router API
   - `params` / `searchParams` type changes
   - Turbopack changes
   - Image optimization changes

### ขั้นที่ 3 — Upgrade Dependencies

```bash
# Upgrade Next.js และ peer dependencies
npm install next@latest react@latest react-dom@latest

# Upgrade TypeScript types
npm install --save-dev @types/react@latest @types/react-dom@latest

# ตรวจสอบ peer dependency conflicts
npm install
```

### ขั้นที่ 4 — รัน Official Codemods

```bash
# รัน codemod อัตโนมัติ (ดู codemods-and-breaking-changes-checklist.md)
npx @next/codemod@latest upgrade latest
```

### ขั้นที่ 5 — ทดสอบ Build

```bash
# ตรวจ lint
npm run lint

# ทดสอบ build
npm run build

# ทดสอบ development server
npm run dev
# เปิด http://localhost:4040 ทดสอบทุกหน้าหลัก
```

### ขั้นที่ 6 — Checklist ทดสอบ Manual

```
☐ หน้า Login (/auth) ทำงานได้
☐ Dashboard (/dashboard) โหลดข้อมูลได้
☐ Modal เปิด/ปิดได้
☐ Sidebar navigation ทำงานได้
☐ ฟีเจอร์ export (PDF, Excel) ทำงานได้
☐ QR Code generation ทำงานได้
☐ Chart (recharts) render ได้
☐ SSE (usePaymentSSE) ทำงานได้
```

## 6. Guardrails

- ❌ ห้าม upgrade ใน production environment โดยตรง
- ❌ ห้าม upgrade หลาย major version พร้อมกัน
- ❌ ห้าม skip การอ่าน release notes
- ❌ ห้าม upgrade โดยไม่มี working backup (git branch หรือ tag)
- ✅ ทดสอบบน `npm run dev` ก่อน build เสมอ

## 7. Validation

```bash
npm run lint
npm run build
# ดู build output: ทุก page ต้อง compiled สำเร็จ
```

## 8. Example Prompts

```
@workspace อ่าน upgrade-playbook.md แล้วช่วย upgrade Next.js 15 เป็น version ล่าสุด
```

```
@workspace สร้าง upgrade branch และทำตาม upgrade-playbook สำหรับ next@latest
```

## 9. Links

- [codemods-and-breaking-changes-checklist.md](./codemods-and-breaking-changes-checklist.md)
- [rollback-plan-and-verification.md](./rollback-plan-and-verification.md)
