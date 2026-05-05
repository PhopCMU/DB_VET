import axios, { AxiosResponse } from "axios";
import { config } from "@/config/config_api";
import CryptoJS from "crypto-js";
import { ApiResponseData } from "@/app/model/cmuvc/paymentModel";

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}
interface TrackingParams {
  visitorId: string;
  date: Date;
}
export const GetParticipant_Vetrun = async (
  date: Date
): Promise<ApiResponse | ApiResponseData | undefined> => {
  try {
    if (!date) {
      throw new Error("Missing date");
    }
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
    };
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";
    const year = date.getFullYear();
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(year),
      secretKey
    ).toString();

    const encodedEncryptedData = encodeURIComponent(encryptedData);
    const response: AxiosResponse<ApiResponseData> = await axios.get(
      `${config.URL_API}/role/api/v1/vetrun/payment/data/approved/list`,
      {
        headers,
        params: {
          encryptedData: encodedEncryptedData,
        },
      }
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

export const GetSponsors_Vetrun = async (): Promise<
  ApiResponse | ApiResponseData | undefined
> => {
  try {
    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/vetrun/sponsors`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error during search:", error);

    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: "ข้อพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};

export const GetTracking_Vetrun = async ({
  visitorId,
  date,
}: TrackingParams): Promise<ApiResponse> => {
  // ตรวจสอบ visitorId ก่อน
  if (!visitorId || typeof visitorId !== "string") {
    return {
      success: false,
      message: "ข้อมูลผู้ใช้ไม่สมบูรณ์",
    };
  }

  if (!date) {
    return {
      success: false,
      message: "ไม่มีข้อมูลวันที่",
    };
  }
  const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";
  const year = date.getFullYear();
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(year),
    secretKey
  ).toString();

  try {
    const encodedEncryptedData = encodeURIComponent(encryptedData);
    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/role/api/v1/vetrun/tracking`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          "Content-Type": "application/json",
          "X-Visitor-Id": visitorId,
        },
        params: {
          encryptedData: encodedEncryptedData,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error during tracking fetch:", error);

    // กรณีมี response จากเซิร์ฟเวอร์ (เช่น 400, 500)
    if (error.response?.data) {
      return error.response.data as ApiResponse;
    }

    // กรณี network error หรือไม่สามารถติดต่อเซิร์ฟเวอร์ได้
    return {
      success: false,
      message: "ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};
