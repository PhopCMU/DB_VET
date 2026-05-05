# Focus Management and Keyboard Navigation

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อสร้างหรือแก้ไข:
- Modal / Dialog (`components/Modal.tsx`, `components/ConfirmModal/`)
- Dropdown menu
- Sidebar (`components/Sidedar/Sidebar.tsx`)
- Custom interactive widget ที่ต้อง manage focus

## 2. Preconditions

- Next.js 15 App Router, TypeScript 5 strict mode
- framer-motion ติดตั้งแล้ว (สำหรับ animation) — ใช้ร่วมกับ focus management ได้
- ไม่มี focus-trap library — ใช้ vanilla DOM approach

## 3. Inputs

- `COMPONENT_FILE` — path ของ component ที่ต้องการปรับปรุง
- `TRIGGER_ELEMENT` — element ที่ trigger การเปิด modal/dropdown

## 4. Outputs

- Component ที่ focus trap ทำงานถูกต้อง
- Keyboard shortcuts (Escape, Tab, Arrow) ทำงาน
- Focus กลับมาที่ trigger element เมื่อปิด

## 5. ขั้นตอน

### ขั้นที่ 1 — Focus Trap สำหรับ Modal

```tsx
// useRef เก็บ trigger element
const triggerRef = useRef<HTMLButtonElement>(null);
const modalRef = useRef<HTMLDivElement>(null);

// เมื่อ modal เปิด → focus ไปที่ modal หรือ first focusable element
useEffect(() => {
  if (isOpen && modalRef.current) {
    const firstFocusable = modalRef.current.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();
  }
}, [isOpen]);

// เมื่อ modal ปิด → focus กลับที่ trigger
useEffect(() => {
  if (!isOpen && triggerRef.current) {
    triggerRef.current.focus();
  }
}, [isOpen]);
```

### ขั้นที่ 2 — Escape Key Handler

```tsx
useEffect(() => {
  if (!isOpen) return;
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [isOpen, onClose]);
```

### ขั้นที่ 3 — Tab Cycling ภายใน Modal

```tsx
const handleTabKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
  if (e.key !== "Tab") return;
  const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusableElements || focusableElements.length === 0) return;

  const firstEl = focusableElements[0];
  const lastEl = focusableElements[focusableElements.length - 1];

  if (e.shiftKey && document.activeElement === firstEl) {
    e.preventDefault();
    lastEl.focus();
  } else if (!e.shiftKey && document.activeElement === lastEl) {
    e.preventDefault();
    firstEl.focus();
  }
};

// ใน JSX
<div ref={modalRef} onKeyDown={handleTabKey} role="dialog" aria-modal="true">
```

### ขั้นที่ 4 — ARIA สำหรับ Modal

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-desc"
>
  <h2 id="modal-title">หัวข้อ Modal</h2>
  <p id="modal-desc">คำอธิบาย Modal</p>
  {/* content */}
</div>
```

### ขั้นที่ 5 — Sidebar Navigation

```tsx
// ✅ ถูกต้อง — ใช้ <nav> + aria-current
<nav aria-label="เมนูหลัก">
  {menuItems.map((item) => (
    <a
      key={item.href}
      href={item.href}
      aria-current={isActive(item.href) ? "page" : undefined}
      className="block px-4 py-2 rounded"
    >
      {item.label}
    </a>
  ))}
</nav>
```

### ขั้นที่ 6 — Body Scroll Lock เมื่อ Modal เปิด

```tsx
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
  return () => {
    document.body.style.overflow = "";
  };
}, [isOpen]);
```

## 6. Guardrails

- ❌ ห้าม `autoFocus` โดยไม่มีเหตุผล — ใช้เฉพาะเมื่อ UX ต้องการจริงๆ
- ❌ ห้ามลบ `outline` ใน CSS โดยไม่มีทางเลือก visual อื่น
- ❌ ห้าม focus ไปที่ element ที่ `aria-hidden="true"`
- ❌ ห้ามใช้ `setTimeout` เพื่อ delay focus — ใช้ `useEffect` dependency แทน
- ❌ ห้ามสร้าง custom scroll lock ที่ซ้ำซ้อน ถ้า framer-motion จัดการอยู่แล้ว

## 7. Validation

```bash
npm run lint
npm run build
```

ตรวจด้วยตนเอง: เปิด modal แล้วกด Tab ทุก cycle, กด Escape ต้องปิด, focus ต้องกลับที่ trigger

## 8. Example Prompts

```
@workspace อ่าน focus-management-and-keyboard-nav.md แล้วแก้ components/Modal.tsx ให้ keyboard accessible
```

```
@workspace ปรับ components/ConfirmModal/ConfirmModal.tsx ให้มี Escape close และ focus trap ตาม skill
```

```
@workspace ตรวจสอบ Sidebar.tsx ว่าใช้ <nav> และ aria-current ถูกต้องไหม
```

## 9. Links

- [a11y-audit-checklist.md](./a11y-audit-checklist.md)
- [accessible-forms-and-errors.md](./accessible-forms-and-errors.md)
- [composition-patterns/compound-components.md](../composition-patterns/compound-components.md)
