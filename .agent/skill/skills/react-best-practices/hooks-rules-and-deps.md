# Hooks Rules and Dependencies

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อ:
- เขียน custom hook ใหม่
- แก้ไข stale closure หรือ infinite loop
- ตรวจสอบ `useEffect` dependency array

## 2. Preconditions

- React 19 + TypeScript 5
- `reactStrictMode: false` (ปิดไว้ใน `next.config.ts`) — useEffect runs ครั้งเดียว
- ESLint + `eslint-config-next` มีอยู่แล้ว (มี hooks lint rules)

## 3. Inputs

- `HOOK_FILE` — path ของ hook ที่ต้องการตรวจ/แก้ไข

## 4. Outputs

- Hook ที่มี dependency array ถูกต้อง
- Custom hook ที่ follows React Rules of Hooks

## 5. ขั้นตอน

### ขั้นที่ 1 — Rules of Hooks (ห้ามละเมิด)

```
✅ กฎที่ 1: เรียก hooks ที่ระดับ top-level เท่านั้น
  — ห้ามเรียกใน conditions, loops, nested functions

✅ กฎที่ 2: เรียก hooks เฉพาะใน React functions
  — ใน function component หรือ custom hook เท่านั้น
  — custom hook ต้องขึ้นต้นด้วย "use"
```

### ขั้นที่ 2 — useEffect Dependency Array

```tsx
// ❌ ผิด — missing dependency
useEffect(() => {
  fetchData(userId); // userId ไม่อยู่ใน deps
}, []); // ESLint จะแจ้ง warning

// ✅ ถูกต้อง — ใส่ dependency ครบ
useEffect(() => {
  fetchData(userId);
}, [userId, fetchData]);

// ✅ ถูกต้อง — รัน once เมื่อ mount (intentional)
useEffect(() => {
  initializeApp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // comment อธิบายว่าทำไมถึง ignore
```

### ขั้นที่ 3 — Stale Closure Pattern

```tsx
// ❌ ผิด — stale closure: count จะเป็น 0 เสมอ
const [count, setCount] = useState(0);
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1); // stale!
  }, 1000);
  return () => clearInterval(timer);
}, []);

// ✅ ถูกต้อง — ใช้ functional update
useEffect(() => {
  const timer = setInterval(() => {
    setCount((prev) => prev + 1); // ใช้ prev state
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

### ขั้นที่ 4 — Custom Hook Pattern

ดูตัวอย่างจาก repo: `hooks/usePaymentSSE.tsx`, `hooks/useSocket.tsx`

```tsx
// ✅ Custom hook pattern ที่ถูกต้อง
function useEmployeeData(departmentId: string) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ stable reference ด้วย useCallback
  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEmployeesByDepartment(departmentId);
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  }, [departmentId]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return { employees, isLoading, error, refetch: fetchEmployees };
}
```

### ขั้นที่ 5 — useRef สำหรับ Mutable Values ที่ไม่ต้อง Re-render

```tsx
// ✅ ใช้ useRef สำหรับ value ที่เปลี่ยนได้แต่ไม่ต้องการ re-render
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
const prevValueRef = useRef<string>("");

// ✅ ใช้ useRef สำหรับ DOM element
const inputRef = useRef<HTMLInputElement>(null);
```

### ขั้นที่ 6 — Cleanup ใน useEffect

```tsx
// ✅ เสมอ cleanup side effects
useEffect(() => {
  const controller = new AbortController();

  fetch(url, { signal: controller.signal })
    .then(/* ... */);

  return () => controller.abort(); // cleanup

  // SSE cleanup
  const es = new EventSource(url);
  return () => es.close();

  // Timer cleanup
  const timer = setTimeout(() => {}, 1000);
  return () => clearTimeout(timer);
}, [url]);
```

## 6. Guardrails

- ❌ ห้ามเรียก hook ใน condition (`if`, `switch`, ternary)
- ❌ ห้าม `useEffect` ที่ไม่มี cleanup สำหรับ subscription/timer/fetch
- ❌ ห้าม mutate state โดยตรง — `array.push(item)` แทนที่จะเป็น `[...array, item]`
- ❌ ห้ามใช้ `object` หรือ `array` ที่สร้างใหม่ทุก render เป็น dependency
- ✅ ใช้ `useCallback` สำหรับ function ที่ส่งเป็น props หรือ dependency

## 7. Validation

```bash
npm run lint
# ESLint จะแจ้ง react-hooks/exhaustive-deps warnings
```

## 8. Example Prompts

```
@workspace อ่าน hooks-rules-and-deps.md แล้วตรวจสอบ hooks/usePaymentSSE.tsx
```

```
@workspace แก้ไข useEffect dependency array ใน components/ReportTable.tsx ตาม skill
```

```
@workspace สร้าง custom hook useEmployeeList ตาม pattern ใน hooks-rules-and-deps.md
```

## 9. Links

- [state-management-guidelines.md](./state-management-guidelines.md)
- [rendering-performance-memoization.md](./rendering-performance-memoization.md)
- [next-cache-components/client-vs-server-state-boundary.md](../next-cache-components/client-vs-server-state-boundary.md)
