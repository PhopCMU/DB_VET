import { config } from "@/config/config_api";
import axios from "axios";

interface SuperAdminResponse {
  success: boolean;
  ids: Array<{
    userSuperAdminId: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

// export const SUPER_ADMIN_IDS = [
//   "f07100fa-8689-4eaf-bdaf-6d214e5b7d25",
//   "f07100fa-8689-4eaf-bdaf-6d214e5b7d2b",
// ] as string[];

export const SUPER_ADMIN_IDS = async () => {
  try {
    const headers = {
      Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
      "Content-Type": "application/json",
    };

    const response = await axios.get<SuperAdminResponse>(
      `${config.URL_API}/role/user/api/v1/ids`,
      {
        headers,
      }
    );

    if (response.data.success) {
      const ids = response.data.ids.map((item) => item.userId);
      // console.log("Mapped super admin user IDs:", ids);
      return ids;
    }
  } catch (error) {
    // console.error("Error fetching super admin IDs:", error);
    return [];
  }
};
