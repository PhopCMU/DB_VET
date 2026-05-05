# Compound Components

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อ component มีหลาย sub-part ที่ต้องทำงานร่วมกันและแชร์ state ภายใน  
เช่น `Modal`, `Tabs`, `Accordion`, `Dropdown`

Pattern นี้ช่วยให้:
- ผู้ใช้ component ควบคุม layout ได้เอง
- หลีกเลี่ยง boolean prop ที่มากเกินไป
- ทดสอบแต่ละ part แยกกันได้

## 2. Preconditions

- React 19 + TypeScript 5 strict mode
- repo นี้มี `components/Modal.tsx`, `components/(360)/360_Modal.tsx` เป็นตัวอย่าง
- ไม่ต้องการ library พิเศษ

## 3. Inputs

- `COMPONENT_NAME` — ชื่อ component ที่จะสร้าง/ปรับปรุง
- `SUB_PARTS` — รายการ sub-component (เช่น `Header, Body, Footer`)

## 4. Outputs

- Component หลักพร้อม Context + sub-components
- TypeScript types ครบถ้วน
- ไม่เพิ่ม dependency ใหม่

## 5. ขั้นตอน

### ขั้นที่ 1 — สร้าง Context ภายใน

```tsx
// components/Modal/Modal.tsx
import { createContext, useContext, useState } from "react";

interface ModalContextValue {
  isOpen: boolean;
  close: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

function useModalContext() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("ต้องใช้ภายใน Modal component เท่านั้น");
  return ctx;
}
```

### ขั้นที่ 2 — สร้าง Root Component

```tsx
interface ModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

function Modal({ children, isOpen, onClose }: ModalProps) {
  return (
    <ModalContext.Provider value={{ isOpen, close: onClose }}>
      {isOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50">
          {children}
        </div>
      )}
    </ModalContext.Provider>
  );
}
```

### ขั้นที่ 3 — สร้าง Sub-components

```tsx
function ModalHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-b px-6 py-4">{children}</div>;
}

function ModalBody({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4">{children}</div>;
}

function ModalClose({ children }: { children: React.ReactNode }) {
  const { close } = useModalContext();
  return (
    <button onClick={close} aria-label="ปิด">
      {children}
    </button>
  );
}
```

### ขั้นที่ 4 — Attach Sub-components ไปที่ Root

```tsx
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Close = ModalClose;

export { Modal };
```

### ขั้นที่ 5 — การใช้งาน

```tsx
// ✅ ผู้ใช้ควบคุม layout ได้เอง
<Modal isOpen={isOpen} onClose={handleClose}>
  <Modal.Header>
    <h2 id="modal-title">ยืนยันการลบ</h2>
    <Modal.Close>✕</Modal.Close>
  </Modal.Header>
  <Modal.Body>
    <p>คุณต้องการลบรายการนี้หรือไม่?</p>
  </Modal.Body>
</Modal>
```

## 6. Guardrails

- ❌ ห้ามเปิดเผย Context ออกนอก module — Context เป็น implementation detail
- ❌ ห้ามใช้ pattern นี้กับ component ที่ง่ายมาก (เช่น `Button`) — over-engineering
- ❌ ห้าม throw error ใน `useContext` ใน production-critical path โดยไม่มี fallback
- ❌ ห้าม pass state ผ่าน `children` function (render props) ถ้า Context ทำได้อยู่แล้ว
- ✅ ตรวจสอบว่า sub-component ที่ใช้ Context throw error ที่อ่านได้เมื่อใช้ผิดที่

## 7. Validation

```bash
npm run lint
npm run build
```

## 8. Example Prompts

```
@workspace อ่าน compound-components.md แล้วปรับ components/Modal.tsx ให้เป็น compound component
```

```
@workspace สร้าง Tabs component ใน components/ โดยใช้ compound components pattern
```

```
@workspace ตรวจสอบว่า components/(360)/360_Modal.tsx ใช้ pattern นี้อยู่หรือยัง
```

## 9. Links

- [context-provider-boundaries.md](./context-provider-boundaries.md)
- [component-api-design-patterns.md](./component-api-design-patterns.md)
- [accessibility/focus-management-and-keyboard-nav.md](../accessibility/focus-management-and-keyboard-nav.md)
