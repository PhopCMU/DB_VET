import axios, { AxiosResponse } from "axios";
import { config } from "@/config/config_api";
import CryptoJS from "crypto-js";
import { ApiResponseData } from "@/app/model/cmuvc/paymentModel";

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

const GENERIC_ERROR_MESSAGE = "ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";

/**
 * Builds request headers with the stored auth token.
 * NOTE: token source (localStorage) is a repo-wide pattern; migrating to
 * HttpOnly cookies requires a broader, app-level change and is out of
 * scope for this file (see .agents/.reports/CMUVC-GetRouter-Security-Review.md).
 */
const getAuthHeaders = (extra?: Record<string, string>) => ({
  Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
  "Content-Type": "application/json",
  ...extra,
});

const isValidDate = (date: unknown): date is Date =>
  date instanceof Date && !Number.isNaN(date.getTime());

/**
 * Trims and caps free-text input length to reduce malformed/oversized
 * payloads. Backend must still validate/escape values before use.
 */
const sanitizeText = (value?: string, maxLength = 200): string | undefined => {
  if (typeof value !== "string") return undefined;
  return value.trim().slice(0, maxLength) || undefined;
};

/**
 * Normalizes error handling so raw backend/error internals are never
 * leaked to the caller/UI, while still logging details for debugging.
 */
const safeErrorResponse = (
  error: unknown,
  context: string,
  fallbackMessage: string = GENERIC_ERROR_MESSAGE,
): ApiResponse => {
  console.error(`[${context}]`, error);

  if (
    axios.isAxiosError(error) &&
    error.response?.data &&
    typeof error.response.data === "object"
  ) {
    const data = error.response.data as Partial<ApiResponse>;
    return {
      success: false,
      message:
        typeof data.message === "string" ? data.message : fallbackMessage,
    };
  }

  return {
    success: false,
    message: fallbackMessage,
  };
};

export const fetchDataListAbstractUser = async (
  date: Date,
): Promise<ApiResponse> => {
  try {
    if (!isValidDate(date)) {
      throw new Error("Missing or invalid date");
    }
    const headers = getAuthHeaders();
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";
    const year = date.getFullYear();
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(year),
      secretKey,
    ).toString();

    const encodedEncryptedData = encodeURIComponent(encryptedData);

    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/role/abstract/all/user/role/staff`,
      {
        headers,
        params: {
          encryptedData: encodedEncryptedData,
        },
      },
    );
    return response.data;
  } catch (error) {
    return safeErrorResponse(error, "fetchDataListAbstractUser");
  }
};

export const getFoods = async (): Promise<any[] | undefined> => {
  try {
    const food: AxiosResponse<any[]> = await axios.get<any[]>(
      `${config.URL_API}/cmuvc/foods`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      },
    );
    if (food?.data?.length > 0) {
      const sanitizedData: any[] = food.data.map((item: any) => ({
        ...item,
        foodId: item.foodId,
        foodType: item.foodType,
      }));
      return sanitizedData;
    }
    return undefined;
  } catch (error) {
    console.error("[getFoods]", error);
    return undefined; // คืน undefined ถ้ามีข้อผิดพลาด
  }
};

export const getAdstractType = async (): Promise<any[] | undefined> => {
  try {
    const abstract: AxiosResponse<any[]> = await axios.get<any[]>(
      `${config.URL_API}/cmuvc/abstract`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      },
    );
    if (abstract?.data?.length > 0) {
      const sanitizedData: any[] = abstract.data.map((item: any) => ({
        ...item,
        abstractTypeId: item.abstractTypeId,
        adstractType: item.adstractType,
      }));
      return sanitizedData;
    }
    return undefined;
  } catch (error) {
    console.error("[getAdstractType]", error);
    return undefined; // คืน undefined ถ้ามีข้อผิดพลาด
  }
};

// ส่งข้อมูลแบบแนบ headers authToken Dashboard

export const getParticipantList = async (
  date: Date,
  title?: string,
): Promise<ApiResponse | ApiResponseData | undefined> => {
  try {
    if (!isValidDate(date)) {
      throw new Error("Missing or invalid date");
    }
    const headers = getAuthHeaders();
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";
    const year = date.getFullYear();
    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(year),
      secretKey,
    ).toString();

    const encodedEncryptedData = encodeURIComponent(encryptedData);
    const response: AxiosResponse<ApiResponseData> = await axios.get(
      `${config.URL_API}/role/payment/data/approved`,
      {
        headers,
        params: {
          encryptedData: encodedEncryptedData,
        },
      },
    );

    return response.data;
  } catch (error) {
    return safeErrorResponse(error, "getParticipantList");
  }
};

export const GetStudents = async (): Promise<ApiResponse> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/role/api/v1/student/list`,
      {
        headers,
      },
    );
    return response.data;
  } catch (error) {
    return safeErrorResponse(error, "GetStudents");
  }
};

export const GetVet = async (): Promise<ApiResponse> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/role/api/v1/vet/list`,
      {
        headers,
      },
    );
    return response.data;
  } catch (error) {
    return safeErrorResponse(error, "GetVet");
  }
};

export const GetPersonnel = async (): Promise<ApiResponse> => {
  try {
    const headers = getAuthHeaders();

    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/role/api/v1/personnel/list`,
      {
        headers,
      },
    );
    return response.data;
  } catch (error) {
    return safeErrorResponse(error, "GetPersonnel");
  }
};

export const GetPackage = async (
  visitorId: string,
  title?: string,
): Promise<ApiResponse> => {
  try {
    if (!visitorId || typeof visitorId !== "string") {
      throw new Error("Missing or invalid visitorId");
    }
    const headers = getAuthHeaders({ "X-Visitor-Id": visitorId });
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";
    const payload = {
      title: sanitizeText(title),
    };

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey,
    ).toString();

    const encodedEncryptedData = encodeURIComponent(encryptedData);
    const response = await axios.get(`${config.URL_API}/role/api/v1/packages`, {
      headers,
      params: {
        encryptedData: encodedEncryptedData,
      },
    });

    return response.data;
  } catch (error) {
    return safeErrorResponse(error, "GetPackage");
  }
};

export const GetParticipantList_Main = async (
  date: Date,
  visitorId: string,
  title?: string,
): Promise<ApiResponse> => {
  try {
    if (!isValidDate(date)) {
      throw new Error("Missing or invalid date");
    }
    if (!visitorId || typeof visitorId !== "string") {
      throw new Error("Missing or invalid visitorId");
    }
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";
    const payload = {
      year: date.getFullYear(),
      title: sanitizeText(title),
    };

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey,
    ).toString();

    const encodedEncryptedData = encodeURIComponent(encryptedData);
    const response = await axios.get(
      `${config.URL_API}/role/api/v1/participant/list`,
      {
        headers: getAuthHeaders({ "X-Visitor-Id": visitorId }),
        params: {
          encryptedData: encodedEncryptedData,
        },
      },
    );

    return response.data;
  } catch (error) {
    return safeErrorResponse(error, "GetParticipantList_Main");
  }
};

export const GetSelector = async (visitorId: string): Promise<ApiResponse> => {
  try {
    if (!visitorId || typeof visitorId !== "string") {
      throw new Error("Missing or invalid visitorId");
    }

    const response = await axios.get(`${config.URL_API}/role/api/v1/selector`, {
      headers: getAuthHeaders({ "X-Visitor-Id": visitorId }),
    });

    return response.data;
  } catch (error) {
    return safeErrorResponse(error, "GetSelector");
  }
};

export const GetSponsorParticipantList = async (
  date: Date,
  visitorId: string,
  title?: string,
): Promise<ApiResponse> => {
  try {
    if (!isValidDate(date)) {
      throw new Error("Missing or invalid date");
    }
    if (!visitorId || typeof visitorId !== "string") {
      throw new Error("Missing or invalid visitorId");
    }
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";
    const payload = {
      year: date.getFullYear(),
      title: sanitizeText(title),
    };

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey,
    ).toString();

    const encodedEncryptedData = encodeURIComponent(encryptedData);
    const response = await axios.get(
      `${config.URL_API}/role/api/v1/sponsors/list`,
      {
        headers: getAuthHeaders({ "X-Visitor-Id": visitorId }),
        params: {
          encryptedData: encodedEncryptedData,
        },
      },
    );

    return response.data;
  } catch (error) {
    return safeErrorResponse(error, "GetSponsorParticipantList");
  }
};

export const GetBoots = async (
  date: Date,
  visitorId: string,
): Promise<ApiResponse> => {
  try {
    if (!isValidDate(date)) {
      throw new Error("Missing or invalid date");
    }
    if (!visitorId || typeof visitorId !== "string") {
      throw new Error("Missing or invalid visitorId");
    }
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";
    const payload = {
      year: date.getFullYear(),
    };

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey,
    ).toString();

    const encodedEncryptedData = encodeURIComponent(encryptedData);
    const response = await axios.get(
      `${config.URL_API}/role/api/v1/sponsor/boots/list`,
      {
        headers: getAuthHeaders({ "X-Visitor-Id": visitorId }),
        params: {
          encryptedData: encodedEncryptedData,
        },
      },
    );

    return response.data;
  } catch (error) {
    return safeErrorResponse(error, "GetBoots");
  }
};

export const GetCheckin = async (
  date: Date,
  title?: string,
): Promise<ApiResponse> => {
  try {
    if (!isValidDate(date)) {
      throw new Error("Missing or invalid date");
    }
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";
    const payload = {
      year: date.getFullYear(),
      title: sanitizeText(title),
    };

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey,
    ).toString();

    const encodedEncryptedData = encodeURIComponent(encryptedData);
    const response = await axios.get(
      `${config.URL_API}/role/api/v1/end/event/list`,
      {
        headers: getAuthHeaders(),
        params: {
          encryptedData: encodedEncryptedData,
        },
      },
    );

    return response.data;
  } catch (error) {
    return safeErrorResponse(error, "GetCheckin");
  }
};
