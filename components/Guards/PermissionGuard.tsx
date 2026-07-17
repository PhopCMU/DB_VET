"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/context/UserContext";
import { motion } from "framer-motion";

interface PermissionGuardProps {
  submenuIdCode: string;
  redirectTo?: string;
}

export default function PermissionGuard({
  submenuIdCode,
  redirectTo = "/dashboard",
}: PermissionGuardProps) {
  const { userData, isSuperAdmin, loading } = useUser();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [redirected, setRedirected] = useState(false);

  // ตรวจสอบว่ามีข้อมูลครบหรือยัง
  const isReady = !loading && userData !== null && userData !== undefined;

  useEffect(() => {
    if (!isReady || redirected) return;

    // ใช้ setTimeout เพื่อรอให้ isSuperAdmin อัปเดต
    const timer = setTimeout(() => {
      let hasPermission = false;

      if (isSuperAdmin === true) {
        hasPermission = true;
      } else if (userData?.UserPermission) {
        hasPermission = userData.UserPermission.some(
          (p: any) => p.submenuId === submenuIdCode,
        );
      }

      // console.log("ตรวจสอบสิทธิ์หลังหน่วงเวลา:");
      // console.log("isSuperAdmin:", isSuperAdmin);
      // console.log("hasPermission:", hasPermission);

      if (!hasPermission) {
        router.replace(redirectTo);
        setRedirected(true);
      } else {
        setChecked(true);
      }
    }, 1000); // หน่วง 300ms — ปรับตามความเหมาะสม

    // cleanup
    return () => clearTimeout(timer);
  }, [
    isReady,
    isSuperAdmin,
    userData,
    submenuIdCode,
    redirectTo,
    router,
    redirected,
  ]);

  // ระหว่างรอ → แสดง loading (fixed เต็มจอเพื่อไม่ให้เนื้อหาอื่นแสดงซ้อนใต้ loading นี้)
  if (!checked) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-100 p-4">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/60">
          {/* Spinner ที่ทันสมัยด้วยการ animate */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <span className="material-symbols-outlined absolute text-blue-500 text-xl">
              verified
            </span>
          </div>

          {/* ข้อความ */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-700 font-medium mb-2"
          >
            กำลังตรวจสอบสิทธิ์
          </motion.p>

          {/* Progress bar */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="h-1 bg-blue-200 rounded-full overflow-hidden mt-4"
          >
            <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 animate-pulse"></div>
          </motion.div>

          {/* ข้อความรอง */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-500 text-xs mt-3"
          >
            กรุณารอสักครู่...
          </motion.p>
        </div>
      </div>
    );
  }

  return null;
}
