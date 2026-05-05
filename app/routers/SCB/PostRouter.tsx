import axios from "axios";
import { config } from "@/config/config_api";
import CryptoJS from "crypto-js";

// ประเภทของข้อมูลตอบกลับ
interface ApiResponse {
  success?: boolean | string;
  message?: string;
  data?: any;
}

interface Paylaods {
  amount: string;
  ref1: string;
  ref2: string;
  ref3: string;
  scbToken: string;
}

interface PaylaodsVoid {
  transactionId: string;
  transactionDateandTime: string;
  amount: string;
}

const secretKey: any = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND;
let token = "";

if (typeof window !== "undefined") {
  token = localStorage.getItem("authToken") || "";
}

export const PostAccessToken = async () => {
  try {
    const response = await axios.post<ApiResponse>(
      `${config.URL_API}/scb/api/v1/token`,
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

export const PostCreateQrCode = async (
  payload: Paylaods,
  visitorId?: string,
) => {
  try {
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey,
    ).toString();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    if (visitorId) headers["X-Visitor-Id"] = visitorId;

    const response = await axios.post<ApiResponse>(
      `${config.URL_API}/scb/api/v1/qrcode`,
      { encryptedData: encryptedData },
      {
        headers,
      },
    );

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: error.response.data,
    };
  }
};

export const PostVoid = async (payload: PaylaodsVoid, visitorId?: string) => {
  try {
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey,
    ).toString();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    if (visitorId) headers["X-Visitor-Id"] = visitorId;

    const response = await axios.post<ApiResponse>(
      `${config.URL_API}/scb/api/v1/void`,
      { encryptedData: encryptedData },
      {
        headers,
      },
    );

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: error.response.data,
    };
  }
};
