# Context Provider Boundaries

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อต้องการแชร์ state ระหว่าง component หลายตัวโดยไม่ prop drill  
และต้องตัดสินใจว่าควรใช้ React Context หรือ Zustand

ดู repo: `app/context/UserContext.tsx`, `app/context/UsePermission.tsx`, `store/menuStore.tsx`

## 2. Preconditions

- React 19 + TypeScript 5
- Zustand v5 ติดตั้งแล้ว (`store/`)
- Context files มีอยู่ใน `app/context/`

## 3. Inputs

- `STATE_TYPE` — ประเภท state: `global` | `feature-scoped` | `component-local`
- `CONSUMER_COUNT` — จำนวน component ที่ต้องการใช้ state นี้

## 4. Outputs

- Provider component หรือ Zustand store ตามความเหมาะสม
- Custom hook สำหรับ consume
- TypeScript types ครบถ้วน

## 5. ขั้นตอน

### ขั้นที่ 1 — เลือก Tool ให้ถูกต้อง

| เงื่อนไข | ใช้ |
|---|---|
| State เปลี่ยนบ่อย, subscribers มาก, global | **Zustand** (`store/`) |
| State เปลี่ยนไม่บ่อย, scoped ใน feature เดียว | **React Context** |
| State ใช้ใน subtree เดียว (compound component) | **React Context** ภายใน module |
| State ที่เกี่ยวกับ server (fetch result) | **URL params + fetch** ไม่ใช่ state |

### ขั้นที่ 2 — Pattern สำหรับ React Context (Feature-scoped)

```tsx
// app/context/UserContext.tsx — pattern ที่ใช้อยู่ใน repo
"use client";

import { createContext, useContext, useState } from "react";

interface UserContextValue {
  userId: string | null;
  setUserId: (id: string) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser ต้องใช้ภายใน UserProvider");
  return ctx;
}
```

### ขั้นที่ 3 — วาง Provider ให้ถูก Boundary

```tsx
// ✅ ถูกต้อง — วาง Provider ที่ใกล้ผู้ใช้ที่สุด
// app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <UserProvider>
      <PermissionProvider>
        {children}
      </PermissionProvider>
    </UserProvider>
  );
}

// ❌ ผิด — วาง Provider ใน app/layout.tsx สำหรับ state ที่ใช้แค่ใน dashboard
```

### ขั้นที่ 4 — Pattern สำหรับ Zustand (Global State)

```tsx
// store/menuStore.tsx — pattern ที่ใช้อยู่
import { create } from "zustand";

interface MenuStore {
  isOpen: boolean;
  toggle: () => void;
}

export const useMenuStore = create<MenuStore>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
```

### ขั้นที่ 5 — ป้องกัน Re-render ที่ไม่จำเป็น

```tsx
// ✅ Subscribe เฉพาะ field ที่ใช้
const isOpen = useMenuStore((state) => state.isOpen);
const toggle = useMenuStore((state) => state.toggle);

// ❌ Subscribe ทั้ง store — re-render ทุกครั้ง
const store = useMenuStore();
```

## 6. Guardrails

- ❌ ห้ามวาง Context Provider ที่ `app/layout.tsx` สำหรับ state ที่ใช้แค่บางหน้า
- ❌ ห้ามใช้ Context สำหรับ state ที่เปลี่ยนถี่มาก (เช่น mouse position, scroll)
- ❌ ห้าม store sensitive data (token, PII) ใน React state / Zustand โดยตรง
- ❌ ห้าม export Context object ออกนอก module — export เฉพาะ hook และ Provider
- ✅ ตรวจสอบ `"use client"` บน Provider ที่ใช้ useState/useEffect เสมอ

## 7. Validation

```bash
npm run lint
npm run build
```

## 8. Example Prompts

```
@workspace อ่าน context-provider-boundaries.md แล้วตรวจว่า app/context/UserContext.tsx วาง Provider ถูก boundary
```

```
@workspace ฉันต้องการแชร์ state ระหว่าง components ใน dashboard — ควรใช้ Context หรือ Zustand?
```

## 9. Links

- [compound-components.md](./compound-components.md)
- [react-best-practices/state-management-guidelines.md](../react-best-practices/state-management-guidelines.md)
