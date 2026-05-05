import axios from "axios";
import { config } from "@/config/config_api";
import CryptoJS from "crypto-js";
import {
  UpdateCertificateProps,
  UpdateSroceProps,
} from "@/app/model/anatomy/studentModel";

// ประเภทของข้อมูลตอบกลับ
interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

const secretKey: any = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND; // ควรเหมือน backend
let token = "";
if (typeof window !== "undefined") {
  token = localStorage.getItem("authToken") || "";
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

export const UpdateFileRouterCryptoJS = async (
  formDataToSend: FormData,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  try {
    // 1. แยกไฟล์ออกมาก่อน เพื่อไม่ให้ถูกเข้ารหัส
    const files: Record<string, File> = {};
    const nonFileData: Record<string, any> = {};

    // วน loop ตรวจสอบว่าเป็นไฟล์หรือไม่
    formDataToSend.forEach((value, key) => {
      if (value instanceof File) {
        files[key] = value;
      } else {
        nonFileData[key] = value;
      }
    });

    // 2. เข้ารหัสเฉพาะข้อมูลธรรมดา (non-file)
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(nonFileData),
      secretKey
    ).toString();

    // 3. สร้าง payload ใหม่: รวม encryptedData + ไฟล์
    const payload = new FormData();
    payload.append("encryptedData", encryptedData);

    // เพิ่มไฟล์ลง payload
    Object.entries(files).forEach(([key, file]) => {
      payload.append(key, file);
    });

    // 4. ส่งไป backend
    const response = await axios.post<ApiResponse>(
      `${config.URL_API}/anatomy/student/update/file`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          "Content-Type": "multipart/form-data",
        },
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
    console.error("Error during registration:", error);
    setUploadProgress(0);
    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};

export const UpdateFileImageRouterCryptoJS = async (
  formDataToSend: FormData,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  try {
    // 1. แยกไฟล์ออกมาก่อน เพื่อไม่ให้ถูกเข้ารหัส
    const files: Record<string, File> = {};
    const nonFileData: Record<string, any> = {};

    // วน loop ตรวจสอบว่าเป็นไฟล์หรือไม่
    formDataToSend.forEach((value, key) => {
      if (value instanceof File) {
        files[key] = value;
      } else {
        nonFileData[key] = value;
      }
    });

    // 2. เข้ารหัสเฉพาะข้อมูลธรรมดา (non-file)
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(nonFileData),
      secretKey
    ).toString();

    // 3. สร้าง payload ใหม่: รวม encryptedData + ไฟล์
    const payload = new FormData();
    payload.append("encryptedData", encryptedData);

    // เพิ่มไฟล์ลง payload
    Object.entries(files).forEach(([key, file]) => {
      payload.append(key, file);
    });

    // 4. ส่งไป backend
    const response = await axios.post<ApiResponse>(
      `${config.URL_API}/anatomy/student/update/file/slip`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          "Content-Type": "multipart/form-data",
        },
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
    console.error("Error during registration:", error);
    setUploadProgress(0);
    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};

export const AddScoreRouter = async (
  formDataScroe: UpdateSroceProps,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  try {
    const data = formDataScroe.updates;

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      secretKey
    ).toString();

    const payloadToSend = {
      studentData: encryptedData,
    };

    const response = await axios.post<ApiResponse>(
      `${config.URL_API}/anatomy/student/add/score`,
      payloadToSend,
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
    console.error("Error during registration:", error);
    setUploadProgress(0);
    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};

export const AddCertificateRouter = async (
  formDataCertificate: UpdateCertificateProps,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  try {
    const data = formDataCertificate.updates;

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      secretKey
    ).toString();

    const payloadToSend = {
      studentData: encryptedData,
    };

    const response = await axios.post<ApiResponse>(
      `${config.URL_API}/anatomy/student/add/certificate`,
      payloadToSend,
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
    console.error("Error during registration:", error);
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
