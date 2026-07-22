import DOMPurify from "dompurify";

// ฟังก์ชัน sanitize ที่รับ string และคืน string
export const sanitize = (dirty: string): string => {
  // ตรวจสอบว่าเป็นฝั่ง client (มี window) หรือไม่
  if (typeof window !== "undefined") {
    return DOMPurify.sanitize(dirty);
  }
  // ถ้าไม่ใช่ฝั่ง client (เช่น server-side rendering) คืนค่าเดิมหรือจัดการตามต้องการ
  return dirty; // หรือ throw new Error("Sanitization is only available on the client side");
};
