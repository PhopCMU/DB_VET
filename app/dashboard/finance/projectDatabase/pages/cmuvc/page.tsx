"use client";

import { getParticipantList } from "@/app/routers/cmuvc/GetRouter";

import ThaiYearPicker from "@/components/ThaiYearPicker";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ExportMenu from "@/utils/ExportOptions";
import { ApiResponseData } from "@/app/model/cmuvc/paymentModel";
import { ModalEditFileParticipant } from "@/components/(CMUVC)/cmuvc_Modal";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import PermissionGuard from "@/components/Guards/PermissionGuard";
import { usePermission } from "@/app/context/UsePermission";
const PieChartComponent = dynamic(() => import("@/components/PieChart"), {
  ssr: false,
});

const SUB_MENU_ID = "e432a5bf-eda0-4638-848d-26df9194f57e";
const PROJECT_ID = "ee9ce62b-2e02-4682-9ecf-9f9b564ee5e3";

export default function CmuvcPage() {
  const [selectedYear, setSelectedYear] = useState<Date | null>(new Date());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const [dataParticipant, setDataParticipant] =
    useState<ApiResponseData | null>(null);
  const [activeTab, setActiveTab] = useState<"pre" | "main" | "abstract">(
    "pre"
  );
  const [onChangeFilePayment, setOnChangeFilePayment] =
    useState<ApiResponseData>();
  const [isModalFileOpen, setIsModalFileOpen] = useState<boolean>(false);
  const hasData = useRef(false);
  const router = useRouter();

  const { canView, canCreate, canEdit, canDelete } = usePermission(
    SUB_MENU_ID,
    PROJECT_ID
  );

  const fetchThemeTitle = async (date: Date): Promise<void> => {
    setIsLoading(true);
    try {
      const data: any = await getParticipantList(date || new Date());

      if (data !== undefined) {
        setDataParticipant(data.result);
      }

      if (data.success === false && data.message === "Authentication failed") {
        router.replace("/");
      }
    } catch (error) {
      console.error("Failed to fetch theme data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect สำหรับ initial load
  useEffect(() => {
    if (!hasData.current) {
      fetchThemeTitle(new Date());
      hasData.current = true;
    }
  }, []);

  // useEffect สำหรับกรณีที่ isUpdated เปลี่ยน
  useEffect(() => {
    if (isUpdated && hasData.current) {
      fetchThemeTitle(new Date());
      setIsUpdated(false);
    }
  }, [isUpdated]);

  const handerChangeYear = async (date: Date) => {
    setSelectedYear(date);
    await fetchThemeTitle(date || new Date());
  };

  const filteredUsers = () => {
    let result: any[] = [];

    if (!dataParticipant) return [];

    // เลือกประเภทข้อมูลตาม activeTab
    switch (activeTab) {
      case "pre":
        result =
          dataParticipant.search_participant?.filter(
            (p) => p.themeTitleId === "ce291973-8980-4a7c-9ab4-13a684aea33b"
          ) || [];
        break;
      case "main":
        result =
          dataParticipant.search_participant?.filter(
            (p) => p.themeTitleId === "522b5662-ebc8-45b7-bfaa-350d8fff66a4"
          ) || [];
        break;
      case "abstract":
        result = dataParticipant.search_abstract || [];
        break;
      default:
        result = [];
    }

    // กรองด้วย searchQuery (ถ้ามี)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        `${item.fname} ${item.lname}`.toLowerCase().includes(query)
      );
    }

    return result;
  };

  const handleViewFile = (participant: ApiResponseData) => {
    setOnChangeFilePayment(participant);
    setIsModalFileOpen(true);
  };
  return (
    <>
      <PermissionGuard submenuIdCode={SUB_MENU_ID} />
      <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-50 min-h-screen">
        {isModalFileOpen && (
          <ModalEditFileParticipant
            isOpen={isModalFileOpen}
            onClose={() => setIsModalFileOpen(false)}
            title="ตรวจสอบเอกสาร & แก้ไขเอกสาร"
            formData={onChangeFilePayment ?? ({} as any)}
            onSave={() => {}}
            onSuccess={() => {
              setIsUpdated(true); // บอกให้โหลดข้อมูลใหม่
            }}
          />
        )}

        {/* Header with Guidance */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-blue-100 hover:bg-blue-50/20 group"
        >
          <div className="flex items-start gap-4">
            <motion.div
              className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <span className="material-symbols-rounded text-3xl">
                assessment
              </span>
            </motion.div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                Project Payment Slip Verification
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
                >
                  New
                </motion.span>
              </h1>
              <p className="text-sm text-gray-600 mb-4">
                Manage and verify payment proof submissions for CMUVC 2025.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
          >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <motion.div
                initial={{ x: -10 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1"
              >
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <span className="material-symbols-rounded text-blue-500 bg-blue-50 p-2 rounded-lg text-3xl">
                    groups
                  </span>
                  <span>
                    รายชื่อทั้งหมด
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="ml-2 text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full align-middle"
                    >
                      CMUVC{" "}
                      {selectedYear ? selectedYear.getFullYear() + 543 : ""}
                    </motion.span>
                  </span>
                </h2>
              </motion.div>

              {/* Controls Section */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Year Picker */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                  className="relative w-full sm:w-60 mr-3"
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <span className="material-symbols-rounded">
                      calendar_today
                    </span>
                  </div>
                  <ThaiYearPicker
                    selectedYear={
                      selectedYear !== null ? selectedYear : new Date()
                    }
                    onChange={handerChangeYear}
                  />
                </motion.div>

                {/* Search Box */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
                  className="relative w-full sm:w-72"
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-rounded text-gray-400">
                      search
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อหรือรหัส..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all placeholder-gray-400 text-gray-700 hover:border-gray-300"
                  />
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <span className="material-symbols-rounded text-gray-400 hover:text-gray-600">
                        close
                      </span>
                    </motion.button>
                  )}
                </motion.div>

                {/* Export Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
                  className="relative w-full sm:w-auto"
                >
                  <motion.button
                    onClick={() => {
                      // ต้องมีให้ครบ 3 สิทธิ์ ถึงจะ Export ได้
                      if (canView && canCreate && canEdit) {
                        setIsOpen(!isOpen);
                      }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`${
                      canView && canCreate && canEdit
                        ? "flex items-center bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                        : "flex items-center bg-gray-300 text-white rounded-xl hover:bg-gray-400"
                    } gap-1 px-4 py-2.5  transition-colors shadow-sm w-full sm:w-auto`}
                    title={
                      canView && canCreate && canEdit
                        ? "ส่งออกข้อมูล"
                        : "ไม่มีสิทธิ์ในการส่งออกข้อมูล"
                    }
                  >
                    <span className="material-symbols-outlined text-lg">
                      {canView && canCreate && canEdit
                        ? "download"
                        : "file_download_off"}
                    </span>
                    <span>
                      {canView && canCreate && canEdit
                        ? "ส่งออกข้อมูล"
                        : "ไม่ได้รับสิทธิ์ส่งออกข้อมูล"}
                    </span>
                    <span className="material-symbols-rounded text-lg transform transition-transform duration-200">
                      {isOpen ? "expand_less" : "expand_more"}
                    </span>
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
                            exportData={filteredUsers() as any}
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

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Card 1 - สำเร็จ */}
              <motion.div
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-emerald-50/80 to-white p-6 rounded-2xl border border-emerald-100/50 shadow-sm relative overflow-hidden group"
              >
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-200 rounded-full opacity-10 group-hover:opacity-20 transition-all duration-500"></div>
                  <div className="absolute -left-5 -bottom-5 w-20 h-20 bg-emerald-300 rounded-full opacity-5 group-hover:opacity-15 transition-all duration-700"></div>
                </div>

                <div className="flex items-start gap-5 relative z-10">
                  <div className="p-3 bg-white rounded-xl shadow-md border border-emerald-100 group-hover:shadow-lg transition-all">
                    <span className="material-symbols-outlined text-emerald-600 text-3xl">
                      check_circle
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-emerald-700/90 tracking-wider">
                      สำเร็จ
                    </h3>
                    <p className="mt-2 text-4xl font-bold text-emerald-900">
                      {
                        filteredUsers().filter((user) => user.payments === true)
                          .length
                      }
                    </p>
                    <p className="mt-1 text-xs text-emerald-600/80">
                      การชำระเงินเสร็จสมบูรณ์
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 2 - รอตรวจสอบ */}
              <motion.div
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gradient-to-br from-amber-50/80 to-white p-6 rounded-2xl border border-amber-100/50 shadow-sm relative overflow-hidden group"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-200 rounded-full opacity-10 group-hover:opacity-20 transition-all duration-500"></div>
                  <div className="absolute -left-5 -bottom-5 w-20 h-20 bg-amber-300 rounded-full opacity-5 group-hover:opacity-15 transition-all duration-700"></div>
                </div>

                <div className="flex items-start gap-5 relative z-10">
                  <div className="p-3 bg-white rounded-xl shadow-md border border-amber-100 group-hover:shadow-lg transition-all">
                    <span className="material-symbols-outlined text-amber-600 text-3xl">
                      pending
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-amber-700/90 tracking-wider">
                      รอตรวจสอบ
                    </h3>
                    <p className="mt-2 text-4xl font-bold text-amber-900">
                      {
                        filteredUsers().filter(
                          (user) => user.payments === false
                        ).length
                      }
                    </p>
                    <p className="mt-1 text-xs text-amber-600/80">
                      รอการยืนยันการชำระเงิน
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 3 - กราฟวงกลม */}
              <motion.div
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br from-blue-50/80 to-white p-6 rounded-2xl border border-blue-100/50 shadow-sm relative overflow-hidden group"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-200 rounded-full opacity-10 group-hover:opacity-20 transition-all duration-500"></div>
                  <div className="absolute -left-5 -bottom-5 w-20 h-20 bg-blue-300 rounded-full opacity-5 group-hover:opacity-15 transition-all duration-700"></div>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-md border border-blue-100 group-hover:shadow-lg transition-all">
                      <span className="material-symbols-outlined text-blue-600 text-3xl">
                        donut_large
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-blue-700/90 tracking-wider">
                        สถานะทั้งหมด
                      </h3>
                      <p className="mt-1 text-xs text-blue-600/80">
                        อัตราส่วนการชำระเงิน
                      </p>
                    </div>
                  </div>
                  <div className="h-30 flex items-center justify-center">
                    <PieChartComponent
                      data={
                        [
                          {
                            name: "สำเร็จ",
                            value: filteredUsers().filter(
                              (user) => user.payments === true
                            ).length,
                            color: "#059669", // emerald-600
                          },
                          {
                            name: "รอตรวจสอบ",
                            value: filteredUsers().filter(
                              (user) => user.payments === false
                            ).length,
                            color: "#d97706", // amber-600
                          },
                        ] as any[]
                      }
                    />
                  </div>
                </div>
              </motion.div>
            </div>
            {/* Info Box */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <div className="flex items-start">
                  <span className="material-symbols-outlined text-blue-500 mt-0.5 mr-2">
                    info
                  </span>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">
                      คำแนะนำการใช้งาน
                    </h3>
                    <p className="mt-1 text-sm text-blue-500">
                      เลือกกลุ่มที่ต้องการ
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            {/* Gradient Tabs */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 my-4 md:my-6"
            >
              {[
                { id: "pre", label: "Pre Congress", icon: "event_upcoming" },
                {
                  id: "main",
                  label: "Main Conference",
                  icon: "calendar_month",
                },
                { id: "abstract", label: "Abstract", icon: "description" },
              ].map((tab: any) => (
                <motion.button
                  key={tab.id}
                  whileHover={{
                    y: -3,
                    scale: 1.03,
                    boxShadow:
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
        px-4 py-3 md:px-6 md:py-4 
        rounded-xl md:rounded-2xl 
        flex items-center justify-center gap-2 md:gap-3 
        transition-all 
        text-sm md:text-base font-medium
        border border-gray-200
        relative overflow-hidden
        ${
          activeTab === tab.id
            ? "text-white shadow-lg"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }
      `}
                >
                  {/* Gradient Background for Active Tab */}
                  {activeTab === tab.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-400"
                    />
                  )}

                  <span className="material-symbols-outlined text-lg md:text-xl relative z-10">
                    {tab.icon}
                  </span>
                  <span className="whitespace-nowrap relative z-10">
                    {tab.label}
                  </span>
                </motion.button>
              ))}
            </motion.div>
            {/* Loading State */}
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <span className="material-symbols-rounded text-4xl text-blue-500 animate-spin mb-3">
                  progress_activity
                </span>
                <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
              </motion.div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead
                    className={`bg-gradient-to-r from-blue-50 to-blue-100 hidden md:table-header-group`}
                  >
                    <tr>
                      {[
                        {
                          key: "ชื่อผู้ลงทะเบียน",
                          label: "ชื่อผู้ลงทะเบียน",
                          icon: "summarize",
                        },
                        {
                          key: "ที่อยู่",
                          label: "ประเทศ/หน่วยงาน/ที่อยู่",
                          icon: "roofing",
                        },
                        {
                          key: filteredUsers()[0]?.titleAbstarct
                            ? "หัวข้อ/เรทค่าลงทะเบียน"
                            : "กลุ่ม",
                          label: filteredUsers()[0]?.titleAbstarct
                            ? "หัวข้อ/ค่าลงทะเบียน"
                            : "กลุ่ม",
                          icon: filteredUsers()[0]?.titleAbstarct
                            ? "title"
                            : "group",
                        },
                        ...(filteredUsers()[0]?.statusAbstract
                          ? [
                              {
                                key: "สถานะผลงาน",
                                label: "สถานะผลงาน",
                                icon: "priority_high",
                              },
                            ]
                          : []),
                        {
                          key: "สถานะการชำระเงิน",
                          label: "สถานะการชำระเงิน",
                          icon: "priority_high",
                        },
                        {
                          key: "ตรวจเอกสาร",
                          label: "ตรวจเอกสาร",
                          icon: "description",
                        },
                      ].map((header) => (
                        <th
                          key={header.key}
                          className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                        >
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">
                              {header.icon}
                            </span>
                            {header.label}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredUsers().length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-3 py-2 md:px-4 md:py-3 text-center text-sm text-gray-700"
                        >
                          ไม่พบข้อมูล
                        </td>
                      </tr>
                    ) : (
                      filteredUsers().map((user: any, index: number) => (
                        <tr
                          key={index}
                          className="hover:bg-blue-50 transition-colors grid grid-cols-2 md:table-row gap-2 p-3 md:p-0"
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3">
                            <div className="flex items-center space-x-3">
                              <div>
                                <div className="text-[12px] font-medium text-gray-900 flex items-center gap-1">
                                  <span className="material-symbols-rounded text-[10px] mr-1">
                                    account_circle
                                  </span>
                                  {user.fname} {user.lname}
                                </div>
                                <div className="text-[10px] text-gray-500 flex items-center mt-1">
                                  <span className="material-symbols-rounded text-[10px] mr-1">
                                    badge
                                  </span>
                                  ID: {user.participantId || user.abstractId}
                                </div>
                                <div className="text-[10px] text-gray-500 flex items-center mt-1">
                                  <span className="material-symbols-rounded text-[10px] mr-1">
                                    email
                                  </span>
                                  {user.email}
                                </div>
                              </div>
                              <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                                {index + 1}
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 w-72">
                            <div className="flex items-center">
                              <div>
                                {/* ประเทศ */}
                                <div className="text-[12px] text-gray-500 flex items-center mt-1 group relative">
                                  <span className="material-symbols-rounded text-gray-400 text-base mr-1">
                                    language
                                  </span>
                                  <span className="truncate max-w-[180px]">
                                    {user?.country?.length > 20
                                      ? `${user.country.substring(0, 20)}...`
                                      : user?.country || "ไม่ระบุประเทศ"}
                                  </span>
                                  {user?.country?.length > 20 && (
                                    <div className="absolute bottom-full left-0 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap invisible group-hover:visible z-10">
                                      {user.country}
                                    </div>
                                  )}
                                </div>

                                {/* องค์กร */}
                                <div className="text-[12px] text-gray-500 flex items-center mt-1 group relative">
                                  <span className="material-symbols-rounded text-gray-400 text-base mr-1">
                                    home_work
                                  </span>
                                  <span className="truncate max-w-[180px]">
                                    {user?.organization?.length > 20
                                      ? `${user.organization.substring(
                                          0,
                                          20
                                        )}...`
                                      : user?.organization || "ไม่ระบุองค์กร"}
                                  </span>
                                  {user?.organization?.length > 20 && (
                                    <div className="absolute bottom-full left-0 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap invisible group-hover:visible z-10">
                                      {user.organization}
                                    </div>
                                  )}
                                </div>

                                {/* ที่อยู่ */}
                                <div className="text-[12px] text-gray-500 flex items-center mt-1 group relative">
                                  <span className="material-symbols-rounded text-gray-400 text-base mr-1">
                                    home
                                  </span>
                                  <span className="truncate max-w-[180px]">
                                    {`${user?.address || ""} ต.${
                                      user?.subDistrict || ""
                                    } อ.${user?.district || ""}`.trim().length >
                                    15
                                      ? `${`${user.address}  ต.${user.subDistrict} อ.${user.district}`
                                          .trim()
                                          .substring(0, 15)}...`
                                      : `${user?.address || ""} ต.${
                                          user?.subDistrict || ""
                                        } อ.${user?.district || ""}`.trim() ||
                                        "ไม่ระบุที่อยู่"}
                                  </span>
                                  {`${user?.address || ""} ต.${
                                    user?.subDistrict || ""
                                  } อ.${user?.district || ""} จ.${
                                    user?.province || ""
                                  } ${user?.zipCode || ""}`.trim().length >
                                    15 && (
                                    <div className="absolute bottom-full left-0 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-normal w-[250px] break-words invisible group-hover:visible z-10">
                                      {`${user?.address || ""} ต.${
                                        user?.subDistrict || ""
                                      } อ.${user?.district || ""} จ.${
                                        user?.province || ""
                                      } ${user?.zipCode || ""}`.trim()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 w-72">
                            <div className="flex items-center">
                              <div>
                                <div className="text-[12px] text-gray-500 flex items-center mt-1 group relative">
                                  <span className="material-symbols-rounded text-gray-400 text-base mr-1">
                                    group
                                  </span>
                                  <span className="truncate max-w-[180px]">
                                    {user?.packages?.category_en ||
                                    user?.titleAbstarct
                                      ? (
                                          user.packages?.category_en ||
                                          user.titleAbstarct
                                        ).length > 20
                                        ? `${(
                                            user.packages?.category_en ||
                                            user.titleAbstarct
                                          ).substring(0, 20)}...`
                                        : user.packages?.category_en ||
                                          user.titleAbstarct
                                      : "ไม่ระบุข้อมูล"}
                                  </span>
                                  {(
                                    user?.packages?.category_en ||
                                    user?.titleAbstarct
                                  )?.length > 20 && (
                                    <div className="absolute bottom-full left-0 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-normal w-[250px] break-words invisible group-hover:visible z-10">
                                      {user.packages?.category_en ||
                                        user.titleAbstarct}
                                    </div>
                                  )}
                                </div>
                                <div className="text-[12px] text-gray-500 flex items-center mt-1">
                                  <span className="material-symbols-rounded text-gray-400 text-base mr-1">
                                    currency_bitcoin
                                  </span>
                                  {user?.price.toLocaleString("th-TH")} .-
                                </div>
                              </div>
                            </div>
                          </td>
                          {user.statusAbstract && (
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                              <div className="flex items-center">
                                <span className="material-symbols-rounded text-gray-400 text-base mr-1">
                                  {user?.statusAbstract === "Accepted"
                                    ? "check"
                                    : " priority_high"}
                                </span>

                                <span
                                  className={`${
                                    user?.statusAbstract === "Accepted"
                                      ? "text-green-500"
                                      : "text-rose-500"
                                  }`}
                                >
                                  {user?.statusAbstract === "Accepted"
                                    ? "ผ่านการตรวจสอบ"
                                    : "รอตรวจสอบ"}
                                </span>
                              </div>
                            </td>
                          )}

                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                            <div className="flex items-center">
                              <span className="material-symbols-rounded text-gray-400 text-base mr-1">
                                {user.payments ? "check" : " priority_high"}
                              </span>

                              <span
                                className={`${
                                  user?.payments
                                    ? "text-green-500"
                                    : "text-rose-500"
                                }`}
                              >
                                {user?.payments ? "ชำระเงินแล้ว" : "รอตรวจสอบ"}
                              </span>
                            </div>
                          </td>

                          {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                        <div className="flex items-center">
                          <span
                            className={`material-symbols-rounded ${
                              user.statusAbstract === "Pending"
                                ? "text-amber-500"
                                : user.statusAbstract === "Accepted"
                                ? "text-green-500"
                                : "text-rose-500"
                            } text-gray-400 text-base mr-1`}
                          >
                            {user.statusAbstract === "Pending"
                              ? "pending"
                              : user.statusAbstract === "Accepted"
                              ? "check"
                              : "close"}
                          </span>
                          {user.statusAbstract === "Pending" ? (
                            <span className="text-amber-500">Pending</span>
                          ) : user.statusAbstract === "Accepted" ? (
                            <span className="text-green-500">Accepted</span>
                          ) : (
                            <span className="text-rose-500">Rejected</span>
                          )}
                        </div>
                      </td> */}
                          <td className="whitespace-nowrap px-3 py-4">
                            {user.Imagepayment ? (
                              <button
                                onClick={() => {
                                  if (canView && canEdit) {
                                    handleViewFile(user);
                                  }
                                }}
                                className={`group flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                                  canView && canEdit
                                    ? "text-blue-600 bg-gradient-to-b from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/70 hover:text-blue-700 border border-blue-200/60 hover:border-blue-300/80 hover:shadow-md cursor-pointer shadow-inner"
                                    : "text-gray-400/80 bg-gradient-to-b from-gray-50 to-gray-100/50 border border-gray-200/60 cursor-not-allowed"
                                }`}
                                disabled={!canView || !canEdit}
                              >
                                <span
                                  className={`material-symbols-rounded text-base transition-transform duration-300 ${
                                    canView && canEdit
                                      ? "group-hover:scale-110"
                                      : ""
                                  }`}
                                >
                                  {canView && canEdit
                                    ? "description"
                                    : "visibility_off"}
                                </span>
                                <span className="transition-all duration-300">
                                  {canView && canEdit
                                    ? "View File"
                                    : "ไม่ได้รับสิทธิ์"}
                                </span>
                              </button>
                            ) : (
                              <span className="text-gray-400 text-sm">
                                ยังไม่ได้ชำระเงิน
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}
