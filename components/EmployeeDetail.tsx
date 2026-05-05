import { Animal } from "@/app/model/vetrun/animalModel";
import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { AnimatePresence, motion } from "framer-motion";
import { Employees } from "@/app/model/vetrun/employees";
import { config } from "@/config/config_api";
import { AlertConfirm } from "./AlertMessage";
import {
  PutEditAnimal_vetrun,
  PutEditParticipant_vetrun,
  putUpdatePayment_vetrun,
} from "@/app/routers/vetrun/PutRouter";
import { LoadingModal, ModalAlertWarning } from "./Modal";
import { Post_UpdateFileRouterCryptoJS } from "@/app/routers/vetrun/PostRouter";
import { useVisitor } from "@/lib/fingerprintjs-shim";
import { InputField } from "./Input/InputField";
import { useToast } from "@/app/hooks/useToast";
import ToastNotification from "./Tooltips/ToastNotification";

interface AnimalDetailModalProps {
  animal: Animal | null;
  isOpen: boolean;
  onClose: () => void;
}

interface AnimalEditModalProps {
  fromAnimal: Animal | null;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  visitorId: string | null;
  onUpdate: (updatedAnimal: Animal) => void;
}

interface EmployeeDetailModalProps {
  employee: Employees | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  onSuccess?: () => void;
}

interface EmployeeEditModalProps {
  formEmployee: Employees | null;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  visitorId: string | null;
  onUpdate: (updatedEmployee: Employees) => void;
}

// interface Shirts
interface Shirt {
  shirtId: string;
  s_high: number;
  s_width: number;
  size: string;
  point: number;
  createdAt: string;
  updatedAt: string;
}

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const AnimalDetailModal: React.FC<AnimalDetailModalProps> = ({
  animal,
  isOpen,
  onClose,
}) => {
  // ตั้งค่าข้อมูลเริ่มต้นเมื่อ modal เปิด
  return (
    <Modal
      isOpen={isOpen}
      // onRequestClose={onClose}
      ariaHideApp={false}
      contentLabel="Animal Details"
      className="bg-white/80  p-8 rounded-2xl shadow-xl max-w-2xl mx-auto my-10 outline-none border border-white/20"
      overlayClassName="fixed inset-0 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        // transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative"
      >
        {/* <button
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:scale-110 "
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-gray-600">close</span>
        </button> */}

        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-3xl text-indigo-500">
            pets
          </span>
          <h2 className="text-2xl font-bold text-gray-800">
            ข้อมูลสัตว์เลี้ยง
          </h2>
        </div>

        {animal ? (
          <div className="space-y-4 text-gray-700">
            <>
              {/* โหมดอ่าน */}
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-500">
                  badge
                </span>
                <p>
                  <strong className="font-medium text-gray-800">ID:</strong>{" "}
                  {animal.animalId}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-500">
                  pets
                </span>
                <p>
                  <strong className="font-medium text-gray-800">
                    ชื่อสัตว์เลี้ยง:
                  </strong>{" "}
                  {animal.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-500">
                  genetics
                </span>
                <p>
                  <strong className="font-medium text-gray-800">
                    สายพันธุ์:
                  </strong>{" "}
                  {animal.breed}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-500">
                  monitor_weight
                </span>
                <p>
                  <strong className="font-medium text-gray-800">
                    น้ำหนัก:
                  </strong>{" "}
                  {animal.weight} kg
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-gray-500">
                  transgender
                </span>
                <p>
                  <strong className="font-medium text-gray-800">เพศ:</strong>{" "}
                  {animal.sex === "DM" ? "ผู้" : "เมีย"}
                </p>
              </div>
            </>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <span className="material-symbols-outlined">error</span>
            <p>ไม่มีข้อมูลสัตว์</p>
          </div>
        )}

        {/* ปุ่มดำเนินการ */}
        <div className="mt-6 flex justify-end gap-3">
          <>
            <button
              onClick={onClose}
              className="mt-6 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
            >
              <span className="material-symbols-outlined">check</span>
              <span>ปิด</span>
            </button>
          </>
        </div>
      </motion.div>
    </Modal>
  );
};

export const AnimalEditModal: React.FC<AnimalEditModalProps> = ({
  fromAnimal,
  isOpen,
  onClose,
  onUpdate,
  visitorId,
  title,
}) => {
  const [editedAnimal, setEditedAnimal] = useState<Animal | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    if (isOpen && fromAnimal) {
      setEditedAnimal({ ...fromAnimal });
    }
  }, [fromAnimal, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditedAnimal((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = async () => {
    if (!editedAnimal || !fromAnimal?.animalId) {
      return showToast("ข้อมูลไม่สมบูรณ์", "warning");
    }
    if (!editedAnimal.name)
      return showToast("กรุณากรอกชื่อสัตว์เลี้ยง", "warning");
    if (!editedAnimal.breed) return showToast("กรุณากรอกสายพันธุ์", "warning");
    if (!editedAnimal.weight) return showToast("กรุณากรอกน้ำหนัก", "warning");

    const payload = {
      animalId: fromAnimal.animalId,
      name: editedAnimal.name,
      breed: editedAnimal.breed,
      weight: editedAnimal.weight,
      sex: editedAnimal.sex,
    };

    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([_, value]) => value !== undefined && value !== "",
      ),
    );

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const response = await PutEditAnimal_vetrun(
        filteredPayload as any,
        visitorId,
        setUploadProgress,
      );

      if (!response) {
        return showToast("ไม่สามารถบันทึกข้อมูลได้", "error");
      }

      if (response.success) {
        onUpdate(response?.data as Animal);
        setIsLoading(false);
        onClose();
      } else {
        showToast("บันทึกข้อมูลไม่สำเร็จ", "error");
      }
    } catch (error) {
      console.error("Failed to update animal:", error);
      showToast("บันทึกข้อมูลไม่สำเร็จ", "error");
    }
  };

  const handleCancel = () => {
    setEditedAnimal(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          ariaHideApp={false}
          contentLabel="Animal Edit Modal"
          className="outline-none"
          overlayClassName="fixed inset-0 z-30 flex items-center justify-center"
        >
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black"
            // onClick={handleCancel}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white/90  p-8 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 border border-white/20"
          >
            <ToastNotification
              isVisible={toast.isVisible}
              message={toast.message}
              type={toast.type}
              onClose={hideToast}
            />

            <LoadingModal isOpen={isLoading} progress={uploadProgress} />

            <motion.div
              className="space-y-4 p-6 bg-white rounded-xl shadow-md border border-gray-100"
              variants={contentVariants}
            >
              <motion.div
                className="flex items-center gap-3 mb-6"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <motion.span
                  className="material-symbols-outlined text-3xl text-indigo-500"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  pets
                </motion.span>
                <h2 className="text-2xl font-bold text-gray-800">
                  {title || "แก้ไขข้อมูลสัตว์เลี้ยง"}
                </h2>
              </motion.div>

              {editedAnimal ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Input Fields */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <InputField
                      label="ชื่อสัตว์เลี้ยง"
                      name="name"
                      value={editedAnimal.name}
                      onChange={handleInputChange}
                      icon={
                        <span className="material-symbols-outlined text-gray-400">
                          pets
                        </span>
                      }
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    <InputField
                      label="สายพันธุ์"
                      name="breed"
                      value={editedAnimal.breed}
                      onChange={handleInputChange}
                      icon={
                        <span className="material-symbols-outlined text-gray-400">
                          pets
                        </span>
                      }
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <InputField
                      label="น้ำหนัก (kg)"
                      name="weight"
                      type="number"
                      value={editedAnimal.weight}
                      onChange={handleInputChange}
                      icon={
                        <span className="material-symbols-outlined text-gray-400">
                          monitor_weight
                        </span>
                      }
                      step="0.1"
                      min="0"
                    />
                  </motion.div>

                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                      เพศ
                    </label>
                    <div className="relative">
                      <select
                        name="sex"
                        value={editedAnimal.sex}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white transition-all hover:border-indigo-300"
                      >
                        <option value="DM">ผู้</option>
                        <option value="DF">เมีย</option>
                      </select>
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {editedAnimal.sex === "DF" ? (
                          <motion.span
                            className="material-symbols-outlined text-pink-500"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.5 }}
                          >
                            female
                          </motion.span>
                        ) : (
                          <motion.span
                            className="material-symbols-outlined text-blue-500"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.5 }}
                          >
                            male
                          </motion.span>
                        )}
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    className="mt-6 flex justify-end gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.button
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors border border-gray-200"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      ยกเลิก
                    </motion.button>
                    <motion.button
                      onClick={handleSave}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg flex items-center gap-2 shadow-md"
                      whileHover={{
                        scale: 1.03,
                        boxShadow: "0px 5px 15px rgba(99, 102, 241, 0.3)",
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="material-symbols-outlined"
                      >
                        save
                      </motion.span>
                      <span>บันทึก</span>
                    </motion.button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  className="flex justify-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"
                  />
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

export const EmployeeEditModal: React.FC<EmployeeEditModalProps> = ({
  formEmployee,
  isOpen,
  onClose,
  title,
  visitorId,
  onUpdate,
}) => {
  const [editedParticipant, setEditedParticipant] = useState<Employees | null>(
    null,
  );
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [shirts, setShirts] = useState<Shirt[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast, showToast, hideToast } = useToast();

  // ✅ ดึง URL ออกมาให้สะอาด
  const PROXY_URL = "https://corsproxy.io/?";
  const TARGET_URL = "https://vmapi.vet.cmu.ac.th/vetrun/size/shirt";

  // ✅ ดึงข้อมูลไซส์เสื้อเพียงครั้งเดียว
  useEffect(() => {
    const fetchSizeShirt = async () => {
      if (shirts) return; // ✅ ถ้ามีข้อมูลแล้ว ไม่ fetch ซ้ำ
      try {
        const response = await fetch(
          PROXY_URL + encodeURIComponent(TARGET_URL),
        );
        const data = await response.json();
        setShirts(data.data);
      } catch (e) {
        showToast("ไม่สามารถดึงข้อมูลไซส์เสื้อได้", "error");
      }
    };

    fetchSizeShirt();
  }, [shirts]); // ✅ ดึงแค่ครั้งเดียว

  // ✅ ตั้งค่า participant เมื่อเปิด modal
  useEffect(() => {
    if (isOpen && formEmployee) {
      setEditedParticipant({ ...formEmployee });
    } else if (!isOpen) {
      setEditedParticipant(null); // ล้างเมื่อปิด
    }
  }, [formEmployee, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditedParticipant((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = async () => {
    if (!editedParticipant?.participantId) {
      return showToast("ข้อมูลไม่สมบูรณ์", "warning");
    }
    if (!editedParticipant.firstName)
      return showToast("กรุณากรอกชื่อ", "warning");
    if (!editedParticipant.lastName)
      return showToast("กรุณากรอกนามสกุล", "warning");
    if (!editedParticipant.email) return showToast("กรุณากรอกอีเมล", "warning");
    if (!editedParticipant.phone)
      return showToast("กรุณากรอกเบอร์โทรศัพท์", "warning");
    if (!editedParticipant.address)
      return showToast("กรุณากรอกที่อยู่", "warning");
    if (!editedParticipant.sex) return showToast("กรุณาเลือกเพศ", "warning");
    if (!editedParticipant.sizeId)
      return showToast("กรุณาเลือกไซส์เสื้อ", "warning");

    const payload = {
      participantId: editedParticipant.participantId,
      firstName: editedParticipant.firstName,
      lastName: editedParticipant.lastName,
      email: editedParticipant.email,
      phone: editedParticipant.phone,
      address: editedParticipant.address,
      sex: editedParticipant.sex,
      sizeId: editedParticipant.sizeId,
    };

    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([_, value]) => value !== undefined && value !== "",
      ),
    );

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const response: any = await PutEditParticipant_vetrun(
        filteredPayload as any,
        visitorId,
        setUploadProgress,
      );

      if (response?.success) {
        onUpdate(response.success);
        onClose();
      } else {
        showToast("บันทึกข้อมูลไม่สำเร็จ", "error");
      }
    } catch (error) {
      console.error("Failed to update:", error);
      showToast("บันทึกข้อมูลไม่สำเร็จ", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="modal-root"
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Overlay */}
        <motion.div
          className="fixed inset-0 bg-black/50  z-40"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 },
            exit: { opacity: 0 },
          }}
          transition={{ duration: 0.2 }}
          onClick={handleCancel}
        />

        {/* Modal Content */}
        <motion.div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          variants={{
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.95 },
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.3,
          }}
        >
          <motion.div
            className="bg-white/95  p-8 rounded-2xl shadow-2xl max-w-2xl w-full mx-auto border border-white/20"
            style={{ minHeight: "auto" }}
            onClick={(e) => e.stopPropagation()} // ❗ ป้องกัน close เมื่อคลิกภายใน
          >
            {/* Toast & Loading */}
            <ToastNotification
              isVisible={toast.isVisible}
              message={toast.message}
              type={toast.type}
              onClose={hideToast}
            />
            <LoadingModal isOpen={isLoading} progress={uploadProgress} />

            {/* Header */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="material-symbols-outlined text-3xl text-indigo-500">
                  menu
                </span>
                <h2 className="text-2xl font-bold text-gray-800">
                  {title || "แก้ไขข้อมูลนักวิ่ง"}
                </h2>
              </div>

              {editedParticipant ? (
                <div className="space-y-6">
                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="ชื่อ"
                      name="firstName"
                      value={editedParticipant.firstName}
                      onChange={handleInputChange}
                      icon={
                        <span className="material-symbols-outlined text-gray-400">
                          edit_note
                        </span>
                      }
                    />
                    <InputField
                      label="นามสกุล"
                      name="lastName"
                      value={editedParticipant.lastName}
                      onChange={handleInputChange}
                      icon={
                        <span className="material-symbols-outlined text-gray-400">
                          edit_note
                        </span>
                      }
                    />
                    <InputField
                      label="อีเมล์"
                      name="email"
                      value={editedParticipant.email}
                      onChange={handleInputChange}
                      icon={
                        <span className="material-symbols-outlined text-gray-400">
                          mail
                        </span>
                      }
                    />
                    <InputField
                      label="เบอร์โทรศัพท์"
                      name="phone"
                      value={editedParticipant.phone}
                      onChange={handleInputChange}
                      icon={
                        <span className="material-symbols-outlined text-gray-400">
                          call
                        </span>
                      }
                    />
                  </div>

                  <InputField
                    label="ที่อยู่"
                    name="address"
                    value={editedParticipant.address}
                    onChange={handleInputChange}
                    icon={
                      <span className="material-symbols-outlined text-gray-400">
                        home
                      </span>
                    }
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                        เพศ
                      </label>
                      <div className="relative">
                        <select
                          name="sex"
                          value={editedParticipant.sex}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                          <option value="M">ชาย</option>
                          <option value="W">หญิง</option>
                        </select>
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                          {editedParticipant.sex === "W" ? (
                            <span className="material-symbols-outlined">
                              female
                            </span>
                          ) : (
                            <span className="material-symbols-outlined">
                              male
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Shirt Size */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                        ไซส์เสื้อ
                      </label>
                      <div className="relative">
                        <select
                          name="sizeId"
                          value={editedParticipant.sizeId || ""}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                          <option value="">เลือกไซส์</option>
                          {shirts?.map((shirt) => (
                            <option key={shirt.shirtId} value={shirt.shirtId}>
                              {shirt.size} ({shirt.s_width}, {shirt.s_high})
                            </option>
                          ))}
                        </select>
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500">
                          <span className="material-symbols-outlined">
                            straighten
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={handleCancel}
                      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg border border-gray-200 flex items-center gap-2 transition"
                    >
                      <span className="material-symbols-outlined">close</span>
                      ยกเลิก
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-lg flex items-center gap-2 shadow"
                    >
                      <span className="material-symbols-outlined">save</span>
                      บันทึก
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  employee,
  isOpen,
  onClose,
  onSuccess,
  onConfirm,
}) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);
  const [newSlipFile, setNewSlipFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isModalMessageOpen, setIsModalMessageOpen] = useState<string | null>(
    null,
  );
  const [isModalAlertOpen, setIsModalAlertOpen] = useState(false);

  const paymentStatus = employee?.payment || false;
  const { data } = useVisitor({ extendedResult: true }, { immediate: true });

  const handleUploadSlip = async () => {
    if (!employee || !newSlipFile) return;

    setIsLoading(true);
    setUploadProgress(0);

    const payload = {
      participantId: employee.participantId,
      imageFile: newSlipFile,
    };
    if (!payload.participantId) {
      setIsModalMessageOpen("Participant ID is required.");
      setIsModalAlertOpen(true);
      setIsLoading(false);
      return;
    }

    if (!payload.imageFile?.name && !payload.imageFile?.size) {
      setIsModalMessageOpen("Please upload both files.");
      setIsModalAlertOpen(true);
      setIsLoading(false);
      return;
    }

    const visitorId: string | null = data?.visitorId || null;

    const formDataToSend = new FormData();
    formDataToSend.append("participantId", payload.participantId);
    formDataToSend.append("imageFile", payload.imageFile);

    const response = await Post_UpdateFileRouterCryptoJS(
      formDataToSend,
      visitorId,
      setUploadProgress,
    );

    if (response.success) {
      setTimeout(async () => {
        setIsLoading(false);
        setIsOpenModal(false);
        setPreviewUrl(null);
        setNewSlipFile(null);
        setIsModalMessageOpen("Upload successful.");
        setIsModalAlertOpen(true);
        onSuccess?.();
      }, 2000);
    } else {
      setIsLoading(false);
      setIsModalMessageOpen(
        response.message || "Request failed with status code 404",
      );
      setIsModalAlertOpen(true);
    }
  };

  const handleConfirmOpen = () => {
    setIsConfirmOpen(true);
  };

  const handleViewSlip = (url: string | null) => {
    setSelectedSlip(url);
    setIsOpenModal(true);
    onClose();
  };

  const handleConfirm = async (participantId: string) => {
    setIsConfirmOpen(false);
    setIsLoading(true);
    setUploadProgress(0);

    if (typeof participantId === "string") {
      const response = await putUpdatePayment_vetrun(
        { id: participantId },
        setUploadProgress,
      );

      if (response.success) {
        setTimeout(async () => {
          onSuccess?.();
          setIsLoading(false);
          setIsOpenModal(false);
          setPreviewUrl(null);
          setNewSlipFile(null);
        }, 2000);
      } else {
        setIsLoading(false);
        setIsModalMessageOpen(
          response.message || "Request failed with status code 404",
        );
        setIsModalAlertOpen(true);
      }
    }
  };

  return (
    <>
      {/* Main Employee Detail Modal */}
      <Modal
        isOpen={isOpen}
        // onRequestClose={onClose}
        ariaHideApp={false}
        contentLabel="Employee Details"
        className="bg-white/90  p-8 rounded-2xl shadow-xl max-w-lg mx-auto my-10 outline-none border border-white/20 z-[60]"
        overlayClassName="fixed inset-0  flex items-center justify-center z-[50]"
      >
        <motion.div className="relative">
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 bg-white px-2 pt-1.5 rounded-full hover:scale-110 cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-gray-600">
              close
            </span>
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div
              className={`p-3 rounded-lg ${
                employee?.sex === "M"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-pink-100 text-pink-600"
              }`}
            >
              <span className="material-symbols-outlined text-2xl">
                {employee?.sex === "M" ? "male" : "female"}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              ข้อมูลผู้ลงทะเบียน
            </h2>
          </div>

          {employee ? (
            <div className="space-y-4 text-gray-700">
              {/* ชื่อ-นามสกุล */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="material-symbols-outlined text-gray-500">
                  person
                </span>
                <div>
                  <p className="font-medium text-gray-800">
                    {employee.firstName} {employee.lastName}
                  </p>
                  <p className="text-sm text-gray-500">ชื่อ-นามสกุล</p>
                </div>
              </div>

              {/* หมายเลขบิบ */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="material-symbols-outlined text-amber-500">
                  confirmation_number
                </span>
                <div>
                  <p className="font-medium text-gray-800">
                    {employee.nameBib}
                    {employee.numberBib}
                  </p>
                  <p className="text-sm text-gray-500">หมายเลขบิบ</p>
                </div>
              </div>

              {/* ข้อมูลติดต่อ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* เบอร์โทร */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="material-symbols-outlined text-blue-500">
                    phone
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">
                      {employee.phone || "-"}
                    </p>
                    <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
                  </div>
                </div>

                {/* อายุ */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="material-symbols-outlined text-green-500">
                    cake
                  </span>
                  <div>
                    <p className="font-medium text-gray-800">
                      {employee.age || "-"}
                    </p>
                    <p className="text-sm text-gray-500">อายุ</p>
                  </div>
                </div>
              </div>

              {/* ปุ่มดูสลิป */}
              <button
                onClick={() => handleViewSlip(employee.transferFile)}
                className="w-full mt-6 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl flex items-center justify-center gap-2  shadow-md hover:shadow-lg"
              >
                <span className="material-symbols-outlined">receipt</span>
                <span>ดูสลิปการโอนเงิน</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500">
              <span className="material-symbols-outlined text-4xl mb-3">
                error
              </span>
              <p>ไม่พบข้อมูลพนักงาน</p>
            </div>
          )}
        </motion.div>
      </Modal>

      {/* Image Modal with Animation */}
      <AnimatePresence>
        {isOpenModal && selectedSlip && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay with blur effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
              onClick={() => setIsOpenModal(false)}
            />

            {/* Modal container */}
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col z-[110] overflow-hidden border border-white/20"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <span className="material-symbols-outlined text-2xl">
                      receipt_long
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      สลิปหลักฐานการชำระเงิน
                    </h3>
                    <p className="text-sm opacity-80">
                      ตรวจสอบและอัปโหลดสลิปใหม่
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsOpenModal(false);
                    setPreviewUrl(null);
                    setNewSlipFile(null);
                  }}
                  className="px-1.5 pt-1.5  rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <span className="material-symbols-outlined text-xl">
                    close
                  </span>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto">
                {/* Image Preview */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 max-w-md mx-auto">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        loading="lazy"
                        alt="Preview"
                        className="w-full h-auto rounded-lg object-contain max-h-[400px]"
                      />
                    ) : selectedSlip ? (
                      <img
                        src={`${config.URL_API}/uploads/dataVetRun/paymentSlips/${selectedSlip}`}
                        alt="Current Slip"
                        className="w-full h-auto rounded-lg object-contain max-h-[400px]"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <span className="material-symbols-outlined text-5xl mb-3">
                          image_not_supported
                        </span>
                        <p>ไม่พบสลิปการชำระเงิน</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Section */}
                <div className="p-6 border-t border-gray-200 bg-white">
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-500">
                        cloud_upload
                      </span>
                      อัปโหลดสลิปใหม่
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      สามารถอัปโหลดไฟล์รูปภาพ (JPG, PNG) ขนาดไม่เกิน 5MB
                    </p>

                    <label className="cursor-pointer block">
                      <div className="flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-colors">
                        {newSlipFile ? (
                          <>
                            <span className="material-symbols-outlined text-green-500 text-4xl mb-2">
                              check_circle
                            </span>
                            <p className="text-sm font-medium text-green-600">
                              {newSlipFile.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {(newSlipFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-blue-400 text-4xl mb-2">
                              upload
                            </span>
                            <p className="text-sm font-medium text-blue-600">
                              ลากไฟล์มาวางหรือคลิกเพื่อเลือกไฟล์
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, GIF (ขนาดไม่เกิน 5MB)
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert("ไฟล์ขนาดเกิน 5MB");
                              return;
                            }
                            setNewSlipFile(file);
                            setPreviewUrl(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setIsOpenModal(false);
                        setPreviewUrl(null);
                        setNewSlipFile(null);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">close</span>
                      ปิดหน้าต่าง
                    </motion.button>

                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleUploadSlip}
                      disabled={!newSlipFile}
                      className={`px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                        newSlipFile
                          ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <span className="material-symbols-outlined">upload</span>
                      อัปโหลดสลิป
                    </motion.button>

                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmOpen}
                      disabled={paymentStatus}
                      className={`px-5 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                        !paymentStatus
                          ? "bg-green-500 hover:bg-green-600 text-white shadow-md"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        check_circle
                      </span>
                      ยืนยันการชำระเงิน
                    </motion.button>

                    {isConfirmOpen && (
                      <AlertConfirm
                        message="คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?"
                        // isOpen={isConfirmOpen}
                        onClose={() => setIsConfirmOpen(false)}
                        onConfirm={() =>
                          handleConfirm(employee?.participantId || "")
                        }
                      />
                    )}
                    {isModalAlertOpen && (
                      <ModalAlertWarning
                        details={isModalMessageOpen || ""}
                        onClose={() => setIsModalAlertOpen(false)}
                      />
                    )}

                    {/* loading */}
                    <LoadingModal
                      isOpen={isLoading}
                      progress={uploadProgress}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
