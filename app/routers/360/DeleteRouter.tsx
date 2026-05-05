import axios from "axios";

import { ApiResponse } from "../SCB/GetRouter";
import { config } from "@/config/config_api";
import CryptoJS from "crypto-js";

const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY_CRYPTO_FRONTEND ?? "";

export const deleteDataUser = async (
  accountId: string,
): Promise<ApiResponse> => {
  try {
    const enCyptedAccountId = CryptoJS.AES.encrypt(
      accountId,
      secretKey,
    ).toString();

    const encodedEncryptedData = encodeURIComponent(enCyptedAccountId);

    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
    };
    const response = await axios.delete<ApiResponse>(
      `${config.URL_API}/role/360/hr/remove?data=${encodedEncryptedData}`,
      { headers },
    );
    return response.data;
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      message: error.response?.data?.message || "ข้อผิดพลาดในการลบข้อมูล",
    };
  }
};
