"use client";

import { AuthContent } from "@/app/lib/authContent";
import { motion } from "framer-motion";
import { Suspense } from "react";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-300 to-pink-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md flex items-center justify-center">
        <Suspense
          fallback={
            <div className="flex items-center justify-center w-full">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/60 p-6 flex flex-col items-center gap-5 w-full">
                {/* Animated Spinner with Gradient */}
                <div className="relative">
                  {/* Outer Glow Effect */}
                  <div className="absolute -inset-3 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full blur-md opacity-30 animate-pulse"></div>

                  {/* Main Spinner */}
                  <div className="relative w-16 h-16 rounded-full">
                    {/* Background Circle */}
                    <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>

                    {/* Animated Spinner Ring */}
                    <div
                      className="absolute inset-0 border-4 border-transparent rounded-full animate-spin border-t-indigo-500 border-r-purple-500"
                      style={{ animationDuration: "1.5s" }}
                    ></div>

                    {/* Inner Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-indigo-500 text-xl">
                        auto_awesome
                      </span>
                    </div>
                  </div>
                </div>

                {/* Text Content with Animation */}
                <div className="text-center space-y-2">
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-base font-semibold text-gray-800"
                  >
                    กำลังเตรียมข้อมูล
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 text-xs leading-relaxed"
                  >
                    กรุณารอสักครู่ ระบบกำลังโหลดเนื้อหาสำหรับคุณ
                  </motion.p>
                </div>

                {/* Animated Dots */}
                <motion.div
                  className="flex space-x-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </motion.div>

                {/* Progress Indicator */}
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <motion.div
                    className="h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "70%" }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </div>
            </div>
          }
        >
          <AuthContent />
        </Suspense>
      </div>
    </div>
  );
}
