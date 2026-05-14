"use client";
import { motion, AnimatePresence } from "framer-motion";
import {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  Fragment,
  FocusEvent,
  useCallback,
  useMemo,
} from "react";
import html2canvas from "html2canvas";
import { useVisitor } from "@/lib/fingerprintjs-shim";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import {
  PostAccessToken,
  PostCreateQrCode,
  PostVoid,
} from "@/app/routers/SCB/PostRouter";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import {
  exportReceipt,
  generateReceiptPDF,
  numberToThaiWords,
  numberToEnglishWords,
  type ReceiptData,
} from "@/app/lib/pdfGenerator";
import { GetScbData, GetScbInquiry } from "@/app/routers/SCB/GetRouter";
import {
  generateCustomCode20,
  generateRandomDigits,
} from "@/app/lib/generators/codeGenerator";

import { useScbWebSocket } from "@/app/hooks/useSocket";
import { usePermission } from "@/app/context/UsePermission";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ScbVoidEntry {
  scbVoidId: string;
  responseStatus: string;
  responseCode?: string;
  responseCodeDescription?: string;
  extStatusDesc?: string;
  createdAt: string;
}

interface ScbTransaction {
  scbId: string;
  reverseFlag: string | null;
  payerName: string | null;
  amount: string;
  transactionDateandTime: string;
  billPaymentRef1: string | null;
  billPaymentRef2: string | null;
  billPaymentRef3: string | null;
  createdAt: string;
  transactionId?: string | null;
  sendingBankCode?: string | null;
  receivingBankCode?: string | null;
  transactionType?: string | null;
  ScbVoid: ScbVoidEntry[];
}

interface PaymentSuccessData {
  transactionId?: string | null;
  amount?: string | number | null;
  payerName?: string | null;
  billPaymentRef1?: string | null;
  billPaymentRef2?: string | null;
  billPaymentRef3?: string | null;
  transactionDateandTime?: string | null;
}

type TransactionStatus =
  | "All"
  | "Normal"
  | "Reversed"
  | "VoidSuccess"
  | "VoidOther";

function deriveStatus(item: ScbTransaction): Exclude<TransactionStatus, "All"> {
  if (item.reverseFlag === "R") return "Reversed";
  if (item.ScbVoid && item.ScbVoid.length > 0) {
    const hasSuccess = item.ScbVoid.some((v) => v.responseStatus === "Success");
    return hasSuccess ? "VoidSuccess" : "VoidOther";
  }
  return "Normal";
}
// ──────────────────────────────────────────────────────────────────────────────

export default function QRCodePayment() {
  const [paymentData, setPaymentData] = useState({
    amount: "",
    refId1: "",
    refId2: "",
    refId3: "",
  });

  const [qrImageBase64, setQrImageBase64] = useState<string | null>(null);
  const [expiryTime, setExpiryTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [scbToken, setScbToken] = useState<string | null>("");
  const [isQrActive, setIsQrActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConfirm, setIsLoadingConfirm] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | number | null>(
    null,
  );
  const qrSectionRef = useRef(null);
  const [dataConfirm, setDataConfirm] = useState<ScbTransaction[]>();
  const hasData = useRef(false);
  const [loadingVoid, setLoadingVoid] = useState<Record<string, boolean>>({});
  const [paymentSuccessData, setPaymentSuccessData] =
    useState<PaymentSuccessData | null>(null);
  const [showQrGenerator, setShowQrGenerator] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ─── Filter state (default: current year) ──────────────────────────────────────────
  const currentYear = new Date().getFullYear();
  const defaultDateFrom = `${currentYear}-01-01`;
  const defaultDateTo = `${currentYear}-12-31`;
  const [filterRef1, setFilterRef1] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState(defaultDateFrom);
  const [filterDateTo, setFilterDateTo] = useState(defaultDateTo);
  const [filterStatus, setFilterStatus] = useState<TransactionStatus>("All");
  const [dateRangeError, setDateRangeError] = useState<string | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  // ───────────────────────────────────────────────────────────────────────────────

  // ─── Filtered data (applied after all filters) ───────────────────────────────

  const filteredData = useMemo<ScbTransaction[]>(() => {
    if (!dataConfirm) return [];

    // Validate date range once before filtering
    const fromMs = filterDateFrom
      ? new Date(filterDateFrom).getTime()
      : -Infinity;
    const toMs = filterDateTo
      ? new Date(filterDateTo + "T23:59:59").getTime()
      : Infinity;

    return dataConfirm.filter((item) => {
      // REF1 contains filter (case-insensitive)
      if (
        filterRef1 &&
        !(item.billPaymentRef1 ?? "")
          .toLowerCase()
          .includes(filterRef1.toLowerCase())
      ) {
        return false;
      }

      // Date range filter
      const txMs = new Date(item.transactionDateandTime).getTime();
      if (txMs < fromMs || txMs > toMs) return false;

      // Status filter
      if (filterStatus !== "All" && deriveStatus(item) !== filterStatus) {
        return false;
      }

      return true;
    });
  }, [dataConfirm, filterRef1, filterDateFrom, filterDateTo, filterStatus]);
  // ─────────────────────────────────────────────────────────────────────────────

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const SUB_MENU_ID = "e432a5bf-eda0-4638-848d-26df9194f57e";

  const { canCreate, canEdit, canDelete, canView } = usePermission(
    SUB_MENU_ID,
    "",
  );

  const { isConnected, countdown, formatTime, connect, disconnect } =
    useScbWebSocket({
      ref2: paymentData.refId2.trim(),
      apiKey: process.env.NEXT_PUBLIC_SCB_KEY ?? "",
      onMessage: async (msg) => {
        // console.log("📩 Received:", msg);
        if (msg.status === "confirmed" && msg.type === "payment") {
          setPaymentSuccessData(msg.data as unknown as PaymentSuccessData);
          setQrImageBase64(null);
          setExpiryTime(null);
          setIsQrActive(false);
          await fetchData();
          // console.log("message:", msg);
          disconnect();
        }
      },
      onOpen: () => {},
      onClose: async () => {
        // setPaymentSuccessData(null);
        setQrImageBase64(null);
        setExpiryTime(null);
        setIsQrActive(false);
        // toast.error("Disconnected");
      },
      onError: (err: Event) => {
        // setPaymentSuccessData(null);
        // setQrImageBase64(null);
        // setExpiryTime(null);
        // setIsQrActive(false);
        (toast.error(err.type), console.error("🚨 Error:", err));
      },
      // onOpen: () => console.log("✅ Connected"),
      // onClose: () => console.log("❌ Disconnected"),
      // onError: (err) => console.error("🚨 Error:", err),
    });

  const toggleRow = (id: string | number) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  const fetchData = useCallback(async () => {
    if (!filterDateFrom || !filterDateTo) {
      setDateRangeError("กรุณาเลือกช่วงวันที่");
    }

    try {
      const response = await GetScbData({
        dateFrom: filterDateFrom,
        dateTo: filterDateTo,
      });
      if (response.success) {
        setDataConfirm(response.data);
      } else {
        toast.warn("ไม่พบข้อมูลการชำระเงิน");
      }
    } catch (err) {
      console.error("Fetch SCB data error:", err);
      toast.error("โหลดข้อมูลไม่สำเร็จ");
    }
  }, [filterDateFrom, filterDateTo]);

  const generateQRCode = async () => {
    if (isQrActive) {
      toast.warn("กรุณายกเลิก QR Code ก่อนหน้าก่อนสร้างใหม่");
      return;
    }

    setIsLoading(true);

    try {
      if (!paymentData.amount || Number(paymentData.amount) <= 0) {
        toast.warn("กรุณากรอกจำนวนเงินที่ถูกต้อง");
        return;
      }
      if (!paymentData.refId1.trim()) {
        toast.warn("กรุณากรอก RefId1");
        return;
      }
      if (!paymentData.refId2.trim()) {
        toast.warn("กรุณากรอก RefId2");
        return;
      }

      const token = await accessToken();
      if (!token) {
        toast.warn("ไม่สามารถดึง Token สำหรับการสร้าง QR Code");
        return;
      }

      const finalRefId2 = paymentData.refId2.trim();

      const payload = {
        amount: paymentData.amount.toString(),
        ref1: paymentData.refId1.trim(),
        ref2: finalRefId2,
        ref3: paymentData.refId3?.trim() || "",
        scbToken: token,
      };

      const response: any = await PostCreateQrCode(payload);

      if (response?.statusCode === 4000) {
        toast.error("Ref2 มีในระบบแล้ว");
        return;
      }

      if (!response?.success) {
        toast.error("ไม่สามารถสร้าง QR Code กรุณาติดต่อผู้ดูแลระบบ");
        return;
      }

      const qrImage = response.data?.qrImage;
      if (!qrImage) {
        toast.error("ไม่ได้รับข้อมูล QR Code จากเซิร์ฟเวอร์");
        return;
      }

      setQrImageBase64(qrImage);
      setExpiryTime(Date.now() + 10 * 60 * 1000); // 10 นาที
      setIsQrActive(true);
      toast.success("สร้าง QR Code สำเร็จ!");

      // ✅ เริ่ม client-side polling ทันที
      // setIsChecking(true);
      // startClientPolling(finalRefId2);

      // เริ่ม Websocket  ทันที
      connect();
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการสร้าง QR Code:", error);
      toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPush = async () => {
    if (!paymentData.refId2) return toast.warn("กรุณากรอก RefId2");
    connect();
    try {
      setTimeout(async () => {
        const res = await fetch(
          "https://vmapi.vet.cmu.ac.th/scb/api/v1/test-push",
        );
        const json = await res.json();
        //  console.log("🚀 Test push response:", json.payload);
        setPaymentSuccessData(json.payload);
      }, 1000);
    } catch (err) {
      console.error("❌ Test push failed:", err);
    }
  };

  const handleCancelQr = () => {
    setQrImageBase64(null);
    setExpiryTime(null);
    setIsQrActive(false);
    setPaymentSuccessData(null);

    disconnect(); // ✅ ปิด WebSocket
  };

  useEffect(() => {
    if (!expiryTime) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(timer);

        disconnect();
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      disconnect();
    };
  }, [expiryTime]);

  useEffect(() => {
    if (!hasData.current) {
      fetchData();
      hasData.current = true;
    }
  }, []);

  // Close export dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(e.target as Node)
      ) {
        setIsExportMenuOpen(false);
      }
    };
    if (isExportMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExportMenuOpen]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let sanitized = value;

    // Sanitize ตาม field
    if (name === "amount") {
      sanitized = value.replace(/[^0-9.]/g, "");
      const dotCount = (sanitized.match(/\./g) || []).length;
      if (dotCount > 1) {
        const parts = sanitized.split(".");
        sanitized = parts[0] + "." + parts.slice(1).join("");
      }
      if (sanitized.includes(".")) {
        const [integer, decimal] = sanitized.split(".");
        sanitized = integer + "." + decimal.substring(0, 2);
      }
    } else if (name === "refId1") {
      sanitized = value
        .replace(/[^A-Z]/g, "")
        .toUpperCase()
        .substring(0, 8);
    } else if (name === "refId2" || name === "refId3") {
      sanitized = value
        .replace(/[^A-Z0-9]/g, "")
        .toUpperCase()
        .substring(0, 20);
    }

    // อัปเดตค่า
    setPaymentData((prev) => ({ ...prev, [name]: sanitized }));
  };

  // เพิ่ม handler สำหรับ onBlur
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "amount") {
      let finalValue = "";

      if (value === "") {
        finalValue = "";
      } else {
        // แปลงเป็นตัวเลข แล้วฟอร์แมตเป็น 2 ตำแหน่งทศนิยม
        const num = parseFloat(value);
        if (!isNaN(num)) {
          finalValue = num.toFixed(2);
        } else {
          finalValue = ""; // หรือ "0.00" ตามที่คุณต้องการ
        }
      }

      setPaymentData((prev) => ({
        ...prev,
        [name]: finalValue,
      }));
    }
  };

  const accessToken = async (): Promise<string | null> => {
    try {
      const response = await PostAccessToken();
      if (!response.success) {
        toast.error("ไม่สามารถดึงข้อมูล Token");
        return null;
      }

      const token = response.data.accessToken;
      setScbToken(token);
      return token;
    } catch (error: any) {
      toast.error(`เกิดข้อผิดพลาดในการดึง Token`);
      return null;
    }
  };

  const generateRandomRef2 = (ref1: string): string => {
    const trimmedRef1 = ref1.trim();

    if (!trimmedRef1) {
      toast.warn("กรุณากรอก Ref1 ก่อนสุ่ม Ref2");
      return "";
    }

    if (trimmedRef1.length > 20) {
      toast.warn("Ref1 ต้องไม่เกิน 20 ตัวอักษร");
      return "";
    }

    const remainingLength = 20 - trimmedRef1.length;
    const randomSuffix =
      remainingLength > 0 ? generateRandomDigits(remainingLength) : "";

    return trimmedRef1 + randomSuffix;
  };

  const generateRandomRef3 = (): string => {
    return generateCustomCode20({ fixedChar: "SCB" });
  };

  const checkPaymentStatus = async (
    ref1: string,
    ref2: string,
    ref3: string,
    date: string,
  ) => {
    // === Validation ===
    if (!ref1?.trim()) return toast.warn("กรุณากรอก Ref1");
    if (!ref2?.trim()) return toast.warn("กรุณากรอก Ref2");
    if (!scbToken)
      return toast.warn("ไม่สามารถดึง Token สำหรับการตรวจสอบการชำระเงิน");

    // === Prepare transaction date ===
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const transactionDate = date || `${year}-${month}-${day}`;

    // === Prepare payload ===
    const payload = {
      ref1: ref1.trim(),
      ref2: ref2.trim(),
      ref3: ref3?.trim() || null,
      transactionDate,
      scbToken,
    };

    // === Start checking ===
    setIsLoadingConfirm(true);
    const toastId = toast.loading("กำลังตรวจสอบสถานะการชำระเงิน...");

    try {
      const response: any = await GetScbInquiry(payload);

      if (!response?.success) {
        const errorCode = response?.error?.status?.code;
        const message =
          errorCode === "1104"
            ? "ไม่พบการชำระเงิน"
            : response?.error?.message || "เกิดข้อผิดพลาดขณะตรวจสอบ";

        toast.update(toastId, {
          render: message,
          type: "error",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });
        return;
      }

      // === หากพบการชำระเงิน → อัปเดตข้อมูลในแอปทันที ===
      try {
        await fetchData(); // ดึงข้อมูลล่าสุดจาก backend
        handleCancelQr(); // ล้าง QR ที่สร้างไว้ (ถ้ามี)

        toast.update(toastId, {
          render: "✅ ตรวจสอบสำเร็จ — พบข้อมูลการชำระเงิน",
          type: "success",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });
      } catch (refreshError) {
        console.error(
          "Failed to refresh UI after payment check:",
          refreshError,
        );
        toast.update(toastId, {
          render: "⚠️ ตรวจสอบพบการชำระเงิน แต่อัปเดต UI ไม่สำเร็จ",
          type: "warning",
          isLoading: false,
          autoClose: 5000,
          closeButton: true,
        });
      }
    } catch (error) {
      console.error("Unexpected error in checkPaymentStatus:", error);
      toast.update(toastId, {
        render: "❌ เกิดข้อผิดพลาดร้ายแรง กรุณาลองใหม่อีกครั้ง",
        type: "error",
        isLoading: false,
        autoClose: 5000,
        closeButton: true,
      });
    } finally {
      setIsLoadingConfirm(false);
    }
  };

  // Void Payment
  const handleVoidPayment = async (item: ScbTransaction) => {
    if (!item?.transactionId) return toast.warn("ไม่มี ID การชำระเงิน");
    if (!item?.transactionDateandTime)
      return toast.warn("ไม่มีวันเวลาการชำระเงิน");
    if (!item?.amount) return toast.warn("ไม่มีค่าใช้จ่ายในการชำระเงิน");

    const transactionId = item.transactionId ?? "";
    if (!transactionId) return toast.warn("ไม่มี ID การชำระเงิน");

    // เปิด loading สำหรับ transaction นี้
    setLoadingVoid((prev) => ({ ...prev, [transactionId]: true }));

    try {
      const token = await accessToken();
      if (!token) {
        toast.warn("ไม่สามารถดึง Token สำหรับการสร้าง QR Code");
        setLoadingVoid((prev) => ({ ...prev, [transactionId]: false }));
        return;
      }

      const payload = {
        scbId: item.scbId,
        transactionId: item.transactionId,
        transactionDateandTime: item.transactionDateandTime,
        amount: item.amount,
        scbToken: token,
      };

      const response = await PostVoid(payload);

      if (response.success === "Failure") {
        toast.error(response.message);
      } else if (response.success === "Success") {
        toast.success("ยกเลิกการชำระเงินสำเร็จ");
      } else if (response.success === false) {
        toast.error("ข้อมูลซ้ำ กรุณาลองใหม่อีกครั้ง");
      }

      await fetchData(); // refresh data
    } catch (_error: unknown) {
      toast.error("เกิดข้อผิดพลาดในการยกเลิกการชำระเงิน");
    } finally {
      // ปิด loading ไม่ว่าจะสำเร็จหรือล้มเหลว
      setLoadingVoid((prev) => ({ ...prev, [transactionId]: false }));
    }
  };

  // Generate Receipt PDF (async — loads Thai font then saves)
  const handleGenerateReceipt = async (item: ScbTransaction) => {
    if (!item?.amount) return toast.warn("ไม่มีจำนวนเงิน");
    if (!item?.transactionDateandTime)
      return toast.warn("ไม่มีวันเวลาการชำระเงิน");

    const amount = parseFloat(item.amount.toString()) || 0;
    if (amount <= 0) return toast.warn("จำนวนเงินต้องมากกว่า 0");

    const txDate = new Date(item.transactionDateandTime);

    // Format date as Thai Buddhist Era: "12 พฤษภาคม 2569/ 12 MAY 2026"
    const thMonths = [
      "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน",
      "พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม",
      "กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
    ];
    const enMonths = ["JAN","FEB","MAR","APR","MAY","JUN",
      "JUL","AUG","SEP","OCT","NOV","DEC"];
    const m = txDate.getMonth();
    const txDateStr = `${txDate.getDate()} ${thMonths[m]} ${txDate.getFullYear() + 543}/ ${txDate.getDate()} ${enMonths[m]} ${txDate.getFullYear()}`;

    const docNumber =
      item.transactionId || item.billPaymentRef2 || `TX-${Date.now()}`;

    const receiptData: ReceiptData = {
      docNumber:       docNumber.substring(0, 20),
      date:            txDateStr,
      customerName:    item.payerName || "ผู้ชำระเงินผ่าน SCB QR",
      customerAddress: "ศูนย์บริหารการเงิน คณะสัตวแพทยศาสตร์",
      customerTaxId:   "-",
      description:     `ค่าใช้สอยคณะสัตวแพทยศาสตร์ (REF: ${item.billPaymentRef2 || "-"})`,
      totalPrice:      amount,
      amountInWords:   numberToThaiWords(amount),
      amountInWordsEN: numberToEnglishWords(amount),
      vatRate:         0, // VAT-exempt
    };

    try {
      await generateReceiptPDF(receiptData);
      toast.success("สร้างใบเสร็จสำเร็จ!");
    } catch (error) {
      console.error("Error generating receipt:", error);
      toast.error("เกิดข้อผิดพลาดในการสร้างใบเสร็จ");
    }
  };

  const downloadQRSection = () => {
    if (qrSectionRef.current) {
      html2canvas(qrSectionRef.current, {
        scale: 2,
        width: 300,
        backgroundColor: "#ffffff",
      }).then((canvas) => {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "qr-การชำระเงิน.png";
        link.click();
      });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  // ─── Export helpers ──────────────────────────────────────────────────────────
  /**
   * Export field types for SCB transactions
   * Includes all transaction details plus void information
   */
  type ScbExportField =
    | "scbId"
    | "payerName"
    | "sendingBankCode"
    | "receivingBankCode"
    | "amount"
    | "transactionDate"
    | "transactionTime"
    | "billPaymentRef1"
    | "billPaymentRef2"
    | "billPaymentRef3"
    | "reverseFlag"
    | "transactionType"
    | "scbVoidId"
    | "responseStatus"
    | "responseCodeDescription"
    | "responseCode";

  const EXPORT_HEADERS: Record<ScbExportField, string> = {
    scbId: "SCB ID",
    payerName: "ผู้ชำระ",
    sendingBankCode: "ธนาคารผู้ส่ง",
    receivingBankCode: "ธนาคารผู้รับ",
    amount: "จำนวนเงิน",
    transactionDate: "วันที่",
    transactionTime: "เวลา",
    billPaymentRef1: "REF1",
    billPaymentRef2: "REF2",
    billPaymentRef3: "REF3",
    reverseFlag: "สถานะคืนเงิน",
    transactionType: "ประเภทรายการ",
    scbVoidId: "Void ID",
    responseStatus: "สถานะ Void",
    responseCodeDescription: "รายละเอียด",
    responseCode: "รหัสผลลัพธ์",
  };

  const EXPORT_FIELDS: ScbExportField[] = [
    "scbId",
    "payerName",
    "sendingBankCode",
    "receivingBankCode",
    "amount",
    "transactionDate",
    "transactionTime",
    "billPaymentRef1",
    "billPaymentRef2",
    "billPaymentRef3",
    "reverseFlag",
    "transactionType",
    "scbVoidId",
    "responseStatus",
    "responseCodeDescription",
    "responseCode",
  ];

  /**
   * Safe string conversion for export
   * Returns "-" for null/undefined, otherwise toString()
   */
  const safeSringify = (value: unknown): string => {
    if (value === null || value === undefined || value === "") return "-";
    return String(value);
  };

  /**
   * Parse date and time from ISO timestamp
   * Returns [date, time] in format ["YYYY-MM-DD", "HH:mm:ss"]
   */
  const splitDatetime = (
    isoString: string | null | undefined,
  ): [string, string] => {
    if (!isoString) return ["-", "-"];
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return ["-", "-"];

      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
      const timeStr = date.toISOString().split("T")[1]?.slice(0, 8) ?? "-"; // HH:mm:ss

      return [dateStr, timeStr];
    } catch {
      return ["-", "-"];
    }
  };

  /**
   * Map SCB transactions for export
   * Expands ScbVoid array: one output row per void (or one row with void columns as "-" if no voids)
   * Splits transactionDateandTime into date and time columns
   * Converts bank codes to bank names using bankName()
   * Returns null-safe export rows
   */
  const mapScbTransactionsForExport = (
    transactions: ScbTransaction[],
  ): Array<Record<ScbExportField, string>> => {
    const rows: Array<Record<ScbExportField, string>> = [];

    transactions.forEach((txn) => {
      const [txnDate, txnTime] = splitDatetime(txn.transactionDateandTime);

      // If there are ScbVoid entries, create one row per void
      if (txn.ScbVoid && txn.ScbVoid.length > 0) {
        txn.ScbVoid.forEach((voidEntry) => {
          rows.push({
            scbId: safeSringify(txn.scbId),
            payerName: safeSringify(txn.payerName),
            sendingBankCode: bankName(txn.sendingBankCode),
            receivingBankCode: bankName(txn.receivingBankCode),
            amount: safeSringify(txn.amount),
            transactionDate: txnDate,
            transactionTime: txnTime,
            billPaymentRef1: safeSringify(txn.billPaymentRef1),
            billPaymentRef2: safeSringify(txn.billPaymentRef2),
            billPaymentRef3: safeSringify(txn.billPaymentRef3),
            reverseFlag: safeSringify(txn.reverseFlag),
            transactionType: safeSringify(txn.transactionType),
            scbVoidId: safeSringify(voidEntry.scbVoidId),
            responseStatus: safeSringify(voidEntry.responseStatus),
            responseCodeDescription: safeSringify(
              voidEntry.responseCodeDescription,
            ),
            responseCode: safeSringify(voidEntry.responseCode),
          });
        });
      } else {
        // No ScbVoid entries: create one row with void columns as "-"
        rows.push({
          scbId: safeSringify(txn.scbId),
          payerName: safeSringify(txn.payerName),
          sendingBankCode: bankName(txn.sendingBankCode),
          receivingBankCode: bankName(txn.receivingBankCode),
          amount: safeSringify(txn.amount),
          transactionDate: txnDate,
          transactionTime: txnTime,
          billPaymentRef1: safeSringify(txn.billPaymentRef1),
          billPaymentRef2: safeSringify(txn.billPaymentRef2),
          billPaymentRef3: safeSringify(txn.billPaymentRef3),
          reverseFlag: safeSringify(txn.reverseFlag),
          transactionType: safeSringify(txn.transactionType),
          scbVoidId: "-",
          responseStatus: "-",
          responseCodeDescription: "-",
          responseCode: "-",
        });
      }
    });

    return rows;
  };

  const buildExportRows = () => {
    return mapScbTransactionsForExport(filteredData);
  };

  const computeTotal = () =>
    filteredData.reduce((sum, item) => {
      const n = parseFloat(item.amount ?? "0");
      return sum + (isNaN(n) ? 0 : n);
    }, 0);

  const exportToCsv = () => {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rows = buildExportRows();
    const total = computeTotal();
    const headers = EXPORT_FIELDS.map((f) => `"${EXPORT_HEADERS[f]}"`).join(
      ",",
    );
    const dataLines = rows.map((row) =>
      EXPORT_FIELDS.map((f) => `"${String(row[f]).replace(/"/g, '""')}"`).join(
        ",",
      ),
    );
    // Total row: only show total in amount column
    const totalLine = `"TOTAL","","","","${total.toFixed(2)}","","","","","","","","","","",""`;
    const bom = "\uFEFF";
    const blob = new Blob(
      [bom + [headers, ...dataLines, totalLine].join("\n")],
      { type: "text/csv;charset=utf-8;" },
    );
    saveAs(blob, `scb-transactions-${todayStr}.csv`);
  };

  const exportToExcel = async () => {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rows = buildExportRows();
    const total = computeTotal();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("SCB Transactions");

    sheet.columns = EXPORT_FIELDS.map((f) => ({
      header: EXPORT_HEADERS[f],
      key: f,
      width:
        f === "responseCodeDescription"
          ? 30
          : f === "transactionType"
            ? 20
            : 14,
    }));

    rows.forEach((row) =>
      sheet.addRow({
        ...row,
        amount: parseFloat(row.amount) || 0,
      }),
    );

    // Add total row
    sheet.addRow({
      scbId: "TOTAL",
      payerName: "",
      sendingBankCode: "",
      receivingBankCode: "",
      amount: total,
      transactionDate: "",
      transactionTime: "",
      billPaymentRef1: "",
      billPaymentRef2: "",
      billPaymentRef3: "",
      reverseFlag: "",
      transactionType: "",
      scbVoidId: "",
      responseStatus: "",
      responseCodeDescription: "",
      responseCode: "",
    });

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEEEEEE" },
    };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `scb-transactions-${todayStr}.xlsx`,
    );
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const bankName = (code: string | null | undefined): string => {
    switch (code) {
      case "002":
        return "BBL";
      case "004":
        return "KBANK";
      case "006":
        return "KTB";
      case "008":
        return "TTB";
      case "011":
        return "CIMB";
      case "014":
        return "SCB";
      case "016":
        return "BAY";
      case "018":
        return "KKP";
      case "020":
        return "SCBT";
      case "022":
        return "CITI";
      case "024":
        return "UOB";
      case "025":
        return "BOC";
      case "039":
        return "ICBC";
      case "066":
        return "GSB";
      case "067":
        return "GHB";
      case "069":
        return "ISBT";
      case "073":
        return "LHBANK";
      case "098":
        return "TISCO";
      case "099":
        return "TCRB";
      default:
        return "-";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex flex-col justify-center items-center p-4">
      <div className=" w-full mx-auto">
        <motion.div
          className="h-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Toggle to show/hide QR generator (collapsed by default) */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowQrGenerator((p) => !p)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-sm hover:from-blue-700 hover:to-purple-700 transition-colors"
            >
              {showQrGenerator
                ? "ซ่อน สร้าง QR Code"
                : "สร้าง QR Code ชำระเงิน"}
            </button>
          </div>
          {/* Main Card */}
          {showQrGenerator && (
            <motion.div
              className="bg-white shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-white/20 "
              variants={cardVariants}
            >
              {/* Left Panel - Form Input */}
              <div className="w-full lg:w-1/2 p-8 lg:p-10">
                <div className="flex flex-col w-full gap-6">
                  {/* Header */}
                  <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4">
                      <span className="material-symbols-outlined text-white text-3xl">
                        qr_code_scanner
                      </span>
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      สร้าง QR Code การชำระเงิน
                    </h1>
                    <p className="text-sm text-gray-600 mt-2 font-medium">
                      คณะสัตวแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่
                    </p>
                  </motion.div>

                  {/* Permission Alert - Create */}
                  {!canCreate && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3"
                    >
                      <span className="material-symbols-outlined text-amber-600 text-lg mt-0.5 flex-shrink-0">
                        lock
                      </span>
                      <div className="text-sm text-amber-800">
                        <p className="font-semibold">
                          ไม่มีสิทธิ์สร้าง QR Code
                        </p>
                        <p className="text-amber-700 text-xs mt-1">
                          กรุณาติดต่อผู้ดูแลระบบเพื่อขอสิทธิ์การสร้าง QR Code
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Form Fields */}
                  <div className="flex flex-col gap-5">
                    {/* Amount Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex flex-col gap-2"
                    >
                      <label className="text-gray-700 font-medium flex flex-col items-start gap-2">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-blue-500 text-lg">
                            payments
                          </span>
                          จำนวนเงิน (บาท)
                          <span className="text-red-500 font-bold">*</span>
                        </div>

                        <span className="text-[12px] text-gray-500">
                          ระบุจำนวนเงินตั้งแต่ 1-9999.99 บาท
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          name="amount"
                          placeholder="0.00"
                          value={paymentData.amount}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={isQrActive || !canCreate}
                          className="w-full p-4 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50  transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                          attach_money
                        </span>
                      </div>
                    </motion.div>

                    {/* Ref Fields */}
                    {/* Ref1 */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-col gap-2"
                    >
                      <label className="text-gray-700 font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500 text-lg">
                          tag
                        </span>
                        Ref1 - รหัสประเภท
                        <span className="text-red-500 font-bold">*</span>
                        <span className="text-[11px] text-gray-500 font-normal">
                          (สูงสุด 8 ตัวอักษร)
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="refId1"
                          placeholder="เช่น: STUD"
                          value={paymentData.refId1 || ""}
                          onChange={handleChange}
                          disabled={isQrActive || !canCreate}
                          maxLength={8}
                          className="w-full p-4 pl-12 uppercase border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50  transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />

                        <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                          123
                        </span>
                      </div>
                    </motion.div>

                    {/* Ref2 */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex flex-col gap-2"
                    >
                      <label className="text-gray-700 font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500 text-lg">
                          tag
                        </span>
                        Ref2 - อ้างอิงลำดับ
                        <span className="text-red-500 font-bold">*</span>
                        <span className="text-[11px] text-gray-500 font-normal">
                          (สูงสุด 20 ตัวอักษร)
                        </span>
                      </label>
                      <div className="relative flex gap-2">
                        <input
                          type="text"
                          name="refId2"
                          placeholder="เช่น: STUD00001"
                          value={paymentData.refId2 || ""}
                          onChange={handleChange}
                          disabled={isQrActive || !canCreate}
                          maxLength={20}
                          className="flex-1 p-4 pl-12 uppercase border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50  transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />

                        <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                          123
                        </span>
                        <motion.button
                          type="button"
                          disabled={isQrActive || !canCreate}
                          onClick={() => {
                            setPaymentData((prev) => ({
                              ...prev,
                              refId2: generateRandomRef2(prev.refId1),
                            }));
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 bg-gradient-to-r  from-blue-500 to-blue-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          title="สร้างอ้างอิง"
                        >
                          <span className="material-symbols-outlined text-sm">
                            autorenew
                          </span>
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* Ref3 */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col gap-2"
                    >
                      <label className="text-gray-700 font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500 text-lg">
                          tag
                        </span>
                        Ref3 - อ้างอิงเพิ่มเติม
                        <span className="text-[11px] text-gray-500 font-normal">
                          (เลือกได้ สูงสุด 20 ตัวอักษร)
                        </span>
                      </label>
                      <div className="relative flex gap-2">
                        <input
                          type="text"
                          name="refId3"
                          placeholder="เลือกได้"
                          value={paymentData.refId3 || ""}
                          onChange={handleChange}
                          disabled={isQrActive || !canCreate}
                          maxLength={20}
                          className="flex-1 uppercase p-4 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white/50  transition-all duration-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />

                        <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                          123
                        </span>
                        <motion.button
                          type="button"
                          disabled={isQrActive || !canCreate}
                          onClick={() => {
                            setPaymentData((prev) => ({
                              ...prev,
                              refId3: generateRandomRef3(),
                            }));
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          title="สร้างอ้างอิง"
                        >
                          <span className="material-symbols-outlined text-sm">
                            autorenew
                          </span>
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>

                  {/* Generate QR Button */}
                  <motion.button
                    onClick={generateQRCode}
                    disabled={isQrActive || isLoading || !canCreate}
                    className="py-4 px-6 text-lg font-semibold rounded-xl transition-all duration-300 ease-in-out shadow-lg flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    whileHover={
                      !isQrActive && !isLoading && canCreate
                        ? { scale: 1.02, y: -2 }
                        : {}
                    }
                    whileTap={
                      !isQrActive && !isLoading && canCreate
                        ? { scale: 0.98 }
                        : {}
                    }
                  >
                    {isLoading ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="material-symbols-outlined"
                        >
                          progress_activity
                        </motion.span>
                        กำลังสร้าง QR Code...
                      </>
                    ) : isQrActive ? (
                      <>
                        <span className="material-symbols-outlined">
                          qr_code_2
                        </span>
                        QR Code กำลังใช้งาน
                      </>
                    ) : !canCreate ? (
                      <>
                        <span className="material-symbols-outlined">lock</span>
                        ไม่มีสิทธิ์
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined">
                          qr_code_2
                        </span>
                        สร้าง QR Code
                      </>
                    )}
                  </motion.button>
                  <button
                    onClick={handleTestPush}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded mr-2"
                  >
                    Send Test Payload
                  </button>
                  {qrImageBase64 && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowQrModal(true)}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 shadow-md hover:bg-indigo-700 transition-colors"
                      >
                        <span className="material-symbols-outlined">
                          qr_code_scanner
                        </span>
                        ชำระเงินผ่าน QR Code
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* QR display moved to modal (opens when user clicks "ชำระเงินผ่าน QR Code") */}
            </motion.div>
          )}

          {/* QR Modal */}
          {showQrModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-y-auto">
                <button
                  onClick={() => setShowQrModal(false)}
                  aria-label="Close"
                  className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                >
                  &times;
                </button>

                <div className="p-6">
                  <AnimatePresence mode="wait">
                    {qrImageBase64 ? (
                      <motion.div
                        key="modal-qr-active"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                      >
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">
                            SCB THAI QR PAYMENT
                          </h3>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                          <div className="bg-white p-2 rounded-xl border-2 border-gray-200">
                            <QRCodeDisplay
                              base64Data={qrImageBase64}
                              altText="สแกนเพื่อชำระเงิน"
                              width={280}
                              height={280}
                            />
                          </div>

                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                              {Number(paymentData.amount).toLocaleString(
                                "th-TH",
                              )}{" "}
                              บาท
                            </p>
                          </div>

                          <div className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700">
                            <div className="flex justify-between">
                              <span className="font-medium">Ref1</span>
                              <span className="font-mono">
                                {paymentData.refId1}
                              </span>
                            </div>
                            <div className="flex justify-between mt-2">
                              <span className="font-medium">Ref2</span>
                              <span className="font-mono">
                                {paymentData.refId2}
                              </span>
                            </div>
                            {paymentData.refId3 && (
                              <div className="flex justify-between mt-2">
                                <span className="font-medium">Ref3</span>
                                <span className="font-mono">
                                  {paymentData.refId3}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="w-full flex gap-2 mt-3">
                            <button
                              onClick={() => {
                                checkPaymentStatus(
                                  paymentData.refId1,
                                  paymentData.refId2,
                                  paymentData.refId3 || "",
                                  new Date().toISOString().split("T")[0],
                                );
                              }}
                              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium"
                            >
                              ตรวจสอบการชำระเงิน
                            </button>

                            <button
                              onClick={handleCancelQr}
                              className="py-2 px-3 bg-red-600 text-white rounded-lg font-medium"
                            >
                              ยกเลิก
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : paymentSuccessData ? (
                      <motion.div
                        key="modal-payment-success"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                      >
                        <div className="text-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-800">
                            ชำระเงินสำเร็จ
                          </h3>
                        </div>

                        <div className="p-4 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm text-gray-600">จำนวน</p>
                          <p className="text-2xl font-bold text-green-600">
                            {Number(paymentSuccessData.amount).toLocaleString(
                              "th-TH",
                            )}{" "}
                            บาท
                          </p>
                          <div className="mt-3 text-sm">
                            <div className="flex justify-between">
                              <span>Ref2</span>
                              <span className="font-mono">
                                {paymentSuccessData.billPaymentRef2}
                              </span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span>Transaction ID</span>
                              <span className="font-mono">
                                {paymentSuccessData.transactionId}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={async () => {
                                await exportReceipt({
                                  shopName:
                                    "คณะสัตวแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่",
                                  logoUrl: "/assets/images/logo.png",
                                  transactionDate:
                                    paymentSuccessData.transactionDateandTime ||
                                    undefined,
                                  refNumber:
                                    paymentSuccessData.billPaymentRef2 ||
                                    paymentSuccessData.transactionId ||
                                    undefined,
                                  amount: paymentSuccessData.amount as any,
                                  paymentMethod: "SCB QR",
                                });
                              }}
                              className="flex-1 py-2 bg-indigo-600 text-white rounded-lg font-medium"
                            >
                              ออกใบเสร็จ (PDF)
                            </button>

                            <button
                              onClick={() => {
                                setPaymentSuccessData(null);
                                setShowQrModal(false);
                                fetchData();
                              }}
                              className="py-2 px-3 bg-gray-200 rounded-lg"
                            >
                              ปิด
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="modal-inactive"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="text-center text-gray-500 py-8">
                          <p className="font-medium">ยังไม่มี QR Code</p>
                          <p className="text-xs">
                            กรุณาสร้าง QR Code ก่อนเปิดการแสดง
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          <AnimatePresence>
            {isLoadingConfirm && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg border border-blue-200/50"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md"
                  >
                    <span className="material-symbols-outlined text-white">
                      sync
                    </span>
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-blue-700 font-medium">
                      กำลังตรวจสอบการโอนเงิน...
                    </p>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-2"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SCB Transactions */}

          <motion.div
            className="mt-8 bg-white/90 rounded-3xl shadow-xl border border-white/20 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Section Header */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-3">
                    <span className="material-symbols-outlined">
                      account_balance
                    </span>
                    SCB Transactions
                  </h3>
                  <p className="text-blue-100 mt-1">
                    {filteredData.length} รายการ
                    {filteredData.length !== dataConfirm?.length && (
                      <span className="ml-1 opacity-75">
                        {/* (กรองจาก {dataConfirm.length} รายการทั้งหมด) */}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="bg-white/20 px-4 py-2 rounded-xl text-sm font-mono">
                    {scbToken ? `${scbToken.slice(0, 15)}...` : "No Key"}
                  </div>
                  <motion.button
                    onClick={accessToken}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg"
                  >
                    <span className="material-symbols-outlined text-sm">
                      key
                    </span>
                    Create Key
                  </motion.button>
                  <motion.button
                    onClick={() => fetchData()}
                    whileHover={{ scale: 1.05, y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg"
                  >
                    <span className="material-symbols-outlined text-sm">
                      autorenew
                    </span>
                    Reload
                  </motion.button>
                  {/* Export dropdown */}
                  <div className="relative" ref={exportMenuRef}>
                    <motion.button
                      onClick={() => setIsExportMenuOpen((p) => !p)}
                      disabled={filteredData.length === 0}
                      whileHover={
                        filteredData.length > 0 ? { scale: 1.05, y: -1 } : {}
                      }
                      whileTap={filteredData.length > 0 ? { scale: 0.95 } : {}}
                      className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-sm">
                        download
                      </span>
                      Export
                    </motion.button>
                    {isExportMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-20 min-w-[160px] overflow-hidden">
                        <button
                          onClick={() => {
                            exportToCsv();
                            setIsExportMenuOpen(false);
                          }}
                          className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">
                            file_download
                          </span>
                          Export CSV
                        </button>
                        <button
                          onClick={() => {
                            void exportToExcel();
                            setIsExportMenuOpen(false);
                          }}
                          className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        >
                          <span className="material-symbols-outlined text-base">
                            table_view
                          </span>
                          Export Excel
                        </button>
                      </div>
                    )}
                  </div>

                  <motion.button
                    onClick={() => setShowQrGenerator((p) => !p)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-sm hover:from-blue-700 hover:to-purple-700 transition-colors"
                  >
                    {showQrGenerator ? "Hide QR Code" : "QR Code Payment"}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Filter Bar
                  Default date range = Jan 1 → Dec 31 of current year (set in state initializers).
                  Any filter change resets pagination to page 1.
                  Date range validation: start > end shows inline error and filteredData still runs
                  but will yield 0 results until corrected.
              */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-3 flex-wrap items-end">
                {/* REF1 text filter */}
                <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                  <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      tag
                    </span>
                    REF1
                  </label>
                  <input
                    type="text"
                    placeholder="กรอง REF1..."
                    value={filterRef1}
                    onChange={(e) => {
                      setFilterRef1(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                {/* Date from */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      calendar_today
                    </span>
                    ตั้งแต่
                  </label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFilterDateFrom(val || defaultDateFrom);
                      setCurrentPage(1);
                      if (val && filterDateTo && val > filterDateTo) {
                        setDateRangeError(
                          "วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด",
                        );
                      } else {
                        setDateRangeError(null);
                      }
                    }}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                {/* Date to */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      event
                    </span>
                    ถึง
                  </label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFilterDateTo(val || defaultDateTo);
                      setCurrentPage(1);
                      if (filterDateFrom && val && filterDateFrom > val) {
                        setDateRangeError(
                          "วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด",
                        );
                      } else {
                        setDateRangeError(null);
                      }
                    }}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  />
                </div>

                {/* Status dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">
                      app_badging
                    </span>
                    สถานะ
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setFilterStatus(e.target.value as TransactionStatus);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="All">ทั้งหมด</option>
                    <option value="Normal">ปกติ</option>
                    <option value="Reversed">คืนเงิน</option>
                  </select>
                </div>

                {/* Search / Re-fetch */}
                <button
                  onClick={() => fetchData()}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 rounded-lg transition-colors self-end"
                >
                  <span className="material-symbols-outlined text-base">
                    search
                  </span>
                  ค้นหา
                </button>

                {/* Reset */}
                <button
                  onClick={() => {
                    setFilterRef1("");
                    setFilterDateFrom(defaultDateFrom);
                    setFilterDateTo(defaultDateTo);
                    setFilterStatus("All");
                    setDateRangeError(null);
                    setCurrentPage(1);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors self-end"
                >
                  <span className="material-symbols-outlined text-base">
                    filter_alt_off
                  </span>
                  รีเซ็ต
                </button>
              </div>
              {/* Inline date range error */}
              {dateRangeError && (
                <p
                  className="mt-2 text-xs text-red-600 flex items-center gap-1"
                  role="alert"
                >
                  <span className="material-symbols-outlined text-sm">
                    error
                  </span>
                  {dateRangeError}
                </p>
              )}
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto bg-white">
              <table className="w-full table-auto min-w-[900px]">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    {[
                      { label: "วันที่/เวลา", icon: "calendar_today" },
                      { label: "REF1", icon: "tag" },
                      { label: "จำนวนเงิน", icon: "payments" },
                      { label: "ผู้ชำระ", icon: "person" },
                      { label: "สถานะ", icon: "app_badging" },
                      { label: "รายละเอียด", icon: "info" },
                    ].map(({ label, icon }) => (
                      <th
                        key={label}
                        className="px-5 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-gray-500">
                            {icon}
                          </span>
                          {label}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedData.map((item, _index) => {
                    // Use scbId as the stable row key per requirement
                    const rowId = item.scbId;
                    const isExpanded = expandedRowId === rowId;
                    // Status derivation:
                    //   reverseFlag==="R"     → Reversed
                    //   ScbVoid with Success  → VoidSuccess
                    //   ScbVoid without Succ  → VoidOther
                    //   otherwise             → Normal
                    const status = deriveStatus(item);
                    const voidedSuccess =
                      item.ScbVoid?.some(
                        (v) => v.responseStatus === "Success",
                      ) ?? false;

                    const statusBadge = (): React.ReactNode => {
                      switch (status) {
                        case "Reversed":
                          return (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-300">
                              <span className="material-symbols-outlined text-sm">
                                swap_horiz
                              </span>
                              คืนเงิน
                            </span>
                          );
                        case "VoidSuccess":
                          return (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
                              <span className="material-symbols-outlined text-sm">
                                undo
                              </span>
                              Void สำเร็จ
                            </span>
                          );
                        case "VoidOther":
                          return (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-300">
                              <span className="material-symbols-outlined text-sm">
                                cancel
                              </span>
                              Void อื่นๆ
                            </span>
                          );
                        default:
                          return (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                              <span className="material-symbols-outlined text-sm">
                                check_circle
                              </span>
                              ปกติ
                            </span>
                          );
                      }
                    };

                    return (
                      <Fragment key={rowId}>
                        {/* Main Row */}
                        <tr
                          className={`transition-all duration-200 cursor-pointer ${
                            isExpanded ? "bg-blue-50" : "hover:bg-gray-50"
                          }`}
                          onClick={() => toggleRow(rowId)}
                        >
                          {/* Date / Time */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium text-gray-800">
                                {item.transactionDateandTime
                                  ? new Intl.DateTimeFormat("th-TH", {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                      timeZone: "Asia/Bangkok",
                                    }).format(
                                      new Date(item.transactionDateandTime),
                                    )
                                  : "-"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {item.transactionDateandTime
                                  ? new Intl.DateTimeFormat("th-TH", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                      hour12: false,
                                      timeZone: "Asia/Bangkok",
                                    }).format(
                                      new Date(item.transactionDateandTime),
                                    )
                                  : ""}
                              </span>
                            </div>
                          </td>

                          {/* REF1 */}
                          <td className="px-5 py-4">
                            <code className="text-sm font-mono bg-gray-100 px-3 py-1.5 rounded-lg text-gray-800 border border-gray-200">
                              {item.billPaymentRef1 ?? "-"}
                            </code>
                          </td>

                          {/* Amount */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 bg-green-50 px-3 py-2 rounded-lg border border-green-200 w-fit">
                              <span className="material-symbols-outlined text-green-600 text-base">
                                payments
                              </span>
                              <span className="font-bold text-green-700 text-sm">
                                {item.amount != null
                                  ? parseFloat(item.amount).toLocaleString(
                                      "th-TH",
                                      { minimumFractionDigits: 2 },
                                    )
                                  : "-"}{" "}
                                ฿
                              </span>
                            </div>
                          </td>

                          {/* Payer */}
                          <td className="px-5 py-4">
                            <span className="text-sm text-gray-800">
                              {item.payerName ?? "-"}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">{statusBadge()}</td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            {canView ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRow(rowId);
                                }}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                  isExpanded
                                    ? "bg-blue-100 text-blue-700 border-blue-300"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                <span className="material-symbols-outlined text-base">
                                  {isExpanded ? "expand_less" : "info"}
                                </span>
                                {isExpanded ? "ซ่อน" : "ดูเพิ่มเติม"}
                              </button>
                            ) : (
                              <div className="text-xs text-gray-400 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">
                                  lock
                                </span>
                                ไม่มีสิทธิ์
                              </div>
                            )}
                          </td>
                        </tr>

                        {/* Expanded Detail Row */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="px-5 py-4 bg-blue-50/40">
                              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                  {/* Reference Numbers */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                                      <span className="material-symbols-outlined text-sm">
                                        tag
                                      </span>
                                      เลขที่อ้างอิง
                                    </h4>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-500 w-10">
                                          REF1:
                                        </span>
                                        <code className="text-xs font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200 text-gray-800">
                                          {item.billPaymentRef1 ?? "-"}
                                        </code>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-gray-500 w-10">
                                          REF2:
                                        </span>
                                        <code className="text-xs font-mono bg-blue-50 px-2 py-1 rounded border border-blue-200 text-blue-800">
                                          {item.billPaymentRef2 ?? "-"}
                                        </code>
                                      </div>
                                      {item.billPaymentRef3 && (
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-medium text-gray-500 w-10">
                                            REF3:
                                          </span>
                                          <code className="text-xs font-mono bg-purple-50 px-2 py-1 rounded border border-purple-200 text-purple-800">
                                            {item.billPaymentRef3}
                                          </code>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Transaction details */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                                      <span className="material-symbols-outlined text-sm">
                                        receipt_long
                                      </span>
                                      Transaction ID
                                    </h4>
                                    <code className="text-xs font-mono bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 text-gray-800 break-all block">
                                      {item.transactionId ?? "-"}
                                    </code>
                                    {item.sendingBankCode && (
                                      <div className="mt-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-orange-600 text-base">
                                          account_balance
                                        </span>
                                        <span className="text-xs text-gray-600">
                                          ธนาคาร:{" "}
                                          <span className="font-semibold">
                                            {bankName(item.sendingBankCode)}
                                          </span>
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* ScbVoid history + void button */}
                                  <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                                      <span className="material-symbols-outlined text-sm">
                                        detector_status
                                      </span>
                                      ประวัติ Void
                                    </h4>

                                    {!canCreate ||
                                    !canEdit ||
                                    !canDelete ||
                                    !canView ? (
                                      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 mb-3">
                                        <p className="text-xs text-amber-800 flex items-start gap-2">
                                          <span className="material-symbols-outlined text-sm mt-0.5 flex-shrink-0">
                                            lock
                                          </span>
                                          <span>
                                            ไม่มีสิทธิ์ใช้งานการคืนเงิน (Void)
                                          </span>
                                        </p>
                                      </div>
                                    ) : null}

                                    {item.ScbVoid && item.ScbVoid.length > 0 ? (
                                      <div className="space-y-2">
                                        {item.ScbVoid.map((v, vi) => (
                                          <div
                                            key={vi}
                                            className={`p-2.5 rounded-lg border text-xs ${
                                              v.responseStatus === "Success"
                                                ? "bg-red-50 border-red-200 text-red-700"
                                                : "bg-yellow-50 border-yellow-200 text-yellow-700"
                                            }`}
                                          >
                                            <div className="flex justify-between items-center">
                                              <span className="font-semibold">
                                                {v.responseStatus}
                                              </span>
                                              {v.responseCode && (
                                                <span className="font-mono opacity-75">
                                                  #{v.responseCode}
                                                </span>
                                              )}
                                            </div>
                                            {v.extStatusDesc && (
                                              <p className="mt-1 opacity-80">
                                                {v.extStatusDesc}
                                              </p>
                                            )}
                                            <p className="mt-1 opacity-60">
                                              {new Date(
                                                v.createdAt,
                                              ).toLocaleString("th-TH", {
                                                timeZone: "Asia/Bangkok",
                                              })}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-gray-400 italic">
                                        ยังไม่มีการ Void
                                      </p>
                                    )}
                                    {/* Void action — only shown when payment was confirmed */}
                                    {item.sendingBankCode && (
                                      <div className="flex flex-col gap-2 mt-3">
                                        {/* Generate Receipt PDF Button */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleGenerateReceipt(item);
                                          }}
                                          className="px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                        >
                                          <span className="material-symbols-outlined text-sm">
                                            receipt_long
                                          </span>
                                          ออกใบเสร็จ PDF
                                        </button>

                                        {/* Void Payment Button */}
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (!voidedSuccess)
                                              handleVoidPayment(item);
                                          }}
                                          disabled={
                                            voidedSuccess ||
                                            !!(
                                              item.transactionId &&
                                              loadingVoid[item.transactionId]
                                            ) ||
                                            !canCreate ||
                                            !canEdit ||
                                            !canDelete ||
                                            !canView
                                          }
                                          className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                                            !canCreate ||
                                            !canEdit ||
                                            !canDelete ||
                                            !canView
                                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                              : voidedSuccess
                                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                : item.transactionId &&
                                                    loadingVoid[
                                                      item.transactionId
                                                    ]
                                                  ? "bg-gray-400 text-white cursor-not-allowed"
                                                  : "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                                          }`}
                                        >
                                          {item.transactionId &&
                                          loadingVoid[item.transactionId] ? (
                                            <>
                                              <span className="animate-spin material-symbols-outlined text-sm">
                                                progress_activity
                                              </span>
                                              กำลังประมวลผล...
                                            </>
                                          ) : voidedSuccess ? (
                                            <>
                                              <span className="material-symbols-outlined text-sm">
                                                undo
                                              </span>
                                              Void สำเร็จแล้ว
                                            </>
                                          ) : (
                                            <>
                                              <span className="material-symbols-outlined text-sm">
                                                cancel
                                              </span>
                                              คืนเงิน (Void)
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                  {/* No results after filtering */}
                  {paginatedData.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-500"
                      >
                        <span className="material-symbols-outlined text-4xl text-gray-300 block mb-2">
                          search_off
                        </span>
                        ไม่พบรายการที่ตรงกับตัวกรอง
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 py-6 bg-gray-50 border-t border-gray-200 flex-wrap">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">
                      chevron_left
                    </span>
                    ก่อนหน้า
                  </button>

                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2.5 rounded-lg border font-medium transition-colors ${
                        currentPage === i + 1
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    ถัดไป
                    <span className="material-symbols-outlined text-base">
                      chevron_right
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Empty State */}
            {dataConfirm?.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-6 rounded-3xl inline-block mb-4">
                  <span className="material-symbols-outlined text-blue-300 text-5xl">
                    receipt_long
                  </span>
                </div>
                <h4 className="text-gray-500 font-medium text-lg">
                  ไม่พบประวัติการชำระเงิน
                </h4>
                <p className="text-gray-400 mt-2">
                  สร้าง Token เพื่อดึงข้อมูลล่าสุด
                </p>
              </div>
            )}
          </motion.div>

          {/* Footer */}
          <motion.div
            className="flex justify-center text-sm text-gray-500 mt-8 pb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          ></motion.div>
        </motion.div>
      </div>
    </div>
  );
}
