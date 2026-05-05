import { motion } from "framer-motion";
import React from "react";

interface ModalStudentProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  // formData: any;
  children: React.ReactNode;
  onSuccess?: () => void; // เพิ่ม prop นี้
}

export const Modal360: React.FC<ModalStudentProps> = ({
  isOpen,
  onClose,
  title,
  // formData,
  children,
}) => {
  if (!isOpen) return null; // ไม่แสดง Modal ถ้า isOpen เป็น false

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative z-10"
      >
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-700">
            {title}{" "}
            {/* <span className="text-gray-500 underline">
              {formData && formData.fullname_th}
            </span> */}
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </div>
  );
};
