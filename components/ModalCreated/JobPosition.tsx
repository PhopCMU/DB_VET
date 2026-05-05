"use client";

import { useToast } from "@/app/hooks/useToast";
import { motion } from "framer-motion";
import React, { useState } from "react";
import Modal from "react-modal";
import ToastNotification from "../Tooltips/ToastNotification";
import { LoadingModal } from "../Modal";

interface JobPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updateJobPosition: boolean) => void;
  visitorId: string | null;
  title?: string;
}

export const JobPositionModal: React.FC<JobPositionModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  visitorId,
  title,
}) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
  });

  const { toast, showToast, hideToast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("กรุณากรอกชื่อตำแหน่งงาน", "warning");
      return;
    }

    const payload = {
      name: formData.name,
    };

    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([_, value]) => value !== undefined && value !== ""
      )
    );

    if (Object.keys(filteredPayload).length === 0) {
      showToast("กรุณากรอกข้อมูลให้ครบถ้วน", "warning");
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
    } catch (error) {
      console.error("Failed to update:", error);
      showToast("บันทึกข้อมูลไม่สำเร็จ", "error");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      ariaHideApp={false}
      contentLabel="Modal"
      className="fixed inset-0 flex items-center justify-center z-50"
      overlayClassName="fixed inset-0"
    >
      {/* Animated Overlay */}
      <motion.div
        className="fixed inset-0 bg-gradient-to-br from-black/70 to-black/30 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
      {/* Main Modal Container */}
      <motion.div
        className="relative bg-white/95 backdrop-blur-xl p-8 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 my-10 border border-white/30"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 400,
          mass: 0.5,
        }}
      >
        {/* Close Button with Animation */}
        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </motion.button>

        {/* Animated Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            {title}
          </h2>
          <motion.div
            className="h-1 w-12 bg-gradient-to-r from-blue-400 to-blue-200 rounded-full mt-2"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />
        </motion.div>
        {/* Toast Notification */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: toast.isVisible ? 1 : 0,
            y: toast.isVisible ? 0 : -20,
          }}
        >
          <ToastNotification
            isVisible={toast.isVisible}
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        </motion.div>

        {/* Loading Animation */}
        <LoadingModal isOpen={isLoading} progress={uploadProgress} />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Animated Form Fields */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          ></motion.div>

          {/* Name (TH) - Required */}

          <motion.div
            className="space-y-1"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <label className="block text-sm font-medium text-gray-700">
              ชื่อตำแหน่ง (ภาษาไทย) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <motion.input
                type="text"
                name="name"
                onChange={handleInputChange}
                placeholder="Ex. โรงพยาบาลสัตว์ มหาวิทยาลัยเชียงใหม่"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 focus:outline-none transition-all"
                whileFocus={{
                  boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                  scale: 1.005,
                }}
              />
              <motion.span
                className="absolute right-3 top-3 text-gray-400 material-symbols-outlined"
                whileHover={{ scale: 1.1 }}
              >
                description
              </motion.span>
            </div>
          </motion.div>

          {/* Animated Action Buttons */}
          <motion.div
            className="flex justify-end space-x-3 pt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              type="button"
              onClick={onClose}
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(229, 231, 235, 1)",
              }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl transition-all disabled:opacity-50 flex items-center"
            >
              <motion.span
                className="material-symbols-outlined mr-1"
                whileHover={{ rotate: 10 }}
              >
                cancel
              </motion.span>
              ยกเลิก
            </motion.button>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={
                isLoading
                  ? {}
                  : {
                      scale: 1.05,
                      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
                    }
              }
              whileTap={isLoading ? {} : { scale: 0.95 }}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-md transition-all disabled:opacity-80 flex items-center"
            >
              {isLoading ? (
                <motion.span
                  className="flex items-center"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <span className="material-symbols-outlined mr-1">
                    progress_activity
                  </span>
                  กำลังสร้าง...
                </motion.span>
              ) : (
                <>
                  <motion.span
                    className="material-symbols-outlined mr-1"
                    whileHover={{ scale: 1.2 }}
                  >
                    add_circle
                  </motion.span>
                  สร้างหน่วยงานหลัก
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </Modal>
  );
};
