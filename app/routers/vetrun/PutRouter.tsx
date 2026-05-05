import axios from "axios";
import { config } from "@/config/config_api";
import CryptoJS from "crypto-js";
import { createProgressSimulator } from "@/utils/ProgressSimulator";
import { Employees } from "@/app/model/vetrun/employees";

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

type PutUpdatePaymentPayload = {
  id: string;
};

const secretKey: any = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND;
let token = "";
if (typeof window !== "undefined") {
  token = localStorage.getItem("authToken") || "";
}

export const putUpdatePayment_vetrun = async (
  participantId: PutUpdatePaymentPayload,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(participantId),
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
    };
    const response = await axios.put<ApiResponse>(
      `${config.URL_API}/role/api/v1/vetrun/payment/data/approved?encryptedData=${encryptedDataEncoded}`,
      {},
      {
        headers,
      }
    );

    await waitForCompletion();
    setUploadProgress(100);

    return response.data;
  } catch (error: any) {
    stop();
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

export const PutEditParticipant_vetrun = async (
  payload: Employees,
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
      `${config.URL_API}/role/api/v1/vetrun/participant/update?encryptedData=${encryptedDataEncoded}`,
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

export const PutEditAnimal_vetrun = async (
  payload: Paylaods,
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
      `${config.URL_API}/role/api/v1/vetrun/animal/update?encryptedData=${encryptedDataEncoded}`,
      {},
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

export const PutUpdateStatusSaleShirt = async (
  userId: string,
  visitorId: string,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  let apiUrl = "/role/api/v1/vetrun/shirt/payment/update/approved";

  // CryptoJS
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(userId),
    secretKey
  ).toString();

  // encodeURIComponent
  const encryptedDataEncoded = encodeURIComponent(encryptedData);

  // Create progress simulator
  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    // Start progress simulation
    start();
    // Request to server
    const requestPromise = axios.put<ApiResponse>(
      `${config.URL_API}${apiUrl}`,
      { status: 200 },
      {
        params: {
          encryptedData: encryptedDataEncoded,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-visitor-Id": visitorId,
        },
      }
    );

    // Wait for the request to complete and the progress simulation to finish
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

export const PutUpdateTracking = async (
  userId: string,
  trackingValue: string,
  visitorId: string,
  setUploadProgress: (progress: number) => void
): Promise<ApiResponse> => {
  let apiUrl = "/role/api/v1/vetrun/tracking/update";

  const payload = {
    userId,
    trackingValue,
  };

  // CryptoJS
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey
  ).toString();

  // encodeURIComponent
  const encryptedDataEncoded = encodeURIComponent(encryptedData);

  // Create progress simulator
  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    // Start progress simulation
    start();
    // Request to server
    const requestPromise = axios.put<ApiResponse>(
      `${config.URL_API}${apiUrl}`,
      { status: 200 },
      {
        params: {
          encryptedData: encryptedDataEncoded,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-visitor-Id": visitorId,
        },
      }
    );

    // Wait for the request to complete and the progress simulation to finish
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
