# Loading, Empty, and Error States

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อสร้าง UI ที่ต้องการแสดง state ต่างๆ ของ async operation:
- **Loading** — กำลังโหลดข้อมูล
- **Empty** — ไม่มีข้อมูล
- **Error** — โหลดล้มเหลว

repo นี้มี `components/Loadings/Loading.tsx`, `components/Loadings/SimpleLoading.tsx` อยู่แล้ว

## 2. Preconditions

- React 19 + TypeScript 5
- Tailwind CSS v4
- `components/Loadings/` มีอยู่แล้ว
- ไม่มี Suspense boundary ที่ global level (ตรวจสอบ `app/layout.tsx`)

## 3. Inputs

- `DATA_SOURCE` — ชื่อ hook หรือ fetch function ที่ใช้
- `COMPONENT_FILE` — path ของ component ที่ต้องการเพิ่ม state handling

## 4. Outputs

- Component ที่ handle ทั้ง 3 state อย่างครบถ้วน
- TypeScript types สำหรับ state

## 5. ขั้นตอน

### ขั้นที่ 1 — State Type Pattern

```tsx
// ใช้ discriminated union — ดู typescript-advanced-types/discriminated-unions
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };
```

### ขั้นที่ 2 — Loading State

```tsx
// ✅ ใช้ component ที่มีอยู่แล้ว
import SimpleLoading from "@/components/Loadings/SimpleLoading";

if (state.status === "loading") {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <SimpleLoading />
    </div>
  );
}
```

**Skeleton Loading Pattern (ถ้าต้องการ):**
```tsx
function TableSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="กำลังโหลด">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-10 animate-pulse rounded bg-gray-200"
        />
      ))}
    </div>
  );
}
```

### ขั้นที่ 3 — Empty State

```tsx
function EmptyState({ message = "ไม่มีข้อมูล" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Icon */}
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <span className="material-symbols-outlined text-4xl text-gray-400">
          inbox
        </span>
      </div>
      <p className="text-base font-medium text-gray-900">{message}</p>
      <p className="mt-1 text-sm text-gray-500">ยังไม่มีรายการที่จะแสดง</p>
    </div>
  );
}
```

### ขั้นที่ 4 — Error State

```tsx
function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-6 text-center"
    >
      <p className="font-medium text-red-700">เกิดข้อผิดพลาด</p>
      <p className="mt-1 text-sm text-red-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
        >
          ลองอีกครั้ง
        </button>
      )}
    </div>
  );
}
```

### ขั้นที่ 5 — การใช้รวมกัน

```tsx
export function DataTable({ fetchData }: { fetchData: () => Promise<Item[]> }) {
  const [state, setState] = useState<AsyncState<Item[]>>({ status: "idle" });

  useEffect(() => {
    setState({ status: "loading" });
    fetchData()
      .then((data) => setState({ status: "success", data }))
      .catch((err: Error) =>
        setState({ status: "error", message: err.message })
      );
  }, [fetchData]);

  if (state.status === "loading") return <SimpleLoading />;
  if (state.status === "error") return <ErrorState message={state.message} />;
  if (state.status === "success" && state.data.length === 0) return <EmptyState />;
  if (state.status !== "success") return null;

  return <table>{/* render data */}</table>;
}
```

## 6. Guardrails

- ❌ ห้ามแสดง error message แบบ raw ที่อาจมี stack trace หรือ sensitive data
- ❌ ห้ามใช้ `status: "loading"` เป็นค่า boolean เดียว — ใช้ discriminated union
- ❌ ห้าม flicker ด้วยการ toggle loading เร็วเกินไป — debounce ถ้าจำเป็น
- ✅ Error state ต้องมี `role="alert"` เสมอ
- ✅ Loading state ต้องมี `aria-busy` เพื่อ screen reader

## 7. Validation

```bash
npm run lint
npm run build
```

## 8. Example Prompts

```
@workspace อ่าน loading-empty-error-states.md แล้วเพิ่ม 3 state ใน app/dashboard/page.tsx
```

```
@workspace สร้าง skeleton loading สำหรับ table ใน app/dashboard/360/hr ตาม skill
```

```
@workspace ตรวจว่า components/ReportTable.tsx handle empty และ error state ครบหรือยัง
```

## 9. Links

- [design-tokens-and-theming.md](./design-tokens-and-theming.md)
- [typescript-advanced-types/discriminated-unions-for-ui-states.md](../typescript-advanced-types/discriminated-unions-for-ui-states.md)
- [react-best-practices/state-management-guidelines.md](../react-best-practices/state-management-guidelines.md)
