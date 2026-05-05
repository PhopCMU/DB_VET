import axios from "axios";
import { config } from "@/config/config_api";

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

let token = "";
if (typeof window !== "undefined") {
  token = localStorage.getItem("authToken") || "";
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};
export const fetchDataListuser = async (): Promise<ApiResponse> => {
  try {
    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/anatomy/student/all/user/role/staff`,
      { headers }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error during search:", error);

    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: "ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};
