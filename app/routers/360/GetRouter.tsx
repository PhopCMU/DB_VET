import axios from "axios";
import { config } from "@/config/config_api";
import CryptoJS from "crypto-js";

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}
const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";

export const encryptPayload = (data: any): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

export const decryptPayload = (encryptedData: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted ? JSON.parse(decrypted) : null;
};

export const RolefetchDataListUser = async (
  year?: number,
  agency?: string,
): Promise<ApiResponse> => {
  try {
    if (!agency && !year) {
      throw new Error("Missing agency or year data");
    }

    const payload = { year, agency };

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey,
    ).toString();

    const encodedEncryptedData = encodeURIComponent(encryptedData);

    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
    };
    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/role/360/user`,
      {
        headers,
        params: {
          encryptedData: encodedEncryptedData,
        },
      },
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

export const fetchDataListUser = async (): Promise<ApiResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
    };
    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/role/360/hr`,
      {
        headers,
      },
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
