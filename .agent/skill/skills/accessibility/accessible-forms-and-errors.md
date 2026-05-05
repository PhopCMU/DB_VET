# Accessible Forms and Errors

## 1. จุดประสงค์ / เมื่อใดควรใช้

ใช้เมื่อสร้างหรือแก้ไข form ที่ต้องผ่านมาตรฐาน WCAG 2.2 AA  
ครอบคลุม: label association, error messaging, required fields, validation feedback

## 2. Preconditions

- Next.js 15 App Router — component ใน `components/` หรือ `app/`
- Tailwind CSS v4 สำหรับ styling
- TypeScript 5 strict mode
- ไม่มี form library (react-hook-form/formik) ใน repo นี้ — ใช้ controlled component pattern

## 3. Inputs

- `FORM_FILE` — path ของ form component ที่ต้องการปรับปรุง
- `FIELD_LIST` — รายชื่อ field ที่ต้องการตรวจ (เช่น `email, password, confirm`)

## 4. Outputs

- Form component ที่มี label/error/aria ครบถ้วน
- ไม่เพิ่ม dependency ใหม่

## 5. ขั้นตอน

### ขั้นที่ 1 — Label Association

ทุก input ต้องมี label ที่ใช้ `htmlFor` + `id` ที่ตรงกัน:

```tsx
// ✅ ถูกต้อง
<label htmlFor="email" className="block text-sm font-medium">
  อีเมล <span aria-hidden="true" className="text-red-500">*</span>
</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-describedby={emailError ? "email-error" : undefined}
  className="w-full rounded border px-3 py-2"
/>

// ❌ ผิด — ไม่มี label association
<span>อีเมล</span>
<input type="email" />
```

### ขั้นที่ 2 — Error Message Pattern

```tsx
// ✅ Pattern ที่ถูกต้อง
{emailError && (
  <p
    id="email-error"
    role="alert"
    aria-live="polite"
    className="mt-1 text-sm text-red-600"
  >
    {emailError}
  </p>
)}
```

**กฎ:**
- `id` ของ error ต้องตรงกับ `aria-describedby` ของ input
- ใช้ `role="alert"` หรือ `aria-live="polite"` เพื่อให้ screen reader อ่าน
- Error message ต้องเป็น text จริง ไม่ใช่แค่สีแดง
- ใช้ `aria-invalid="true"` บน input เมื่อมี error

```tsx
<input
  id="email"
  type="email"
  aria-invalid={!!emailError}
  aria-describedby={emailError ? "email-error" : undefined}
/>
```

### ขั้นที่ 3 — Required Field

```tsx
// แสดง * พร้อม sr-only text
<label htmlFor="name">
  ชื่อ
  <span aria-hidden="true"> *</span>
  <span className="sr-only">(จำเป็น)</span>
</label>
<input
  id="name"
  aria-required="true"
  required
/>
```

### ขั้นที่ 4 — Disabled State

```tsx
// ✅ ถูกต้อง — disabled ต้องชัดเจน
<button
  type="submit"
  disabled={isLoading}
  aria-disabled={isLoading}
  className="... disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isLoading ? "กำลังบันทึก..." : "บันทึก"}
</button>
```

### ขั้นที่ 5 — Form-level Error Summary

สำหรับ form ที่มี validation หลาย field ให้แสดง summary เมื่อ submit:

```tsx
{formErrors.length > 0 && (
  <div
    role="alert"
    aria-live="assertive"
    className="rounded border border-red-300 bg-red-50 p-3"
  >
    <p className="font-medium text-red-700">กรุณาแก้ไขข้อมูลต่อไปนี้:</p>
    <ul className="mt-1 list-inside list-disc text-sm text-red-600">
      {formErrors.map((err) => (
        <li key={err.field}>{err.message}</li>
      ))}
    </ul>
  </div>
)}
```

## 6. Guardrails

- ❌ ห้ามใช้ `placeholder` แทน `label`
- ❌ ห้ามแสดง error ด้วยสีแดงอย่างเดียวโดยไม่มี text
- ❌ ห้ามใช้ `tabIndex > 0`
- ❌ ห้ามเพิ่ม form library โดยไม่ได้รับอนุมัติ
- ❌ ห้าม log ค่า form field ที่อาจเป็น PII ใน console

## 7. Validation

```bash
npm run lint
npm run build
```

## 8. Example Prompts

```
@workspace อ่าน accessible-forms-and-errors.md แล้วตรวจสอบ components/Input/InputField.tsx
```

```
@workspace ปรับ form ใน app/auth/page.tsx ให้ผ่าน accessible-forms-and-errors pattern
```

## 9. Links

- [a11y-audit-checklist.md](./a11y-audit-checklist.md)
- [focus-management-and-keyboard-nav.md](./focus-management-and-keyboard-nav.md)
- [typescript-advanced-types/discriminated-unions-for-ui-states.md](../typescript-advanced-types/discriminated-unions-for-ui-states.md)
