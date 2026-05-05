"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StudentData } from "@/app/model/anatomy/studentModel";
import { fetchDataListuser } from "@/app/routers/anatomy/GetRouter";
import { config } from "@/config/config_api";
import { LoadingModal, ModalAlertWarning } from "@/components/Modal";
import { UpdateFileImageRouterCryptoJS } from "@/app/routers/anatomy/PostRouter";
import { AlertConfirm } from "@/components/AlertMessage";
import { putUpdateStatusPayment } from "@/app/routers/anatomy/PutRouter";
import dayjs from "dayjs";
import ExportMenu from "@/utils/ExportOptions";

export const AnatomyPage = () => {
  // 🔁 States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [paymentStatus, setPaymentStatus] = useState<boolean | null>(null);
  const [newSlipFile, setNewSlipFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<
    StudentData[] | undefined
  >();
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isModalAlertOpen, setIsModalAlertOpen] = useState(false);
  const [isModalMessageOpen, setIsModalMessageOpen] = useState<string | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fatchDataUser = async () => {
    const response: any = await fetchDataListuser();
    if (response.status === 200 || response.success) {
      setSelectedStudent(response.data);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      fatchDataUser();
      setIsUpdated(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [isUpdated]);

  // กรองข้อมูลตามชื่อ
  const filteredStudents = selectedStudent?.filter((student: StudentData) =>
    Object.values(student).some((val: any) =>
      val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // คำนวณยอดรวม
  const totalPaidStudents = filteredStudents?.filter(
    (s) => s.payments === true
  ).length;

  const totalPendingStudents = filteredStudents?.filter(
    (s) => s.payments === false
  ).length;

  // ฟังก์ชันดู Slip
  const handleViewSlip = (url: string | null, studentId: string) => {
    setSelectedSlip(url);
    setSelectedStudentId(studentId);
    setIsOpenModal(true);
  };

  // อัปโหลด Slip ใหม่
  const handleUploadSlip = async () => {
    setIsLoading(true);
    setUploadProgress(0);

    const payload = {
      studentId: selectedStudentId,
      uploadSlip: newSlipFile,
    };

    if (!payload.studentId) {
      setIsModalMessageOpen("Student ID is required.");
      setIsModalAlertOpen(true);
      setIsLoading(false);
      return;
    }

    if (!payload.uploadSlip?.name && !payload.uploadSlip?.name) {
      setIsModalMessageOpen("Please upload both files.");
      setIsModalAlertOpen(true);
      setIsLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("studentId", payload.studentId);
    formDataToSend.append("uploadSlip", payload.uploadSlip);

    const response: any = await UpdateFileImageRouterCryptoJS(
      formDataToSend,
      setUploadProgress
    );
    if (response.success) {
      setTimeout(async () => {
        await fatchDataUser();
        setIsUpdated(true);
        setIsLoading(false);
        setIsOpenModal(false);
        setPreviewUrl(null);
        setNewSlipFile(null);
      }, 2000);
    } else {
      setIsLoading(false);
    }
  };

  const handleConfirmOpen = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = async (studentId: string) => {
    setIsLoading(true);
    setUploadProgress(0);
    const response: any = await putUpdateStatusPayment(
      studentId,
      setUploadProgress
    );

    if (response.success || response.status === 200) {
      setTimeout(async () => {
        await fatchDataUser();
        setIsUpdated(true);
        setIsLoading(false);
        setIsOpenModal(false);
        setPreviewUrl(null);
        setNewSlipFile(null);
      }, 2000);
    } else {
      setIsLoading(false);
      setIsModalMessageOpen(
        response.message || "Request failed with status code 404"
      );
      setIsModalAlertOpen(true);
    }
  };

  const exportOptions = [
    {
      id: 1,
      label: "PDF",
      icon: "picture_as_pdf",
      action: () => handleExport("pdf"),
    },
    {
      id: 2,
      label: "Excel",
      icon: "table_view",
      action: () => handleExport("excel"),
    },
    {
      id: 3,
      label: "CSV",
      icon: "file_download",
      action: () => handleExport("csv"),
    },
  ];

  const handleExport = (type: any) => {
    console.log(`Exporting as ${type}`);
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      {isConfirmOpen && (
        <AlertConfirm
          message="คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?"
          // isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => handleConfirm(selectedStudentId || "")}
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
      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 md:p-8 text-white">
          <div className="flex items-center gap-4 mb-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                ANATOMY FINANCE
              </h1>
              <p className="text-blue-100 mt-1">
                การแข่งขันอัจฉริยภาพการตอบปัญหากายวิภาคศาสตร์ทางสัตวแพทย์ระดับชาติ
              </p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-200 rounded-full opacity-20"></div>
              <div className="flex items-center gap-4 relative ">
                <div className="p-3 bg-emerald-100 rounded-lg shadow-inner">
                  <span className="material-symbols-outlined text-emerald-600 text-2xl">
                    check_circle
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-emerald-800">
                    ชำระเงินแล้ว
                  </h3>
                  <p className="mt-1 text-3xl font-bold text-emerald-900">
                    {totalPaidStudents}
                    <span className="text-base font-normal ml-1">คน</span>
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100 shadow-sm relative overflow-hidden"
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-200 rounded-full opacity-20"></div>
              <div className="flex items-center gap-4 relative">
                <div className="p-3 bg-amber-100 rounded-lg shadow-inner">
                  <span className="material-symbols-outlined text-amber-600 text-2xl">
                    pending
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-amber-800">
                    รอตรวจสอบ
                  </h3>
                  <p className="mt-1 text-3xl font-bold text-amber-900">
                    {totalPendingStudents}
                    <span className="text-base font-normal ml-1">คน</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-4 sm:px-0 mb-6">
            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full sm:w-96"
            >
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="ค้นหาชื่อนักเรียน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all duration-300 ease-in-out placeholder-gray-400 text-gray-700"
              />
            </motion.div>

            {/* Export Button */}
            <div className="relative">
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
                  className="relative w-full sm:w-auto"
                >
                  <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-sm w-full sm:w-auto"
                  >
                    <span className="material-symbols-outlined">download</span>
                    <span>ส่งออกข้อมูล</span>
                  </motion.button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 z-40 mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-gray-100 overflow-hidden"
                      >
                        <div className="py-1">
                          <ExportMenu
                            exportData={selectedStudent as any}
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-16"
            >
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                <p className="text-blue-600 font-medium">กำลังโหลดข้อมูล...</p>
              </div>
            </motion.div>
          )}

          {/* Table */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden rounded-xl border border-blue-100 shadow-sm bg-white"
            >
              <table className="min-w-full divide-y divide-blue-100">
                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">
                          person
                        </span>
                        ชื่อ-นามสกุล
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">
                          location_city
                        </span>
                        โรงเรียน
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">
                          today
                        </span>
                        วันที่
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">
                          payments
                        </span>
                        สถานะการชำระเงิน
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold uppercase tracking-wider">
                      <span className="mr-2">สลิปการโอนเงิน</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-50">
                  {filteredStudents?.map((student: any, index) => (
                    <motion.tr
                      key={student.studentId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-blue-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="material-symbols-outlined text-blue-600">
                              person
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex justify-start gap-2">
                              <span>{student.fname}</span>
                              <span>#{student.examSeatNumber}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {student.studentId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {student.school}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {dayjs(student.createdAt)
                            .locale("th")
                            .format("DD/MM/YYYY")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            student.payments
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {student.payments ? (
                            <span className="flex items-center">
                              <span className="material-symbols-outlined text-xs mr-1">
                                check_circle
                              </span>
                              ชำระแล้ว
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <span className="material-symbols-outlined text-xs mr-1">
                                schedule
                              </span>
                              รอตรวจสอบ
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            handleViewSlip(
                              student.uploadSlip,
                              student.studentId
                            );
                            setPaymentStatus(student.payments);
                          }}
                          disabled={!student.uploadSlip}
                          className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg transition-all ${
                            student.uploadSlip
                              ? "text-blue-600 hover:bg-blue-100"
                              : "text-gray-400 cursor-not-allowed bg-gray-100"
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">
                            receipt_long
                          </span>
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Image Modal */}
      {isOpenModal && (
        <AnimatePresence>
          {selectedSlip && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] flex flex-col z-10 overflow-hidden"
              >
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <h3 className="text-xl font-semibold flex items-center gap-3">
                    <span className="material-symbols-outlined">
                      receipt_long
                    </span>
                    สลิปหลักฐานการชำระเงิน
                  </h3>
                  <button
                    onClick={() => {
                      setSelectedSlip(null);
                      setNewSlipFile(null);
                      setPreviewUrl(null);
                    }}
                    className="p-2 rounded-full hover:bg-blue-800 transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                {/* Image Preview */}
                <div className="flex-1 overflow-auto p-6 bg-gray-50">
                  {previewUrl ? (
                    <div className="flex justify-center">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full w-64 h-auto rounded-lg shadow-md border border-gray-200"
                      />
                    </div>
                  ) : selectedSlip ? (
                    <div className="flex justify-center">
                      <img
                        src={`${config.URL_API}/uploads/dataAnatomy/slips/${selectedSlip}`}
                        alt="Current Slip"
                        className="max-w-full w-64 h-auto rounded-lg shadow-md border border-gray-200"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-64 flex flex-col items-center justify-center bg-gray-100 rounded-xl text-gray-500">
                      <span className="material-symbols-outlined text-4xl mb-2">
                        receipt
                      </span>
                      ไม่มี Slip
                    </div>
                  )}
                </div>

                {/* Upload Section */}
                <div className="p-5 border-t border-gray-200 bg-white">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      อัปโหลด Slip ใหม่ (รูปภาพ)
                    </label>
                    <div className="flex items-center gap-3">
                      <label className="flex-1 cursor-pointer">
                        <div className="flex flex-col items-center justify-center px-6 py-4 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                          <span className="material-symbols-outlined text-blue-500 text-3xl mb-2">
                            upload
                          </span>
                          <p className="text-sm text-blue-600 font-medium">
                            {newSlipFile ? newSlipFile.name : "เลือกไฟล์รูปภาพ"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF (ขนาดไม่เกิน 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setNewSlipFile(file);
                              setPreviewUrl(URL.createObjectURL(file));
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center justify-start gap-3">
                      <motion.button
                        onClick={
                          !paymentStatus ? () => handleConfirmOpen() : () => {}
                        }
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`${
                          !paymentStatus
                            ? "flex-1 py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center shadow-md hover:shadow-lg cursor-pointer"
                            : "flex-1 py-2.5 px-5 bg-gray-200  text-gray-800 rounded-lg font-medium transition-colors flex items-center justify-center shadow-md hover:shadow-lg cursor-not-allowed opacity-50 "
                        }`}
                      >
                        <span className="material-symbols-outlined mr-2">
                          check_circle
                        </span>
                        ยืนยันการตรวจสอบ
                      </motion.button>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setNewSlipFile(null);
                          setPreviewUrl(null);
                        }}
                        className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium"
                      >
                        ยกเลิก
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleUploadSlip}
                        disabled={!newSlipFile}
                        className={`px-5 py-2.5 rounded-xl transition-colors font-medium ${
                          newSlipFile
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-lg">
                            upload
                          </span>
                          อัปโหลด Slip
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
