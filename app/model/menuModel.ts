// กำหนดโครงสร้างของเมนูย่อย
export interface SubMenu {
  submenuId?: string;
  menuId?: string; // อ้างอิงถึง menuId ของเมนูหลัก
  name: string;
  part: string | null; // อนุญาตให้เป็น null ตามข้อมูลตัวอย่าง
  icon: string;
  position: number | null;
  [key: string]: any; // สำหรับฟิลด์เพิ่มเติม เช่น createdAt, updatedAt เป็นต้น
}

export interface SubMenuId {
  submenuId: string | null;
}

export interface MenuId {
  menuId: string | null;
}

// กำหนดโครงสร้างของรายการเมนู
export interface MenuItem {
  menuId: string;
  name: string; // อนุญาตให้เป็น null ตามข้อมูลตัวอย่าง
  icon: string;
  part: string | null; // อนุญาตให้เป็น null ตามข้อมูลตัวอย่าง
  position: number;
  subMenus: SubMenu[];
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // สำหรับฟิลด์เพิ่มเติม
}

// กำหนดประเภทของการตอบกลับจาก API (อาร์เรย์ของรายการเมนู)
export type MenuSidebarResponse = MenuItem[];

export interface Menu {
  name: string;
  icon: string;
  part: string | null; //
  position: number | null;
}
export interface FormData {
  name: string;
  icon: string;
  part: string;
  position: string;
}
