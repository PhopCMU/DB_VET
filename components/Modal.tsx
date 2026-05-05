import React, { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { th } from "date-fns/locale/th"; // locale ภาษาไทย
import { StudentData } from "@/app/model/anatomy/studentModel";
import { config } from "@/config/config_api";
import {
  putUpdateStatusPDPA,
  putUpdateStudentText,
} from "@/app/routers/anatomy/PutRouter";
import { AlertConfirm } from "./AlertMessage";
import { UpdateFileRouterCryptoJS } from "@/app/routers/anatomy/PostRouter";

interface ModalProps {
  isOpen: boolean; // ควบคุมการเปิด/ปิด Modal
  onClose: () => void; // ฟังก์ชันสำหรับปิด Modal
  title?: string; // หัวข้อของ Modal (optional)
  children: React.ReactNode; // เนื้อหาภายใน Modal
}

interface ModalAlertProps {
  onClose: () => void;
  details: string | React.ReactNode;
}

interface ModalLoadingProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  progress: number; // ค่าเปอร์เซ็นต์ 0-100
  loadingText?: string;
}

interface ModalStudentProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  formData: StudentData;
  onSave: (updatedData: StudentData) => void;
  onSuccess?: () => void; // เพิ่ม prop นี้
}

interface LoadingModalProps {
  isOpen: boolean;
  progress: number;
  isError?: boolean;
  errorMessage?: string;
  actionButton?: ReactNode;
}

export const ModalEditStudent: React.FC<ModalStudentProps> = ({
  isOpen,
  onClose,
  title,
  formData,
  onSave,
  onSuccess,
}) => {
  // เก็บค่า formData ใน state เพื่อให้สามารถแก้ไขได้
  const [dataEdit, setDataEdit] = useState<StudentData>({ ...formData });
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isModalAlertOpen, setIsModalAlertOpen] = useState(false);
  const [isModalMessageOpen, setIsModalMessageOpen] = useState("");

  if (!isOpen) return null;

  // Handler เมื่อ input เปลี่ยน
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setDataEdit((prev) => ({ ...prev, [name]: value }));
  };

  // ฟังก์ชันคำนวณอายุ
  const calculateAge = (birthDate: string | Date): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  };

  const handleCancel = () => {
    setDataEdit({} as StudentData);
    onClose();
  };

  const handleConfirmOpen = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setUploadProgress(0);

    const payload = {
      address: dataEdit.address,
      hdb: dataEdit.hdb,
      age: dataEdit.age,
      cardId: dataEdit.cardId,
      fname: dataEdit.fname,
      email: dataEdit.email,
      levelup: dataEdit.levelup,
      phone: dataEdit.phone,
      prefix: dataEdit.prefix,
      school: dataEdit.school,
      studentId: formData.studentId,
    };

    if (!payload.studentId) {
      setIsModalMessageOpen("Student ID is required.");
      setIsModalAlertOpen(true);
      setIsLoading(false);
      return false;
    }

    // Filter out undefined and empty string fields
    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([_, value]) => value !== undefined && value !== ""
      )
    );

    // Convert levelup to number if it exists
    if (filteredPayload.levelup !== undefined) {
      filteredPayload.levelup = Number(filteredPayload.levelup);
    }

    // Check if there are other fields besides studentId
    const hasOtherFields = Object.keys(filteredPayload).some(
      (key) => key !== "studentId"
    );

    if (!hasOtherFields) {
      setIsModalMessageOpen("Please fill in at least one field to update.");
      setIsModalAlertOpen(true);
      setIsLoading(false);
      return false;
    }

    // Call update API
    const response = await putUpdateStudentText(
      filteredPayload as any,
      setUploadProgress
    );

    if (response.success) {
      setTimeout(() => {
        onClose();
        setIsLoading(false);
        if (onSuccess) onSuccess();
      }, 2000);
    } else {
      setIsLoading(false);
      setIsModalMessageOpen(response.message || "An error occurred.");
      setIsModalAlertOpen(true);
    }
  };

  // ตัวเลือกคำนำหน้า
  const Prefixs = [
    { prefix_name: "นาย" },
    { prefix_name: "นางสาว" },
    { prefix_name: "เด็กชาย" },
    { prefix_name: "เด็กหญิง" },
    { prefix_name: "ไม่ระบุ" },
  ];

  // ระดับชั้น
  const Level = [{ Level: "6" }, { Level: "5" }, { Level: "4" }];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      {isConfirmOpen && (
        <AlertConfirm
          message="คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?"
          // isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => handleConfirm()}
        />
      )}

      {/* ModalAlert Messages */}
      {isModalAlertOpen && (
        <ModalAlertWarning
          details={isModalMessageOpen || ""}
          onClose={() => setIsModalAlertOpen(false)}
        />
      )}

      {/* loading */}
      <LoadingModal isOpen={isLoading} progress={uploadProgress} />
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative z-10"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={handleCancel}
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

        {/* Form Content */}
        <div className="p-6">
          <motion.div
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {/* คำนำหน้า */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ delay: 0.1 }}
              className="col-span-1"
            >
              <label
                htmlFor="prefix"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                คำนำหน้า <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="prefix"
                  name="prefix"
                  value={dataEdit.prefix || formData.prefix}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b18246] focus:border-[#b18246] text-gray-700 appearance-none bg-white"
                  required
                >
                  {Prefixs.map((prefix) => (
                    <option key={prefix.prefix_name} value={prefix.prefix_name}>
                      {prefix.prefix_name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* ชื่อ-นามสกุล */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ delay: 0.2 }}
              className="col-span-1 md:col-span-2"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ชื่อ-นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fname"
                value={dataEdit.fname || formData.fname}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="กรอกชื่อ-นามสกุล"
              />
            </motion.div>

            {/* ระดับชั้น */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ delay: 0.3 }}
              className="col-span-1"
            >
              <label
                htmlFor="levelup"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                ระดับชั้น <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="levelup"
                  name="levelup"
                  value={dataEdit.levelup || formData.levelup}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b18246] focus:border-[#b18246] text-gray-700 appearance-none bg-white"
                  required
                >
                  {Level &&
                    Level.map((level) => (
                      <option key={level.Level} value={level.Level}>
                        ม.{level.Level}
                      </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* โรงเรียน */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ delay: 0.4 }}
              className="col-span-1"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                โรงเรียน <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="school"
                value={dataEdit.school || formData.school}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="กรอกชื่อโรงเรียน"
              />
            </motion.div>

            {/* ที่อยู่โรงเรียน */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ delay: 0.5 }}
              className="col-span-1 md:col-span-3"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ที่อยู่โรงเรียน <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={dataEdit.address || formData.address}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="กรอกที่อยู่โรงเรียน"
              />
            </motion.div>

            {/* วันเกิด */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ delay: 0.6 }}
              className="col-span-1"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                วันเกิด <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={
                  dataEdit.hdb
                    ? new Date(dataEdit.hdb)
                    : formData.hdb
                    ? new Date(formData.hdb)
                    : null
                }
                onChange={(date: Date | null) => {
                  if (date instanceof Date && !isNaN(date.getTime())) {
                    const formattedDate = date.toISOString().split("T")[0];
                    const age = calculateAge(date); // คำนวณอายุใหม่
                    setDataEdit((prev) => ({
                      ...prev,
                      hdb: formattedDate,
                      age,
                    }));
                  }
                }}
                dateFormat="dd/MM/yyyy"
                wrapperClassName="w-full"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#b18246] focus:border-[#b18246] text-gray-700"
                placeholderText="เลือกวันเกิด"
                peekNextMonth
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                maxDate={new Date()}
                locale={th as any}
                withPortal
              />
            </motion.div>

            {/* อายุ */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ delay: 0.7 }}
              className="col-span-1"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                อายุ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="age"
                value={dataEdit.age || formData.age}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="คำนวณอัตโนมัติ"
              />
            </motion.div>

            {/* รหัสบัตรประชาชน */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ delay: 0.8 }}
              className="col-span-1 md:col-span-2"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                รหัสบัตรประชาชน <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cardId"
                value={dataEdit.cardId || formData.cardId}
                onChange={handleInputChange}
                required
                pattern="\d{1,13}"
                maxLength={13}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="กรอกรหัสบัตรประชาชน"
              />
            </motion.div>

            {/* เบอร์โทร */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ delay: 0.9 }}
              className="col-span-1"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                เบอร์โทร <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={dataEdit.phone || formData.phone}
                onChange={handleInputChange}
                required
                pattern="\d{1,10}"
                maxLength={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="กรอกเบอร์โทร"
              />
            </motion.div>

            {/* อีเมล */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ delay: 1.0 }}
              className="col-span-1 md:col-span-3"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={dataEdit.email || formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="กรอกอีเมล"
              />
            </motion.div>

            {/* ปุ่มบันทึก */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ delay: 1.4 }}
              className="col-span-full flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100"
            >
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmOpen}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                บันทึกข้อมูล
              </button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export const ModalEditFileStudent: React.FC<ModalStudentProps> = ({
  isOpen,
  onClose,
  title,
  formData,
  onSave,
  onSuccess,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isModalAlertOpen, setIsModalAlertOpen] = useState(false);
  const [isModalMessageOpen, setIsModalMessageOpen] = useState<string | null>(
    null
  );
  const [dataEdit, setDataEdit] = useState<StudentData>({ ...formData });
  const [imagePreview, setImagePreview] = useState<string | null>(
    typeof formData.uploadImage === "object" && formData.uploadImage
      ? URL.createObjectURL(formData.uploadImage)
      : `${config.URL_API}/uploads/dataAnatomy/profile/${
          formData.uploadImage || "default.jpg"
        }`
  );
  const [pdfPreview, setPdfPreview] = useState<string | null>(
    typeof formData.uploadPDPA === "object" && formData.uploadPDPA
      ? URL.createObjectURL(formData.uploadPDPA)
      : `${config.URL_API}/uploads/dataAnatomy/pdpa/${
          formData.uploadPDPA || "default.pdf"
        }`
  );

  if (!isOpen) return null;

  const handleCancelEdit = () => {
    setDataEdit({ ...formData }); // รีเซ็ตข้อมูลเป็นค่าเดิม
    setImagePreview(
      formData.uploadImage && typeof formData.uploadImage === "object"
        ? URL.createObjectURL(formData.uploadImage)
        : `${config.URL_API}/uploads/dataAnatomy/profile/${
            formData.uploadImage || "default.jpg"
          }`
    );
    setPdfPreview(
      formData.uploadPDPA && typeof formData.uploadPDPA === "object"
        ? URL.createObjectURL(formData.uploadPDPA)
        : `${config.URL_API}/uploads/dataAnatomy/pdpa/${
            formData.uploadPDPA || "default.pdf"
          }`
    );
    setIsEditing(false); // ออกจากโหมดแก้ไข
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files?.length) return;
    const file = files[0];

    setDataEdit((prev) => ({ ...prev, [name]: file }));

    if (name === "uploadImage") {
      setImagePreview(URL.createObjectURL(file));
    } else if (name === "uploadPDPA") {
      setPdfPreview(URL.createObjectURL(file));
    }
  };
  const handleSubmit = async () => {
    setIsLoading(true);
    setUploadProgress(0);

    const formDataToSend = new FormData();

    if (!formData.studentId) {
      setIsModalMessageOpen("Student ID is required.");
      setIsModalAlertOpen(true);
      setIsLoading(false);
      return;
    }

    if (!dataEdit.uploadImage.name && !dataEdit.uploadPDPA.name) {
      setIsModalMessageOpen("Please upload both files.");
      setIsModalAlertOpen(true);
      setIsLoading(false);
      return;
    }

    formDataToSend.append("studentId", formData.studentId);
    if (dataEdit.uploadImage.name) {
      formDataToSend.append("uploadImage", dataEdit.uploadImage);
    }
    if (dataEdit.uploadPDPA.name) {
      formDataToSend.append("uploadPDPA", dataEdit.uploadPDPA);
    }

    const response: any = await UpdateFileRouterCryptoJS(
      formDataToSend,
      setUploadProgress
    );

    if (response.success) {
      onClose();
      setIsEditing(false);
      if (onSuccess) onSuccess();
    } else {
      setIsModalMessageOpen(response.message || "เกิดข้อผิดพลาดในการอัปเดต");
      setIsModalAlertOpen(true);
    }

    setIsLoading(false);
  };

  const handleConfirmOpen = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = async (studentId: string) => {
    setIsLoading(true);
    setUploadProgress(0);
    const response: any = await putUpdateStatusPDPA(
      studentId,
      setUploadProgress
    );

    if (response.success || response.status === 200) {
      setTimeout(() => {
        onClose();
        setIsEditing(false); // Reset mode
        if (onSuccess) onSuccess(); // เรียก onSuccess เมื่ออัพเดทสำเร็จ
      }, 2000);
    } else {
      setIsLoading(false);
      setIsModalMessageOpen(response.message || "");
      setIsModalAlertOpen(true);
    }
  };

  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40 backdrop-blur-sm p-4">
      {isConfirmOpen && (
        <AlertConfirm
          message="คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?"
          // isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => handleConfirm(formData.studentId)}
        />
      )}

      {/* ModalAlert Messages */}
      {isModalAlertOpen && (
        <ModalAlertWarning
          details={isModalMessageOpen || ""}
          onClose={() => setIsModalAlertOpen(false)}
        />
      )}

      {/* loading */}
      <LoadingModal isOpen={isLoading} progress={uploadProgress} />

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0"
        // onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto z-40 border border-gray-200"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-8 py-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200"
            aria-label="Close modal"
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

        {/* Body */}
        <div className="px-6 py-6 space-y-8">
          {/* แสดงข้อมูลเดิมหรือโหมดแก้ไข */}
          {!isEditing ? (
            <div className="space-y-8">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                ข้อมูลปัจจุบัน
              </h3>

              {/* PDF ปัจจุบัน */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="material-symbols-outlined mr-2 text-blue-500">
                      description
                    </span>
                    หนังสือให้ความยินยอม
                  </p>
                  <a
                    href={pdfPreview || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <span className="material-symbols-outlined mr-1 text-base">
                      open_in_new
                    </span>
                    เปิดในแท็บใหม่
                  </a>
                </div>
                <div className="relative h-[50vh] rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <iframe
                    src={pdfPreview || ""}
                    title="PDF Preview"
                    className="w-full h-full"
                  />
                  {!pdfPreview && (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-4xl">
                          insert_drive_file
                        </span>
                        <p className="mt-2">ไม่มีไฟล์ PDF</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* รูปภาพปัจจุบัน */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <span className="material-symbols-outlined mr-2 text-blue-500">
                    image
                  </span>
                  รูปถ่าย (หน้าตรง)
                </p>
                <div className="flex justify-center">
                  <div className="relative group">
                    <img
                      src={imagePreview || "/placeholder-user.jpg"}
                      alt="รูปถ่ายปัจจุบัน"
                      className="w-48 h-48 object-contain rounded-lg border-2 border-dashed border-gray-300"
                    />
                    {imagePreview && (
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => window.open(imagePreview, "_blank")}
                          className="p-2 bg-white rounded-full shadow-md text-blue-600 hover:text-blue-800"
                        >
                          <span className="material-symbols-outlined">
                            zoom_in
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ปุ่มดำเนินการ */}
              <div className="flex justify-between gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={
                    formData.paperPDPA ? undefined : () => handleConfirmOpen()
                  }
                  className={`${
                    formData.paperPDPA
                      ? "hidden"
                      : "flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
                  }`}
                >
                  <span className="material-symbols-outlined mr-2">
                    check_circle
                  </span>
                  ยืนยันการตรวจสอบ
                </button>
                <button
                  type="button"
                  onClick={toggleEditMode}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  <span className="material-symbols-outlined mr-2">edit</span>
                  แก้ไขข้อมูล
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ฟอร์มแก้ไข */}
              <div className="space-y-8">
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                  แก้ไขข้อมูล
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upload Image */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3  items-center">
                      <span className="material-symbols-outlined mr-2 text-amber-500">
                        image
                      </span>
                      อัพโหลดรูปถ่าย (หน้าตรง){" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-4">
                      รองรับ JPG/PNG สูงสุด 10MB
                    </p>

                    <div className="relative group">
                      <input
                        type="file"
                        name="uploadImage"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                        className="w-full opacity-0 absolute inset-0 cursor-pointer z-20"
                      />
                      <div
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 relative z-10
                ${
                  typeof dataEdit.uploadImage === "object" &&
                  dataEdit.uploadImage
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 hover:border-amber-400 hover:bg-amber-50"
                }
              `}
                      >
                        {typeof dataEdit.uploadImage === "object" &&
                        dataEdit.uploadImage ? (
                          <div className="flex flex-col items-center space-y-3">
                            <div className="relative">
                              <img
                                src={imagePreview || ""}
                                alt="ตัวอย่างรูปถ่าย"
                                className="w-32 h-32 object-contain rounded-lg border-2 border-green-200"
                              />
                              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                                <span className="material-symbols-outlined text-sm">
                                  check
                                </span>
                              </div>
                            </div>
                            <p className="text-green-600 text-sm font-medium">
                              อัพโหลดสำเร็จ
                            </p>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                // ลบรูปภาพที่เลือก
                              }}
                              className="text-xs text-red-500 hover:text-red-700 flex items-center"
                            >
                              <span className="material-symbols-outlined mr-1 text-sm">
                                delete
                              </span>
                              ลบรูปภาพ
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                              <span className="material-symbols-outlined text-3xl text-gray-400">
                                photo_camera
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">
                              คลิกหรือลากวางเพื่ออัพโหลดรูปภาพ
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              ขนาดแนะนำ: 400x400 พิกเซล
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upload PDPA PDF */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <label className=" text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <span className="material-symbols-outlined mr-2 text-amber-500">
                        description
                      </span>
                      อัพโหลดหนังสือยินยอม (PDF){" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-4">
                      รองรับไฟล์ PDF สูงสุด 10MB
                    </p>

                    <div className="relative group">
                      <input
                        type="file"
                        name="uploadPDPA"
                        accept=".pdf"
                        onChange={handleFileChange}
                        required
                        className="w-full opacity-0 absolute inset-0 cursor-pointer z-20"
                      />
                      <div
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 relative z-10
                ${
                  typeof dataEdit.uploadPDPA === "object" && dataEdit.uploadPDPA
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 hover:border-amber-400 hover:bg-amber-50"
                }
              `}
                      >
                        {typeof dataEdit.uploadPDPA === "object" &&
                        dataEdit.uploadPDPA ? (
                          <div className="flex flex-col items-center space-y-3">
                            <div className="relative">
                              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <span className="material-symbols-outlined text-3xl text-green-500">
                                  picture_as_pdf
                                </span>
                              </div>
                              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                                <span className="material-symbols-outlined text-sm">
                                  check
                                </span>
                              </div>
                            </div>
                            <p className="text-green-600 text-sm font-medium">
                              {dataEdit.uploadPDPA.name}
                            </p>
                            <div className="flex space-x-3">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(
                                    URL.createObjectURL(dataEdit.uploadPDPA),
                                    "_blank"
                                  );
                                }}
                                className="text-xs text-blue-500 hover:text-blue-700 flex items-center"
                              >
                                <span className="material-symbols-outlined mr-1 text-sm">
                                  visibility
                                </span>
                                ดูไฟล์
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // ลบไฟล์ PDF ที่เลือก
                                }}
                                className="text-xs text-red-500 hover:text-red-700 flex items-center"
                              >
                                <span className="material-symbols-outlined mr-1 text-sm">
                                  delete
                                </span>
                                ลบไฟล์
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                              <span className="material-symbols-outlined text-3xl text-gray-400">
                                description
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-600">
                              คลิกหรือลากวางเพื่ออัพโหลด PDF
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                              ไฟล์ต้องมีลายเซ็นและวันที่ชัดเจน
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons when editing */}
                <div className="flex flex-col-reverse md:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200 flex items-center"
                    >
                      <span className="material-symbols-outlined mr-1">
                        arrow_back
                      </span>
                      ย้อนกลับ
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200 flex items-center"
                    >
                      <span className="material-symbols-outlined mr-1">
                        close
                      </span>
                      ยกเลิก
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-8 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined mr-2">save</span>
                    บันทึกการเปลี่ยนแปลง
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null; // ไม่แสดง Modal ถ้า isOpen เป็น false

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 bg-opacity-50"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 relative transform transition-all duration-300 scale-100">
        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* หัวข้อ */}
        {title && (
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
        )}

        {/* เนื้อหา */}
        <div className="text-gray-600">{children}</div>
      </div>
    </motion.div>
  );
};

export const ModalCard: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null; // ไม่แสดง Modal ถ้า isOpen เป็น false

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 bg-opacity-50"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 relative transform transition-all duration-300 scale-100">
        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none hidden"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* หัวข้อ */}
        {title && (
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
        )}

        {/* เนื้อหา */}
        <div className="text-gray-600 flex flex-col gap-2">{children}</div>
      </div>
    </motion.div>
  );
};

export const ModalRecheck: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null; // ไม่แสดง Modal ถ้า isOpen เป็น false

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 bg-opacity-50"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6 relative transform transition-all duration-300 scale-100">
        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* หัวข้อ */}
        {title && (
          <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
        )}

        {/* เนื้อหา */}
        <div className="text-gray-600 flex flex-col gap-2">{children}</div>
      </div>
    </motion.div>
  );
};

export const ModalLoading: React.FC<ModalLoadingProps> = ({
  isOpen,
  onClose,
  title = "Loading...",
  progress = 0,
  loadingText = "Please wait a moment...",
}) => {
  if (!isOpen) return null;

  // จำกัด progress ระหว่าง 0-100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 bg-opacity-50"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 relative transform transition-all duration-300 scale-100">
        {/* ปุ่มปิด (ถ้ามี onClose) */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none hidden"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* หัวข้อ */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          {title}
        </h2>

        {/* เนื้อหา Progress */}
        <div className="flex flex-col items-center gap-4">
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
              className="bg-blue-500 h-full rounded-full"
              style={{ backgroundColor: "#ae7e47" }}
              initial={{ width: 0 }}
              animate={{ width: `${clampedProgress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>

          {/* เปอร์เซ็นต์และข้อความ */}
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">
              {clampedProgress}%
            </span>
            <span className="text-gray-600">{loadingText}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isOpen,
  progress = 0,
  isError = false,
  errorMessage,
  actionButton,
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 400 }}
        className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-gray-700 overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full"
          />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <motion.div
              animate={
                isError
                  ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }
                  : {
                      rotate: [0, 360],
                    }
              }
              transition={
                isError
                  ? {
                      duration: 0.6,
                      repeat: 1,
                    }
                  : {
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }
              }
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                isError ? "bg-red-500/20" : "bg-blue-500/20"
              }`}
            >
              <span className="material-symbols-outlined text-4xl">
                {isError
                  ? "error"
                  : progress >= 100
                  ? "check_circle"
                  : "progress_activity"}
              </span>
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-white text-center"
            >
              {isError
                ? "เกิดข้อผิดพลาด"
                : progress >= 100
                ? "สำเร็จเรียบร้อย"
                : "กำลังประมวลผล"}
            </motion.h3>
          </div>

          {/* Content */}
          {!isError ? (
            <div className="space-y-5">
              <div className="space-y-3">
                <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{
                      duration: 0.6,
                      ease: "easeOut",
                    }}
                    className={`h-full rounded-full ${
                      progress >= 100
                        ? "bg-green-500"
                        : "bg-gradient-to-r from-blue-400 to-purple-500"
                    } shadow-lg`}
                  />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">สถานะ:</span>
                  <span className="font-medium text-white">
                    {progress >= 100 ? "เสร็จสิ้น" : `${progress}%`}
                  </span>
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-400 text-center text-sm"
              >
                {progress >= 100
                  ? "การดำเนินการเสร็จสมบูรณ์แล้ว"
                  : "กรุณารอสักครู่ ระบบกำลังประมวลผล..."}
              </motion.p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/20">
                <p className="text-red-200 font-medium text-center">
                  {errorMessage || "เกิดข้อผิดพลาดในการประมวลผล"}
                </p>
              </div>

              <div className="flex justify-center gap-4">
                {actionButton || (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium transition-all duration-300 shadow-lg flex items-center"
                  >
                    <span className="material-symbols-outlined mr-2">
                      refresh
                    </span>
                    ลองอีกครั้ง
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Animated dots for loading state */}
        {!isError && progress < 100 && (
          <motion.div
            className="flex justify-center gap-1.5 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 bg-blue-400 rounded-full"
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export const ModalAlertWarning: React.FC<ModalAlertProps> = ({
  onClose,
  details,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
    >
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-purple-900/20"
        onClick={onClose}
      />

      {/* Modal container */}
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-lg mx-auto border border-white/20 relative overflow-hidden"
        role="dialog"
        aria-labelledby="modal-title"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl -z-0">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-200/10 rounded-full filter blur-3xl animate-float-slow"></div>
          <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-amber-200/10 rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0)_70%)]"></div>
        </div>

        <div className="relative z-10">
          {/* Content */}
          <div className="text-gray-800 text-lg leading-relaxed mb-8 max-h-[65vh] overflow-y-auto custom-scroll pr-3">
            {details}
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">check</span>
              <span>เข้าใจแล้ว</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
