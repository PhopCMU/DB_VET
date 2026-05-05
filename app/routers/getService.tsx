import { config } from "@/config/config_api";
import axios, { AxiosResponse } from "axios";
import CryptoJS from "crypto-js";
import { MenuSidebarResponse } from "@/app/model/menuModel";
import { ProjectModel } from "../model/projectModel";
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

export const menuSidebar = async (): Promise<MenuSidebarResponse> => {
  try {
    // ทำการร้องขอ API
    const res: AxiosResponse<MenuSidebarResponse> = await axios.get(
      `${config.URL_API}/role/menu`
    );

    // ตรวจสอบว่ามีข้อมูลการตอบกลับและเป็นอาร์เรย์หรือไม่
    if (!res.data || !Array.isArray(res.data)) {
      throw new Error("การตอบกลับไม่ถูกต้อง: ข้อมูลเมนูไม่ใช่อาร์เรย์");
    }

    // การตรวจสอบเพิ่มเติม (ถ้าต้องการ): ตรวจสอบฟิลด์ที่จำเป็น
    res.data.forEach((item: any, index: number) => {
      if (!item.name || !item.icon) {
        throw new Error(
          `รายการเมนูไม่ถูกต้องที่ดัชนี ${index}: ต้องมี 'name' และ 'icon'`
        );
      }
    });

    // ส่งคืนข้อมูลที่ผ่านการตรวจสอบ
    return res.data;
  } catch (error) {
    // จัดการข้อผิดพลาดอย่างละเอียด
    if (axios.isAxiosError(error)) {
      const message = error.response
        ? `การร้องขอ API ล้มเหลว: ${error.response.status} - ${
            error.response.data?.message || error.message
          }`
        : `ข้อผิดพลาดเครือข่าย: ${error.message}`;
      throw new Error(message);
    } else {
      throw new Error(
        `ข้อผิดพลาดการดึงเมนู: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
};

export const getProject = async (): Promise<ProjectModel> => {
  try {
    // ทำการร้องขอ API
    const res: AxiosResponse<ProjectModel> = await axios.get(
      `${config.URL_API}/role/project`
    );
    // ตรวจสอบว่ามีข้อมูลการตอบกลับและเป็นอาร์เรย์หรือไม่
    if (!res.data || !Array.isArray(res.data)) {
      throw new Error("การตอบกลับไม่ถูกต้อง: ข้อมูลเมนูไม่ใช่อาร์เรย์");
    }

    // การตรวจสอบเพิ่มเติม (ถ้าต้องการ): ตรวจสอบฟิลด์ที่จำเป็น
    res.data.forEach((item: any, index: number) => {
      if (!item.name || !item.projectId) {
        throw new Error(
          `รายการเมนูไม่ถูกต้องที่ดัชนี ${index}: ต้องมี 'name' และ 'icon'`
        );
      }
    });

    // ส่งคืนข้อมูลที่ผ่านการตรวจสอบ
    return res.data;
  } catch (error) {
    // จัดการข้อผิดพลาดอย่างละเอียด
    if (axios.isAxiosError(error)) {
      const message = error.response
        ? `การร้องขอ API ล้มเหลว: ${error.response.status} - ${
            error.response.data?.message || error.message
          }`
        : `ข้อผิดพลาดเครือข่าย: ${error.message}`;
      throw new Error(message);
    } else {
      throw new Error(
        `ข้อผิดพลาดการดึงเมนู: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
};

export const GetUsers_Role = async (
  visitorId: string | null
): Promise<ApiResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
      "X-Visitor-Id": visitorId,
    };
    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/role/user/api/v1/list`,
      {
        headers,
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: "ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};

export const GetDepartments_Role = async (
  visitorId: string | null
): Promise<ApiResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
      "X-Visitor-Id": visitorId,
    };
    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/role/api/v1/department/list`,
      {
        headers,
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: "ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};

export const GetProjectToggle = async (
  visitorId: string | null
): Promise<ApiResponse> => {
  const payload = {
    title: "vetrun",
  };
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey
  ).toString();
  const encryptedDataEncoded = encodeURIComponent(encryptedData);

  try {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
      "X-Visitor-Id": visitorId || "",
    };

    // ส่ง params ให้ถูกต้อง
    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/role/api/v1/vetrun/status`,
      {
        params: { encryptedData: encryptedDataEncoded },
        headers,
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: "ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};
