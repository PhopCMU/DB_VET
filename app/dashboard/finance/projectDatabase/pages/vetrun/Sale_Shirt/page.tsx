"use client";
import { Order, OrderItem } from "@/app/model/vetrun/employees";
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
if (!hasShirts.current) {
      fetchShirts(selectedYear || new Date());
      hasShirts.current = true;
    }
  }, [selectedYear]);

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

  const getShirtDetails = (orderItems: OrderItem[]) => {
    const shirtCounts = new Map<string, number>();

    orderItems.forEach((item) => {
      const detail = `${item.size?.size || "ไม่ระบุไซส์"} - ${item.shirtmodel?.name || "ไม่ระบุรุ่น"} - ${item.shirtcolor?.name || "ไม่ระบุสี"}`;
      shirtCounts.set(detail, (shirtCounts.get(detail) || 0) + 1);
    });

    return Array.from(shirtCounts.entries()).map(([detail, count]) => (
      <div key={detail} className="rounded-lg bg-slate-50 px-3 py-2 font-semibold text-slate-900">
        {detail}{count > 1 ? ` * ${count}` : ""}
      </div>
    ));
  };

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

 

    setIsOpenProgress(true);
    setOnUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("transferFile", newSlipFile);
      formDataToSend.append("userId", currentUserId);

      const response = await PostUpdateSlipShirt(
        formDataToSend,
  
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
        className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
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
        className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700"
      >
        <span className="material-symbols-outlined text-base">pending</span>
        ยังไม่ชำระ
      </motion.span>
    );

  const summary = useMemo(
    () => ({
      total: filtered.length,
      paid: filtered.filter((order) => order.payment).length,
      pending: filtered.filter((order) => !order.payment).length,
      delivery: filtered.filter(
        (order) => order.sh_collection_method === "delivery",
      ).length,
      revenue: filtered.reduce((total, order) => total + order.total_amount, 0),
    }),
    [filtered],
  );

  const closeSlipModal = () => {
    setIsOpenModal(false);
    setSelectedSlip(null);
    setNewSlipFile(null);
    setPreviewUrl(null);
  };

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

      <div className="min-h-screen  px-4 py-5 text-slate-100 sm:px-6 lg:px-8">
        <div className="mx-auto w-full">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative mb-6 overflow-hidden rounded-2xl border border-[#283343] bg-[#1d2736] px-5 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:px-8 sm:py-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[24px] border-sky-400/10" />
          <div className="pointer-events-none absolute bottom-0 left-0 h-1 w-32 bg-sky-400" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sky-300">
                VETRUN / MERCHANDISE DESK
              </p>
              <h1 className="mt-2 flex items-center gap-3 text-2xl font-black tracking-tight text-white sm:text-4xl">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#283343] text-sky-300">
                  <span className="material-symbols-outlined">inventory</span>
                </span>
                ระบบจัดการการสั่งซื้อเสื้อ
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
                ตรวจสอบคำสั่งซื้อ สถานะการชำระเงิน และเลขพัสดุจากรายการเดียว
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              ข้อมูลปี {selectedYear ? selectedYear.getFullYear() + 543 : "ปัจจุบัน"}
            </div>
          </div>
        </motion.div>

        <section
          aria-label="สรุปคำสั่งซื้อเสื้อ"
          className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5"
        >
          {[
            { label: "รายการทั้งหมด", value: summary.total, tone: "text-white", icon: "receipt_long" },
            { label: "ชำระแล้ว", value: summary.paid, tone: "text-emerald-300", icon: "check_circle" },
            { label: "รอชำระ", value: summary.pending, tone: "text-amber-300", icon: "pending" },
            { label: "จัดส่ง", value: summary.delivery, tone: "text-sky-300", icon: "local_shipping" },
            { label: "ยอดรวม", value: formatCurrency(summary.revenue), tone: "text-white", icon: "payments" },
          ].map((metric) => (
            <div
              key={metric.label}
              className="flex min-h-24 items-center justify-between rounded-xl border border-[#283343] bg-[#1d2736] px-4 py-4 shadow-sm sm:px-5"
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  {metric.label}
                </p>
                <p className={`mt-1 text-xl font-black tabular-nums sm:text-2xl ${metric.tone}`}>
                  {metric.value}
                </p>
              </div>
              <span className={`material-symbols-outlined rounded-lg bg-[#283343] p-2 text-lg ${metric.tone}`}>
                {metric.icon}
              </span>
            </div>
          ))}
        </section>

        {/* Controls Section */}
        <div className="mb-6 rounded-2xl border border-[#283343] bg-[#1d2736] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.16)] sm:p-5">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">คำสั่งซื้อเสื้อ</h2>
              <p className="text-xs text-slate-400">
                ค้นหาจากชื่อ อีเมล หรือเบอร์โทรศัพท์
              </p>
            </div>
            <span className="text-xs font-semibold text-sky-300">
              แสดง {filtered.length} รายการ
            </span>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
    

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
              className="relative w-full lg:flex-1"
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-slate-400">
                <span className="material-symbols-outlined text-xl">search</span>
              </div>
              <input
                type="search"
                aria-label="ค้นหาคำสั่งซื้อ"
                placeholder="ค้นหาชื่อ / อีเมล / เบอร์โทร"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-h-11 w-full rounded-lg border border-[#3a4657] bg-[#121a2a] py-3 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="ล้างคำค้นหา"
                  className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-[#283343] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
            </motion.div>

            {/* Export Button */}
            <div className="relative w-full lg:w-auto">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-sky-400 px-5 py-3 text-sm font-black text-[#121a2a] transition hover:bg-sky-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 lg:w-auto"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                ส่งออกข้อมูล
                <span className="material-symbols-outlined text-base">
                  {isOpen ? "expand_less" : "expand_more"}
                </span>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 z-40 mt-2 w-full min-w-56 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/10 lg:w-56"
                  >
                    <ExportMenu
                      exportData={filtered}
                      isOpen={isOpen}
                      setIsOpen={setIsOpen}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

                  {/* Year Picker */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
              className="relative w-full lg:w-56 mt-2"
            >
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-slate-400">
                <span className="material-symbols-rounded">calendar_today</span>
              </div>
              <ThaiYearPicker
                selectedYear={selectedYear !== null ? selectedYear : new Date()}
                onChange={handerChangeYear}
              />
            </motion.div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-[#283343] bg-[#1d2736] py-16 shadow-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mb-3 text-sky-300"
            >
              <span className="material-symbols-outlined text-4xl">
                progress_activity
              </span>
            </motion.div>
            <p className="font-medium text-slate-300">กำลังโหลดข้อมูล...</p>
          </motion.div>
        )}

        {/* No Data State (after load) */}
        {!isLoading && !dataTracking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-[#283343] bg-[#1d2736] py-16 shadow-sm"
          >
            <span className="material-symbols-outlined text-red-500 text-4xl mb-3">
              error
            </span>
            <p className="text-red-500 font-medium">รอการระบุตัวตน...</p>
          </motion.div>
        )}

        {!isLoading && !dataTracking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-[#283343] bg-[#1d2736] py-16 shadow-sm"
          >
            <span className="material-symbols-outlined text-yellow-500 text-4xl mb-3">
              inventory_2
            </span>
            <p className="font-medium text-amber-300">
              ไม่มีข้อมูลการสั่งซื้อเสื้อสำหรับผู้ใช้นี้
            </p>
          </motion.div>
        )}

        {/* Empty Result After Filter */}
        {!isLoading && dataTracking !== null && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-[#283343] bg-[#1d2736] py-16 shadow-sm"
          >
            <span className="material-symbols-outlined text-gray-400 text-4xl mb-3">
              search_off
            </span>
            <p className="font-medium text-slate-300">
              ไม่พบข้อมูลตามเงื่อนไขที่ระบุ
            </p>
            <p className="mt-1 text-sm text-slate-500">
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
            className="overflow-hidden rounded-2xl border border-[#283343] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.22)]"
          >
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-slate-200">
                <thead className="bg-[#283343]">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-sky-300">
                          person
                        </span>
                        ข้อมูลผู้สั่งซื้อ
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-sky-300">
                          local_shipping
                        </span>
                        วิธีรับ
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-sky-300">
                          checklist
                        </span>
                        จำนวนเสื้อ
                      </div>
                    </th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-sky-300">
                          straighten
                        </span>
                          รายละเอียดเสื้อ
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-sky-300">
                          payments
                        </span>
                        ยอดรวม
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-sky-300">
                          receipt_long
                        </span>
                        เลขพัสดุ
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-sky-300">
                          paid
                        </span>
                        สถานะชำระ
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg text-sky-300">
                          receipt
                        </span>
                        หลักฐานการโอน
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filtered.map((order, index) => (
                    <motion.tr
                      key={order.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group transition-colors duration-150 hover:bg-slate-50"
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
                          <span className="font-medium text-black">
                            {order.OrderItem.length} ตัว
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex min-w-64 flex-col gap-1.5">
                          {getShirtDetails(order.OrderItem)}
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
                                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-2 py-2 text-white shadow-sm transition-colors hover:bg-emerald-500"
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
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-sky-400"
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
                            className="inline-flex items-center gap-2 rounded-lg bg-sky-100 px-3 py-2 font-semibold text-sky-800 shadow-sm transition-colors hover:bg-sky-200"
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
                            className="inline-flex items-center gap-2 rounded-lg bg-rose-100 px-3 py-2 font-semibold text-rose-800 shadow-sm transition-colors hover:bg-rose-200"
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
                      onClick={closeSlipModal}
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
                      className="z-10 mx-4 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                    >
                      <div className="flex items-center justify-between bg-[#121a2a] p-5 text-white sm:p-6">
                        <h3 className="text-xl font-semibold flex items-center gap-3">
                          <span className="material-symbols-outlined">
                            receipt_long
                          </span>
                          สลิปหลักฐานการชำระเงิน
                        </h3>
                        <motion.button
                          onClick={closeSlipModal}
                          aria-label="ปิดหน้าต่างสลิป"
                          className="rounded-lg p-2 transition-colors hover:bg-[#283343]"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <span className="material-symbols-outlined">
                            close
                          </span>
                        </motion.button>
                      </div>

                      {/* Image Preview */}
                      <div className="flex flex-1 items-center justify-center overflow-auto bg-[#f3f6fa] p-6 sm:p-8">
                        {previewUrl ? (
                          <div className="flex justify-center">
                            <img
                              src={previewUrl}
                              alt="Preview"
                              className="h-auto max-h-80 max-w-full w-auto rounded-xl border border-slate-200 object-contain shadow-md"
                            />
                          </div>
                        ) : selectedSlip ? (
                          <div className="flex justify-center">
                            <img
                              src={`${config.URL_API}/uploads/dataVetRun/paymentShirt/${selectedSlip}`}
                              alt="Current Slip"
                              className="h-auto max-h-80 max-w-full w-auto rounded-xl border border-slate-200 object-contain shadow-md"
                            />
                          </div>
                        ) : (
                          <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                            <span className="material-symbols-outlined text-4xl mb-2">
                              receipt
                            </span>
                            <p>ไม่มีสลิป</p>
                          </div>
                        )}
                      </div>

                      {/* Upload Section */}
                      <div className="border-t border-slate-200 bg-white p-5 sm:p-6">
                        <div className="mb-5">
                          <label className=" text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg text-sky-700">
                              upload
                            </span>
                            อัปโหลดสลิปใหม่ (รูปภาพ)
                          </label>
                          <div className="flex items-center gap-3">
                            <label className="flex-1 cursor-pointer">
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-400 bg-sky-50 px-6 py-6 transition-colors hover:bg-sky-100"
                              >
                                <span className="material-symbols-outlined mb-3 text-4xl text-sky-600">
                                  cloud_upload
                                </span>
                                <p className="text-sm font-medium text-sky-800">
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
                              className={`flex items-center justify-center gap-2 rounded-lg px-5 py-3 font-bold shadow-md ${
                                !paymentStatus
                                  ? "cursor-pointer bg-emerald-600 text-white hover:bg-emerald-500"
                                  : "cursor-not-allowed bg-slate-200 text-slate-500"
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
                              className="flex items-center gap-2 rounded-lg bg-slate-100 px-5 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-200"
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
                              className={`flex items-center gap-2 rounded-lg px-5 py-3 font-semibold ${
                                newSlipFile
                                  ? "cursor-pointer bg-[#283343] text-white shadow-md hover:bg-[#121a2a]"
                                  : "cursor-not-allowed bg-slate-200 text-slate-400"
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
      </div>
    </>
  );
}
