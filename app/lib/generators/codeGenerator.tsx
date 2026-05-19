import { customAlphabet } from "nanoid";

export type CodeOptions = {
  prefix?: string; // เช่น SCB, INV
  suffix?: string; // เช่น TH, 2025
  length?: number; // ความยาวส่วนสุ่ม (default 10)
  charset?: string; // ชุดตัวอักษร เช่น "0123456789", "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
};

export type SCBCodeOptions = {
  type?: string; // เช่น "SCB", "INV", "ABC"
  fixedChar?: string; // default = "S"
};

// สุ่มตัวเลขแบบสตริง ตามจำนวนหลักที่กำหนด
export const generateRandomDigits = (length: number): string => {
  if (length <= 0) return "";

  // สร้าง array ขนาดเพียงพอ (แต่ละ Uint32 ให้ได้ ~9-10 หลัก)
  const numRandoms = Math.ceil(length / 9); // ปลอดภัย: 9 หลักต่อค่า
  const array = new Uint32Array(numRandoms);
  crypto.getRandomValues(array);

  let result = "";
  for (let i = 0; i < numRandoms && result.length < length; i++) {
    // แปลงเป็นสตริง 9 หลัก (เติม 0 ข้างหน้า)
    result += array[i].toString().padStart(9, "0");
  }

  // ตัดให้เหลือแค่ length ตัว
  return result.substring(0, length);
};

// 1. สร้างเลข 10 หลัก (0-9) แบบ secure
export const generateRandom10Digits = (): string => {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  const num = array[0] % 10_000_000_000; // 0–9,999,999,999
  return num.toString().padStart(10, "0"); // ✅ 10 หลัก
};

//

// 2. สร้างโค้ดแบบยืดหยุ่น
export const generateCode = ({
  prefix = "",
  suffix = "",
  length = 10,
  charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
}: CodeOptions = {}): string => {
  const maxRandomLength = Math.max(0, 12 - prefix.length - suffix.length);
  if (maxRandomLength <= 0) {
    // ถ้า prefix + suffix ยาวเกิน 12 → ตัดให้พอดี
    return (prefix + suffix).substring(0, 12);
  }

  const actualLength = Math.min(length, maxRandomLength);
  const nanoid = customAlphabet(charset, actualLength);
  const result = `${prefix}${nanoid()}${suffix}`;
  return result.substring(0, 12); // ✅ ประกันไม่เกิน 12
};

// 3. สร้างโค้ดแบบกำหนดรูปแบบ (เช่น SCB)
export const generateCustomCode = ({
  type: ref1,
  fixedChar = "SCB",
}: SCBCodeOptions): string => {
  // 1. สร้างเลข 3 หลักแรก (000–999)
  const first3Array = new Uint8Array(1);
  crypto.getRandomValues(first3Array);
  const first3 = (first3Array[0] % 1000).toString().padStart(3, "0");

  // 2. ใช้ fixedChar (จำกัด 3 ตัว และเป็นตัวพิมพ์ใหญ่)
  const safeFixed = fixedChar.substring(0, 3).toUpperCase();

  // 3. สร้างเลข 6 หลักท้าย (000000–999999)
  const last6Array = new Uint32Array(1);
  crypto.getRandomValues(last6Array);
  const last6 = (last6Array[0] % 1_000_000).toString().padStart(6, "0");

  // 4. รวมเป็น 3 + 3 + 6 = 12 ตัว
  return `${safeFixed}${last6}${ref1}${first3}`;
};

export const generateCustomCode20 = ({
  fixedChar = "SCB",
}: SCBCodeOptions): string => {
  // 1. สร้างเลข 3 หลักแรก (000–999)
  const first3Array = new Uint8Array(1);
  crypto.getRandomValues(first3Array);
  const first3 = (first3Array[0] % 1000).toString().padStart(3, "0");

  // 2. ใช้ fixedChar (จำกัด 3 ตัว และเป็นตัวพิมพ์ใหญ่)
  const safeFixed = fixedChar.substring(0, 3).toUpperCase();

  // 3. สร้างเลข 6 หลักท้าย (000000–999999)
  const last6Array = new Uint32Array(1);
  crypto.getRandomValues(last6Array);
  const last6 = (last6Array[0] % 1_000_000).toString().padStart(14, first3);

  // 4. รวมเป็น 3 + 3 + 6 = 12 ตัว
  return `${safeFixed}${last6}${first3}`;
};
