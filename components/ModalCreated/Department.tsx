"use client";
import { useToast } from "@/app/hooks/useToast";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import ToastNotification from "../Tooltips/ToastNotification";
import {
  PostDepartmentMemberShipCreated_Role,
  PostMainDepartmentCreated_Role,
  PostSubDepartmentCreated_Role,
} from "@/app/routers/postService";
import {
  MainDepartment,
  Personnel,
  SubDepartment,
} from "@/app/model/roleModel";
import { motion } from "framer-motion";
import { LoadingModal } from "../Modal";

interface MainDepartmentCreateProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedMainDepartment: MainDepartment) => void;
  visitorId: string | null;
  title?: string;
}

interface SubDepartmentCreateProps {
  fromMainDepartment: MainDepartment | null | undefined;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedSubDepartment: boolean) => void;
  visitorId: string | null;
  title?: string;
}

interface AssignDepartmentModalProps {
  fromPersonnel: Personnel | null | undefined;
  fromMainDepartment: MainDepartment[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedAssignment: boolean) => void;
  visitorId: string | null;
  title?: string;
}

export const MainDepartmentCreate: React.FC<MainDepartmentCreateProps> = ({
  isOpen,
  onClose,
  onUpdate,
  visitorId,
  title = "เพิ่มหน่วยงานหลัก",
}) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name_EN: "",
    name_TH: "",
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
    if (!formData.name_TH.trim()) {
      showToast("กรุณากรอกชื่อหน่วยงานหลัก (ภาษาไทย)", "warning");
      return;
    }

    const payload = {
      name_EN: formData.name_EN,
      name_TH: formData.name_TH,
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
      const response = await PostMainDepartmentCreated_Role(
        filteredPayload as MainDepartment | any,
        visitorId,
        setUploadProgress
      );

      if (response.success) {
        setIsLoading(false);
        onClose();
        onUpdate(response?.data as MainDepartment);
      } else {
        showToast("สร้างหน่วยงานหลักไม่สำเร็จ", "error");
        setIsLoading(false);
      }
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
          {/* Name (EN) */}
          <motion.div
            className="space-y-1"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <label className="block text-sm font-medium text-gray-700">
              ชื่อ (ภาษาอังกฤษ)
            </label>
            <div className="relative">
              <motion.input
                type="text"
                name="name_EN"
                onChange={handleInputChange}
                placeholder="Faculty of Engineering"
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
                translate
              </motion.span>
            </div>
          </motion.div>

          {/* Name (TH) - Required */}

          <motion.div
            className="space-y-1"
            variants={{
              hidden: { opacity: 0, y: 10 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <label className="block text-sm font-medium text-gray-700">
              ชื่อ (ภาษาไทย) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <motion.input
                type="text"
                name="name_TH"
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

export const SubDepartmentModalCreate: React.FC<SubDepartmentCreateProps> = ({
  isOpen,
  onClose,
  onUpdate,
  visitorId,
  title,
  fromMainDepartment,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    mainDepartmentId: fromMainDepartment?.mainDepartmentId,
    name_EN: "",
    name_TH: "",
  });

  const { toast, showToast, hideToast } = useToast();

  // ✅ อัปเดต mainDepartmentId เมื่อ Modal เปิด และ fromMainDepartment มีค่า
  useEffect(() => {
    if (isOpen && fromMainDepartment) {
      setFormData((prev) => ({
        ...prev,
        mainDepartmentId: fromMainDepartment.mainDepartmentId,
      }));
    }
  }, [isOpen, fromMainDepartment]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name_TH.trim()) {
      showToast("กรุณากรอกชื่อหน่วยงานย่อย (ภาษาไทย)", "warning");
      return;
    }

    const payload = {
      mainDepartmentId: formData.mainDepartmentId,
      name_EN: formData.name_EN,
      name_TH: formData.name_TH,
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
      const response = await PostSubDepartmentCreated_Role(
        filteredPayload as SubDepartment | any,
        visitorId,
        setUploadProgress
      );

      if (response.success) {
        setIsLoading(false);
        onClose();
        onUpdate(response?.success);
      } else {
        showToast("สร้างหน่วยงานย่อยไม่สำเร็จ", "error"); // Show error toast
        setIsLoading(false);
      }
    } catch (error: any) {
      showToast(error.message || "สร้างหน่วยงานย่อยไม่สำเร็จ", "error");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData((prev) => ({
      ...prev,
      name_EN: "",
      name_TH: "",
    }));
    onClose();
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
          onClick={handleCancel}
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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Animated Form Fields */}
          <motion.div
            className="space-y-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {/* Main Department Field */}
            <motion.div
              className="space-y-1"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <label className="block text-sm font-medium text-gray-600">
                หน่วยงานหลัก
              </label>
              <div className="relative">
                <motion.input
                  type="text"
                  value={fromMainDepartment?.name_TH ?? ""}
                  disabled
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
                  business
                </motion.span>
              </div>
            </motion.div>

            {/* English Name Field */}
            <motion.div
              className="space-y-1"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <label className="block text-sm font-medium text-gray-600">
                ชื่อหน่วยงานย่อย (ภาษาอังกฤษ)
              </label>
              <div className="relative">
                <motion.input
                  type="text"
                  name="name_EN"
                  onChange={handleInputChange}
                  placeholder="Ex. Northern Veterinary Health Learning and Promotion Center"
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
                  translate
                </motion.span>
              </div>
            </motion.div>

            {/* Thai Name Field */}
            <motion.div
              className="space-y-1"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <label className="block text-sm font-medium text-gray-600">
                ชื่อหน่วยงานย่อย (ภาษาไทย){" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <motion.input
                  type="text"
                  name="name_TH"
                  onChange={handleInputChange}
                  placeholder="Ex. ศูนย์การเรียนรู้และส่งเสริมสุขภาพทางสัตวแพทย์ภาคเหนือ"
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
              onClick={handleCancel}
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
                  สร้างหน่วยงานย่อย
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </Modal>
  );
};

export const AssignDepartmentModal: React.FC<AssignDepartmentModalProps> = ({
  fromPersonnel,
  fromMainDepartment,
  isOpen,
  onClose,
  onUpdate,
  visitorId,
  title,
}) => {
  const [selectedMainDeptId, setSelectedMainDeptId] = useState<string>("");
  const [selectedSubDeptId, setSelectedSubDeptId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    personnelId: fromPersonnel?.userId,
  });
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    if (isOpen && fromPersonnel) {
      setFormData((prev) => ({
        ...prev,
        personnelId: fromPersonnel.userId,
      }));
    }
  }, [isOpen, fromPersonnel]);

  // ค้นหา subDepartments ตาม main department ที่เลือก
  const selectedMainDept = fromMainDepartment.find(
    (dept) => dept.mainDepartmentId === selectedMainDeptId
  );

  const handleSubmit = async () => {
    if (!formData.personnelId) return showToast("กรุณาเลือกพนักงาน", "warning");

    if (!selectedMainDeptId)
      return showToast("กรุณาเลือกหน่วยงานหลัก", "warning");

    if (!selectedSubDeptId)
      return showToast("กรุณาเลือกหน่วยงานย่อย", "warning");

    const payload = {
      personnelId: formData.personnelId,
      mainDepartmentId: selectedMainDeptId,
      subDepartmentId: selectedSubDeptId,
    };

    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([_, value]) => value !== undefined && value !== ""
      )
    );

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const response = await PostDepartmentMemberShipCreated_Role(
        filteredPayload as SubDepartment | any,
        visitorId,
        setUploadProgress
      );

      if (response.success) {
        setIsLoading(false);
        onClose();
        onUpdate(response?.success);
      } else {
        showToast("กำหนดหน่วยงานไม่สำเร็จ", "error"); // Show error toast
        setIsLoading(false);
      }
    } catch (error: any) {
      showToast(error.message || "กำหนดหน่วยงานไม่สำเร็จ", "error");
      setIsLoading(false);
    }
  };
  const handleCancel = () => {
    setSelectedMainDeptId("");
    setSelectedSubDeptId("");
    onClose();
  };

  if (!isOpen) return null;

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
          onClick={handleCancel}
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
            {title} :: {fromPersonnel?.firstname_TH}{" "}
            {fromPersonnel?.lastname_TH}
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

        <div className="space-y-6">
          {/* Main Department Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500 text-lg">
                corporate_fare
              </span>
              <span>หน่วยงานหลัก</span>
            </label>
            <motion.div whileHover={{ scale: 1.005 }} className="relative">
              <select
                value={selectedMainDeptId}
                onChange={(e) => {
                  setSelectedMainDeptId(e.target.value);
                  setSelectedSubDeptId("");
                }}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white shadow-sm appearance-none hover:border-blue-300 transition-all"
              >
                <option value="">เลือกหน่วยงานหลัก</option>
                {fromMainDepartment.map((dept) => (
                  <option
                    key={dept.mainDepartmentId}
                    value={dept.mainDepartmentId}
                  >
                    {dept.name_TH}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-3 top-3 text-gray-400 pointer-events-none">
                unfold_more
              </span>
            </motion.div>
          </motion.div>

          {/* Sub Department Selection (if main selected) */}
          {selectedMainDeptId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400 text-lg">
                  account_tree
                </span>
                <span>หน่วยงานย่อย</span>
              </label>
              <motion.div whileHover={{ scale: 1.005 }} className="relative">
                <select
                  value={selectedSubDeptId}
                  onChange={(e) => setSelectedSubDeptId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white shadow-sm appearance-none hover:border-blue-300 transition-all"
                >
                  <option value="">ไม่ระบุ</option>
                  {selectedMainDept?.subDepartments.map((sub) => (
                    <option
                      key={sub.subDepartmentId}
                      value={sub.subDepartmentId}
                    >
                      {sub.name_TH}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-3 text-gray-400 pointer-events-none">
                  unfold_more
                </span>
              </motion.div>
            </motion.div>
          )}

          {/* Control Buttons */}
          <motion.div
            className="flex gap-4 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              type="button"
              onClick={handleCancel}
              whileHover={{ scale: 1.03, backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">close</span>
              <span>ยกเลิก</span>
            </motion.button>

            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedMainDeptId}
              whileHover={
                !selectedMainDeptId
                  ? {}
                  : {
                      scale: 1.03,
                      boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)",
                    }
              }
              whileTap={{ scale: 0.98 }}
              className={`flex-1 px-6 py-3 rounded-xl text-white flex items-center justify-center gap-2 ${
                !selectedMainDeptId
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-md"
              } transition-all`}
            >
              <span className="material-symbols-outlined">check</span>
              <span>บันทึก</span>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </Modal>
  );
};
