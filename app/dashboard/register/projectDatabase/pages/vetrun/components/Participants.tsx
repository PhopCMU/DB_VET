"use client";
import { usePermission } from "@/app/context/UsePermission";
import { useUser } from "@/app/context/UserContext";
import { useToast } from "@/app/hooks/useToast";
import { ParticipantData } from "@/app/model/cmuvc/paymentModel";
import { Animal } from "@/app/model/vetrun/animalModel";
import { Employees } from "@/app/model/vetrun/employees";
import { DeleteVetrunParticipant } from "@/app/routers/vetrun/DeleteRouter";
import { GetParticipant_Vetrun } from "@/app/routers/vetrun/GetRouter";
import { Post_UpdateCheckPoint } from "@/app/routers/vetrun/PostRouter";
import { AlertConfirm } from "@/components/AlertMessage";
import {
  AnimalDetailModal,
  AnimalEditModal,
  EmployeeEditModal,
} from "@/components/EmployeeDetail";
import Loading from "@/components/Loadings/Loading";
// import { LoadingModal } from "@/components/Modal";
import ThaiYearPicker from "@/components/ThaiYearPicker";
import ToastNotification from "@/components/Tooltips/ToastNotification";
import ExportMenu from "@/utils/ExportOptions";
import { useVisitor } from "@/lib/fingerprintjs-shim";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const SUB_MENU_ID = "9b940740-d1e9-4a41-af0d-4e1faa90464d";
const PRODUCT_ID = "d3a154e2-9e0a-48e6-b69b-63f3c7c9f406";

export default function VetRunPage() {
  const [selectedYear, setSelectedYear] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isModalOpenEdit, setIsModalOpenEdit] = useState<boolean>(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Employees | null>(null);
  const [isModalOpenEditParticipant, setIsModalOpenEditParticipant] =
    useState<boolean>(false);
  const [removeParticpant, setRemoveParticpant] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean | null>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const hasData = useRef(false);

  const { loading } = useUser();
  const [dataParticipant, setDataParticipant] = useState<
    ParticipantData[] | null
  >(null);
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

  const { data } = useVisitor();
  const { toast, showToast, hideToast } = useToast();
  const { canView, canEdit, canDelete } = usePermission(
    SUB_MENU_ID,
    PRODUCT_ID,
  );

  const visitorId = data ? data?.visitorId : null;

  // บันทึกค่า activeTab ลง localStorage เมื่อเปลี่ยน
  useEffect(() => {
    localStorage.setItem("activeParticipantTab", activeTab);
  }, [activeTab]);
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

  if (loading) return <Loading />;

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
    let result: any[] = [];

    if (!dataParticipant) return [];

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
        result = dataParticipant.filter((item: any) =>
          item.Animal?.some((a: any) => a.fancys === false),
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

    // Search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          `${item.firstName} ${item.lastName}`.toLowerCase().includes(query) ||
          item.nameBib.toLowerCase().includes(query) ||
          item.numberBib.toLowerCase().includes(query) ||
          item.phone.toLowerCase().includes(query) ||
          item.email.toLowerCase().includes(query),
      );
    }

    return result;
  };

  const handleAnimalClick = (animal: Animal) => {
    if (canView) {
      setSelectedAnimal(animal);
      setModalOpen(true);
    }
  };

  const handleRemoveParticipant = async (participant: any) => {
    const animalId = participant.Animal?.[0]?.animalId;
    const payload = {
      participantId: participant.participantId,
      transferFile: participant.transferFile,
      ...(animalId && { animalId }),
    };

    if (!payload.participantId)
      return showToast("ไม่มีค่าไอดีของผู้เข้าร่วม", "warning");
    if (!payload.transferFile) return showToast("ไม่มีชื่อไฟล์เดิม", "warning");

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const response = await DeleteVetrunParticipant(
        payload,
        visitorId,
        setUploadProgress,
      );

      if (response.success) {
        setTimeout(async () => {
          setIsLoading(false);
          await fetchThemeTitle(new Date());
          showToast("Remove successful.", "success");
        }, 1000);
      }
    } catch (e) {
      showToast("เกิดข้อผิดพลาด", "error");
    }
  };

  const handleOpenModalEdit = (animal: Animal) => {
    if (!canEdit) return;
    setSelectedAnimal(animal);
    setIsModalOpenEdit(true);
  };

  const handleOpenModelEditParticipant = (participant: any) => {
    if (!canEdit) return;
    setSelectedParticipant(participant);
    setIsModalOpenEditParticipant(true);
  };

  const handleCheckPoint = async (
    checkPoint: boolean,
    participantId: string,
  ) => {
    if (!visitorId) return showToast("ไม่มีข้อมูล ID ประจำ Browser", "warning");

    const payload = {
      checkPoint,
      participantId,
    };

    try {
      const response: any = await Post_UpdateCheckPoint(payload, visitorId);

      if (!response.success) return showToast(response.data.message, "warning");
      if (response.change) {
        showToast("Checkpoint success", "success");
        await fetchThemeTitle(new Date());
      } else {
        showToast("Close checkpoint", "success");
        await fetchThemeTitle(new Date());
      }
    } catch (error: any) {
      showToast("เกิดข้อผิดพลาด", "error");
    }
  };

  return (
    <div className="p-2 md:p-3 bg-gradient-to-br from-gray-50 to-gray-50 min-h-screen">
      {/* Confirm Delete */}
      {confirmDelete && (
        <AlertConfirm
          message="คุณแน่ใจหรือไม่ว่าต้องการลบ?"
          variant="warning"
          onClose={() => setConfirmDelete(null)}
          onConfirm={() => handleRemoveParticipant(removeParticpant)}
        />
      )}

      {/* loading */}
      {/* <LoadingModal isOpen={isLoading} progress={uploadProgress} /> */}

      {/* ToastNotification */}
      <ToastNotification
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      {/* Modal Alert Animal */}
      <AnimalDetailModal
        animal={selectedAnimal}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      {/* Modal Edit Animal */}
      <AnimalEditModal
        fromAnimal={selectedAnimal}
        isOpen={isModalOpenEdit}
        title="แก้ไขข้อมูลสัตว์เลี้ยง"
        visitorId={visitorId}
        onClose={() => setIsModalOpenEdit(false)}
        onUpdate={(updatedAnimal) => {
          if (!updatedAnimal) return;
          showToast("อัปเดตข้อมูลสำเร็จ", "success");
          setSelectedAnimal(updatedAnimal);
          setIsModalOpenEdit(false);
          setIsUpdated(true);
        }}
      />

      {/* Modal Edit Participant */}
      <EmployeeEditModal
        formEmployee={selectedParticipant}
        isOpen={isModalOpenEditParticipant}
        title="แก้ไขข้อมูลนักวิ่ง"
        visitorId={visitorId}
        onClose={() => setIsModalOpenEditParticipant(false)}
        onUpdate={(updatedParticipant) => {
          if (!updatedParticipant) return;
          showToast("อัปเดตข้อมูลสำเร็จ", "success");
          setIsModalOpenEditParticipant(false);
          setIsUpdated(true);
        }}
      />

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
                whileHover={{ scale: 1.03 }}
                className="hidden sm:flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50/50 px-3 py-1.5 rounded-full border border-blue-200 cursor-pointer"
              >
                <span className="material-symbols-rounded text-sm">
                  arrow_forward
                </span>
                View Details
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
            className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8 w-full"
          >
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
                    จำนวน
                  </h3>
                  <p className="mt-2 text-4xl font-bold text-emerald-900">
                    {filteredUsers().filter((user) => user).length}
                  </p>
                  <p className="mt-1 text-xs text-emerald-600/80">
                    ผู้สมัครเข้าร่วมงาน
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Gradient Tabs */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-6 gap-2 md:gap-3"
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
                onClick={() => canView && canEdit && setIsOpen(!isOpen)}
                whileHover={{
                  y: -2,
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.25)",
                }}
                whileTap={{ scale: 0.98 }}
                className={`${
                  canView && canEdit
                    ? "flex items-center justify-center gap-2 px-5 py-2.5 shadow-md w-full lg:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700"
                    : "flex items-center justify-center gap-2 px-5 py-2.5 shadow-md w-full lg:w-auto bg-gray-400 text-white cursor-not-allowed"
                }`}
              >
                <span className="material-symbols-outlined text-xl">
                  {canView && canEdit ? "download" : "file_download_off"}
                </span>
                <span className="font-medium whitespace-nowrap">
                  {canView && canEdit ? "ส่งออกข้อมูล" : "ไม่ได้รับสิทธิ์"}
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
                        key: "setting",
                        label: "การจัดการ",
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
                            <div className="flex flex-col gap-3 items-center">
                              {/* Gender Icon - Clickable */}
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  // ใช้ !! เพื่อแปลงค่าให้เป็น boolean แน่นอน
                                  const currentCheckPoint =
                                    !!employee?.CheckPoint?.checkPoint;
                                  handleCheckPoint(
                                    !currentCheckPoint,
                                    employee.participantId,
                                  );
                                }}
                                className={`${
                                  employee.sex === "M"
                                    ? employee?.CheckPoint?.checkPoint
                                      ? "bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-200"
                                      : "bg-blue-100 text-blue-600 border-2 border-blue-300 hover:bg-blue-200"
                                    : employee?.CheckPoint?.checkPoint
                                      ? "bg-gradient-to-br from-pink-500 to-pink-700 text-white shadow-lg shadow-pink-200"
                                      : "bg-pink-100 text-pink-600 border-2 border-pink-300 hover:bg-pink-200"
                                } flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center font-medium cursor-pointer transition-all duration-200 relative`}
                              >
                                <span className="material-symbols-outlined text-lg">
                                  {employee.sex === "M" ? "male" : "female"}
                                </span>
                                {/* Check Indicator */}
                                {employee?.CheckPoint?.checkPoint && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                                  >
                                    <span className="material-symbols-outlined text-white text-xs">
                                      check
                                    </span>
                                  </motion.div>
                                )}
                              </motion.div>
                            </div>

                            <div>
                              <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                <span className="material-symbols-outlined text-base opacity-70">
                                  person
                                </span>
                                {employee.firstName} {employee.lastName}{" "}
                                <span
                                  className={`material-symbols-outlined text-xs ${
                                    employee?.CheckPoint?.checkPoint
                                      ? "text-green-600"
                                      : "text-yellow-500"
                                  } `}
                                >
                                  {employee?.CheckPoint?.checkPoint
                                    ? "check_circle"
                                    : "pending"}
                                </span>
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
                                <div
                                  className="flex gap-x-3"
                                  key={animal.animalId}
                                >
                                  <button
                                    type="button"
                                    onClick={() => handleAnimalClick(animal)}
                                    key={animal.animalId}
                                    className="text-xs text-gray-700 flex items-center hover:text-amber-600 transition-colors cursor-pointer"
                                  >
                                    <span
                                      className={`${
                                        canView
                                          ? "material-symbols-outlined text-base mr-2 text-green-500"
                                          : "material-symbols-outlined text-base mr-2 text-red-400"
                                      }`}
                                    >
                                      {canView ? "pets" : "preview_off"}
                                    </span>
                                    {}{" "}
                                    {canView
                                      ? `${animal.name}`
                                      : "ไม่ได้รับสิทธิ์"}
                                  </button>

                                  <button
                                    onClick={() => handleOpenModalEdit(animal)}
                                    className={`${
                                      canEdit
                                        ? "text-amber-500 text-xs transition-colors cursor-pointer hover:text-gray-600"
                                        : "text-gray-500 text-xs transition-colors cursor-not-allowed hover:text-gray-600"
                                    }`}
                                  >
                                    <span className="material-symbols-outlined">
                                      {canEdit ? "edit" : "edit_off"}
                                    </span>
                                  </button>
                                </div>
                              ))}
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
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="flex flex-col justify-between gap-y-10">
                            <div className="grid grid-cols-2 gap-1 ">
                              <motion.button
                                whileHover={{
                                  scale: 1.05,
                                  background:
                                    "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
                                  boxShadow:
                                    "0 4px 6px -1px rgba(245, 158, 11, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                  transition: { duration: 0.2 },
                                }}
                                whileTap={{
                                  scale: 0.95,
                                  boxShadow:
                                    "0 2px 3px -1px rgba(245, 158, 11, 0.3)",
                                }}
                                onClick={() =>
                                  handleOpenModelEditParticipant(employee)
                                }
                                className={`relative overflow-hidden ${
                                  canEdit
                                    ? "text-xs inline-flex items-center gap-x-2 text-white bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 px-2 py-1.5 rounded-lg shadow-sm font-medium cursor-pointer"
                                    : "text-xs inline-flex items-center gap-x-2 text-gray-100 bg-gradient-to-r from-gray-500 to-gray-400 px-2 py-1.5 rounded-lg cursor-not-allowed opacity-70 font-medium"
                                }`}
                                title={canEdit ? "แก้ไข" : "ไม่มีสิทธิ์แก้ไข"}
                              >
                                {/* Ripple effect (only for enabled state) */}
                                {canEdit && (
                                  <motion.span
                                    className="absolute inset-0 bg-white opacity-0 rounded-full"
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileTap={{ scale: 3, opacity: 0.2 }}
                                    transition={{ duration: 0.4 }}
                                  />
                                )}

                                <motion.span
                                  className="material-symbols-outlined"
                                  whileHover={{ rotate: 10 }}
                                  transition={{ duration: 0.3 }}
                                  style={{ fontSize: "16px" }}
                                >
                                  {canEdit ? "edit" : "edit_off"}
                                </motion.span>
                                <span>{canEdit ? "แก้ไข" : "ไม่มีสิทธิ์"}</span>
                              </motion.button>

                              <motion.button
                                whileHover={{
                                  scale: 1.05,
                                  background:
                                    "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                                  boxShadow:
                                    "0 4px 6px -1px rgba(220, 38, 38, 0.3)",
                                  transition: { duration: 0.2 },
                                }}
                                whileTap={{
                                  scale: 0.95,
                                  boxShadow:
                                    "0 2px 10px -3px rgba(0, 0, 0, 0.2)",
                                  transition: {
                                    duration: 0.15,
                                    ease: [0.4, 0, 0.2, 1],
                                  },
                                }}
                                onClick={() => {
                                  if (canDelete) {
                                    setConfirmDelete(true);
                                    setRemoveParticpant(employee);
                                  }
                                }}
                                className={`relative overflow-hidden ${
                                  canDelete
                                    ? "text-xs inline-flex items-center gap-x-2 text-white bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 px-2 py-1.5 rounded-lg shadow-sm font-medium cursor-pointer"
                                    : "text-xs inline-flex items-center gap-x-2 text-gray-100 bg-gradient-to-r from-gray-500 to-gray-400 px-2 py-1.5 rounded-lg cursor-not-allowed opacity-70 font-medium"
                                }`}
                                title={canDelete ? "ลบ" : "ไม่มีสิทธิ์ลบ"}
                              >
                                {/* Ripple effect (only for enabled state) */}
                                {canDelete && (
                                  <motion.span
                                    className="absolute inset-0 bg-white opacity-0 rounded-full"
                                    initial={{ scale: 0, opacity: 0 }}
                                    whileTap={{ scale: 3, opacity: 0.2 }}
                                    transition={{ duration: 0.4 }}
                                  />
                                )}

                                <motion.span
                                  className="material-symbols-outlined text-lg"
                                  whileHover={{ rotate: 10 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  {canDelete ? "delete" : "contract_delete"}
                                </motion.span>

                                <span>{canDelete ? "ลบ" : "ไม่มีสิทธิ์"}</span>
                              </motion.button>
                            </div>
                            <div className="flex gap-2 text-xs text-gray-400">
                              {(() => {
                                if (!employee.updatedAt) {
                                  return (
                                    <>
                                      <span>แก้ไขล่าสุด:</span>
                                      <span className="text-gray-400 ml-1">
                                        ยังไม่ได้แก้ไข
                                      </span>
                                    </>
                                  );
                                }

                                const updatedAt = dayjs(employee.updatedAt);
                                const today = dayjs().startOf("day");
                                const isToday = updatedAt.isSame(today, "day");

                                return (
                                  <>
                                    <span>
                                      {isToday
                                        ? "แก้ไขล่าสุด:"
                                        : "แก้ไขเมื่อวันที่:"}
                                    </span>
                                    <span
                                      className={`ml-1 ${
                                        isToday
                                          ? "text-green-500"
                                          : "text-yellow-500"
                                      }`}
                                    >
                                      {isToday
                                        ? ` วันนี้ เวลา ${updatedAt.format(
                                            "HH:mm",
                                          )}`
                                        : ` ${updatedAt.format(
                                            "DD/MM/YYYY HH:mm",
                                          )}`}
                                    </span>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
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
