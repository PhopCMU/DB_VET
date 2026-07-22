"use client";

import { getParticipantList } from "@/app/routers/cmuvc/GetRouter";

import ThaiYearPicker from "@/components/ThaiYearPicker";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ExportMenu from "@/utils/ExportOptions";
import { ApiResponseData } from "@/app/model/cmuvc/paymentModel";
import { ModalEditFileParticipant } from "@/components/(CMUVC)/cmuvc_Modal";

import { useRouter } from "next/navigation";
import PermissionGuard from "@/components/Guards/PermissionGuard";
import { usePermission } from "@/app/context/UsePermission";

const SUB_MENU_ID = "e432a5bf-eda0-4638-848d-26df9194f57e";
const PROJECT_ID = "ee9ce62b-2e02-4682-9ecf-9f9b564ee5e3";

export default function TsarPage() {
  const [selectedYear, setSelectedYear] = useState<Date | null>(new Date());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const [dataParticipant, setDataParticipant] =
    useState<ApiResponseData | null>(null);
  const [activeTab, setActiveTab] = useState<"tsar">("tsar");
  const [onChangeFilePayment, setOnChangeFilePayment] =
    useState<ApiResponseData>();
  const [isModalFileOpen, setIsModalFileOpen] = useState<boolean>(false);
  const hasData = useRef(false);
  const router = useRouter();

  const { canView, canCreate, canEdit, canDelete } = usePermission(
    SUB_MENU_ID,
    PROJECT_ID,
  );

  const fetchThemeTitle = async (date: Date): Promise<void> => {
    setIsLoading(true);
    try {
      const data: any = await getParticipantList(date || new Date(), "tsar");

      if (data !== undefined) {
        setDataParticipant(data.result);
      }

      if (data.success === false && data.message === "Authentication failed") {
        router.replace("/");
      }
    } catch (error) {
      console.error("Failed to fetch theme data");
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
      case "tsar":
        result =
          dataParticipant.search_participant?.filter(
            (p) => p.themeTitleId === "c23040e6-1f3c-41c8-9240-38b74281dd7f",
          ) || [];
        break;

      default:
        result = [];
    }

    // กรองด้วย searchQuery (ถ้ามี)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) =>
        `${item.fname} ${item.lname}`.toLowerCase().includes(query),
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
      <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#fceee2] text-[#f7a45d] ring-1 ring-[#fceee2]">
            <span className="material-symbols-rounded text-2xl">
              assessment
            </span>
          </div>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-900">
              Project Payment Slip Verification
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              จัดการและตรวจสอบหลักฐานการชำระเงินของโครงการ TSAR
            </p>
          </div>
        </motion.div>

        {/* Main Content */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <motion.div
                initial={{ x: -10 }}
                animate={{ x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1"
              >
                <h2 className="flex items-center gap-3 text-lg font-semibold text-slate-800">
                  <span className="material-symbols-rounded rounded-lg bg-[#fceee2] p-2 text-2xl text-[#f7a45d]">
                    groups
                  </span>
                  <span className="flex items-center gap-2">
                    รายชื่อทั้งหมด
                    <span className="rounded-full bg-[#fceee2] px-2.5 py-1 text-xs font-medium text-[#f7a45d] ring-1 ring-[#fceee2]">
                      TSAR{" "}
                      {selectedYear ? selectedYear.getFullYear() + 543 : ""}
                    </span>
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
                    <span className="material-symbols-rounded text-slate-400">
                      search
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อหรือรหัส..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="ค้นหาชื่อหรือรหัส"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white transition-all placeholder-slate-400 text-sm text-slate-700"
                  />
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSearchQuery("")}
                      aria-label="ล้างคำค้นหา"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <span className="material-symbols-rounded text-slate-400 hover:text-slate-600">
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
                    aria-expanded={isOpen}
                    className={`${
                      canView && canCreate && canEdit
                        ? "flex items-center bg-[#f7a45d] text-white hover:bg-[#f29240]"
                        : "flex items-center bg-slate-200 text-slate-500 hover:bg-slate-300"
                    } gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors w-full sm:w-auto justify-center`}
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
                        className="absolute right-0 z-40 mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-slate-100 overflow-hidden"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              {/* Card 1 - สำเร็จ */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-4 rounded-2xl border border-[#fceee2] bg-[#fceee2]/60 p-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-[#fceee2]">
                  <span className="material-symbols-outlined text-2xl text-[#f7a45d]">
                    check_circle
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-medium tracking-wide text-[#f7a45d]/80">
                    สำเร็จ
                  </h3>
                  <p className="text-2xl font-bold text-[#d97e38]">
                    {
                      filteredUsers().filter((user) => user.payments === true)
                        .length
                    }
                  </p>
                  <p className="text-xs text-[#f7a45d]/70">
                    การชำระเงินเสร็จสมบูรณ์
                  </p>
                </div>
              </motion.div>

              {/* Card 2 - รอตรวจสอบ */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="flex items-center gap-4 rounded-2xl border border-[#fceee2] bg-[#fceee2]/60 p-5"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-[#fceee2]">
                  <span className="material-symbols-outlined text-2xl text-[#f7a45d]">
                    pending
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-medium tracking-wide text-[#f7a45d]/80">
                    รอตรวจสอบ
                  </h3>
                  <p className="text-2xl font-bold text-[#d97e38]">
                    {
                      filteredUsers().filter((user) => user.payments === false)
                        .length
                    }
                  </p>
                  <p className="text-xs text-[#f7a45d]/70">
                    รอการยืนยันการชำระเงิน
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Info Box */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-4 flex items-start gap-2 rounded-xl border-l-4 border-[#f7a45d] bg-[#fceee2] p-4">
                <span className="material-symbols-outlined mt-0.5 text-[#f7a45d]">
                  info
                </span>
                <div>
                  <h3 className="text-sm font-medium text-[#d97e38]">
                    คำแนะนำการใช้งาน
                  </h3>
                  <p className="mt-1 text-sm text-[#f7a45d]/80">
                    เลือกกลุ่มที่ต้องการ
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-1 gap-3 my-4 md:my-6"
            >
              {[{ id: "tsar", label: "TSAR", icon: "event_upcoming" }].map(
                (tab: any) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium border transition-colors ${
                      activeTab === tab.id
                        ? "border-[#f7a45d] bg-[#f7a45d] text-white shadow-sm "
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {tab.icon}
                    </span>
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </button>
                ),
              )}
            </motion.div>
            {/* Loading State */}
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                role="status"
                aria-live="polite"
                className="flex flex-col items-center justify-center py-12"
              >
                <span className="material-symbols-rounded text-4xl text-[#f7a45d] animate-spin mb-3">
                  progress_activity
                </span>
                <p className="text-slate-500 text-sm">กำลังโหลดข้อมูล...</p>
              </motion.div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className={`bg-slate-50 hidden md:table-header-group`}>
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
                          className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider"
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
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {filteredUsers().length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-3 py-2 md:px-4 md:py-3 text-center text-sm text-slate-500"
                        >
                          ไม่พบข้อมูล
                        </td>
                      </tr>
                    ) : (
                      filteredUsers().map((user: any, index: number) => (
                        <tr
                          key={index}
                          className="hover:bg-emerald-50/60 transition-colors grid grid-cols-2 md:table-row gap-2 p-3 md:p-0"
                        >
                          <td className="whitespace-nowrap py-4 pl-4 pr-3">
                            <div className="flex items-center space-x-3">
                              <div>
                                <div className="text-[12px] font-medium text-slate-800 flex items-center gap-1">
                                  <span className="material-symbols-rounded text-[10px] mr-1">
                                    account_circle
                                  </span>
                                  {user.fname} {user.lname}
                                </div>
                                <div className="text-[10px] text-slate-500 flex items-center mt-1">
                                  <span className="material-symbols-rounded text-[10px] mr-1">
                                    badge
                                  </span>
                                  ID: {user.participantId || user.abstractId}
                                </div>
                                <div className="text-[10px] text-slate-500 flex items-center mt-1">
                                  <span className="material-symbols-rounded text-[10px] mr-1">
                                    email
                                  </span>
                                  {user.email}
                                </div>
                              </div>
                              <div className="h-8 w-8 bg-[#fceee2] rounded-full flex items-center justify-center text-[#f7a45d] font-medium text-sm ring-1 ring-[#fceee2]">
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
                                          20,
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
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                                  user?.statusAbstract === "Accepted"
                                    ? "bg-[#fceee2] text-[#f7a45d] ring-1 ring-[#fceee2]"
                                    : "bg-rose-50 text-rose-600 ring-1 ring-rose-100"
                                }`}
                              >
                                <span className="material-symbols-rounded text-sm">
                                  {user?.statusAbstract === "Accepted"
                                    ? "check"
                                    : "priority_high"}
                                </span>
                                {user?.statusAbstract === "Accepted"
                                  ? "ผ่านการตรวจสอบ"
                                  : "รอตรวจสอบ"}
                              </span>
                            </td>
                          )}

                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                                user?.payments
                                  ? "bg-[#fceee2] text-[#f7a45d] ring-1 ring-[#fceee2]"
                                  : "bg-rose-50 text-rose-600 ring-1 ring-rose-100"
                              }`}
                            >
                              <span className="material-symbols-rounded text-sm">
                                {user.payments ? "check" : "priority_high"}
                              </span>
                              {user?.payments ? "ชำระเงินแล้ว" : "รอตรวจสอบ"}
                            </span>
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
                                className={`group flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                  canView && canEdit
                                    ? "text-[#f7a45d] bg-[#fceee2] hover:bg-[#fadcc7] border border-[#fceee2] hover:border-[#f7a45d] cursor-pointer"
                                    : "text-slate-400 bg-slate-50 border border-slate-200 cursor-not-allowed"
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
                                <span>
                                  {canView && canEdit
                                    ? "View File"
                                    : "ไม่ได้รับสิทธิ์"}
                                </span>
                              </button>
                            ) : (
                              <span className="text-slate-400 text-sm">
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
