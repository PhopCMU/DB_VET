# Cache Decision Tree

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อต้องตัดสินใจว่าควรแคช response หรือไม่  
อิงตาม `next.config.ts` ที่ตั้ง `Cache-Control: no-store, no-cache` ทุก path โดย default

## 2. Preconditions

- Next.js 15 App Router
- `next.config.ts` มี `headers()` ที่ตั้ง `Cache-Control: no-store` ไว้แล้ว
- ระบบนี้เป็น dashboard ที่ต้องการข้อมูล real-time เป็นหลัก

## 3. Inputs

- `DATA_TYPE` — ประเภทข้อมูล: `real-time` | `semi-static` | `static`
- `UPDATE_FREQUENCY` — ความถี่ที่ข้อมูลเปลี่ยน

## 4. Outputs

- คำแนะนำว่าควรใช้ cache strategy ไหน

## 5. ขั้นตอน

### ขั้นที่ 1 — Decision Tree

```
ข้อมูลเปลี่ยนทุก request (user-specific, real-time)?
  ├── ใช่ → cache: "no-store" (default ของ repo นี้)
  └── ไม่ใช่
        ├── เปลี่ยนทุกไม่กี่นาที/ชั่วโมง?
        │     ├── ใช่ → revalidate: N (seconds)
        │     └── ไม่ใช่
        │           ├── เปลี่ยนเฉพาะเมื่อ deploy?
        │           │     ├── ใช่ → cache: "force-cache" (static)
        │           │     └── ไม่ใช่ → revalidatePath/revalidateTag (on-demand)
```

### ขั้นที่ 2 — ประเภทข้อมูลใน repo นี้

| ข้อมูล | Strategy | เหตุผล |
|---|---|---|
| Dashboard KPI | `no-store` | Real-time, user-specific |
| Employee list | `revalidate: 300` | เปลี่ยนไม่บ่อย |
| Menu/permissions | `no-store` | User-specific, ต้องใหม่เสมอ |
| Static assets | CDN cache | `next.config.ts` จัดการให้ |
| QR Code | `no-store` | Dynamic, unique per session |

### ขั้นที่ 3 — Cache ใน fetch()

```tsx
// Real-time data — ไม่แคช (สอดคล้องกับ next.config.ts)
const data = await fetch(url, { cache: "no-store" });

// Semi-static — แคช 5 นาที
const data = await fetch(url, { next: { revalidate: 300 } });

// Static — แคชตลอด (ไม่เหมาะกับ dashboard นี้ส่วนใหญ่)
const data = await fetch(url, { cache: "force-cache" });
```

### ขั้นที่ 4 — On-demand Revalidation

```tsx
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { path, tag } = await request.json();

  if (path) revalidatePath(path);
  if (tag) revalidateTag(tag);

  return NextResponse.json({ revalidated: true });
}
```

### ขั้นที่ 5 — สรุป: นโยบาย cache ของ repo นี้

```
default:          no-store (ตาม next.config.ts headers)
image cache:      60 วินาที (minimumCacheTTL: 60)
fetch (RSC):      ระบุ cache option ทุกครั้ง อย่าพึ่ง default
client fetch:     ไม่มี HTTP cache — จัดการด้วย state
```

## 6. Guardrails

- ❌ ห้ามใช้ `force-cache` กับข้อมูลที่เปลี่ยนตาม user หรือ session
- ❌ ห้าม override `Cache-Control` header ที่ `next.config.ts` กำหนดไว้โดยไม่มีเหตุผล
- ❌ ห้ามแคช response ที่มี sensitive data (token, PII)
- ✅ ทุก Server Component fetch ต้องระบุ cache option อย่างชัดเจน

## 7. Validation

```bash
npm run build
# ตรวจ build output ว่า page ไหนถูก static render (○) vs dynamic (λ)
```

## 8. Example Prompts

```
@workspace อ่าน cache-decision-tree.md แล้วบอกว่า app/dashboard/page.tsx ควรใช้ cache strategy ไหน
```

```
@workspace ตรวจสอบ fetch calls ใน app/dashboard/ ว่าระบุ cache option ครบหรือยัง
```

## 9. Links

- [fetch-caching-revalidate-patterns.md](./fetch-caching-revalidate-patterns.md)
- [client-vs-server-state-boundary.md](./client-vs-server-state-boundary.md)
- [next-best-practices/data-fetching-and-rsc-boundaries.md](../next-best-practices/data-fetching-and-rsc-boundaries.md)
