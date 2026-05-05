"use client";
import { motion } from "framer-motion";

export default function SimpleLoading() {
  return (
    <div className="fixed inset-0 bg-white/95 flex flex-col items-center justify-center z-50">
      {/* Simple but elegant spinner */}
      <div className="relative w-16 h-16">
        <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      {/* Text with fade animation */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 text-gray-700 font-medium"
      >
        กำลังโหลด...
      </motion.p>
    </div>
  );
}
