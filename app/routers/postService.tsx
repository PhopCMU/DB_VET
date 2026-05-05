import axios, { AxiosError } from "axios";
import CryptoJS from "crypto-js";
import { Menu, SubMenu } from "../model/menuModel";
import { config } from "@/config/config_api";
import { createProgressSimulator } from "@/utils/ProgressSimulator";
import { MainDepartment, SubDepartment } from "../model/roleModel";

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

const secretKey: any = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND;
let token = "";
if (typeof window !== "undefined") {
  token = localStorage.getItem("authToken") || "";
}

// ฟังก์ชันสำหรับตรวจสอบข้อมูล SubMenu
const validateSubMenu = (submenu: SubMenu) => {
  // ตัวอย่างการตรวจสอบ: ตรวจสอบว่า submenu มีฟิลด์ที่จำเป็น
  if (!submenu.name || !submenu.part || !submenu.menuId) {
    return false;
  }
  // เพิ่มการตรวจสอบเพิ่มเติมตามโครงสร้างของ SubMenu
  return true;
};

// ฟังก์ชันสำหรับตรวจสอบข้อมูล Menu
const validateMenu = (menu: Menu) => {
  // ตัวอย่างการตรวจสอบ: ตรวจสอบว่า submenu มีฟิลด์ที่จำเป็น
  if (!menu.name || !menu.part) {
    return false;
  }
  // เพิ่มการตรวจสอบเพิ่มเติมตามโครงสร้างของ SubMenu
  return true;
};

export const postAddMenu = async (newMenu: Menu) => {
  try {
    if (!validateMenu(newMenu)) {
      throw new Error("Invalid SubMenu data");
    }
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
    };
    const res = await axios.post(`${config.URL_API}/role/menu/add`, newMenu, {
      headers,
    });

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

export const postAddSubMenu = async (newSubmenu: SubMenu) => {
  try {
    if (!validateSubMenu(newSubmenu)) {
      throw new Error("Invalid SubMenu data");
    }
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
    };

    const res = await axios.post(
      `${config.URL_API}/role/menu/submenu`,
      newSubmenu,
      { headers },
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

export const postAddRole = async (newRole: any) => {
  try {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
    };
    const res = await axios.post(`${config.URL_API}/role/add`, newRole, {
      headers,
    });

    if (res.status === 201 || res.status === 200) {
      return res.data;
    } else {
      throw new Error(`Unexpected response status: ${res.status}`);
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("API error:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to add role");
    } else if (error instanceof Error) {
      console.error("Validation or general error:", error.message);
      throw error;
    } else {
      console.error("Unknown error:", error);
      throw new Error("An unexpected error occurred");
    }
  }
};

export const PostMainDepartmentCreated_Role = async (
  payload: MainDepartment,
  visitorId: string | null,
  setUploadProgress: (progress: number) => void,
): Promise<ApiResponse> => {
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey,
  ).toString();

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    start();

    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
      "X-Visitor-Id": visitorId,
    };
    const response = await axios.post<ApiResponse>(
      `${config.URL_API}/role/api/v1/department/create`,
      {
        encryptedData,
        status: 200,
      },
      { headers },
    );

    await waitForCompletion();
    setUploadProgress(100);

    return response.data;
  } catch (error: any) {
    // Stop the progress simulation
    stop();
    // Set progress to 0%
    setUploadProgress(0);

    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: "ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};

export const PostSubDepartmentCreated_Role = async (
  payload: SubDepartment,
  visitorId: string | null,
  setUploadProgress: (progress: number) => void,
): Promise<ApiResponse> => {
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey,
  ).toString();

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    start();

    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
      "X-Visitor-Id": visitorId,
    };
    const response = await axios.post<ApiResponse>(
      `${config.URL_API}/role/api/v1/department/sub/create`,
      {
        encryptedData,
        status: 200,
      },
      { headers },
    );

    await waitForCompletion();
    setUploadProgress(100);

    return response.data;
  } catch (error: any) {
    // Stop the progress simulation
    stop();
    // Set progress to 0%
    setUploadProgress(0);

    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: "ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};

export const PostDepartmentMemberShipCreated_Role = async (
  payload: {
    personnelId: string;
    mainDepartmentId: string;
    subDepartmentId: string;
  },
  visitorId: string | null,
  setUploadProgress: (progress: number) => void,
): Promise<ApiResponse> => {
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey,
  ).toString();

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    start();

    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
      "X-Visitor-Id": visitorId,
    };
    const response = await axios.post<ApiResponse>(
      `${config.URL_API}/role/api/v1/department/ship/create`,
      {
        encryptedData,
        status: 200,
      },
      { headers },
    );

    await waitForCompletion();
    setUploadProgress(100);

    return response.data;
  } catch (error: any) {
    // Stop the progress simulation
    stop();
    // Set progress to 0%
    setUploadProgress(0);

    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: "ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};
