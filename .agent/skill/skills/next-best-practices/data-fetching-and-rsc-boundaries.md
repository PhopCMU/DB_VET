# Data Fetching and RSC Boundaries

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อต้องตัดสินใจว่า component ไหนควรเป็น **Server Component (RSC)** หรือ **Client Component**  
และวิธี fetch data ที่ถูกต้องสำหรับ Next.js 15 App Router

## 2. Preconditions

- Next.js 15 App Router
- React 19 (Server Components เป็น default)
- axios ติดตั้งแล้ว — แต่ใช้ได้เฉพาะใน Client Component หรือ Route Handler
- `routers/` directory มีอยู่แล้ว (API service layer)

## 3. Inputs

- `COMPONENT_FILE` — path ของ component ที่ต้องการตรวจสอบ
- `DATA_REQUIREMENT` — ต้องการ data จาก API ไหน

## 4. Outputs

- Component ที่ใช้ Server/Client boundary ถูกต้อง
- Data fetching pattern ที่เหมาะสม

## 5. ขั้นตอน

### ขั้นที่ 1 — ตัดสินใจ Server vs Client Component

```
ใช้ Server Component เมื่อ:
☐ Component แสดงผลข้อมูลที่ไม่ interactive
☐ ต้องการ SEO (content ใน HTML)
☐ ต้องการ fetch ข้อมูลจาก server โดยตรง
☐ ไม่ใช้ useState, useEffect, browser API

ใช้ Client Component ("use client") เมื่อ:
☐ ใช้ useState, useEffect, useContext
☐ ใช้ event handlers (onClick, onChange, ...)
☐ ใช้ browser API (localStorage, window, ...)
☐ ใช้ framer-motion, recharts, หรือ library ที่ต้องการ browser
☐ ใช้ Zustand (useMenuStore, ...)
☐ ใช้ axios (ต้อง run ใน browser หรือ Route Handler)
```

### ขั้นที่ 2 — Data Fetching ใน Server Component

```tsx
// app/dashboard/reports/page.tsx — Server Component
// ดึงข้อมูลจาก external API โดยตรง
async function getReports() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports`, {
    cache: "no-store", // ไม่แคช — ข้อมูล real-time
  });
  if (!res.ok) throw new Error("ดึงข้อมูลรายงานไม่สำเร็จ");
  return res.json();
}

export default async function ReportsPage() {
  const reports = await getReports();
  return <ReportTable data={reports} />;
}
```

### ขั้นที่ 3 — Data Fetching ใน Client Component (axios)

```tsx
// components/ReportTable.tsx — Client Component
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export function ReportTable() {
  const [data, setData] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get<Report[]>("/api/reports", { signal: controller.signal })
      .then((res) => setData(res.data))
      .catch((err) => {
        if (!axios.isCancel(err)) {
          setError("ดึงข้อมูลไม่สำเร็จ กรุณาลองใหม่");
        }
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort(); // cleanup เมื่อ unmount
  }, []);

  // ... render states
}
```

### ขั้นที่ 4 — RSC Boundary Pattern (ส่ง data ลง Client Component)

```tsx
// ✅ ถูกต้อง — Server Component fetch แล้วส่ง props ลง Client
// app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  const summary = await getSummaryData();
  return <DashboardChart data={summary} />; // Client Component รับ props
}

// components/DashboardChart.tsx (Client Component)
"use client";
export function DashboardChart({ data }: { data: SummaryData }) {
  // ใช้ recharts ซึ่งต้องการ browser
  return <PieChart data={data} />;
}
```

### ขั้นที่ 5 — Route Handler (API ใน Next.js)

```tsx
// app/api/reports/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // ดึงข้อมูลจาก external API หรือ database
    const data = await fetchFromExternalAPI();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "ดึงข้อมูลไม่สำเร็จ" },
      { status: 500 }
    );
  }
}
```

## 6. Guardrails

- ❌ ห้ามใช้ axios ใน Server Component — ใช้ native `fetch()` แทน
- ❌ ห้าม `console.log` ข้อมูลที่เป็น sensitive ใน server-side code
- ❌ ห้าม hardcode API URL — ใช้ `process.env.NEXT_PUBLIC_API_URL`
- ❌ ห้ามลืม AbortController ใน useEffect ที่มี axios
- ✅ ตรวจสอบ `reactStrictMode: false` ใน `next.config.ts` (มีอยู่แล้ว) — useEffect จะ run ครั้งเดียว

## 7. Validation

```bash
npm run lint
npm run build
```

ตรวจด้วยตนเอง: เปิด Network tab ใน DevTools ดูว่า request ไม่ถูก double-call

## 8. Example Prompts

```
@workspace อ่าน data-fetching-and-rsc-boundaries.md แล้วบอกว่า components/ReportTable.tsx ควรเป็น Server หรือ Client Component
```

```
@workspace ปรับ app/dashboard/page.tsx ให้ fetch ข้อมูลใน Server Component แล้วส่งเป็น props
```

```
@workspace สร้าง Route Handler ใน app/api/employees/route.ts สำหรับ GET employees
```

## 9. Links

- [routing-layouts-and-metadata.md](./routing-layouts-and-metadata.md)
- [next-cache-components/client-vs-server-state-boundary.md](../next-cache-components/client-vs-server-state-boundary.md)
- [react-best-practices/hooks-rules-and-deps.md](../react-best-practices/hooks-rules-and-deps.md)
