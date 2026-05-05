import axios from "axios";
import { config } from "@/config/config_api";
import CryptoJS from "crypto-js";

export interface ApiResponse {
  success: boolean;
  status?: string; // 'success', 'timeout', 'error'
  message: string;
  data?: any;
  statusCode?: number;
}

interface Paylaods {
  ref1: string;
  ref2: string;
  ref3: string | null;
  transactionDate: string;
  scbToken: string;
}

export const GetScbData = async (options?: {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  ref1?: string;
  page?: number;
  pageSize?: number;
}): Promise<ApiResponse> => {
  try {
    const { dateFrom, dateTo, status, ref1, page, pageSize } = options || {};

    const headers: Record<string, string> = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
    };

    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";

    const payload = {
      dateFrom: dateFrom || "",
      dateTo: dateTo || "",
    };

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey,
    ).toString();
    const encodedEncryptedData = encodeURIComponent(encryptedData);

    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/scb/api/v1/data`,
      {
        headers,
        params: {
          encryptedData: encodedEncryptedData,
        },
      },
    );
    return response.data;
  } catch (error: any) {
    // console.log(error);
    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }
    return {
      success: false,
      message: "ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};

export const GetScbInquiry = async (
  payload: Paylaods,
  visitorId?: string,
): Promise<ApiResponse> => {
  try {
    if (!payload) {
      return {
        success: false,
        message: "ข้อมูลผู้ใช้ไม่สมบูรณ์",
      };
    }
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey,
    ).toString();
    const encodedEncryptedData = encodeURIComponent(encryptedData);

    const headers: Record<string, string> = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
    };
    if (visitorId) headers["X-Visitor-Id"] = visitorId;

    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/scb/api/v1/inquiry`,
      {
        headers,
        params: {
          encryptedData: encodedEncryptedData,
        },
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

export const GetConfirmScb = async (
  visitorId?: string,
  ref2?: string,
  signal?: AbortSignal,
): Promise<ApiResponse> => {
  if (!ref2) {
    return {
      success: false,
      message: "ข้อมูลผู้ใช้ไม่สมบูรณ์",
    };
  }

  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(ref2),
    secretKey,
  ).toString();

  const encodedEncryptedData = encodeURIComponent(encryptedData);

  try {
    const headers: Record<string, string> = {
      Authorization:
        typeof window !== "undefined"
          ? `Bearer ${localStorage.getItem("authToken") || ""}`
          : "",
      "Content-Type": "application/json",
    };
    if (visitorId) headers["X-Visitor-Id"] = visitorId;

    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/scb/api/v1/check/wait`,
      {
        signal,
        headers,
        params: {
          encryptedData: encodedEncryptedData,
        },
        timeout: 600000, // 10 นาที = 600,000 ms
      },
    );
    return response.data;
  } catch (error: any) {
    if (axios.isCancel(error)) {
      throw new DOMException("Aborted", "AbortError");
    }

    return {
      success: false,
      status: error.response?.status === 408 ? "timeout" : "error",
      message: error.response?.data?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ",
    };
  }
};
