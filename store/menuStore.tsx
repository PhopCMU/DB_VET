import { create } from "zustand";
import { menuSidebar } from "@/app/routers/getService";

interface MenuState {
  menuData: any[];
  fetchMenuData: () => Promise<void>;
}

export const useMenuStore = create<MenuState>((set) => ({
  menuData: [],
  fetchMenuData: async () => {
    try {
      const result = await menuSidebar();
      set({ menuData: result || [] });
    } catch (error) {
      console.error("ไม่สามารถดึงข้อมูลเมนูได้:", error);
    }
  },
}));
