import axios from "axios";
import { config } from "@/config/config_api";
import CryptoJS from "crypto-js";
import { AbstractDataModel } from "@/app/model/cmuvc/abstractModel";
import {
  CmuvcParticipant,
  CmuvcPersonnel,
  CmuvcStudents,
  CmuvcVet,
} from "@/app/model/cmuvc/dashboardModel";
import { createProgressSimulator } from "@/utils/ProgressSimulator";
import { param } from "framer-motion/client";

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

export const putUpdateAbstactText = async (
  payload: AbstractDataModel,
  setUploadProgress: (progress: number) => void,
): Promise<ApiResponse> => {
  try {
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey,
    ).toString();

    const encryptedDataEncoded = encodeURIComponent(encryptedData);

    const response = await axios.put<ApiResponse>(
      `${config.URL_API}/role/abstract/update/text?abstractData=${encryptedDataEncoded}`,
      {},
      {
        headers,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          setUploadProgress(percent);
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error during update student text:", error);

    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: "ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};

export const putUpdateAbstactStatus = async (
  payload: string,
  setUploadProgress: (progress: number) => void,
): Promise<ApiResponse> => {
  try {
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey,
    ).toString();

    const encryptedDataEncoded = encodeURIComponent(encryptedData);

    const response = await axios.put<ApiResponse>(
      `${config.URL_API}/role/abstract/update/status?abstractData=${encryptedDataEncoded}`,
      {},
      {
        headers,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          setUploadProgress(percent);
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error during update student image:", error);

    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: "ข้อพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};

export const putUpdate_Participant_Abstract_Image = async (
  payload: { id: string; type: string },
  setUploadProgress: (progress: number) => void,
): Promise<ApiResponse> => {
  try {
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey,
    ).toString();

    const encryptedDataEncoded = encodeURIComponent(encryptedData);

    const response = await axios.put<ApiResponse>(
      `${config.URL_API}/role/payment/update/status`,
      {},
      {
        params: {
          paymentData: encryptedDataEncoded,
        },
        headers,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1),
          );
          setUploadProgress(percent);
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error("Error during update student image:", error);

    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: "ข้อพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};

export const PutEditVetlist = async (
  payload: CmuvcVet,
  setUploadProgress: (progress: number) => void,
): Promise<ApiResponse> => {
  // CryptoJS
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey,
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
      `${config.URL_API}/role/api/v1/vet/edit`,
      {},
      {
        params: {
          encryptedData: encryptedDataEncoded,
        },
        headers,
      },
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

export const PutEditStudentlist = async (
  payload: CmuvcStudents,
  setUploadProgress: (progress: number) => void,
): Promise<ApiResponse> => {
  // CryptoJS
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey,
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
      `${config.URL_API}/role/api/v1/student/edit`,
      {},
      {
        params: {
          encryptedData: encryptedDataEncoded,
        },
        headers,
      },
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

export const PutEditPersonlist = async (
  payload: CmuvcPersonnel,
  visitorId: string,
  setUploadProgress: (progress: number) => void,
): Promise<ApiResponse> => {
  // CryptoJS
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey,
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
      `${config.URL_API}/role/api/v1/person/edit`,
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
      },
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

export const PutEditParticipant = async (
  data: CmuvcParticipant,

  title: string,
  setUploadProgress: (progress: number) => void,
): Promise<ApiResponse> => {
  const payload = {
    data,
    title,
  };

  let apiUrl;
  if (title === "main") apiUrl = "/role/api/v1/participant/main/edit";
  if (title === "pre") apiUrl = "/role/api/v1/participant/pre/edit";

  // CryptoJS
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey,
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
        },
      },
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

export const Cmuvc_Edit_Sponsor = async (
  payload: any,

  setUploadProgress: (progress: number) => void,
) => {
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey,
  ).toString();

  // encodeURIComponent
  const encryptedDataEncoded = encodeURIComponent(encryptedData);
  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);
  try {
    start();

    const responseFromEdit = await axios.put(
      `${config.URL_API}/role/api/v1/sponsor/edit`,
      { status: 200 },
      {
        params: {
          encryptedData: encryptedDataEncoded,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    await waitForCompletion();
    setUploadProgress(100);

    return {
      success: true,
      data: responseFromEdit.data,
    };
  } catch (error) {
    stop();
    setUploadProgress(0);
    console.error("Error during edit sponsor:", error);
    return {
      success: false,
      message: "ข้อพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};
export const Cmuvc_Edit_Sponsor_Boot = async (
  payload: any,
  setUploadProgress: (progress: number) => void,
) => {
  const encryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey,
  ).toString();

  // encodeURIComponent
  const encryptedDataEncoded = encodeURIComponent(encryptedData);
  const { start, stop, waitForCompletion } =
    createProgressSimulator(setUploadProgress);
  try {
    start();

    const responseFromEdit = await axios.put(
      `${config.URL_API}/role/api/v1/sponsor/boot/edit`,
      { status: 200 },
      {
        params: {
          encryptedData: encryptedDataEncoded,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    await waitForCompletion();
    setUploadProgress(100);

    return {
      success: true,
      data: responseFromEdit.data,
    };
  } catch (error) {
    stop();
    setUploadProgress(0);
    console.error("Error during edit sponsor:", error);
    return {
      success: false,
      message: "ข้อพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};
