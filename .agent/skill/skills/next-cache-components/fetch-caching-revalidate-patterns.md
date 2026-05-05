# Fetch Caching and Revalidate Patterns

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อต้องการกำหนดวิธี revalidate data ใน Server Components  
อิงตาม pattern ของ repo นี้ที่ใช้ `no-store` เป็น default

## 2. Preconditions

- Next.js 15 App Router + Server Components
- `next.config.ts` มี `Cache-Control: no-store` headers อยู่แล้ว
- ข้อมูลส่วนใหญ่ใน repo นี้ต้องการ real-time

## 3. Inputs

- `API_ENDPOINT` — endpoint ที่ต้องการ configure caching
- `REVALIDATE_SECONDS` — ช่วงเวลา revalidate (ถ้าไม่ใช่ no-store)

## 4. Outputs

- fetch calls ที่มี cache option ที่ถูกต้อง

## 5. ขั้นตอน

### ขั้นที่ 1 — Pattern ที่ใช้บ่อยใน repo นี้

```tsx
// ✅ Real-time data (Dashboard KPI, User permissions)
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/dashboard/kpi`, {
  cache: "no-store",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// ✅ Semi-static data (Employee list, Department list)
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees`, {
  next: { revalidate: 300, tags: ["employees"] }, // 5 นาที
});

// ✅ Force static (config data ที่ไม่เปลี่ยน)
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/config/static`, {
  cache: "force-cache",
});
```

### ขั้นที่ 2 — Error Handling Pattern สำหรับ fetch

```tsx
async function fetchWithHandling<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    cache: "no-store",
    ...options,
  });

  if (!res.ok) {
    // ไม่ throw Error ที่มี sensitive info
    throw new Error(`API error: ${res.status}`);
  }

  return res.json() as Promise<T>;
}
```

### ขั้นที่ 3 — Revalidate on Action

เมื่อ user ทำ action (เช่น บันทึก, ลบ) ให้ revalidate data:

```tsx
// app/actions/employees.ts (Server Action)
"use server";
import { revalidateTag } from "next/cache";

export async function deleteEmployee(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/employees/${id}`,
    { method: "DELETE", cache: "no-store" }
  );

  if (!res.ok) throw new Error("ลบพนักงานไม่สำเร็จ");

  // Revalidate หลัง mutation
  revalidateTag("employees");
}
```

### ขั้นที่ 4 — ไม่ Revalidate เมื่อ axios ทำ Request

**สำคัญ:** axios อยู่ใน Client Component เท่านั้น — ไม่มี Next.js cache integration  
ถ้าต้อง revalidate ให้ใช้ Server Action หรือ Route Handler

```tsx
// ❌ axios ใน Client Component ไม่มี cache tag
await axios.delete(`/api/employees/${id}`);
// → ไม่ trigger revalidateTag — ต้องทำ manual state update

// ✅ ใช้ Server Action แทนถ้าต้องการ revalidate
await deleteEmployee(id); // Server Action — revalidateTag ทำงาน
```

### ขั้นที่ 5 — Parallel Fetching ใน Server Component

```tsx
// ✅ Parallel fetch — เร็วกว่า sequential
export default async function DashboardPage() {
  const [kpi, employees, alerts] = await Promise.all([
    fetchKPI(),
    fetchEmployees(),
    fetchAlerts(),
  ]);

  return (
    <div>
      <KPICards data={kpi} />
      <EmployeeTable data={employees} />
      <AlertList data={alerts} />
    </div>
  );
}
```

## 6. Guardrails

- ❌ ห้ามใส่ token ใน URL — ใส่ใน headers เท่านั้น
- ❌ ห้ามใช้ `force-cache` กับ user-specific data
- ❌ ห้ามลืม error handling ใน fetch
- ❌ ห้าม sequential fetch โดยไม่จำเป็น — ใช้ `Promise.all`
- ✅ ทุก fetch ต้องระบุ `cache` option อย่างชัดเจน

## 7. Validation

```bash
npm run build
```

## 8. Example Prompts

```
@workspace อ่าน fetch-caching-revalidate-patterns.md แล้วเพิ่ม revalidateTag ใน action ลบพนักงาน
```

```
@workspace ปรับ fetch calls ใน app/dashboard/ ให้ใช้ parallel fetching
```

## 9. Links

- [cache-decision-tree.md](./cache-decision-tree.md)
- [client-vs-server-state-boundary.md](./client-vs-server-state-boundary.md)
