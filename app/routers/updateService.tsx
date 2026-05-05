import axios from "axios";
import { config } from "@/config/config_api";
import CryptoJS from "crypto-js";
import { createProgressSimulator } from "@/utils/ProgressSimulator";

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface MenuItem {
  menuId: string;
  name: string;
  icon: string;
  part: string | null;
  position: number;
}

const secretKey: any = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND;
let token = "";
if (typeof window !== "undefined") {
  token = localStorage.getItem("authToken") || "";
}

export const PutEditMenu_Role = async (
  payload: MenuItem,
  visitorId: string | null,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey
  ).toString();

  const encryptedDataEncoded = encodeURIComponent(encryptedData);

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    start();

    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
      "X-Visitor-Id": visitorId,
    };
    const response = await axios.put<ApiResponse>(
      `${config.URL_API}/role/menu/api/v1/update?encryptedData=${encryptedDataEncoded}`,
      { status: 200 },
      {
        headers,
      }
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

export const PutEditSubMenu_Role = async (
  payload: MenuItem,
  visitorId: string | null,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey
  ).toString();

  const encryptedDataEncoded = encodeURIComponent(encryptedData);

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    start();

    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
      "X-Visitor-Id": visitorId,
    };
    const response = await axios.put<ApiResponse>(
      `${config.URL_API}/role/menu/api/v1/submenu/update?encryptedData=${encryptedDataEncoded}`,
      { status: 200 },
      {
        headers,
      }
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

export const PutprojectToggleClient = async (
  onToggle: boolean,
  visitorId: string | null
): Promise<ApiResponse> => {
  const payload = {
    tileData: "vetrun",
    onToggle,
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
      "X-Visitor-Id": visitorId,
    };
    const response = await axios.put<ApiResponse>(
      `${config.URL_API}/role/api/v1/vetrun/update/status?encryptedData=${encryptedDataEncoded}`,
      { status: 200 },
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
