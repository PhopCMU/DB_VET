# Rendering Performance and Memoization

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อ:
- Component re-render บ่อยโดยไม่จำเป็น
- List ขนาดใหญ่ (>50 items) render ช้า
- Chart หรือ animation กระตุก

**กฎ: วัดก่อน optimize — ห้าม optimize โดยไม่มีหลักฐาน**

## 2. Preconditions

- React 19 + TypeScript 5
- framer-motion, recharts ติดตั้งแล้ว
- `reactStrictMode: false` — ไม่มี double-invocation ใน dev

## 3. Inputs

- `COMPONENT_FILE` — path ของ component ที่มีปัญหา performance

## 4. Outputs

- Component ที่ render น้อยลงโดยไม่กระทบ correctness

## 5. ขั้นตอน

### ขั้นที่ 1 — วัด Performance ก่อน

```
วิธีวัด:
1. เปิด React DevTools Profiler
2. Record ขณะ interact กับ component
3. ดู component ไหนที่ render บ่อยและนาน
4. ดู "Why did this render?" ใน DevTools
```

### ขั้นที่ 2 — React.memo (สำหรับ Component)

```tsx
// ✅ ใช้ React.memo เฉพาะ component ที่:
// - re-render บ่อยโดยไม่จำเป็น (วัดแล้ว)
// - props ไม่เปลี่ยนบ่อย

const EmployeeRow = React.memo(function EmployeeRow({
  employee,
  onDelete,
}: {
  employee: Employee;
  onDelete: (id: string) => void;
}) {
  return (
    <tr>
      <td>{employee.name}</td>
      <td>
        <button onClick={() => onDelete(employee.id)}>ลบ</button>
      </td>
    </tr>
  );
});

// ❌ ผิด — ห่อทุก component ด้วย memo โดยไม่วัด
const SimpleLabel = React.memo(({ text }: { text: string }) => (
  <span>{text}</span>
)); // ไม่จำเป็น
```

### ขั้นที่ 3 — useCallback (สำหรับ Function)

```tsx
// ✅ ใช้ useCallback เมื่อ function ส่งเป็น prop ให้ memoized component
function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  // stable reference — ป้องกัน React.memo ทำงานเปล่า
  const handleDelete = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  }, []); // [] เพราะใช้ functional update

  return employees.map((emp) => (
    <EmployeeRow key={emp.id} employee={emp} onDelete={handleDelete} />
  ));
}
```

### ขั้นที่ 4 — useMemo (สำหรับ Computation)

```tsx
// ✅ ใช้ useMemo สำหรับ computation ที่หนักและเรียกบ่อย
const chartData = useMemo(
  () =>
    employees.reduce<ChartData[]>((acc, emp) => {
      // expensive aggregation
      const dept = acc.find((d) => d.name === emp.department);
      if (dept) dept.count++;
      else acc.push({ name: emp.department, count: 1 });
      return acc;
    }, []),
  [employees]
);

// ❌ ผิด — useMemo สำหรับ operation ง่ายๆ
const count = useMemo(() => employees.length, [employees]); // ไม่จำเป็น
```

### ขั้นที่ 5 — Key Prop สำหรับ List

```tsx
// ✅ ถูกต้อง — ใช้ unique, stable key
{employees.map((emp) => (
  <EmployeeRow key={emp.id} employee={emp} />
))}

// ❌ ผิด — ใช้ index เป็น key (เมื่อ list มีการเพิ่ม/ลบ/เรียงลำดับ)
{employees.map((emp, index) => (
  <EmployeeRow key={index} employee={emp} /> // Re-mounts ทุกครั้ง
))}
```

### ขั้นที่ 6 — Stable Object/Array Reference

```tsx
// ❌ ผิด — object ใหม่ทุก render → ทำให้ useMemo/useEffect fire ทุกครั้ง
function Parent() {
  return <Child config={{ timeout: 3000 }} />; // object ใหม่ทุก render
}

// ✅ ถูกต้อง — ย้าย constant ออกนอก component หรือใช้ useMemo
const DEFAULT_CONFIG = { timeout: 3000 }; // ไว้ข้างนอก

function Parent() {
  return <Child config={DEFAULT_CONFIG} />;
}
```

### ขั้นที่ 7 — Framer Motion Performance

```tsx
// ✅ ใช้ transform properties แทน layout properties
// ✅ (position, scale, rotate ใช้ GPU)
<motion.div
  animate={{ x: isOpen ? 0 : -100 }}  // ✅ transform — ไม่ trigger reflow
  // animate={{ left: isOpen ? 0 : -100 }}  // ❌ layout property — trigger reflow
/>

// ✅ ใช้ layout prop แทน animate ขนาด
<motion.div layout>  // ✅ Next.js optimized layout animation
```

## 6. Guardrails

- ❌ ห้าม wrap ทุก component ด้วย `React.memo` — วัดก่อน
- ❌ ห้าม `useMemo` สำหรับ primitive values หรือ operation ง่ายๆ
- ❌ ห้าม optimize โดยไม่มีหลักฐานว่าเป็นปัญหา
- ✅ Memoize callback ที่ส่งลง memoized component เสมอ

## 7. Validation

```bash
npm run lint
npm run build
```

ตรวจด้วย React DevTools Profiler: render count ต้องลดลง

## 8. Example Prompts

```
@workspace อ่าน rendering-performance-memoization.md แล้วตรวจสอบว่า components/ReportTable.tsx มี unnecessary re-renders
```

```
@workspace ปรับ components/PieChart.tsx ให้ใช้ React.memo ตาม skill
```

```
@workspace ตรวจว่า recharts components ใน app/dashboard/ ใช้ dynamic import ถูกต้อง
```

## 9. Links

- [hooks-rules-and-deps.md](./hooks-rules-and-deps.md)
- [next-best-practices/performance-checklist.md](../next-best-practices/performance-checklist.md)
