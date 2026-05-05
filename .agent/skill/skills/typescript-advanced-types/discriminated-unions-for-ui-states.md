# Discriminated Unions for UI States

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อต้องการ model state ที่ mutually exclusive เช่น:
- Async data: loading / error / success
- Form state: idle / submitting / success / error
- Modal state: closed / open / confirming

## 2. Preconditions

- TypeScript 5 strict mode
- ห้ามใช้ `any` — ใช้ discriminated union แทน

## 3. Inputs

- `STATE_DESCRIPTION` — คำอธิบาย state ที่ต้องการ model

## 4. Outputs

- TypeScript type สำหรับ state
- Component/hook ที่ใช้ type นี้

## 5. ขั้นตอน

### ขั้นที่ 1 — Async Data State Pattern

```tsx
// ✅ Discriminated union — แต่ละ case มี data ที่ต่างกัน
type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

// การใช้งาน
const [state, setState] = useState<AsyncState<Employee[]>>({ status: "idle" });

// TypeScript narrows type ใน switch/if
switch (state.status) {
  case "loading":
    return <SimpleLoading />;
  case "error":
    return <ErrorMessage message={state.message} />; // TypeScript รู้ว่ามี .message
  case "success":
    return <EmployeeTable data={state.data} />; // TypeScript รู้ว่ามี .data
  default:
    return null;
}
```

### ขั้นที่ 2 — Form State Pattern

```tsx
type FormState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; errors: Record<string, string> };

// การใช้งาน
const [formState, setFormState] = useState<FormState>({ status: "idle" });

const handleSubmit = async (data: FormData) => {
  setFormState({ status: "submitting" });
  try {
    await submitForm(data);
    setFormState({ status: "success", message: "บันทึกสำเร็จ" });
  } catch (err) {
    setFormState({
      status: "error",
      errors: { general: "เกิดข้อผิดพลาด กรุณาลองใหม่" },
    });
  }
};

// ใน render
{formState.status === "error" && (
  <div role="alert">{formState.errors.general}</div>
)}
{formState.status === "success" && (
  <div role="status">{formState.message}</div>
)}
```

### ขั้นที่ 3 — Modal/Dialog State

```tsx
type ModalState =
  | { isOpen: false }
  | { isOpen: true; mode: "create" }
  | { isOpen: true; mode: "edit"; itemId: string }
  | { isOpen: true; mode: "delete"; itemId: string; itemName: string };

const [modal, setModal] = useState<ModalState>({ isOpen: false });

// TypeScript ตรวจสอบว่า itemId มีเฉพาะ mode="edit" และ "delete"
if (modal.isOpen && modal.mode === "edit") {
  console.log(modal.itemId); // ✅ TypeScript รู้ว่ามี itemId
}

// เปิด modal ตัวอย่าง
setModal({ isOpen: true, mode: "edit", itemId: "123" });
setModal({ isOpen: true, mode: "delete", itemId: "123", itemName: "John" });
```

### ขั้นที่ 4 — Permission/Role State

```tsx
// อิงจาก model/roleModel.ts ที่มีอยู่
type UserRole = "admin" | "manager" | "employee" | "viewer";

type AuthState =
  | { status: "unauthenticated" }
  | { status: "loading" }
  | {
      status: "authenticated";
      userId: string;
      role: UserRole;
      permissions: string[];
    };
```

### ขั้นที่ 5 — Exhaustive Check

```tsx
// ✅ ตรวจสอบว่า handle ทุก case
function renderState(state: AsyncState<Employee[]>): React.ReactNode {
  switch (state.status) {
    case "idle":
      return null;
    case "loading":
      return <SimpleLoading />;
    case "success":
      return <Table data={state.data} />;
    case "error":
      return <ErrorMsg message={state.message} />;
    default:
      // Exhaustive check — TypeScript จะ error ถ้ามี case ที่ไม่ได้ handle
      const _exhaustive: never = state;
      return null;
  }
}
```

## 6. Guardrails

- ❌ ห้าม `status: boolean` — ทำให้ type ไม่ safe
- ❌ ห้าม `data: T | null` โดยไม่มี `status` discriminant — ไม่รู้ว่า null เพราะ loading หรือ error
- ❌ ห้ามใช้ `any` เป็น type ของ data ใน AsyncState
- ✅ เพิ่ม exhaustive check (`never`) ใน switch statement เสมอ

## 7. Validation

```bash
npm run lint
# TypeScript จะ error ถ้า type ไม่ถูกต้อง
```

## 8. Example Prompts

```
@workspace อ่าน discriminated-unions-for-ui-states.md แล้วสร้าง AsyncState type สำหรับ employee list
```

```
@workspace ปรับ form state ใน app/auth/page.tsx ให้ใช้ FormState discriminated union
```

```
@workspace ตรวจว่า modal state ใน components/Modal.tsx ใช้ discriminated union หรือยัง
```

## 9. Links

- [utility-types-and-type-guards.md](./utility-types-and-type-guards.md)
- [typed-api-contracts.md](./typed-api-contracts.md)
- [frontend-design/loading-empty-error-states.md](../frontend-design/loading-empty-error-states.md)
