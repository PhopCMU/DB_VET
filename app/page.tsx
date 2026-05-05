"use client";

import images from "@/constant/images";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { AuthServiceCmu } from "./routers/authServer";

export default function Home() {
  // const router = useRouter();
  const [alertMessage, setAlertMessage] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClose = () => {
    setAlertMessage(false); // ล้าง message เมื่อปิด
  };
  const authUrlBase = process.env.NEXT_PUBLIC_AUTH_URL ?? "";
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID ?? "";
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI ?? "";
  const scope = process.env.NEXT_PUBLIC_SCOPE ?? "";
  const responseType = "code";
  const handleChangeDashboard = async () => {
    setIsLoading(true); // Show loading modal
    try {
      await AuthServiceCmu({
        authUrlBase,
        clientId,
        redirectUri,
        scope,
        responseType,
      });
    } catch (error) {
      console.error("Authentication failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-center items-center p-4">
      <div className="container max-w-2xl w-full mx-auto">
        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Card Container */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Decorative Header */}
            <div className="bg-gradient-to-r from-[#325e8c] to-[#1e3a5f] h-2 w-full"></div>

            <div className="flex flex-col items-center p-8 gap-6">
              {/* Logo Section */}
              <div className="flex justify-center relative">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#9878b0] to-[#325e8c] rounded-full blur-md opacity-30 -z-10"></div>
                  <Image
                    src={images.logo}
                    alt="Logo CMUVC"
                    width={220}
                    height={220}
                    className="object-cover rounded-full border-4 border-white"
                    priority
                  />
                </motion.div>
              </div>

              {/* Title Section */}
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9878b0] to-[#325e8c]">
                  ระบบสารสนเทศ
                </h1>
                <p className="text-gray-600 font-medium">
                  คณะสัตวแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่
                </p>
              </div>

              {/* Alert Message */}
              {alertMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
                    <span className="material-symbols-outlined mr-2">info</span>
                    <span>กรุณาเข้าสู่ระบบ</span>
                    <button
                      onClick={handleClose}
                      className="ml-auto text-blue-800 hover:text-blue-900"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Login Button */}
              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 4px 12px rgba(50, 94, 140, 0.2)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={handleChangeDashboard}
                className={`w-full py-3 px-4 font-medium rounded-xl transition-all duration-300 flex justify-center items-center space-x-3
              ${
                isLoading
                  ? "bg-gray-100 cursor-not-allowed text-gray-400"
                  : "bg-white border-2 border-[#325e8c] hover:bg-[#f8fbff] text-[#325e8c] shadow-sm"
              }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="relative w-5 h-5">
                      <div className="w-5 h-5 border-2 border-gray-200 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-5 h-5 border-2 border-t-[#325e8c] border-transparent rounded-full animate-spin"></div>
                    </div>
                    <motion.span
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-[#325e8c] font-medium ml-2 text-sm"
                    >
                      กำลังโหลด...
                    </motion.span>
                  </>
                ) : (
                  <>
                    <Image
                      src={images.logocmu ?? ""}
                      alt="Microsoft Logo"
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                    <span className="font-medium">
                      เข้าสู่ระบบผ่าน CMU IT ACCOUNT
                    </span>
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative w-full flex items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">
                  หรือ
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Logout Button */}
              <motion.button
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 4px 12px rgba(30, 58, 95, 0.2)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  (location.href = process.env.NEXT_PUBLIC_LOGOUT_URL ?? "")
                }
                className="w-full bg-gradient-to-r from-[#325e8c] to-[#1e3a5f] py-3 px-6 text-white font-medium rounded-xl shadow-md hover:from-[#4273a8] hover:to-[#2a4d7a] transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>ออกจากระบบ CMU IT ACCOUNT ทั้งหมด</span>
              </motion.button>

              {/* Information Section */}
              <div className="text-center text-gray-600 text-sm space-y-3 mt-2">
                <p className="leading-relaxed">
                  CMU IT ACCOUNT เพื่อเข้าถึงทุก Application
                  ในมหาวิทยาลัยเชียงใหม่
                </p>
                <p className="font-medium text-gray-500">
                  (ONE IT ACCOUNT TO ALL CMU SERVICES)
                </p>
                <p className="text-red-500 font-semibold text-sm">
                  ** ใช้ CMU E-Mail และ Password เดียวกันกับระบบ CMU MIS **
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 mt-6">
            <p>©2025 คณะสัตวแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่</p>
            <p className="mt-1">Veterinary Medicine, Chiang Mai University</p>
          </div>

          {/* Loading Modal */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm z-50"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center max-w-xs w-full mx-4 border border-gray-100"
              >
                <div className="w-14 h-14 border-4 border-t-4 border-t-[#325e8c] border-gray-100 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-700 font-medium">กำลังดำเนินการ...</p>
                <p className="text-sm text-gray-500 mt-1 text-center">
                  กรุณารอสักครู่
                </p>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
