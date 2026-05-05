import axios from "axios";
import { ApiResponse } from "../SCB/GetRouter";
import { config } from "@/config/config_api";

export const createDataUser = async (
  formData: FormData,
): Promise<ApiResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "multipart/form-data",
    };

    const response = await axios.post<ApiResponse>(
      `${config.URL_API}/role/360/hr/create`,
      formData,
      { headers },
    );
    return response.data;
  } catch (error: any) {
    console.error("Error creating user:", error);
    return {
      success: false,
      message: error.response?.data?.message || "ข้อผิดพลาดในการสร้างผู้ใช้",
    };
  }
};

export const updateDataUser = async (
  formData: FormData,
): Promise<ApiResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      // ✅ ให้ Axios จัดการ Content-Type + boundary โดยอัตโนมัติ
      "Content-Type": "multipart/form-data",
    };

    const response = await axios.post<ApiResponse>(
      `${config.URL_API}/role/360/hr/update`, // ✅ ไม่ต่อท้าย :accountId
      formData,
      { headers },
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating user:", error);
    return {
      success: false,
      message: error.response?.data?.message || "ข้อผิดพลาดในการอัปเดตข้อมูล",
    };
  }
};
