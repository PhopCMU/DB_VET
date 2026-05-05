import axios from "axios";
import { config } from "@/config/config_api";
import CryptoJS from "crypto-js";
import { createProgressSimulator } from "@/utils/ProgressSimulator";

// ประเภทของข้อมูลตอบกลับ
interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface CheckPoint {
  checkPoint: boolean;
  participantId: string;
}

const secretKey: any = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND; // ควรเหมือน backend

export const Post_UpdateFileRouterCryptoJS = async (
  formDataToSend: FormData,
  visitorId: any,
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

    const response = await axios.post<ApiResponse>(
      `${config.URL_API}/role/api/v1/vetrun/payment/update/image`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          "Content-Type": "multipart/form-data",
          "X-Visitor-Id": visitorId,
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

export const Post_UpdateSponsorCryptoJS = async (
  formDataToSend: FormData,
  visitorId: string | null,
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

    const response = await axios.post<ApiResponse>(
      `${config.URL_API}/role/api/v1/vetrun/logo/sponsor/image`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          "Content-Type": "multipart/form-data",
          "X-Visitor-Id": visitorId,
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

export const PostUpdateSlipShirt = async (
  formDataToSend: FormData,
  visitorId: string,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  // 1. แยกไฟล์ออกมาก่อน เพื่อไม่ให้ถูกเข้ารหัส
  const files: Record<string, File> = {};
  const nonFileData: Record<string, any> = {};

  formDataToSend.forEach((value, key) => {
    if (value instanceof File) {
      files[key] = value;
    } else {
      nonFileData[key] = value;
    }
  });

  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(nonFileData),
    secretKey
  ).toString();

  const payload = new FormData();
  payload.append("encryptedData", encryptedData);

  Object.entries(files).forEach(([key, file]) => {
    payload.append(key, file);
  });

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    start();
    const requestPromise = axios.post<ApiResponse>(
      `${config.URL_API}/role/api/v1/vetrun/shirt/slip/image`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          "Content-Type": "multipart/form-data",
          "X-Visitor-Id": visitorId,
        },
      }
    );

    const response = await requestPromise;

    await waitForCompletion();

    // Set progress to 100%
    setUploadProgress(100);

    return {
      success: true,
      data: response.data,
    };
  } catch (error: any) {
    // Stop progress simulation
    stop();
    // Set progress to 0%
    setUploadProgress(0);

    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: "ข้อพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};

export const Post_UpdateCheckPoint = async (
  payload: CheckPoint,
  visitorId: string | null
): Promise<ApiResponse> => {
  try {
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey
    ).toString();

    const response = await axios.post<ApiResponse>(
      `${config.URL_API}/role/api/v1/vetrun/checkpoint`,
      { encryptedData: encryptedData },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          "Content-Type": "multipart/form-data",
          "X-Visitor-Id": visitorId,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error during registration:", error);

    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: error.response.data,
    };
  }
};
