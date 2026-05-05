import axios from "axios";
import { config } from "@/config/config_api";
import CryptoJS from "crypto-js";
import {
  CmuvcPersonnel,
  CmuvcStudents,
  CmuvcVet,
} from "@/app/model/cmuvc/dashboardModel";
import { createProgressSimulator } from "@/utils/ProgressSimulator";

// ประเภทของข้อมูลตอบกลับ
interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

const secretKey: any = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND;

export const Cmuvc_UpdateFileRouterCryptoJS = async (
  formDataToSend: FormData,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
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

  let partApi;

  if (nonFileData["type"] === "participant") {
    partApi = `${config.URL_API}/role/payment/participant/update/image`;
  } else if (nonFileData["type"] === "abstract") {
    partApi = `${config.URL_API}/role/payment/abstract/update/image`;
  } else {
    partApi = `${config.URL_API}/role/abstract/update/file`;
  }

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);
  try {
    start();
    // 4. ส่งไป backend
    const response = await axios.post<ApiResponse>(partApi, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        "Content-Type": "multipart/form-data",
      },
    });

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
      message: "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};

export const Cmuvc_Create_Vet_Router_CryptoJS = async (
  payload: CmuvcVet,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  if (!payload) {
    return {
      success: false,
      message: "ข้อมูลไม่ครบถ้วน",
    };
  }

  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey
  ).toString();

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    // Start the progress simulation
    start();
    // Request to the server
    const requestPromise = axios.post<ApiResponse>(
      `${config.URL_API}/role/api/v1/vet/create`,
      { encryptedData: encryptedData },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          "Content-Type": "application/json",
        },
      }
    );

    const response = await requestPromise;

    await waitForCompletion();
    // Set progress to 100%
    setUploadProgress(100);

    // Return the response
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

export const Cmuvc_Create_Student_Router_CryptoJS = async (
  payload: CmuvcStudents,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  if (!payload) {
    return {
      success: false,
      message: "ข้อมูลไม่ครบถ้วน",
    };
  }

  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey
  ).toString();

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    // Start the progress simulation
    start();
    // Request to the server
    const requestPromise = axios.post<ApiResponse>(
      `${config.URL_API}/role/api/v1/student/create`,
      { encryptedData: encryptedData },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          "Content-Type": "application/json",
        },
      }
    );

    const response = await requestPromise;

    await waitForCompletion();
    // Set progress to 100%
    setUploadProgress(100);

    // Return the response
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

export const Cmuvc_Create_Person_Router_CryptoJs = async (
  payload: CmuvcPersonnel,
  visitorId: string,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  if (!payload) {
    return {
      success: false,
      message: "ข้อมูลไม่ครบถ้วน",
    };
  }

  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey
  ).toString();

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    // Start the progress simulation
    start();
    // Request to the server
    const requestPromise = axios.post<ApiResponse>(
      `${config.URL_API}/role/api/v1/person/create`,
      { encryptedData: encryptedData },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          "Content-Type": "application/json",
          "X-Visitor-Id": visitorId,
        },
      }
    );

    const response = await requestPromise;

    await waitForCompletion();
    // Set progress to 100%
    setUploadProgress(100);

    // Return the response
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
      message: error.response.data,
    };
  }
};

export const Cmuvc_Create_Sponsor = async (
  payload: any,
  visitorId: string,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  if (!payload) {
    return {
      success: false,
      message: "ข้อมูลไม่ครบถ้วน",
    };
  }

  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey
  ).toString();

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    // Start the progress simulation
    start();
    // Request to the server
    const requestPromise = axios.post<ApiResponse>(
      `${config.URL_API}/role/api/v1/sponsor/create`,
      { encryptedData: encryptedData },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          "Content-Type": "application/json",
          "X-Visitor-Id": visitorId,
        },
      }
    );

    const response = await requestPromise;

    await waitForCompletion();
    // Set progress to 100%
    setUploadProgress(100);

    // Return the response
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
      message: error.response.data,
    };
  }
};

export const Cmuvc_Create_Sponsor_Boot = async (
  payload: any,
  visitorId: string,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  if (!payload) {
    return {
      success: false,
      message: "ข้อมูลไม่ครบถ้วน",
    };
  }

  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey
  ).toString();

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    // Start the progress simulation
    start();
    // Request to the server
    const requestPromise = axios.post<ApiResponse>(
      `${config.URL_API}/role/api/v1/sponsor/boot/create`,
      { encryptedData: encryptedData },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          "Content-Type": "application/json",
          "X-Visitor-Id": visitorId,
        },
      }
    );

    const response = await requestPromise;

    await waitForCompletion();
    // Set progress to 100%
    setUploadProgress(100);

    // Return the response
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
      message: error.response.data,
    };
  }
};
