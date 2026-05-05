# Client vs Server State Boundary

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อต้องตัดสินใจว่า state ไหนควรอยู่ที่ server และ state ไหนควรอยู่ที่ client  
ช่วยลด over-fetching และป้องกัน hydration mismatch

## 2. Preconditions

- Next.js 15 App Router (Server Components เป็น default)
- Zustand v5 (`store/menuStore.tsx` มีอยู่แล้ว) — client-side state
- `app/context/` มี UserContext, UsePermission อยู่แล้ว

## 3. Inputs

- `STATE_DESCRIPTION` — คำอธิบาย state ที่ต้องการจัดการ

## 4. Outputs

- คำแนะนำและโค้ดตัวอย่างสำหรับ state management ที่เหมาะสม

## 5. ขั้นตอน

### ขั้นที่ 1 — ประเภท State และที่อยู่ที่เหมาะสม

```
SERVER STATE (ไม่ต้องการ client JavaScript):
  ✅ ข้อมูลจาก API ที่ไม่ interactive (read-only display)
  ✅ Metadata, page config
  ✅ Initial data สำหรับ render ครั้งแรก

CLIENT STATE (ต้องการ JavaScript / browser):
  ✅ UI state (isOpen, activeTab, selectedItem)
  ✅ Form state
  ✅ User interactions
  ✅ Real-time updates (SSE, WebSocket)
  ✅ Authentication state (UserContext)
  ✅ Menu state (Zustand menuStore)
```

### ขั้นที่ 2 — Hydration-safe Pattern

```tsx
// ✅ ถูกต้อง — ป้องกัน hydration mismatch
"use client";
import { useState, useEffect } from "react";

function UserGreeting() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    // ดึงข้อมูลจาก localStorage หลัง hydration เสร็จ
    setName(localStorage.getItem("userName"));
  }, []);

  // Render null หรือ placeholder จนกว่า hydration จะเสร็จ
  if (!name) return <span>สวัสดี</span>;
  return <span>สวัสดี {name}</span>;
}

// ❌ ผิด — เข้าถึง localStorage โดยตรงระหว่าง render (hydration mismatch)
function BadComponent() {
  const name = localStorage.getItem("userName"); // Error on server
  return <span>สวัสดี {name}</span>;
}
```

### ขั้นที่ 3 — Pattern: SSE / Real-time (hooks/usePaymentSSE.tsx)

```tsx
// hooks/usePaymentSSE.tsx — มีอยู่แล้ว
// Pattern: EventSource ใน Client Component

"use client";
import { useEffect, useState } from "react";

export function useSSE<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource(url);

    es.onopen = () => setIsConnected(true);
    es.onmessage = (e) => {
      try {
        setData(JSON.parse(e.data) as T);
      } catch {
        // ไม่ log sensitive data
      }
    };
    es.onerror = () => {
      setIsConnected(false);
      es.close();
    };

    return () => es.close(); // cleanup สำคัญมาก
  }, [url]);

  return { data, isConnected };
}
```

### ขั้นที่ 4 — URL State (แทน useState สำหรับ filter/sort)

```tsx
// ✅ ใช้ URL searchParams สำหรับ shareable state
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function FilterBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select onChange={(e) => setFilter("department", e.target.value)}>
      {/* options */}
    </select>
  );
}
```

### ขั้นที่ 5 — ตาราง Summary

| State | Tool | Location |
|---|---|---|
| User session | UserContext | `app/context/UserContext.tsx` |
| Permission | UsePermission | `app/context/UsePermission.tsx` |
| Menu open/close | Zustand | `store/menuStore.tsx` |
| UI toggle state | useState | ใน component |
| Filter/sort | URL searchParams | URL |
| Real-time feed | SSE hook | `hooks/` |
| Server data (read-only) | RSC fetch | Server Component |

## 6. Guardrails

- ❌ ห้าม store token/session ใน Zustand หรือ localStorage ในรูป plain text
- ❌ ห้ามเข้าถึง `window`, `localStorage`, `document` ใน Server Component
- ❌ ห้าม serialize function ลง URL state
- ✅ ตรวจสอบ `"use client"` ทุก component ที่ใช้ Zustand หรือ useContext

## 7. Validation

```bash
npm run lint
npm run build
```

ตรวจ hydration errors: เปิด browser console ดู `Hydration failed` warnings

## 8. Example Prompts

```
@workspace อ่าน client-vs-server-state-boundary.md แล้วบอกว่า state ใน components/Header.tsx ควรอยู่ที่ไหน
```

```
@workspace ปรับ filter state ใน app/dashboard/page.tsx ให้ใช้ URL searchParams
```

## 9. Links

- [cache-decision-tree.md](./cache-decision-tree.md)
- [react-best-practices/state-management-guidelines.md](../react-best-practices/state-management-guidelines.md)
- [composition-patterns/context-provider-boundaries.md](../composition-patterns/context-provider-boundaries.md)
