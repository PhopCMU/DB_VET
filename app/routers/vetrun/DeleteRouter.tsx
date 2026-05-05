import axios from "axios";
import CryptoJS from "crypto-js";
import { config } from "@/config/config_api";
import { createProgressSimulator } from "@/utils/ProgressSimulator";

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

interface Paylaods {
  participantId: string;
  animalId: string;
  transferFile: string;
}

const secretKey: any = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND;
let token = "";
if (typeof window !== "undefined") {
  token = localStorage.getItem("authToken") || "";
}

export const DeleteVetrunSponsorLogo = async (
  sponsorId: string,
  visitorId: string | null,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(sponsorId),
    secretKey
  ).toString();

  const encodedEncryptedData = encodeURIComponent(encryptedData);

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    start();

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Visitor-Id": visitorId,
    };

    const response = await axios.delete<ApiResponse>(
      `${config.URL_API}/role/api/v1/vetrun/sponsor/logo/delete`,
      { headers, params: { encryptedData: encodedEncryptedData } }
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

export const DeleteVetrunParticipant = async (
  payload: Paylaods,
  visitorId: string | null,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey
  ).toString();

  const encodedEncryptedData = encodeURIComponent(encryptedData);

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    start();

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Visitor-Id": visitorId,
    };

    const response = await axios.delete<ApiResponse>(
      `${config.URL_API}/role/api/v1/vetrun/participant/delete`,
      { headers, params: { encryptedData: encodedEncryptedData } }
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

export const DeletedVetrunOrderShirt = async (
  userId: string,
  visitorId: string,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(userId),
    secretKey
  ).toString();

  const encodedEncryptedData = encodeURIComponent(encryptedData);

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    start();

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Visitor-Id": visitorId,
    };

    const response = await axios.delete<ApiResponse>(
      `${config.URL_API}/role/api/v1/vetrun/shirt/order/delete`,
      { headers, params: { encryptedData: encodedEncryptedData } }
    );

    await waitForCompletion();
    setUploadProgress(100);

    return response.data;
  } catch (e: any) {
    stop();
    setUploadProgress(0);

    if (e.response && e.response.data) {
      return e.response.data as ApiResponse;
    }

    return {
      success: false,
      message: "ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};
