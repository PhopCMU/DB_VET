import React, { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  confirmColor?: "red" | "blue" | "green" | "indigo";
  icon?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "ยืนยันการดำเนินการ",
  message = "คุณแน่ใจหรือไม่ที่ต้องการดำเนินการนี้? การกระทำนี้ไม่สามารถยกเลิกได้",
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  isLoading = false,
  confirmColor = "red",
  icon = "help",
}) => {
  const colorVariants = {
    red: {
      bg: "bg-red-500",
      hover: "hover:bg-red-600",
      ring: "focus:ring-red-500",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    blue: {
      bg: "bg-blue-500",
      hover: "hover:bg-blue-600",
      ring: "focus:ring-blue-500",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    green: {
      bg: "bg-green-500",
      hover: "hover:bg-green-600",
      ring: "focus:ring-green-500",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    indigo: {
      bg: "bg-indigo-500",
      hover: "hover:bg-indigo-600",
      ring: "focus:ring-indigo-500",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background overlay - อยู่หน้าสุดเพื่อคุมทั้งหน้าจอ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] bg-black/50 bg-opacity-50"
            onClick={onClose}
          />

          {/* Modal container - เด้งลงมาจากด้านบนสุด เหมือน alert */}
          <div className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-16 sm:pt-24">
            <motion.div
              initial={{ opacity: 0, y: -80, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -60, scale: 0.95 }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 400,
                duration: 0.2,
              }}
              className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${colorVariants[confirmColor].iconBg}`}
                  >
                    <span
                      className={`material-symbols-outlined text-2xl ${colorVariants[confirmColor].iconColor}`}
                    >
                      {icon}
                    </span>
                  </motion.div>

                  <div className="flex-1">
                    <motion.h3
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="text-lg font-semibold text-gray-900"
                    >
                      {title}
                    </motion.h3>
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-2"
                    >
                      <p className="text-gray-600">{message}</p>
                    </motion.div>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="mt-6 flex justify-end gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    {cancelText}
                  </motion.button>
                  <motion.button
                    whileHover={!isLoading ? { scale: 1.03 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                    type="button"
                    className={`px-4 py-2 text-sm font-medium text-white ${colorVariants[confirmColor].bg} ${colorVariants[confirmColor].hover} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorVariants[confirmColor].ring}`}
                    onClick={onConfirm}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center">
                        <span className="material-symbols-outlined animate-spin mr-2">
                          progress_activity
                        </span>
                        กำลังประมวลผล...
                      </span>
                    ) : (
                      confirmText
                    )}
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
