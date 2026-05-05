# Performance Checklist

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้ก่อน deploy feature ใหม่หรือเมื่อ page load ช้าผิดปกติ  
ครอบคลุม: bundle size, image optimization, re-render, font loading

## 2. Preconditions

- Next.js 15 App Router
- Tailwind CSS v4
- framer-motion, recharts ติดตั้งแล้ว (heavy libraries)
- `npm run build` ต้องผ่านก่อน

## 3. Inputs

- `TARGET_PAGE` — path ของ page ที่ต้องการ optimize (เช่น `app/dashboard/page.tsx`)

## 4. Outputs

- รายการปัญหาพร้อม priority (High/Medium/Low)
- โค้ดที่แก้ไขแล้ว

## 5. ขั้นตอน

### ขั้นที่ 1 — Bundle Analysis

```bash
# ตรวจ build output
npm run build

# ดู bundle size จาก .next/analyze/ (ถ้าติดตั้ง @next/bundle-analyzer)
# TODO: พิจารณาติดตั้ง @next/bundle-analyzer ถ้าต้องการ analyze bundle
```

**สัญญาณปัญหา bundle:**
```
☐ Page First Load JS > 200 kB → ต้องการ code splitting
☐ Shared JS > 100 kB → ตรวจ imports ที่ไม่จำเป็น
```

### ขั้นที่ 2 — Dynamic Import สำหรับ Heavy Libraries

```tsx
// ✅ ถูกต้อง — framer-motion และ recharts โหลดเฉพาะเมื่อต้องการ
import dynamic from "next/dynamic";

const PieChart = dynamic(
  () => import("@/components/PieChart").then((mod) => mod.PieChart),
  {
    loading: () => <SimpleLoading />,
    ssr: false, // recharts ต้องการ browser
  }
);

const MotionDiv = dynamic(
  () => import("framer-motion").then((mod) => mod.motion.div),
  { ssr: false }
);
```

### ขั้นที่ 3 — Image Optimization

```tsx
// ✅ ถูกต้อง — ใช้ next/image
import Image from "next/image";

<Image
  src="/assets/images/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority={true}  // สำหรับ LCP image
/>

// ❌ ผิด — ใช้ <img> โดยตรง (ไม่มี optimization)
<img src="/assets/images/logo.png" alt="Logo" />
```

**next.config.ts มี remote patterns กำหนดไว้แล้ว** สำหรับ `vmapi.vet.cmu.ac.th`

### ขั้นที่ 4 — Font Loading

```tsx
// app/layout.tsx — ใช้ next/font/local (มีอยู่แล้ว)
// ✅ ถูกต้อง — NotoSansThai โหลดด้วย next/font/local พร้อม display: "swap"
// ตรวจสอบว่าไม่มีการ import font จาก Google Fonts โดยตรง (เพิ่ม latency)
```

### ขั้นที่ 5 — ป้องกัน Re-render ที่ไม่จำเป็น

```tsx
// ✅ Memoize expensive component
const MemoizedChart = React.memo(PieChart);

// ✅ Stable callback reference
const handleClick = useCallback(() => {
  // ...
}, [dependency]);

// ✅ Memoize expensive computation
const processedData = useMemo(
  () => data.filter((item) => item.isActive),
  [data]
);
```

ดูรายละเอียดเพิ่มเติมใน [react-best-practices/rendering-performance-memoization.md](../react-best-practices/rendering-performance-memoization.md)

### ขั้นที่ 6 — Checklist สรุป

```
Priority HIGH:
☐ Heavy components (recharts, framer-motion) ใช้ dynamic import + ssr: false
☐ LCP image มี priority={true} และ width/height ที่ถูกต้อง
☐ ไม่มี useEffect ที่ run ทุก render โดยไม่มี dependency array

Priority MEDIUM:
☐ List ขนาดใหญ่ใช้ virtualization (TODO: react-window ถ้าจำเป็น)
☐ Component ที่ render บ่อยห่อด้วย React.memo
☐ Zustand subscribe เฉพาะ field ที่ใช้ ไม่ subscribe ทั้ง store

Priority LOW:
☐ Static assets มี Cache-Control ที่ next.config.ts กำหนดไว้แล้ว
☐ Font preloading ผ่าน next/font/local (มีอยู่แล้ว)
```

## 6. Guardrails

- ❌ ห้าม `ssr: false` กับ component ที่ต้องการ SEO
- ❌ ห้ามเพิ่ม dependency ใหม่เพื่อ performance โดยไม่วัดก่อน
- ❌ ห้าม premature optimization — วัดก่อน แล้วค่อย optimize
- ❌ ห้าม React.memo ทุก component — ใช้เฉพาะเมื่อวัดแล้วว่า re-render เป็นปัญหาจริง

## 7. Validation

```bash
npm run build
# ดู output: ✓ Compiled successfully
# ดู page sizes ใน build output
```

## 8. Example Prompts

```
@workspace อ่าน performance-checklist.md แล้วตรวจสอบ app/dashboard/page.tsx
```

```
@workspace ใช้ dynamic import กับ components/PieChart.tsx ตาม performance-checklist
```

```
@workspace ตรวจสอบว่ามี unnecessary re-renders ใน app/dashboard/layout.tsx
```

## 9. Links

- [routing-layouts-and-metadata.md](./routing-layouts-and-metadata.md)
- [react-best-practices/rendering-performance-memoization.md](../react-best-practices/rendering-performance-memoization.md)
- [next-cache-components/cache-decision-tree.md](../next-cache-components/cache-decision-tree.md)
