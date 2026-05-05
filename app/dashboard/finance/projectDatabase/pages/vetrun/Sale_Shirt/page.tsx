"use client";
import { Order } from "@/app/model/vetrun/employees";
import { DeletedVetrunOrderShirt } from "@/app/routers/vetrun/DeleteRouter";
import { GetTracking_Vetrun } from "@/app/routers/vetrun/GetRouter";
import { PostUpdateSlipShirt } from "@/app/routers/vetrun/PostRouter";
import {
  PutUpdateStatusSaleShirt,
  PutUpdateTracking,
} from "@/app/routers/vetrun/PutRouter";
import { AlertConfirm } from "@/components/AlertMessage";
import { LoadingModal } from "@/components/Modal";
import ThaiYearPicker from "@/components/ThaiYearPicker";
import { config } from "@/config/config_api";
import ExportMenu from "@/utils/ExportOptions";
import { useVisitor } from "@/lib/fingerprintjs-shim";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

export default function Sale_Shirt() {
  const { data } = useVisitor({ extendedResult: true });
  const visitorId = data?.visitorId ?? "";

  const [isLoading, setIsLoading] = useState(false);
  const [dataTracking, setDataTracking] = useState<Order[] | null>(null);
  const [selectedYear, setSelectedYear] = useState<Date | null>(new Date());
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const [isOpenProgress, setIsOpenProgress] = useState(false);
  const [onUploadProgress, setOnUploadProgress] = useState<number>(0);

  const [paymentStatus, setPaymentStatus] = useState<boolean | null>(null);
  const [newSlipFile, setNewSlipFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [ems, setEms] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const hasShirts = useRef(false);

  const fetchShirts = async (date: Date) => {
    setIsLoading(true);
    try {
      const response: any = await GetTracking_Vetrun({
        visitorId,
        date: date || new Date(),
      });
      if (response.success) {
        setDataTracking(response.data || []);
      } else {
        console.error(
          "❌ API returned success: false",
          response.message || "Unknown error",
        );
        setDataTracking([]);
      }
    } catch (error) {
      console.error("💥 Network or API Error:", error);
      setDataTracking(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!visitorId) {
      console.warn("⏳ Waiting for visitorId from FingerprintJS...");
      return;
    } else if (!hasShirts.current) {
      fetchShirts(selectedYear || new Date());
      hasShirts.current = true;
    }
  }, [visitorId]);

  const handerChangeYear = async (date: Date) => {
    setSelectedYear(date);
    await fetchShirts(date);
  };

  // ✅ กรองข้อมูลตาม ปี + คำค้นหา (ใช้ useMemo)
  const filtered = useMemo(() => {
    if (!dataTracking) return [];

    return dataTracking.filter((order) => {
      // 🔍 กรองตามคำค้นหา
      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        order.fullname.toLowerCase().includes(lowerSearchTerm) ||
        order.email.toLowerCase().includes(lowerSearchTerm) ||
        order.phone.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [dataTracking, searchTerm]);

  // ✅ ฟังก์ชันช่วยจัดรูปแบบ
  const getShirtSizes = (orderItem: any[]) =>
    orderItem.map((item: any) => item.size.size).join(", ");

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(amount);

  const handleViewSlip = (url: string, userId: string) => {
    setSelectedSlip(url);
    setSelectedUserId(userId);
    setIsOpenModal(true);
  };

  const handleConfirmOpen = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = async (userId: string) => {
    if (!userId) {
      return toast.error("ไม่พบข้อมูลผู้สั่งซื้อ");
    }

    setIsOpenProgress(true);
    setOnUploadProgress(0);

    try {
      const response = await PutUpdateStatusSaleShirt(
        userId,
        visitorId,
        setOnUploadProgress,
      );

      // ✅ ตรวจสอบว่า response มีโครงสร้างถูกต้อง
      if (!response || !response.success) {
        const errorMsg = response?.message || "ไม่สามารถอัปเดตสถานะได้";
        return toast.error(errorMsg);
      }

      setIsConfirmOpen(false);
      // ✅ ดึงข้อมูลใหม่จาก API
      setTimeout(async () => {
        setIsOpenModal(false);
        setIsOpenProgress(false);
        await fetchShirts(selectedYear || new Date());
      }, 1000);
    } catch (error: any) {
      // ✅ จัดการ error ได้หลากหลายกรณี
      let errorMessage = "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";

      if (error.response) {
        // Server ส่ง error กลับมา (4xx, 5xx)
        errorMessage =
          error.response.data.message || `ข้อผิดพลาด: ${error.response.status}`;
      } else if (error.request) {
        // ไม่สามารถติดต่อ server ได้
        errorMessage =
          "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
      } else {
        // ข้อผิดพลาดอื่น ๆ เช่น syntax error
        errorMessage = error.message || "เกิดข้อผิดพลาดในการประมวลผล";
      }
      toast.error(`❌ ${errorMessage}`);
    }
  };

  const handleUpdateEMS = async (userId: string) => {
    if (!userId) return toast.error("ไม่พบข้อมูลผู้สั่งซื้อ");

    const trackingValue = ems.trim();

    if (!trackingValue) {
      return toast.error("กรุณากรอกหมายเลข EMS");
    }

    setIsOpenProgress(true);
    setOnUploadProgress(0);

    try {
      const response = await PutUpdateTracking(
        userId,
        trackingValue,
        visitorId,
        setOnUploadProgress,
      );

      if (!response.success) {
        const errorMsg = response?.message || "ไม่สามารถอัปเดต EMS ได้";
        return toast.error(errorMsg);
      }

      // ✅ ดึงข้อมูลใหม่จาก API
      setTimeout(async () => {
        setIsOpenProgress(false);
        await fetchShirts(selectedYear || new Date());
      }, 1000);
    } catch (error: any) {
      // ✅ จัดการ error ได้หลากหลายกรณี
      let errorMessage = "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";

      if (error.response) {
        // Server ส่ง error กลับมา (4xx, 5xx)
        errorMessage =
          error.response.data.message || `ข้อผิดพลาด: ${error.response.status}`;
      } else if (error.request) {
        // ไม่สามารถติดต่อ server ได้
        errorMessage =
          "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
      } else {
        // ข้อผิดพลาดอื่น ๆ เช่น syntax error
        errorMessage = error.message || "เกิดข้อผิดพลาดในการประมวลผล";
      }
      toast.error(`❌ ${errorMessage}`);
    }
  };

  const handleUploadSlip = async () => {
    if (!newSlipFile?.arrayBuffer) return toast.error("ไม่พบไฟล์ใบเสร็จ");
    if (!currentUserId) return toast.error("ไม่พบข้อมูลผู้สั่งซื้อ");

    console.log({
      currentUserId,
      newSlipFile,
      visitorId,
    });

    setIsOpenProgress(true);
    setOnUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("transferFile", newSlipFile);
      formDataToSend.append("userId", currentUserId);

      const response = await PostUpdateSlipShirt(
        formDataToSend,
        visitorId,
        setOnUploadProgress,
      );

      if (!response.success) {
        const errorMsg = response?.message || "ไม่สามารถอัปเดต Slip ได้";
        return toast.error(errorMsg);
      }

      setTimeout(async () => {
        setIsOpenProgress(false);
        setIsOpenModal(false);
        await fetchShirts(selectedYear || new Date());
      }, 1000);
    } catch (error: any) {
      // ✅ จัดการ error ได้หลากหลายกรณี
      let errorMessage = "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";

      if (error.response) {
        // Server ส่ง error กลับมา (4xx, 5xx)
        errorMessage =
          error.response.data.message || `ข้อผิดพลาด: ${error.response.status}`;
      } else if (error.request) {
        // ไม่สามารถติดต่อ server ได้
        errorMessage =
          "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
      } else {
        // ข้อผิดพลาดอื่น ๆ เช่น syntax error
        errorMessage = error.message || "เกิดข้อผิดพลาดในการประมวลผล";
      }
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setIsOpenProgress(false);
    }
  };

  const handleDeleteOrder = async (userId: string) => {
    if (!userId) return toast.error("ไม่พบข้อมูลผู้สั่งซื้อ");

    setIsOpenProgress(true);
    setOnUploadProgress(0);

    try {
      const response = await DeletedVetrunOrderShirt(
        userId,
        visitorId,
        setOnUploadProgress,
      );

      // ✅ ตรวจสอบว่า response มีโครงสร้างถูกต้อง
      if (!response || !response.success) {
        const errorMsg = response?.message || "ไม่สามารถอัปเดตสถานะได้";
        return toast.error(errorMsg);
      }

      // ✅ ดึงข้อมูลใหม่จาก API
      setTimeout(async () => {
        setIsOpenProgress(false);
        await fetchShirts(selectedYear || new Date());
      }, 1000);
    } catch (error: any) {
      // ✅ จัดการ error ได้หลากหลายกรณี
      let errorMessage = "เกิดข้อผิดพลาดไม่ทราบสาเหตุ";
      if (error.response) {
        // Server ส่ง error กลับมา (4xx, 5xx)
        errorMessage =
          error.response.data.message || `ข้อผิดพลาด: ${error.response.status}`;
      } else if (error.request) {
        // ไม่สามารถติดต่อ server ได้
        errorMessage =
          "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
      } else {
        // ข้อผิดพลาดอื่น ๆ เช่น syntax error
        errorMessage = error.message || "เกิดข้อผิดพลาดในการประมวลผล";
      }
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setIsOpenProgress(false);
    }
  };

  const getStatusText = (payment: boolean) =>
    payment ? (
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200 flex items-center gap-1.5"
      >
        <span className="material-symbols-outlined text-base">
          check_circle
        </span>
        ชำระแล้ว
      </motion.span>
    ) : (
      <motion.span
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200 flex items-center gap-1.5"
      >
        <span className="material-symbols-outlined text-base">pending</span>
        ยังไม่ชำระ
      </motion.span>
    );

  return (
    <>
      {isConfirmOpen && (
        <AlertConfirm
          message="คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?"
          // isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => handleConfirm(selectedUserId || "")}
        />
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <AlertConfirm
          message="คุณแน่ใจหรือไม่ว่าต้องการลบ?"
          variant="warning"
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => handleDeleteOrder(confirmDelete)}
        />
      )}

      <LoadingModal isOpen={isOpenProgress} progress={onUploadProgress} />

      <div className="p-6 bg-gray-50 min-h-screen mb-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">
              inventory
            </span>
            ระบบจัดการการสั่งซื้อเสื้อ
          </h1>
          <p className="text-gray-500 mt-1">
            จัดการข้อมูลการสั่งซื้อเสื้อของลูกค้า
          </p>
        </motion.div>

        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          {/* Left Section - Year Picker and Search */}
          <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
            {/* Year Picker */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
              className="relative w-full sm:w-60 mr-3"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <span className="material-symbols-rounded">calendar_today</span>
              </div>
              <ThaiYearPicker
                selectedYear={selectedYear !== null ? selectedYear : new Date()}
                onChange={handerChangeYear}
              />
            </motion.div>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
              className="relative w-full  sm:w-96"
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 z-10">
                <span className="material-symbols-outlined text-xl">
                  search
                </span>
              </div>
              <input
                type="text"
                placeholder="ค้นหาชื่อ / อีเมล / เบอร์โทร"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-700 shadow-sm transition-all duration-200"
              />
              {searchTerm && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="material-symbols-outlined text-gray-400 hover:text-red-500 transition-colors bg-gray-100 rounded-full p-0.5">
                    close
                  </span>
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Right Section - Export Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
            className="relative w-full lg:w-auto"
          >
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileHover={{
                y: -2,
                boxShadow: "0 6px 16px rgba(59, 130, 246, 0.2)",
              }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md w-full lg:w-auto transition-all duration-200"
            >
              <span className="material-symbols-outlined text-xl">
                download
              </span>
              <span className="font-medium whitespace-nowrap">
                ส่งออกข้อมูล
              </span>
              <span className="material-symbols-outlined text-lg">
                {isOpen ? "expand_less" : "expand_more"}
              </span>
            </motion.button>

            {/* Export Dropdown */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className="absolute right-0 z-40 mt-2 w-full sm:w-56 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden  border border-gray-200"
                >
                  <div className="py-1 bg-white/95">
                    <ExportMenu
                      exportData={filtered}
                      isOpen={isOpen}
                      setIsOpen={setIsOpen}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Debug Panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700 flex items-center gap-2 mt-8"
        >
          <span className="material-symbols-outlined">info</span>
          <div>
            <strong>Information:</strong> {visitorId} | จำนวนรายการ:{" "}
            {filtered.length}
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-blue-600 mb-3"
            >
              <span className="material-symbols-outlined text-4xl">
                progress_activity
              </span>
            </motion.div>
            <p className="text-blue-600 font-medium">กำลังโหลดข้อมูล...</p>
          </motion.div>
        )}

        {/* No Data State (after load) */}
        {!isLoading && !dataTracking && visitorId === "" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <span className="material-symbols-outlined text-red-500 text-4xl mb-3">
              error
            </span>
            <p className="text-red-500 font-medium">รอการระบุตัวตน...</p>
          </motion.div>
        )}

        {!isLoading && !dataTracking && visitorId !== "" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <span className="material-symbols-outlined text-yellow-500 text-4xl mb-3">
              inventory_2
            </span>
            <p className="text-yellow-700 font-medium">
              ไม่มีข้อมูลการสั่งซื้อเสื้อสำหรับผู้ใช้นี้
            </p>
          </motion.div>
        )}

        {/* Empty Result After Filter */}
        {!isLoading && dataTracking !== null && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100"
          >
            <span className="material-symbols-outlined text-gray-400 text-4xl mb-3">
              search_off
            </span>
            <p className="text-gray-500 font-medium">
              ไม่พบข้อมูลตามเงื่อนไขที่ระบุ
            </p>
            <p className="text-gray-400 text-sm mt-1">
              ลองเปลี่ยนปีหรือคำค้นหาของคุณ
            </p>
          </motion.div>
        )}

        {/* Table — แสดงผลลัพธ์ที่กรองแล้ว */}
        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-2xl shadow-lg border border-gray-200 bg-white"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-blue-600">
                          person
                        </span>
                        ข้อมูลผู้สั่งซื้อ
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-blue-600">
                          local_shipping
                        </span>
                        วิธีรับ
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-blue-600">
                          checklist
                        </span>
                        จำนวนเสื้อ
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-blue-600">
                          straighten
                        </span>
                        ขนาดเสื้อ
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-blue-600">
                          payments
                        </span>
                        ยอดรวม
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-blue-600">
                          receipt_long
                        </span>
                        เลขพัสดุ
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-blue-600">
                          paid
                        </span>
                        สถานะชำระ
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-blue-600">
                          receipt
                        </span>
                        หลักฐานการโอน
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map((order, index) => (
                    <motion.tr
                      key={order.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-blue-50/30 transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900">
                            {order.fullname}
                          </span>
                          <span className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-sm text-gray-400">
                              mail
                            </span>
                            {order.email}
                          </span>
                          <span className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <span className="material-symbols-outlined text-sm text-gray-400">
                              call
                            </span>
                            {order.phone}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                        {order.sh_collection_method === "pickup" ? (
                          <div className="flex items-center gap-2 bg-blue-100 px-3 py-1.5 rounded-full w-fit">
                            <span className="material-symbols-outlined text-base text-blue-600">
                              store
                            </span>
                            <span>มารับเอง</span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 bg-green-100 px-3 py-1.5 rounded-full w-fit">
                              <span className="material-symbols-outlined text-base text-green-600">
                                local_shipping
                              </span>
                              <span>จัดส่ง</span>
                            </div>
                            {order.delivery_address && (
                              <div className="mt-2 text-xs bg-gray-100 p-2 rounded-lg text-gray-600 max-w-xs">
                                {order.delivery_address}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 bg-purple-100 px-3 py-1.5 rounded-full w-fit">
                          <span className="material-symbols-outlined text-base text-purple-600">
                            check_box
                          </span>
                          <span className="font-medium">
                            {order.OrderItem.length} ตัว
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex flex-col gap-1.5">
                          {getShirtSizes(order.OrderItem)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 bg-amber-100 px-3 py-1.5 rounded-full w-fit">
                          {formatCurrency(order.total_amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-center gap-2">
                          {/* ปุ่มบันทึก — แสดงเฉพาะเมื่อชำระแล้ว */}
                          {order.payment &&
                            order.sh_collection_method === "delivery" && (
                              <motion.button
                                onClick={() => {
                                  handleUpdateEMS(order.userId);
                                }}
                                className="px-2 py-2 text-white bg-green-700 hover:bg-green-600 rounded transition-colors shadow-sm w-full flex items-center justify-center gap-1.5"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                aria-label="บันทึกเลขพัสดุ"
                              >
                                <span className="material-symbols-outlined text-base">
                                  save
                                </span>
                                บันทึกเลขพัสดุ
                              </motion.button>
                            )}
                          {order.sh_collection_method === "delivery" && (
                            <input
                              value={
                                currentUserId === order.userId
                                  ? ems
                                  : order.ems_tracking || ""
                              }
                              onFocus={() => {
                                // เมื่อ focus input → ตั้งค่า currentUserId และเติม ems ด้วยค่าเดิม
                                setCurrentUserId(order.userId);
                                setEms(order.ems_tracking || "");
                              }}
                              onChange={(e) => setEms(e.target.value)}
                              type="text"
                              placeholder={
                                !order.payment
                                  ? "รอตรวจสอบการชำระเงิน"
                                  : "กรอกเลขพัสดุ"
                              }
                              className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200"
                              disabled={!order.payment}
                              aria-label="เลขพัสดุ"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusText(order.payment)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap ">
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => {
                              handleViewSlip(order.transferFile, order.userId);
                              setPaymentStatus(order.payment);
                              setCurrentUserId(order.userId);
                            }}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors font-medium group-hover:bg-blue-200 shadow-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="ดูรูปหลักฐานการโอน"
                          >
                            <span className="material-symbols-outlined text-lg">
                              image
                            </span>
                            ดูสลิป
                          </motion.button>
                          <motion.button
                            onClick={() => setConfirmDelete(order.userId)}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition-colors font-medium group-hover:bg-red-200 shadow-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            aria-label="ลบข้อมูล"
                          >
                            <span className="material-symbols-outlined text-lg">
                              delete
                            </span>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                      onClick={() => {
                        setSelectedSlip(null);
                        setNewSlipFile(null);
                        setPreviewUrl(null);
                      }}
                    ></motion.div>

                    <motion.div
                      initial={{ scale: 0.95, y: 20, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ scale: 0.95, y: 20, opacity: 0 }}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                      }}
                      className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col z-10 overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <h3 className="text-xl font-semibold flex items-center gap-3">
                          <span className="material-symbols-outlined">
                            receipt_long
                          </span>
                          สลิปหลักฐานการชำระเงิน
                        </h3>
                        <motion.button
                          onClick={() => {
                            setSelectedSlip(null);
                            setNewSlipFile(null);
                            setPreviewUrl(null);
                          }}
                          className="p-2 rounded-full hover:bg-blue-700/50 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <span className="material-symbols-outlined">
                            close
                          </span>
                        </motion.button>
                      </div>

                      {/* Image Preview */}
                      <div className="flex-1 overflow-auto p-8 bg-gray-50 flex justify-center items-center">
                        {previewUrl ? (
                          <div className="flex justify-center">
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="max-w-full max-h-80 w-auto h-auto rounded-xl shadow-md border border-gray-200 object-contain"
                            />
                          </div>
                        ) : selectedSlip ? (
                          <div className="flex justify-center">
                            <img
                              src={`${config.URL_API}/uploads/dataVetRun/paymentShirt/${selectedSlip}`}
                              alt="Current Slip"
                              className="max-w-full max-h-80 w-auto h-auto rounded-xl shadow-md border border-gray-200 object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-64 flex flex-col items-center justify-center bg-gray-100 rounded-xl text-gray-500">
                            <span className="material-symbols-outlined text-4xl mb-2">
                              receipt
                            </span>
                            <p>ไม่มีสลิป</p>
                          </div>
                        )}
                      </div>

                      {/* Upload Section */}
                      <div className="p-6 border-t border-gray-200 bg-white">
                        <div className="mb-5">
                          <label className=" text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-blue-600">
                              upload
                            </span>
                            อัปโหลดสลิปใหม่ (รูปภาพ)
                          </label>
                          <div className="flex items-center gap-3">
                            <label className="flex-1 cursor-pointer">
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex flex-col items-center justify-center px-6 py-6 border-2 border-dashed border-blue-400 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors"
                              >
                                <span className="material-symbols-outlined text-blue-500 text-4xl mb-3">
                                  cloud_upload
                                </span>
                                <p className="text-sm text-blue-700 font-medium">
                                  {newSlipFile
                                    ? newSlipFile.name
                                    : "คลิกเพื่อเลือกไฟล์รูปภาพ"}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  PNG, JPG, GIF (ขนาดไม่เกิน 5MB)
                                </p>
                              </motion.div>
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

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center justify-start">
                            <motion.button
                              onClick={
                                !paymentStatus
                                  ? () => handleConfirmOpen()
                                  : () => {}
                              }
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              className={`flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-medium shadow-md ${
                                !paymentStatus
                                  ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white cursor-pointer"
                                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
                              }`}
                            >
                              <span className="material-symbols-outlined">
                                check_circle
                              </span>
                              ยืนยันการตรวจสอบ
                            </motion.button>
                          </div>

                          <div className="flex items-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => {
                                setNewSlipFile(null);
                                setPreviewUrl(null);
                              }}
                              className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors font-medium flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined">
                                close
                              </span>
                              ยกเลิก
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={handleUploadSlip}
                              disabled={!newSlipFile}
                              className={`px-5 py-3 rounded-xl font-medium flex items-center gap-2 ${
                                newSlipFile
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md cursor-pointer"
                                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              <span className="material-symbols-outlined">
                                upload
                              </span>
                              อัปโหลดสลิป
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </div>
    </>
  );
}
