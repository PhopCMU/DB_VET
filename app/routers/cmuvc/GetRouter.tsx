import axios, { AxiosResponse } from "axios";
import { config } from "@/config/config_api";
import CryptoJS from "crypto-js";
import { ApiResponseData } from "@/app/model/cmuvc/paymentModel";

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export const fetchDataListAbstractUser = async (
  date: Date
): Promise<ApiResponse> => {
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

    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/role/abstract/all/user/role/staff`,
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

    console.log(error.response.data.message);

    return {
      success: false,
      message: error.response.data,
    };
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
      }
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
    console.error("Error fetching themes:", error);
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
      }
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
  } catch (error: any) {
    console.error("Error fetching themes:", error);
    if (error.response && error.response.data) {
      return error.response.data as any;
    }
    return undefined; // คืน undefined ถ้ามีข้อผิดพลาด
  }
};

// ส่งข้อมูลแบบแนบ headers authToken Dashboard

export const getParticipantList = async (
  date: Date,
  title?: string
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
      `${config.URL_API}/role/payment/data/approved`,
      {
        headers,
        params: {
          encryptedData: encodedEncryptedData,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error fetching participant data:", error);
    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }
    return undefined;
  }
};

export const GetStudents = async (): Promise<ApiResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/role/api/v1/student/list`,
      {
        headers,
      }
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

export const GetVet = async (): Promise<ApiResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/role/api/v1/vet/list`,
      {
        headers,
      }
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

export const GetPersonnel = async (): Promise<ApiResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get<ApiResponse>(
      `${config.URL_API}/role/api/v1/personnel/list`,
      {
        headers,
      }
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

export const GetPackage = async (
  visitorId: string,
  title?: string
): Promise<ApiResponse> => {
  try {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
      "X-Visitor-Id": visitorId,
    };
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";
    const payload = {
      title: title,
    };

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey
    ).toString();

    const encodedEncryptedData = encodeURIComponent(encryptedData);
    const response = await axios.get(`${config.URL_API}/role/api/v1/packages`, {
      headers,
      params: {
        encryptedData: encodedEncryptedData,
      },
    });

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

export const GetParticipantList_Main = async (
  date: Date,
  visitorId: string,
  title?: string
): Promise<ApiResponse> => {
  try {
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";
    const payload = {
      year: date.getFullYear(),
      title: title,
    };

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey
    ).toString();

    const encodedEncryptedData = encodeURIComponent(encryptedData);
    const response = await axios.get(
      `${config.URL_API}/role/api/v1/participant/list`,
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
    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: "ข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์",
    };
  }
};

export const GetSelector = async (visitorId: string): Promise<ApiResponse> => {
  if (!visitorId) {
    throw new Error("Missing visitorId");
  }

  try {
    const response = await axios.get(`${config.URL_API}/role/api/v1/selector`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
        "Content-Type": "application/json",
        "X-Visitor-Id": visitorId,
      },
    });

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

export const GetSponsorParticipantList = async (
  date: Date,
  visitorId: string,
  title?: string
): Promise<ApiResponse> => {
  try {
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";
    const payload = {
      year: date.getFullYear(),
      title: title,
    };

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey
    ).toString();

    const encodedEncryptedData = encodeURIComponent(encryptedData);
    const response = await axios.get(
      `${config.URL_API}/role/api/v1/sponsors/list`,
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
    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: error.response.data,
    };
  }
};

export const GetBoots = async (
  date: Date,
  visitorId: string
): Promise<ApiResponse> => {
  try {
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";
    const payload = {
      year: date.getFullYear(),
    };

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey
    ).toString();

    const encodedEncryptedData = encodeURIComponent(encryptedData);
    const response = await axios.get(
      `${config.URL_API}/role/api/v1/sponsor/boots/list`,
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
    if (error.response && error.response.data) {
      return error.response.data as ApiResponse;
    }

    return {
      success: false,
      message: error.response.data,
    };
  }
};

export const GetCheckin = async (
  date: Date,
  title?: string
): Promise<ApiResponse> => {
  try {
    const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";
    const payload = {
      year: date.getFullYear(),
      title,
    };

    const encryptedData = CryptoJS.AES.encrypt(
      JSON.stringify(payload),
      secretKey
    ).toString();

    const encodedEncryptedData = encodeURIComponent(encryptedData);
    const response = await axios.get(
      `${config.URL_API}/role/api/v1/end/event/list`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
          "Content-Type": "application/json",
        },
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
