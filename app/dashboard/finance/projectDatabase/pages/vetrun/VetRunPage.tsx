"use client";

import { ParticipantData } from "@/app/model/cmuvc/paymentModel";
import { Animal } from "@/app/model/vetrun/animalModel";
import { Employees } from "@/app/model/vetrun/employees";
import { GetParticipant_Vetrun } from "@/app/routers/vetrun/GetRouter";
import {
  AnimalDetailModal,
  EmployeeDetailModal,
} from "@/components/EmployeeDetail";
import PieChartComponent from "@/components/PieChart";
import ThaiYearPicker from "@/components/ThaiYearPicker";
import ExportMenu from "@/utils/ExportOptions";
import { useVisitor } from "@/lib/fingerprintjs-shim";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Page() {
  const router = useRouter();
  const [selectedYear, setSelectedYear] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpenEmployee, setModalOpenEmployee] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const hasData = useRef(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employees | null>(
    null,
  );
  const [dataParticipant, setDataParticipant] = useState<
    ParticipantData[] | null
  >(null);

  const { data } = useVisitor({ extendedResult: true });
  const [activeTab, setActiveTab] = useState<
    "All" | "VIP" | "FUNRUN" | "FANCY" | "MARATHON" | "FUNRUN_WITH_DOG"
  >(() => {
    const savedTab = localStorage.getItem("activeParticipantTab");
    return (
      (savedTab as
        | "All"
        | "VIP"
        | "FUNRUN"
        | "FUNRUN_WITH_DOG"
        | "FANCY"
        | "MARATHON") || "All"
    );
  });
  const visitorId = data?.visitorId ?? "";
  // บันทึกค่า activeTab ลง localStorage เมื่อเปลี่ยน
  useEffect(() => {
    localStorage.setItem("activeParticipantTab", activeTab);
  }, [activeTab]);
  // useEffect สำหรับ initial load
  useEffect(() => {
    if (!visitorId) return;

    if (!hasData.current) {
      fetchThemeTitle(new Date());
      hasData.current = true;
    }
  }, [visitorId]);

  // useEffect สำหรับกรณีที่ isUpdated เปลี่ยน
  useEffect(() => {
    if (isUpdated && hasData.current && visitorId) {
      fetchThemeTitle(new Date());
      setIsUpdated(false);
    }
  }, [isUpdated, visitorId]);

  const fetchThemeTitle = async (date: Date): Promise<void> => {
    setIsLoading(true);
    try {
      const response: any = await GetParticipant_Vetrun(date || new Date());
      if (response.success) {
        setDataParticipant(response.data);
      }
    } catch (error) {
      setDataParticipant(null);
      console.error("Failed to fetch theme data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handerChangeYear = async (date: Date) => {
    setSelectedYear(date);
    await fetchThemeTitle(date || new Date());
  };

  const filteredUsers = () => {
    // ถ้ายังไม่มี dataParticipant → ยังไม่ render ได้
    if (!dataParticipant) return [];

    let result: any[] = [];

    switch (activeTab) {
      case "VIP":
        result = dataParticipant.filter((item: any) =>
          item.nameBib.startsWith("VIP"),
        );
        break;

      case "FUNRUN":
        result = dataParticipant.filter(
          (item: any) =>
            (item.nameBib.startsWith("FRW") && !item.nameBib.includes("D")) ||
            (item.nameBib.startsWith("FRM") && !item.nameBib.includes("D")),
        );
        break;

      case "FUNRUN_WITH_DOG":
        result = dataParticipant.filter(
          (item: any) =>
            item.nameBib.startsWith("FRWD") || item.nameBib.startsWith("FRMD"),
        );
        break;

      case "FANCY":
        result = dataParticipant.filter((item: any) =>
          item.nameBib.startsWith("FANCY"),
        );
        break;

      case "MARATHON":
        result = dataParticipant.filter((item: any) =>
          [
            "W19",
            "W20",
            "W30",
            "W40",
            "W50",
            "M19",
            "M20",
            "M30",
            "M40",
            "M50",
          ].some((prefix) => item.nameBib.startsWith(prefix)),
        );
        break;

      default:
        result = dataParticipant;
    }

    // Search filter (ใช้ได้กับทุก tab)
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          `${item.firstName} ${item.lastName}`.toLowerCase().includes(query) ||
          item.nameBib?.toLowerCase().includes(query) ||
          item.numberBib?.toLowerCase().includes(query),
      );
    }

    return result;
  };

  const handleAnimalClick = (animal: Animal) => {
    setSelectedAnimal(animal);
    setModalOpen(true);
  };

  const handleViewFile = (employee: Employees) => {
    setSelectedEmployee(employee);
    setModalOpenEmployee(true);
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-50 min-h-screen">
      {/* Header with Guidance */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          y: -5,
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        }}
        transition={{
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-sm border border-gray-200/80 hover:shadow-lg hover:border-blue-200/70 hover:bg-blue-50/30 group backdrop-blur-sm"
      >
        <div className="flex items-start gap-5">
          <motion.div
            className="p-3.5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-blue-600 group-hover:from-blue-100 group-hover:to-blue-200 shadow-inner"
            whileHover={{
              scale: 1.08,
              rotate: 2,
              boxShadow: "0 0 15px rgba(59, 130, 246, 0.3)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span className="material-symbols-rounded text-3xl">
              assessment
            </span>
          </motion.div>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h1 className="text-2xl font-bold text-gray-800 group-hover:text-blue-700 transition-color flex items-center gap-3">
                <span>Project Payment Slip Verification</span>
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: 0.3,
                    type: "spring",
                    stiffness: 500,
                  }}
                  className="text-xs font-semibold px-2.5 py-1 bg-blue-100/70 text-blue-800 rounded-full border border-blue-200/50 whitespace-nowrap"
                >
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </motion.span>
              </h1>

              <motion.div
                onClick={() =>
                  router.push(
                    "/dashboard/finance/projectDatabase/pages/vetrun/Sale_Shirt",
                  )
                }
                whileHover={{ scale: 1.03 }}
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-blue-600 bg-blue-50/50 px-3 py-1.5 rounded-full border border-blue-200 cursor-pointer"
              >
                <span className="material-symbols-rounded">arrow_forward</span>
                ดูข้อมูลสั่งซื้อเสื้อ
              </motion.div>
            </div>

            <p className="text-sm text-gray-600 mb-1 leading-relaxed">
              Manage and verify payment proof submissions for VETRUN 2025.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs font-medium px-2 py-1 bg-green-100/50 text-green-800 rounded-full border border-green-200">
                Active
              </span>
              <span className="text-xs font-medium px-2 py-1 bg-purple-100/50 text-purple-800 rounded-full border border-purple-200">
                Priority
              </span>
            </div>
          </div>
        </div>

        <motion.div
          className="sm:hidden mt-4 w-full flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button className="text-xs font-medium text-blue-600 bg-blue-50/70 px-3 py-1.5 rounded-full border border-blue-200 flex items-center gap-1">
            View Details
            <span className="material-symbols-rounded text-sm">
              arrow_forward
            </span>
          </button>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shado"
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
                    VETRUN{" "}
                    {selectedYear ? selectedYear.getFullYear() + 543 : ""}
                  </motion.span>
                </span>
              </h2>
            </motion.div>
          </div>

          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full"
          >
            <div className="grid grid-cols-1 gap-6 mb-8">
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
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-200 rounded-full opacity-10 group-hover:opacity-20"></div>
                  <div className="absolute -left-5 -bottom-5 w-20 h-20 bg-emerald-300 rounded-full opacity-5 group-hover:opacity-15"></div>
                </div>

                <div className="flex items-start gap-5 relative">
                  <div className="p-3 bg-white rounded-xl shadow-md border border-emerald-100 group-hover:shadow-lg ">
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
                        filteredUsers().filter((user) => user.payment === true)
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
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-200 rounded-full opacity-10 group-hover:opacity-20"></div>
                  <div className="absolute -left-5 -bottom-5 w-20 h-20 bg-amber-300 rounded-full opacity-5 group-hover:opacity-15"></div>
                </div>

                <div className="flex items-start gap-5 relative">
                  <div className="p-3 bg-white rounded-xl shadow-md border border-amber-100 group-hover:shadow-lg ">
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
                        filteredUsers().filter((user) => user.payment === false)
                          .length
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
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-200 rounded-full opacity-10 group-hover:opacity-20"></div>
                  <div className="absolute -left-5 -bottom-5 w-20 h-20 bg-blue-300 rounded-full opacity-5 group-hover:opacity-15"></div>
                </div>

                <div className="relative">
                  <div className="flex items-center gap-5 mb-4">
                    <div className="p-3 bg-white rounded-xl shadow-md border border-blue-100 group-hover:shadow-lg ">
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
                  <div className="h-40 flex items-center justify-center">
                    <PieChartComponent
                      data={
                        [
                          {
                            name: "สำเร็จ",
                            value: filteredUsers().filter(
                              (user) => user.payment === true,
                            ).length,
                            color: "#059669", // emerald-600
                          },
                          {
                            name: "รอตรวจสอบ",
                            value: filteredUsers().filter(
                              (user) => user.payment === false,
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
            <div className="grid grid-cols-1 gap-6 mb-2">
              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-6"
              >
                <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 p-5 rounded-xl border border-blue-200 shadow-sm relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-200 rounded-full opacity-10"></div>
                  <div className="absolute -left-3 -bottom-3 w-16 h-16 bg-blue-300 rounded-full opacity-5"></div>

                  <div className="flex items-start gap-4 relative">
                    {/* Icon with subtle background */}
                    <div className="p-2 bg-white rounded-lg shadow-inner border border-blue-100">
                      <span className="material-symbols-outlined text-blue-600 text-xl">
                        info
                      </span>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-blue-800 mb-2">
                        คำแนะนำการใช้งาน
                      </h3>

                      {/* Usage tips with bullet points */}
                      <ul className="space-y-2 text-sm text-blue-700/90">
                        <li className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-blue-500 text-sm mt-0.5">
                            arrow_right
                          </span>
                          <span>เลือกกลุ่มที่ต้องการจากเมนูด้านบน</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-blue-500 text-sm mt-0.5">
                            arrow_right
                          </span>
                          <span>ระบบจะแสดงข้อมูลเฉพาะกลุ่มที่เลือก</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="material-symbols-outlined text-blue-500 text-sm mt-0.5">
                            arrow_right
                          </span>
                          <span>สามารถสลับระหว่างกลุ่มได้ตลอดเวลา</span>
                        </li>
                      </ul>

                      {/* Additional help section */}
                      <div className="mt-4 p-3 bg-blue-100/50 rounded-lg border border-blue-200/50">
                        <p className="text-xs text-blue-700/80 flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">
                            help
                          </span>
                          <span>
                            ต้องการความช่วยเหลือ? ติดต่อเจ้าหน้าที่ที่หมายเลข
                            02-XXX-XXXX
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              {/* Gradient Tabs */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-3 my-4 md:my-6"
              >
                {[
                  {
                    id: "All",
                    label: "All",
                    icon: "all_inbox",
                    activeGradient: "from-teal-600 to-teal-400",
                  },
                  {
                    id: "VIP",
                    label: "VIP",
                    icon: "diamond",
                    activeGradient: "from-purple-600 to-purple-400",
                  },
                  {
                    id: "FUNRUN",
                    label: "FUN RUN",
                    sublabel: "ไม่มีสุนัข",
                    icon: "directions_run",
                    activeGradient: "from-blue-600 to-blue-400",
                  },
                  {
                    id: "FUNRUN_WITH_DOG",
                    label: "FUN RUN",
                    sublabel: "มีสุนัข",
                    icon: "pets",
                    activeGradient: "from-green-600 to-green-400",
                  },
                  {
                    id: "FANCY",
                    label: "FANCY",
                    icon: "emoji_events",
                    activeGradient: "from-pink-600 to-pink-400",
                  },
                  {
                    id: "MARATHON",
                    label: "MINI MARATHON",
                    icon: "timer",
                    activeGradient: "from-orange-600 to-orange-400",
                  },
                ].map((tab: any) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{
                      y: -3,
                      scale: 1.03,
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-3 md:px-4 md:py-3 
        rounded-lg md:rounded-xl
        flex flex-col items-center justify-center 
       
        text-xs md:text-sm font-medium
        border border-gray-200
        relative overflow-hidden
        group
        ${
          activeTab === tab.id
            ? "text-white shadow-md"
            : "bg-white text-gray-700 hover:bg-gray-50"
        }
      `}
                  >
                    {/* Active Tab Gradient Background */}
                    {activeTab === tab.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`absolute inset-0 bg-gradient-to-br ${tab.activeGradient}`}
                      />
                    )}

                    {/* Hover Effect (Inactive Tabs) */}
                    {activeTab !== tab.id && (
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacit" />
                    )}

                    <span
                      className={`material-symbols-outlined text-xl md:text-2xl mb-1 relative ${
                        activeTab === tab.id ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {tab.icon}
                    </span>

                    <div className="flex flex-col items-center relative">
                      <span className="font-medium whitespace-nowrap">
                        {tab.label}
                      </span>
                      {tab.sublabel && (
                        <span className="text-[10px] md:text-xs opacity-80 mt-0.5">
                          {tab.sublabel}
                        </span>
                      )}
                    </div>

                    {/* Active Indicator */}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-white/50"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Controls Section */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch gap-4 mb-6">
            {/* Left Section - Year Picker and Search */}
            <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
              {/* Year Picker */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                className="relative w-full md:w-48 lg:w-56"
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-500">
                  <span className="material-symbols-outlined text-xl">
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
                className="relative w-full md:flex-1 lg:w-64 xl:w-72 ml-10 "
              >
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-500">
                  <span className="material-symbols-outlined text-xl">
                    search
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อหรือรหัส..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-400 text-gray-700 hover:border-blue-300"
                />
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <span className="material-symbols-outlined text-gray-400 hover:text-red-500 transition-colors">
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
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
                }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md w-full lg:w-auto"
              >
                <span className="material-symbols-outlined text-xl">
                  download
                </span>
                <span className="font-medium whitespace-nowrap">
                  ส่งออกข้อมูล
                </span>
              </motion.button>

              {/* Export Dropdown */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: "spring", damping: 25, stiffness: 400 }}
                    className="absolute right-0 z-40 mt-2 w-full sm:w-56 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-gray-200/50 overflow-hidden backdrop-blur-sm"
                  >
                    <div className="py-1 bg-white/80">
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
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
              <table className="min-w-full divide-y divide-gray-200/70">
                <thead
                  className={`bg-gradient-to-r from-blue-600 to-indigo-600 hidden md:table-header-group`}
                >
                  <tr>
                    {[
                      {
                        key: "participantName",
                        label: "ชื่อผู้ลงทะเบียน",
                        icon: "badge",
                      },
                      {
                        key: "datas",
                        label: "ข้อมูลการลงทะเบียน",
                        icon: "description",
                      },
                      {
                        key: "address",
                        label: "ข้อมูลติดต่อ",
                        icon: "contact_page",
                      },
                      {
                        key: "status",
                        label: "สถานะการชำระเงิน",
                        icon: "payments",
                      },
                      {
                        key: "viewDetail",
                        label: "จัดการ",
                        icon: "settings",
                      },
                    ].map((header) => (
                      <th
                        key={header.key}
                        className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">
                            {header.icon}
                          </span>
                          {header.label}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 bg-white">
                  {filteredUsers().length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-sm text-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-gray-400 text-3xl">
                            search_off
                          </span>
                          <span>ไม่พบข้อมูลผู้ลงทะเบียน</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers().map((employee: any, index: number) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50/50 transition-color grid grid-cols-2 md:table-row gap-3 p-4 md:p-0"
                      >
                        {/* Participant Name */}
                        <td className="whitespace-nowrap py-4 pl-4 pr-3">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`${
                                employee.sex === "M"
                                  ? "bg-blue-100/80 text-blue-600"
                                  : "bg-pink-100/80 text-pink-600"
                              } flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center font-medium text-sm`}
                            >
                              <span className="material-symbols-outlined">
                                {employee.sex === "M" ? "male" : "female"}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                <span className="material-symbols-outlined text-base opacity-70">
                                  person
                                </span>
                                {employee.firstName} {employee.lastName}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center mt-1.5">
                                <span className="material-symbols-outlined text-xs mr-1.5 opacity-70">
                                  fingerprint
                                </span>
                                ID: {employee.participantId}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center mt-1.5">
                                <span className="material-symbols-outlined text-xs mr-1.5 opacity-70">
                                  mail
                                </span>
                                {employee.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Data */}
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="space-y-2">
                            <div className="text-xs text-gray-700 flex items-center">
                              <span className="material-symbols-outlined text-base mr-2 text-amber-500">
                                confirmation_number
                              </span>
                              {employee.nameBib}
                              {employee.numberBib}
                            </div>
                            {employee?.typeBib === "VIP" &&
                              employee?.nameBib !== "FANCY-" && (
                                <div className="text-xs text-gray-700 flex items-center">
                                  <span className="material-symbols-outlined text-base mr-2 text-blue-500">
                                    directions_run
                                  </span>
                                  {employee.age ? "MINI MARATHON" : "FUN RUN"}
                                </div>
                              )}

                            {employee?.typeBib === "VIP" &&
                              employee?.nameBib === "FANCY-" && (
                                <div className="text-xs text-gray-700 flex items-center">
                                  <span className="material-symbols-outlined text-base mr-2 text-purple-500">
                                    star
                                  </span>
                                  VIP
                                </div>
                              )}

                            {employee.Animal.length > 0 &&
                              employee.Animal.map((animal: any) => (
                                <button
                                  type="button"
                                  onClick={() => handleAnimalClick(animal)}
                                  key={animal.animalId}
                                  className="text-xs text-gray-700 flex items-center hover:text-amber-600 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-base mr-2 text-green-500">
                                    pets
                                  </span>
                                  {animal.name}
                                </button>
                              ))}

                            {employee.Items_vip.length > 0 &&
                              employee.Items_vip?.map(
                                (s2: any, index: number) =>
                                  s2.items === "trophy" ? (
                                    <div
                                      key={index}
                                      className="flex gap-2 items-center text-[12px] text-gray-500"
                                    >
                                      <span className="material-symbols-outlined ">
                                        rewarded_ads
                                      </span>
                                      ถ้วยรางวัล
                                    </div>
                                  ) : (
                                    <div
                                      key={index}
                                      className="flex gap-2 items-center text-[12px] text-gray-500"
                                    >
                                      <span className="material-symbols-outlined ">
                                        apparel
                                      </span>
                                      <span>
                                        {s2?.model_shirt === "Shirt4KM"
                                          ? "4 KM"
                                          : "11 KM"}
                                      </span>
                                      <span className="material-symbols-outlined text-base  text-gray-500">
                                        checkroom
                                      </span>
                                      {`${s2?.size_sh?.size || "ไม่ระบุ"} ${
                                        s2?.size_sh?.s_width || ""
                                      } ${s2?.size_sh?.s_high || ""}`}
                                    </div>
                                  ),
                              )}

                            <AnimalDetailModal
                              animal={selectedAnimal}
                              isOpen={modalOpen}
                              onClose={() => setModalOpen(false)}
                            />
                          </div>
                        </td>

                        {/* Address/Contact */}
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="space-y-2">
                            <div className="text-xs text-gray-700 flex items-start group relative">
                              <span className="material-symbols-outlined text-base mr-2 text-gray-500">
                                home
                              </span>
                              <span className="truncate max-w-[160px]">
                                {employee?.address || "ไม่ระบุที่อยู่"}
                              </span>
                              {employee?.address?.length > 25 && (
                                <div className="absolute left-0 bottom-full mb-2 bg-gray-800 text-white text-xs rounded px-3 py-1.5 whitespace-normal w-64 shadow-lg invisible group-hover:visible z-10">
                                  {employee.address}
                                </div>
                              )}
                            </div>

                            <div className="text-xs text-gray-700 flex items-center">
                              <span className="material-symbols-outlined text-base mr-2 text-gray-500">
                                phone
                              </span>
                              {employee?.phone || "ไม่ระบุเบอร์โทร"}
                            </div>

                            <div className="text-xs text-gray-700 flex items-center">
                              <span className="material-symbols-outlined text-base mr-2 text-gray-500">
                                checkroom
                              </span>
                              {`ไซส์เสื้อ: ${
                                employee?.size_sh?.size || "ไม่ระบุ"
                              } ${employee?.size_sh?.s_width || ""} ${
                                employee?.size_sh?.s_high || ""
                              }`}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <span
                                className={`material-symbols-outlined text-base mr-2 ${
                                  employee?.payment
                                    ? "text-green-500"
                                    : "text-yellow-500"
                                }`}
                              >
                                {employee?.payment ? "check_circle" : "pending"}
                              </span>
                              <span
                                className={`text-xs font-medium ${
                                  employee?.payment
                                    ? "text-green-600"
                                    : "text-yellow-600"
                                }`}
                              >
                                {employee?.payment
                                  ? "ชำระเงินแล้ว"
                                  : "รอการตรวจสอบ"}
                              </span>
                            </div>
                            <div className="text-xs text-gray-700 flex items-center">
                              <span className="material-symbols-outlined text-base mr-2 text-gray-500">
                                attach_money
                              </span>
                              {employee?.typeBib === "VIP" ? "1,500" : "500"}{" "}
                              บาท
                            </div>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => handleViewFile(employee)}
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                            >
                              <span className="material-symbols-outlined text-base mr-1">
                                visibility
                              </span>
                              ดูเอกสาร
                            </button>
                            {/* <button className="text-xs text-gray-600 hover:text-gray-800 flex items-center transition-colors">
                              <span className="material-symbols-outlined text-base mr-1">
                                edit
                              </span>
                              แก้ไข
                            </button> */}
                          </div>

                          <EmployeeDetailModal
                            employee={selectedEmployee}
                            isOpen={modalOpenEmployee}
                            onClose={() => setModalOpenEmployee(false)}
                            onSuccess={() => {
                              setIsUpdated(true);
                            }}
                          />
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
  );
}
