"use client";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const VetRunPage = dynamic(() => import("./VetRunPage"), {
  ssr: false, //
  loading: () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="text-center space-y-6">
        {/* Animated Spinner */}
        <div className="relative inline-flex items-center justify-center">
          {/* Outer glow effect */}
          <div className="absolute -inset-4 bg-blue-400/20 rounded-full blur-lg animate-pulse"></div>

          {/* Main spinner */}
          <div className="relative w-16 h-16 border-4 border-blue-100 rounded-full">
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>

          {/* Center icon */}
          <span className="material-symbols-outlined absolute text-blue-500 text-xl">
            hourglass_top
          </span>
        </div>

        {/* Text content with animation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <h3 className="text-gray-800 font-semibold text-lg">
            กำลังโหลดหน้าเว็บ
          </h3>
          <p className="text-gray-600 text-sm">กรุณารอสักครู่...</p>
        </motion.div>

        {/* Loading dots */}
        <motion.div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full"
              animate={{ y: [0, -5, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  ),
});

export default VetRunPage;
