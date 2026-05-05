# State Management Guidelines

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อต้องการเพิ่ม state ใหม่ใน application และต้องตัดสินใจว่าจะเก็บไว้ที่ไหน  
repo นี้มี tools หลายอย่าง — ต้องเลือกให้ถูกต้อง

## 2. Preconditions

- React 19 + TypeScript 5
- Zustand v5 (`store/menuStore.tsx`)
- React Context (`app/context/UserContext.tsx`, `app/context/UsePermission.tsx`)

## 3. Inputs

- `STATE_DESCRIPTION` — คำอธิบาย state ที่ต้องการจัดการ
- `SCOPE` — `global` | `feature` | `component`

## 4. Outputs

- แนวทางและโค้ดตัวอย่างที่เหมาะสม

## 5. ขั้นตอน

### ขั้นที่ 1 — State Selection Matrix

```
Local UI State (useState):
  ✅ isOpen, isLoading, selectedTab, formValues
  ✅ state ที่ใช้ใน component เดียว
  ✅ state ที่ lifecycle ผูกกับ component

React Context (app/context/):
  ✅ User session, Permissions (มีอยู่แล้ว)
  ✅ State ที่ share ใน subtree เดียว
  ✅ State ที่เปลี่ยนไม่บ่อย
  ❌ ห้ามใช้กับ state ที่ update บ่อยมาก

Zustand (store/):
  ✅ Global UI state ที่ share หลาย component (เช่น menu)
  ✅ State ที่ต้องการ devtools หรือ persist
  ✅ State ที่ update บ่อยและมี subscriber หลายตัว

URL State (searchParams):
  ✅ Filter, sort, pagination
  ✅ State ที่ต้องการ shareable link
  ✅ State ที่ทำงานกับ browser back/forward
```

### ขั้นที่ 2 — Local State Pattern

```tsx
// ✅ ถูกต้อง — state ง่ายๆ ใน component
function ConfirmModal({ onConfirm }: { onConfirm: () => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return <button onClick={handleConfirm} disabled={isLoading}>ยืนยัน</button>;
}
```

### ขั้นที่ 3 — Zustand Pattern (ตาม store/menuStore.tsx)

```tsx
// store/dashboardStore.tsx — ถ้าต้องการเพิ่ม store ใหม่
import { create } from "zustand";

interface DashboardStore {
  activeSection: string;
  setActiveSection: (section: string) => void;
  notifications: Notification[];
  addNotification: (n: Notification) => void;
  clearNotifications: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  activeSection: "overview",
  setActiveSection: (section) => set({ activeSection: section }),
  notifications: [],
  addNotification: (n) =>
    set((state) => ({ notifications: [...state.notifications, n] })),
  clearNotifications: () => set({ notifications: [] }),
}));
```

### ขั้นที่ 4 — State Shape Best Practices

```tsx
// ✅ ถูกต้อง — flat state structure
const [userId, setUserId] = useState<string | null>(null);
const [userName, setUserName] = useState<string>("");

// หรือ group เฉพาะเมื่อ update พร้อมกัน
const [user, setUser] = useState<{ id: string; name: string } | null>(null);

// ❌ ผิด — nested state ที่ยาก update
const [data, setData] = useState({
  user: { profile: { settings: { theme: "light" } } }
});
```

### ขั้นที่ 5 — Derived State (คำนวณจาก state ที่มีอยู่)

```tsx
// ✅ ใช้ useMemo หรือ คำนวณตรงใน render
const activeUsers = useMemo(
  () => users.filter((u) => u.isActive),
  [users]
);

// ✅ Simple derivation ไม่จำเป็นต้องใช้ useMemo
const totalCount = items.length; // คำนวณตรงใน render ได้เลย

// ❌ ผิด — เก็บ derived state ใน useState
const [activeUsers, setActiveUsers] = useState([]);
useEffect(() => {
  setActiveUsers(users.filter((u) => u.isActive)); // ไม่จำเป็น
}, [users]);
```

## 6. Guardrails

- ❌ ห้าม store sensitive data (token, password) ใน state ที่อยู่ใน JS memory นานเกินจำเป็น
- ❌ ห้ามสร้าง Zustand store ใหม่สำหรับ state ที่ใช้ใน component เดียว
- ❌ ห้าม duplicate state — ถ้า data มาจาก API ให้ fetch ใหม่แทนการ sync state
- ❌ ห้าม `any` เป็น type ของ state
- ✅ ตรวจสอบว่า Zustand store อยู่ใน `store/` directory เสมอ

## 7. Validation

```bash
npm run lint
npm run build
```

## 8. Example Prompts

```
@workspace อ่าน state-management-guidelines.md แล้วบอกว่า notification state ควรเก็บที่ไหน
```

```
@workspace สร้าง Zustand store สำหรับ notification ตาม pattern ใน store/menuStore.tsx
```

```
@workspace ตรวจสอบว่า app/context/UserContext.tsx ใช้ pattern ที่ถูกต้องจาก skill
```

## 9. Links

- [hooks-rules-and-deps.md](./hooks-rules-and-deps.md)
- [composition-patterns/context-provider-boundaries.md](../composition-patterns/context-provider-boundaries.md)
- [next-cache-components/client-vs-server-state-boundary.md](../next-cache-components/client-vs-server-state-boundary.md)
