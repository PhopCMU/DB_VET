# Codemods and Breaking Changes Checklist

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้หลังจากรัน `npm install next@latest` เพื่อตรวจสอบและแก้ไข breaking changes  
ตรวจสอบว่าโค้ดใน repo นี้ได้รับผลกระทบอะไรบ้าง

## 2. Preconditions

- อยู่ใน upgrade branch แล้ว
- `npm install` เสร็จแล้ว
- ไม่ได้ start dev server ระหว่างแก้ไข

## 3. Inputs

- `FROM_VERSION` — version ที่มาจาก
- `TO_VERSION` — version ที่ upgrade ไป

## 4. Outputs

- โค้ดที่แก้ไขจาก breaking changes

## 5. ขั้นตอน

### ขั้นที่ 1 — รัน Official Codemod

```bash
# รัน codemod อัตโนมัติสำหรับ Next.js upgrade
npx @next/codemod@latest upgrade latest

# หรือระบุ version เฉพาะ
npx @next/codemod@latest upgrade 16
```

### ขั้นที่ 2 — Breaking Changes ที่ต้องตรวจในโค้ด

#### Next.js 15 → 16 (ถ้า upgrade)

```
☐ async params/searchParams — Next.js 15 เปลี่ยน params เป็น Promise แล้ว
   ตรวจไฟล์: app/**/page.tsx, app/**/layout.tsx

☐ cookies() / headers() — เป็น async function แล้ว
   ตรวจไฟล์: app/api/**/route.ts, Server Actions

☐ Turbopack เป็น default — ตรวจว่า devDependencies compatible
```

#### การตรวจสอบใน repo นี้

```bash
# ตรวจหา params ที่ยังไม่ await
grep -r "params\." app/ --include="*.tsx" --include="*.ts"

# ตรวจหา cookies() ที่ยังไม่ await
grep -r "cookies()" app/ --include="*.tsx" --include="*.ts"

# ตรวจหา headers() ที่ยังไม่ await
grep -r "headers()" app/ --include="*.tsx" --include="*.ts"
```

### ขั้นที่ 3 — Pattern ที่ต้องแก้ไข (Next.js 15)

```tsx
// ❌ เก่า (Next.js 14 และก่อนหน้า)
export default function Page({ params }: { params: { id: string } }) {
  const id = params.id;
}

// ✅ ใหม่ (Next.js 15+) — params เป็น Promise
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
}
```

### ขั้นที่ 4 — ตรวจ next.config.ts

```tsx
// ✅ ตรวจสอบว่า config ยังถูกต้องหลัง upgrade
// next.config.ts ของ repo นี้มี:
// - reactStrictMode: false
// - eslint.ignoreDuringBuilds: true
// - typescript.ignoreBuildErrors: true
// - images.remotePatterns
// - headers() — Cache-Control: no-store

// ถ้า Next.js version ใหม่เปลี่ยน config API → ดู migration guide
```

### ขั้นที่ 5 — ตรวจ Dependencies ที่อาจไม่ compatible

```bash
# ตรวจ peer dependency warnings
npm install 2>&1 | grep -i "peer\|warn\|conflict"

# Dependencies ที่ต้องระวัง:
# - eslint-config-next: ต้องตรงกับ next version
# - @types/react, @types/react-dom: ต้องตรงกับ react version
```

**Dependencies สำคัญของ repo นี้:**
```
framer-motion:    ตรวจ compatibility กับ React 19
recharts:         ตรวจ compatibility กับ React 19  
react-modal:      ตรวจ compatibility
react-datepicker: ตรวจ compatibility
```

## 6. Guardrails

- ❌ ห้ามแก้ไข type error ด้วยการเพิ่ม `// @ts-ignore`
- ❌ ห้าม skip codemod โดยเด็ดขาด — อาจมี breaking change ที่ซ่อนอยู่
- ❌ ห้าม update `typescript.ignoreBuildErrors: true` เพื่อหลีกเลี่ยง type error (มีอยู่แล้วใน config แต่ไม่ควรพึ่งพา)
- ✅ แก้ไข breaking changes ทีละ file แล้ว test ทีละ file

## 7. Validation

```bash
npm run lint
npm run build
```

## 8. Example Prompts

```
@workspace อ่าน codemods-and-breaking-changes-checklist.md แล้วตรวจ app/ ว่ามี params ที่ยังไม่ await
```

```
@workspace รัน next codemod สำหรับ upgrade จาก 15 เป็น 16
```

## 9. Links

- [upgrade-playbook.md](./upgrade-playbook.md)
- [rollback-plan-and-verification.md](./rollback-plan-and-verification.md)
