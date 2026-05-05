"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { exchangeCodeForToken, getUserInfo } from "../routers/authServer";
import { AccessToken, TokenResponse, UserInfo } from "../model/authModel";

export const AuthContent = () => {
  const searchParams = useSearchParams();
  const code = searchParams?.get("code");
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const hasHandledAuth = useRef(false);

  const handleAuth = async () => {
    // ป้องกันการเรียกซ้ำ
    if (hasHandledAuth.current) return;
    hasHandledAuth.current = true;

    if (!code) {
      setError("ไม่พบรหัสการยืนยันตัวตน");
      setIsLoading(false);
      setTimeout(() => router.replace("/"), 2000);
      return;
    }

    setIsLoading(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      const tokenResponse: TokenResponse = await exchangeCodeForToken(code);
      setProgress(60);

      const accessToken: AccessToken = tokenResponse;
      const fetchedUserInfo: UserInfo = await getUserInfo(accessToken);
      setProgress(90);

      if (
        fetchedUserInfo.cmuitaccount &&
        (fetchedUserInfo.itaccounttype_id === "MISEmpAcc" ||
          fetchedUserInfo.itaccounttype_id === "ManAcc") &&
        fetchedUserInfo.organization_code === "14"
      ) {
        setUserInfo(fetchedUserInfo);
        setProgress(100);
        setIsLoading(false);
        // setTimeout(() => router.replace("/dashboard"), 1200);
      } else {
        let errorMessage = "";

        if (!fetchedUserInfo.cmuitaccount) {
          errorMessage = "ไม่พบบัญชี CMU IT Account";
        } else if (
          fetchedUserInfo.itaccounttype_id !== "MISEmpAcc" &&
          fetchedUserInfo.itaccounttype_id !== "ManAcc"
        ) {
          errorMessage = "ประเภทบัญชีไม่ได้รับการอนุญาต";
        } else if (fetchedUserInfo.organization_code !== "14") {
          errorMessage = "หน่วยงานไม่ตรงกับที่กำหนด";
        } else {
          errorMessage = "ไม่มีสิทธิ์เข้าใช้งานระบบ";
        }

        setError(errorMessage);
        setTimeout(() => router.replace("/"), 2000);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Token exchange failed:", error);
      setError(error.message || "การยืนยันตัวตนล้มเหลว");
      setTimeout(() => router.replace("/"), 2000);
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      handleAuth();
    } else {
      // ถ้าไม่มี code เลย ให้ redirect ทันที
      setError("ไม่พบรหัสการยืนยันตัวตน");
      setIsLoading(false);
      setTimeout(() => router.replace("/"), 2000);
    }
  }, [code, router]);

  useEffect(() => {
    if (userInfo && !isLoading) {
      const timer = setTimeout(() => {
        router.replace("/dashboard");
      }, 1200);

      return () => clearTimeout(timer); // ป้องกัน memory leak
    }
  }, [userInfo, isLoading, router]);

  useEffect(() => {
    if (error && !isLoading) {
      const timer = setTimeout(() => {
        router.replace("/");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [error, isLoading, router]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  if (isLoading) {
    return (
      <>
        <motion.div
          className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl flex flex-col items-center gap-5 w-full border border-blue-100/50"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Animated Logo/Icon */}
          <motion.div
            className="relative"
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity },
            }}
          >
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-2xl">
                security
              </span>
            </div>

            {/* Pulsing ring effect */}
            <motion.div
              className="absolute inset-0 border-4 border-cyan-400 rounded-2xl"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          {/* Progress Bar */}
          <div className="w-full space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>กำลังตรวจสอบสิทธิ์...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Loading Text */}
          <motion.div className="text-center space-y-2" variants={itemVariants}>
            <h2 className="text-lg font-semibold text-gray-800">
              กำลังยืนยันตัวตน
            </h2>
            <motion.p
              className="text-gray-500 text-xs"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              กรุณารอสักครู่ ระบบกำลังตรวจสอบข้อมูล
            </motion.p>
          </motion.div>

          {/* Animated Dots */}
          <motion.div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-cyan-500 rounded-full"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </>
    );
  }

  const isSuccess = userInfo?.cmuitaccount;
  const headingText = isSuccess
    ? "ยืนยันตัวตนสำเร็จ!"
    : error
    ? "เกิดข้อผิดพลาด"
    : "กำลังดำเนินการ";

  const subText = isSuccess
    ? "กำลังนำทางไปยังแดชบอร์ด..."
    : error
    ? error
    : "กรุณารอสักครู่";

  const iconConfig = {
    success: {
      icon: "check_circle",
      color: "text-green-500",
      bg: "bg-green-100",
    },
    error: { icon: "error", color: "text-red-500", bg: "bg-red-100" },
    default: {
      icon: "hourglass_top",
      color: "text-blue-500",
      bg: "bg-blue-100",
    },
  };

  const currentConfig = isSuccess
    ? iconConfig.success
    : error
    ? iconConfig.error
    : iconConfig.default;

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br">
      <AnimatePresence mode="wait">
        <motion.div
          className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl flex flex-col items-center gap-5 w-full max-w-sm border border-blue-100/50 relative"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          key={isSuccess ? "success" : error ? "error" : "default"}
        >
          {/* Status Icon */}
          <motion.div
            className={`w-20 h-20 ${currentConfig.bg} rounded-full flex items-center justify-center shadow-lg`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              duration: 0.6,
            }}
          >
            <span
              className={`material-symbols-outlined text-3xl ${currentConfig.color}`}
            >
              {currentConfig.icon}
            </span>
          </motion.div>

          {/* Content */}
          <motion.div className="text-center space-y-3" variants={itemVariants}>
            <h2
              className={`text-xl font-bold ${
                isSuccess
                  ? "text-green-600"
                  : error
                  ? "text-red-600"
                  : "text-gray-800"
              }`}
            >
              {headingText}
            </h2>

            <motion.p
              className="text-gray-600 text-sm leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {subText}
            </motion.p>

            {/* Code Preview */}
            {code && (
              <motion.div
                className="bg-gray-100/80 px-3 py-2 rounded-lg backdrop-blur-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-xs text-gray-500 mb-1">รหัสยืนยัน:</p>
                <code className="text-xs font-mono text-gray-700 bg-white/50 px-2 py-1 rounded">
                  {code.substring(0, 12)}...
                </code>
              </motion.div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div className="w-full space-y-3" variants={itemVariants}>
            {error && (
              <motion.button
                onClick={() => router.push("/")}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ลองใหม่อีกครั้ง
              </motion.button>
            )}

            {isSuccess && (
              <motion.div
                className="flex items-center justify-center text-green-600 text-sm"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <span className="material-symbols-outlined text-xs mr-1">
                  schedule
                </span>
                กำลังนำทางอัตโนมัติ...
              </motion.div>
            )}
          </motion.div>

          {/* Success Animation */}
          {isSuccess && (
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-white/20 pointer-events-none"
              initial={{ scale: 1, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
