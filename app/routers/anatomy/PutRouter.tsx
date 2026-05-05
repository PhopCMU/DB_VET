import axios from "axios";
import { config } from "@/config/config_api";
import { StudentData } from "@/app/model/anatomy/studentModel";
import CryptoJS from "crypto-js";

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

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

export const putUpdateStatusPDPA = async (
  studentId: string,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  try {
    const response = await axios.put<ApiResponse>(
      `${config.URL_API}/anatomy/student/update/pdpa?studentId=${studentId}`, // ส่งผ่าน query
      {},
      {
        headers,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percent);
        },
      }
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

export const putUpdateStatusPayment = async (
  studentId: string,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  try {
    const response = await axios.put<ApiResponse>(
      `${config.URL_API}/anatomy/student/update/silp?studentId=${studentId}`, // ส่งผ่าน query
      {},
      {
        headers,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percent);
        },
      }
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

export const putUpdateStudentText = async (
  payload: StudentData,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  try {
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey
    ).toString();

    const encryptedDataEncoded = encodeURIComponent(encryptedData);

    const response = await axios.put<ApiResponse>(
      `${config.URL_API}/anatomy/student/update/text?studentData=${encryptedDataEncoded}`,
      {},
      {
        headers,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(percent);
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error during update student text:", error);

    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: "ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};
