"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { verifyToken } from "@/app/routers/authServer";
import { UserInfoGet } from "@/app/model/authModel";
import { useRouter } from "next/navigation";
import { SUPER_ADMIN_IDS } from "../lib/constants";

type UserContextType = {
  userData: UserInfoGet | null | any;
  loading: boolean;
  refreshUserData: () => Promise<void>;
  clearUserData: () => void;
  logout: () => void;
  isSuperAdmin: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export default function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserInfoGet | null>(null);
  const [loading, setLoading] = useState(true);
  const [superAdminIds, setSuperAdminIds] = useState<string[]>([]);
  const hasCheckedAuth = useRef(false);
  const router = useRouter();

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (token) {
        // ดึง userData และ superAdminIds พร้อมกัน แล้วค่อย set state ทีเดียว
        // เพื่อป้องกันไม่ให้ isSuperAdmin เปลี่ยนค่าหลังจาก userData ถูก set แล้ว
        // (ซึ่งจะทำให้ effect ที่ depend ทั้งคู่ยิงซ้ำ และเรียก API ซ้ำ เช่น /role/project)
        const [response, superAdminResponse] = await Promise.all([
          verifyToken(token),
          SUPER_ADMIN_IDS().catch(() => [] as string[]),
        ]);

        if (response && response.data) {
          setSuperAdminIds((superAdminResponse as any) || []);
          setUserData(response.data as UserInfoGet);
        } else {
          if (
            response &&
            response.status === 401 &&
            response.statusText === "Unauthorized"
          ) {
            router.replace("/");
          }
          localStorage.removeItem("authToken");
          setUserData(null);
        }
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("Failed to verify token:", error);
      localStorage.removeItem("authToken");
      setUserData(null);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    setLoading(true);
    await fetchUserData();
  };

  const clearUserData = () => {
    localStorage.removeItem("authToken");
    setUserData(null);
  };

  const logout = () => {
    localStorage.clear();
    router.push("/"); // เปลี่ยนเส้นทางไปหน้า login
  };

  // โหลด super admin IDs จาก API พร้อมกับ userData (ดู fetchUserData ด้านบน)
  useEffect(() => {
    if (hasCheckedAuth.current) return;

    fetchUserData();
    hasCheckedAuth.current = true;
  }, []);

  return (
    <UserContext.Provider
      value={{
        userData,
        loading,
        isSuperAdmin: userData
          ? superAdminIds.includes(userData.userId)
          : false,
        refreshUserData,
        clearUserData,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
