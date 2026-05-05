import axios, { AxiosError } from "axios";
import { MenuId, SubMenuId } from "../model/menuModel";
import { config } from "@/config/config_api";

// ฟังก์ชันสำหรับตรวจสอบข้อมูล SubMenu
const validateSubMenu = (submenuId: SubMenuId) => {
  // ตรวจสอบว่า submenuId มีค่าและไม่ว่างเปล่า
  if (!submenuId || typeof submenuId !== "string") {
    return false;
  }

  // ตรวจสอบว่า submenuId เป็น UUID ที่ถูกต้อง
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(submenuId)) {
    return false;
  }

  return true;
};

// ฟังก์ชันสำหรับตรวจสอบข้อมูล SubMenu
const validateMenu = (menuId: MenuId) => {
  // ตรวจสอบว่า submenuId มีค่าและไม่ว่างเปล่า
  if (!menuId || typeof menuId !== "string") {
    return false;
  }

  // ตรวจสอบว่า submenuId เป็น UUID ที่ถูกต้อง
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(menuId)) {
    return false;
  }

  return true;
};

export const reMoveMenu = async (menuId: MenuId) => {
  try {
    if (!validateMenu(menuId)) {
      throw new Error("Invalid SubMenu ID: Must be a valid UUID");
    }
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
    };

    const res = await axios.delete(
      `${config.URL_API}/role/menu/remove/${menuId}`,
      {
        headers,
      }
    );
    if (res.status === 201 || res.status === 200) {
      return res.data;
    } else {
      throw new Error(`Unexpected response status: ${res.status}`);
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("API error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to add submenu");
    } else if (error instanceof Error) {
      console.error("Validation or general error:", error.message);
      throw error;
    } else {
      console.error("Unknown error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
};

export const reMoveSubMenu = async (submenuId: SubMenuId) => {
  try {
    if (!validateSubMenu(submenuId)) {
      throw new Error("Invalid SubMenu ID: Must be a valid UUID");
    }
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
    };

    const res = await axios.delete(
      `${config.URL_API}/role/menu/submenu/remove/${submenuId}`,
      {
        headers,
      }
    );
    if (res.status === 201 || res.status === 200) {
      return res.data;
    } else {
      throw new Error(`Unexpected response status: ${res.status}`);
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("API error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to add submenu");
    } else if (error instanceof Error) {
      console.error("Validation or general error:", error.message);
      throw error;
    } else {
      console.error("Unknown error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
};
