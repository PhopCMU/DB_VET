import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { StudentData } from "@/app/model/anatomy/studentModel";
import { config } from "@/config/config_api";
import { AlertConfirm } from "./../AlertMessage";
import { Cmuvc_UpdateFileRouterCryptoJS } from "@/app/routers/cmuvc/PostRouter";
import { AbstractDataModel } from "@/app/model/cmuvc/abstractModel";
import mammoth from "mammoth";
import {
  putUpdateAbstactStatus,
  putUpdateAbstactText,
} from "@/app/routers/cmuvc/PutRouter";
import { LoadingModal, ModalAlertWarning } from "../Modal";
import { putUpdate_Participant_Abstract_Image } from "@/app/routers/cmuvc/PutRouter";
import { motion } from "framer-motion";

interface ModalAbstractProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  formData: any;
  foodsData?: any;
  abstractTypeData?: any;
  onSave: (updatedData: AbstractDataModel) => void;
  onSuccess?: () => void;
}

export const ModalEditAbstract: React.FC<ModalAbstractProps> = ({
  isOpen,
  onClose,
  title,
  formData,
  foodsData,
  abstractTypeData,
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setDataEdit((prev) => ({ ...prev, [name]: value }));
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
      fname: dataEdit.fname,
      lname: dataEdit.lname,
      email: dataEdit.email,
      phone: dataEdit.phone,
      foodId: dataEdit.foodId,
      abstractTypeId: dataEdit.abstractTypeId,
      titleAbstarct: dataEdit.titleAbstarct,
      abstractId: formData.abstractId,
    };

    if (!payload.abstractId) {
      setIsModalMessageOpen("Student ID is required.");
      setIsModalAlertOpen(true);
      setIsLoading(false);
      return false;
    }

    // Filter out undefined and empty string fields
    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([_, value]) => value !== undefined && value !== "",
      ),
    );

    // Check if there are other fields besides studentId
    const hasOtherFields = Object.keys(filteredPayload).some(
      (key) => key !== "studentId",
    );

    if (!hasOtherFields) {
      setIsModalMessageOpen("Please fill in at least one field to update.");
      setIsModalAlertOpen(true);
      setIsLoading(false);
      return false;
    }

    // Call update API
    const response = await putUpdateAbstactText(
      filteredPayload as any,
      setUploadProgress,
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

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4 animate-fadeIn">
      {isConfirmOpen && (
        <AlertConfirm
          message="คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?"
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => handleConfirm()}
        />
      )}

      {isModalAlertOpen && (
        <ModalAlertWarning
          details={isModalMessageOpen || ""}
          onClose={() => setIsModalAlertOpen(false)}
        />
      )}

      <LoadingModal isOpen={isLoading} progress={uploadProgress} />

      {/* Modal Content */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto relative z-10 animate-scaleIn">
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* ชื่อ */}
            <div className="col-span-1 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fname"
                value={dataEdit.fname || formData.fname}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="กรอกชื่อ"
              />
            </div>

            {/* นามสกุล */}
            <div className="col-span-1 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lname"
                value={dataEdit.lname || formData.lname}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="นามสกุล"
              />
            </div>

            {/* อีเมล */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                อีเมล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="email"
                value={dataEdit.email || formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="อีเมล"
              />
            </div>

            {/* เบอร์ติดต่อ */}
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                เบอร์ติดต่อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={dataEdit.phone || formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="เบอร์โทร"
              />
            </div>

            {/* อาหาร */}
            <div className="col-span-1">
              <label
                htmlFor="foodType"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                อาหาร <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="foodId"
                  name="foodId"
                  value={dataEdit.foodId || formData.foodId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-700 appearance-none bg-white transition-all"
                  required
                >
                  {foodsData.map(
                    (food: { foodId: string; foodType: string }) => (
                      <option key={food.foodId} value={food.foodId}>
                        {food.foodType}
                      </option>
                    ),
                  )}
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
            </div>

            {/* ประเภทนำเสนอ */}
            <div className="col-span-1">
              <label
                htmlFor="abstractTypeId"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                ประเภทนำเสนอ <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="abstractTypeId"
                  name="abstractTypeId"
                  value={dataEdit.abstractTypeId || formData.abstractTypeId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-gray-700 appearance-none bg-white transition-all"
                  required
                >
                  {abstractTypeData &&
                    abstractTypeData.map(
                      (abstract: {
                        abstractTypeId: string;
                        adstractType: string;
                      }) => (
                        <option
                          key={abstract.abstractTypeId}
                          value={abstract.abstractTypeId}
                        >
                          {abstract.adstractType}
                        </option>
                      ),
                    )}
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
            </div>

            {/* หัวข้อเรื่อง */}
            <div className="col-span-1 md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                หัวข้อเรื่อง <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="titleAbstarct"
                value={dataEdit.titleAbstarct || formData.titleAbstarct}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                placeholder="หัวข้อเรื่อง"
              />
            </div>

            {/* ปุ่มบันทึก */}
            <div className="col-span-full flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ModalEditFileAbstract: React.FC<ModalAbstractProps> = ({
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
    null,
  );
  const [dataEdit, setDataEdit] = useState<any>({ ...formData });

  const [imagePreview, setImagePreview] = useState<string | null>(
    typeof formData.fileAbstarct === "object" && formData.fileAbstarct
      ? URL.createObjectURL(formData.fileAbstarct)
      : `${config.URL_API}/uploads/dataCmuvc/abstracts/${
          formData.fileAbstarct || "default.docx"
        }`,
  );

  const [docxContent, setDocxContent] = useState<string>("");
  const [isLoadingDoc, setIsLoadingDoc] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const renderDocx = async () => {
      if (!imagePreview) {
        setDocxContent("");
        return;
      }

      setIsLoadingDoc(true);
      try {
        let arrayBuffer;
        if (
          typeof formData.fileAbstract === "object" &&
          formData.fileAbstract
        ) {
          arrayBuffer = await formData.fileAbstract.arrayBuffer();
        } else {
          const response = await fetch(imagePreview);
          if (!response.ok) throw new Error("ไม่สามารถดึงเอกสารได้");
          arrayBuffer = await response.arrayBuffer();
        }
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setDocxContent(result.value);
      } catch (err) {
        console.error("เกิดข้อผิดพลาดในการแสดง .docx:", err);
        setDocxContent("");
      } finally {
        setIsLoadingDoc(false);
      }
    };

    renderDocx();
  }, [isOpen, imagePreview]);

  if (!isOpen) return null;

  const handleCancelEdit = () => {
    setDataEdit({ ...formData }); // รีเซ็ตข้อมูลเป็นค่าเดิม
    setImagePreview(
      formData.fileAbstarct && typeof formData.fileAbstarct === "object"
        ? URL.createObjectURL(formData.fileAbstarct)
        : `${config.URL_API}/uploads/dataCmuvc/abstracts/${
            formData.fileAbstarct || "default.docx"
          }`,
    );
    setIsEditing(false); // ออกจากโหมดแก้ไข
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files?.length) return;
    const file = files[0];

    setDataEdit((prev: any) => ({ ...prev, [name]: file }));
    if (name === "fileAbstract") {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    setDataEdit({} as any);
    onClose();
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setUploadProgress(0);

    const formDataToSend = new FormData();

    if (!formData.abstractId) {
      setIsModalMessageOpen("Student ID is required.");
      setIsModalAlertOpen(true);
      setIsLoading(false);
      return;
    }

    // ตรวจสอบ fileAbstract
    if (!(dataEdit.fileAbstract instanceof File)) {
      setIsModalMessageOpen("Please upload both files.");
      setIsModalAlertOpen(true);
      setIsLoading(false);
      return;
    }

    formDataToSend.append("abstractId", formData.abstractId);

    // Append fileAbstract
    formDataToSend.append("fileAbstract", dataEdit.fileAbstract);

    const response: any = await Cmuvc_UpdateFileRouterCryptoJS(
      formDataToSend,
      setUploadProgress,
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

  const handleConfirm = async (abstractId: string) => {
    setIsLoading(true);
    setUploadProgress(0);
    const response: any = await putUpdateAbstactStatus(
      abstractId,
      setUploadProgress,
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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm p-4 animate-fadeIn">
      {isConfirmOpen && (
        <AlertConfirm
          message="คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?"
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => handleConfirm(formData.abstractId)}
        />
      )}

      {isModalAlertOpen && (
        <ModalAlertWarning
          details={isModalMessageOpen || ""}
          onClose={() => setIsModalAlertOpen(false)}
        />
      )}

      <LoadingModal isOpen={isLoading} progress={uploadProgress} />

      {/* Modal Content */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[85vh] overflow-hidden z-40 border border-gray-200 animate-scaleIn flex flex-col">
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

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {!isEditing ? (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                ข้อมูลปัจจุบัน
              </h3>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <p className="text-sm font-medium text-gray-700 flex items-center">
                    <span className="material-symbols-outlined mr-2 text-blue-500">
                      description
                    </span>
                    เอกสาร Word
                  </p>
                  <a
                    href={imagePreview || "#"}
                    download="document.docx"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                  >
                    <span className="material-symbols-outlined mr-1 text-base">
                      download
                    </span>
                    ดาวน์โหลดเอกสาร
                  </a>
                </div>

                {/* Word Preview Container */}
                <div
                  className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                  style={{ height: "calc(85vh - 280px)", minHeight: "400px" }}
                >
                  {isLoadingDoc ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="material-symbols-rounded text-4xl text-blue-500 animate-spin">
                          progress_activity
                        </span>
                        <p className="mt-2 text-gray-600">กำลังโหลดเอกสาร...</p>
                      </div>
                    </div>
                  ) : docxContent ? (
                    <div
                      className="w-full h-full overflow-y-auto p-6 prose prose-sm max-w-none"
                      style={{
                        fontFamily: "Sarabun, -apple-system, sans-serif",
                        lineHeight: "1.8",
                      }}
                      dangerouslySetInnerHTML={{ __html: docxContent }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-5xl">
                          insert_drive_file
                        </span>
                        <p className="mt-3 text-base">
                          ไม่มีเอกสาร Word ให้แสดง
                        </p>
                        <p className="mt-1 text-sm">กรุณาอัปโหลดเอกสาร .docx</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={
                    formData.statusAbstract === "Pending"
                      ? handleConfirmOpen
                      : undefined
                  }
                  className={`${
                    formData.statusAbstract === "Pending"
                      ? "flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
                      : "hidden"
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
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  <span className="material-symbols-outlined mr-2">edit</span>
                  แก้ไขข้อมูล
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">
                แก้ไขข้อมูล
              </h3>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <span className="material-symbols-outlined mr-2 text-amber-500">
                    description
                  </span>
                  อัปโหลดเอกสาร Word (.docx){" "}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-4">
                  รองรับไฟล์ .docx สูงสุด 10MB
                </p>

                <div className="relative">
                  <input
                    type="file"
                    name="fileAbstract"
                    accept=".docx"
                    onChange={handleFileChange}
                    required
                    className="w-full opacity-0 absolute inset-0 cursor-pointer z-20"
                  />
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 relative z-10 ${
                      typeof dataEdit.fileAbstract === "object" &&
                      dataEdit.fileAbstract
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 hover:border-amber-400 hover:bg-amber-50/50"
                    }`}
                  >
                    {typeof dataEdit.fileAbstract === "object" &&
                    dataEdit.fileAbstract ? (
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-green-500">
                              description
                            </span>
                          </div>
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1.5">
                            <span className="material-symbols-outlined text-base">
                              check
                            </span>
                          </div>
                        </div>
                        <p className="text-green-600 text-sm font-medium max-w-xs truncate">
                          {dataEdit.fileAbstract.name}
                        </p>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(
                                URL.createObjectURL(dataEdit.fileAbstract),
                                "_blank",
                              );
                            }}
                            className="text-xs text-blue-500 hover:text-blue-700 flex items-center transition-colors"
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
                              setDataEdit((prev: any) => ({
                                ...prev,
                                fileAbstract: null,
                              }));
                              setImagePreview(null);
                              setDocxContent("");
                            }}
                            className="text-xs text-red-500 hover:text-red-700 flex items-center transition-colors"
                          >
                            <span className="material-symbols-outlined mr-1 text-sm">
                              delete
                            </span>
                            ลบไฟล์
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4">
                        <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-4xl text-gray-400">
                            description
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          คลิกหรือลากวางเพื่ออัปโหลด .docx
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          ไฟล์ต้องมีลายเซ็นและวันที่ชัดเจน
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined mr-2">
                      arrow_back
                    </span>
                    ย้อนกลับ
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined mr-2">
                      close
                    </span>
                    ยกเลิก
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <span className="material-symbols-outlined mr-2">save</span>
                  บันทึกข้อมูล
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ModalEditFileParticipant: React.FC<ModalAbstractProps> = ({
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
    null,
  );
  const [dataEdit, setDataEdit] = useState<StudentData>({ ...formData });
  const [imagePreview, setImagePreview] = useState<string | null>(
    typeof formData.Imagepayment === "object" && formData.Imagepayment
      ? URL.createObjectURL(formData.Imagepayment)
      : `${config.URL_API}/uploads/dataCmuvc/slips/${
          formData.Imagepayment || "default.png"
        }`,
  );

  if (!isOpen) return null;
  const handleCancelEdit = () => {
    setDataEdit({ ...formData }); // รีเซ็ตข้อมูลเป็นค่าเดิม
    setImagePreview(
      formData.Imagepayment && typeof formData.Imagepayment === "object"
        ? URL.createObjectURL(formData.Imagepayment)
        : `${config.URL_API}/uploads/${formData.Imagepayment || "default.png"}`,
    );

    setIsEditing(false); // ออกจากโหมดแก้ไข
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (!files?.length) return;
    const file = files[0];

    setDataEdit((prev) => ({ ...prev, [name]: file }));

    if (name === "Imagepayment") {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setUploadProgress(0);

    if (!formData.participantId && !formData.abstractId) {
      setIsModalMessageOpen(
        `${
          formData.participantId
            ? "Participant ID is required."
            : "Abstract ID is required."
        },`,
      );
      setIsModalAlertOpen(true);
      setIsLoading(false);
      return;
    }

    if (!dataEdit?.Imagepayment.name) {
      setIsModalMessageOpen("Please upload both files.");
      setIsModalAlertOpen(true);
      setIsLoading(false);
      return;
    }

    const formDataToSend = new FormData();

    formDataToSend.append(
      `${formData.participantId ? "participantId" : "abstractId"}`,
      formData.participantId || formData.abstractId,
    );
    if (dataEdit.Imagepayment.name) {
      formDataToSend.append("Imagepayment", dataEdit.Imagepayment);
    }
    formDataToSend.append(
      "type",
      `${formData.participantId ? "participant" : "abstract"}`,
    );

    try {
      const response: any = await Cmuvc_UpdateFileRouterCryptoJS(
        formDataToSend,
        (progress) => {
          setUploadProgress(progress); // รับค่า progress จริงจาก axios.onUploadProgress
        },
      );

      if (response.success) {
        // แสดง progress 100% จนครบ 2 วินาที
        setUploadProgress(100);

        setTimeout(() => {
          onClose();
          setIsEditing(false);

          if (onSuccess) onSuccess();
        }, 2000);
      } else {
        setIsModalMessageOpen(response.message || "เกิดข้อผิดพลาดในการอัปเดต");
        setIsModalAlertOpen(true);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsModalMessageOpen("เกิดข้อผิดพลาดระหว่างการส่งข้อมูล");
      setIsModalAlertOpen(true);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  const handleConfirmOpen = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setUploadProgress(0);

    if (!formData.participantId && !formData.abstractId) {
      setIsModalMessageOpen(
        `${
          formData.participantId
            ? "Participant ID is required."
            : "Abstract ID is required."
        },`,
      );
      setIsModalAlertOpen(true);
      setIsLoading(false);
      return;
    }

    const id = formData.participantId || formData.abstractId;
    const type = formData.participantId ? "participant" : "abstract";

    const payload = {
      id,
      type,
    };

    try {
      const response: any = await putUpdate_Participant_Abstract_Image(
        payload,
        (progress: any) => {
          setUploadProgress(progress); // รับค่า progress จริงจาก axios.onUploadProgress
        },
      );

      if (response.success) {
        // แสดง progress 100% จนครบ 2 วินาที
        setUploadProgress(100);

        setTimeout(() => {
          onClose();
          setIsEditing(false);
          if (onSuccess) onSuccess();
        }, 2000);
      } else {
        setIsModalMessageOpen(response.message || "เกิดข้อผิดพลาดในการอัปเดต");
        setIsModalAlertOpen(true);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsModalMessageOpen("เกิดข้อผิดพลาดระหว่างการส่งข้อมูล");
      setIsModalAlertOpen(true);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
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
        // onClick={onClose}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-40 border border-gray-200"
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

              {/* รูปภาพปัจจุบัน */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <span className="material-symbols-outlined mr-2 text-blue-500">
                    image
                  </span>
                  หลักฐานสลิปเงินโอน
                </p>
                <div className="flex justify-center">
                  <div className="relative group w-full flex justify-center">
                    <img
                      src={imagePreview || "_.jpg"}
                      alt=""
                      className="w-full max-w-md max-h-[60vh] object-contain rounded-lg border-2 border-dashed border-gray-300"
                    />

                    {imagePreview ===
                      `${config.URL_API}/uploads/dataCmuvc/slips/default.png` && (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        <span className="material-symbols-outlined text-4xl">
                          image_not_supported
                        </span>
                      </div>
                    )}

                    {imagePreview && (
                      <div className="absolute inset-0 bg-black/10 bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
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
                    formData.payments ? undefined : () => handleConfirmOpen()
                  }
                  className={`${
                    formData.payments
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

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  {/* Upload Image */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3  items-center">
                      <span className="material-symbols-outlined mr-2 text-amber-500">
                        image
                      </span>
                      อัพโหลดรูปสลิปเงินโอน{" "}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-4">
                      รองรับ JPG/PNG สูงสุด 10MB
                    </p>

                    <div className="relative group">
                      <input
                        type="file"
                        name="Imagepayment"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                        className="w-full opacity-0 absolute inset-0 cursor-pointer z-20"
                      />
                      <div
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 relative z-10
                ${
                  typeof dataEdit.Imagepayment === "object" &&
                  dataEdit.Imagepayment
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 hover:border-amber-400 hover:bg-amber-50"
                }
              `}
                      >
                        {typeof dataEdit.Imagepayment === "object" &&
                        dataEdit.Imagepayment ? (
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
