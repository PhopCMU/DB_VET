import axios from "axios";
import CryptoJS from "crypto-js";
import { config } from "@/config/config_api";
import { createProgressSimulator } from "@/utils/ProgressSimulator";

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

const secretKey: any = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND;
let token = "";
if (typeof window !== "undefined") {
  token = localStorage.getItem("authToken") || "";
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};
export const Delete_Vets = async (
  accountId: string,
  setUploadProgress: (progress: number) => void,
): Promise<ApiResponse> => {
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(accountId),
    secretKey,
  ).toString();

  const encodedEncryptedData = encodeURIComponent(encryptedData);

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    start();

    const response = await axios.delete<ApiResponse>(
      `${config.URL_API}/role/api/v1/vet/delete`,
      { headers, params: { encryptedData: encodedEncryptedData } },
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

export const Delete_Students = async (
  studentId: string,
  setUploadProgress: (progress: number) => void,
): Promise<ApiResponse> => {
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(studentId),
    secretKey,
  ).toString();

  const encodedEncryptedData = encodeURIComponent(encryptedData);

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    start();

    const response = await axios.delete<ApiResponse>(
      `${config.URL_API}/role/api/v1/student/delete`,
      { headers, params: { encryptedData: encodedEncryptedData } },
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

export const Delete_Personnel = async (
  personnelId: string,
  visitorId: string,
  setUploadProgress: (progress: number) => void,
): Promise<ApiResponse> => {
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(personnelId),
    secretKey,
  ).toString();

  const encodedEncryptedData = encodeURIComponent(encryptedData);

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    start();

    const response = await axios.delete<ApiResponse>(
      `${config.URL_API}/role/api/v1/person/delete`,

      {
        params: { encryptedData: encodedEncryptedData },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Visitor-Id": visitorId,
        },
      },
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

export const Delete_Participant = async (
  participantId: string,
  title: string,
  setUploadProgress: (progress: number) => void,
): Promise<ApiResponse> => {
  const payload = {
    participantId,
    title,
  };

  let apiUrl;
  if (title === "main") apiUrl = "/role/api/v1/participant/main/delete";
  if (title === "pre") apiUrl = "/role/api/v1/participant/pre/delete";
  if (title === "tsar") apiUrl = "/role/api/v1/participant/tsar/delete";

  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey,
  ).toString();

  const encodedEncryptedData = encodeURIComponent(encryptedData);

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    start();

    const response = await axios.delete<ApiResponse>(
      `${config.URL_API}${apiUrl}`,

      {
        params: { encryptedData: encodedEncryptedData },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
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

export const Delete_Abstract = async (
  abstractId: string,
  setUploadProgress: (progress: number) => void,
): Promise<ApiResponse> => {
  const apiUrl = "/role/abstract/delete";
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(abstractId),
    secretKey,
  ).toString();

  const encodedEncryptedData = encodeURIComponent(encryptedData);

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    start();

    const response = await axios.delete<ApiResponse>(
      `${config.URL_API}${apiUrl}`,

      {
        params: { encryptedData: encodedEncryptedData },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
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

export const Delete_Sponsor = async (
  sponsorsParticipantsId: string,

  setUploadProgress: (progress: number) => void,
): Promise<ApiResponse> => {
  const apiUrl = "/role/api/v1/sponsor/delete";
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(sponsorsParticipantsId),
    secretKey,
  ).toString();

  const encodedEncryptedData = encodeURIComponent(encryptedData);

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    start();

    const response = await axios.delete<ApiResponse>(
      `${config.URL_API}${apiUrl}`,

      {
        params: { encryptedData: encodedEncryptedData },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
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
      message: error.response.data || "ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};

export const Delete_boot_Sponsor = async (
  sponsorBootId: string,
  setUploadProgress: (progress: number) => void,
): Promise<ApiResponse> => {
  const apiUrl = "/role/api/v1/sponsor/boot/delete";
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(sponsorBootId),
    secretKey,
  ).toString();

  const encodedEncryptedData = encodeURIComponent(encryptedData);

  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);

  try {
    start();

    const response = await axios.delete<ApiResponse>(
      `${config.URL_API}${apiUrl}`,

      {
        params: { encryptedData: encodedEncryptedData },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
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
      message: error.response.data || "ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};
