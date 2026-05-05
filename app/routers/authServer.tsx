import axios, { AxiosResponse } from "axios";
import {
  AccessToken,
  IAuthModel,
  TokenResponse,
  UserInfo,
} from "../model/authModel";
import { config } from "@/config/config_api";

export const AuthServiceCmu = async ({
  authUrlBase,
  clientId,
  redirectUri,
  scope,
  responseType = "code",
}: IAuthModel): Promise<void> => {
  try {
    // ตรวจสอบพารามิเตอร์ที่จำเป็น
    const requiredParams = { authUrlBase, clientId, redirectUri, scope };
    const missingParams = Object.entries(requiredParams)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingParams.length > 0) {
      throw new Error(
        `Environment variables ไม่ครบถ้วน: ${missingParams.join(", ")}`
      );
    }

    // สร้าง URL สำหรับ OAuth
    const authUrl = new URL(authUrlBase);
    authUrl.searchParams.append("response_type", responseType);
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scope);

    console.log("Redirecting to:", authUrl.toString());
    window.location.href = authUrl.toString();
  } catch (error: any) {
    console.error("เกิดข้อผิดพลาดใน AuthServiceCmu:", error.message);
    throw error;
  }
};

// Change code to token
export const exchangeCodeForToken = async (
  code: string
): Promise<TokenResponse> => {
  try {
    if (!code) {
      throw new Error("No authorization code provided");
    }

    if (!config.URL_API) {
      throw new Error("URL_API environment variable is not defined");
    }
    const response = await axios.post<TokenResponse>(
      `${config.URL_API}/role/auth/exchange-code`,
      { code },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || "Unknown error";
    console.error("Error in exchangeCodeForToken:", errorMessage);
    throw new Error(`Failed to exchange code for token: ${errorMessage}`);
  }
};

export const getUserInfo = async (
  accessToken: AccessToken
): Promise<UserInfo> => {
  try {
    if (!accessToken) {
      throw new Error("No access token provided");
    }
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BASICINFO_URL ?? "",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    if (!response.data) {
      throw new Error("No user info returned from API");
    }
    if (response.data) {
      const add_account: AxiosResponse<any> = await axios.post(
        `${config.URL_API}/role/user/add-account`,
        response.data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (add_account.data?.token) {
        localStorage.setItem("authToken", add_account.data.token);
        return {
          ...response.data,
          token: add_account.data.token,
          userId: add_account.data.user.userId,
          cmuitaccount: add_account.data.user.cmuitaccount,
        };
      }
    }
    return response.data;
  } catch (error: any) {
    console.error("Error in getUserInfo:", error.message);
    throw new Error(`Failed to get user info: ${error.message}`);
  }
};

// ฟังก์ชันตรวจสอบ token
export const verifyToken = async (token: string): Promise<UserInfo | null> => {
  try {
    const response = await axios.get(
      `${config.URL_API}/role/auth/verify-token`, // สมมติว่ามี endpoint นี้ใน backend
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Token verification failed:", error.message);
    return null;
  }
};
