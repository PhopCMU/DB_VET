"use client";

import { ParticipantData } from "@/app/model/cmuvc/paymentModel";
import { Animal } from "@/app/model/vetrun/animalModel";
import { Employees } from "@/app/model/vetrun/employees";
import { GetParticipant_Vetrun } from "@/app/routers/vetrun/GetRouter";
import {
  AnimalDetailModal,
  EmployeeDetailModal,
} from "@/components/EmployeeDetail";
import ThaiYearPicker from "@/components/ThaiYearPicker";
import ExportMenu from "@/utils/ExportOptions";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type TabId =
  | "All"
  | "VIP"
  | "FUNRUN"
  | "FANCY"
  | "MARATHON"
  | "FUNRUN_WITH_DOG";

const TABS: {
  id: TabId;
  label: string;
  sublabel?: string;
  icon: string;
  dot: string;
}[] = [
  { id: "All", label: "All", icon: "all_inbox", dot: "bg-slate-400" },
  { id: "VIP", label: "VIP", icon: "diamond", dot: "bg-violet-400" },
  {
    id: "FUNRUN",
    label: "FUN RUN",
    sublabel: "ไม่มีสุนัข",
    icon: "directions_run",
    dot: "bg-sky-400",
  },
  {
    id: "FUNRUN_WITH_DOG",
    label: "FUN RUN",
    sublabel: "มีสุนัข",
    icon: "pets",
    dot: "bg-emerald-400",
  },
  { id: "FANCY", label: "FANCY", icon: "emoji_events", dot: "bg-pink-400" },
  { id: "MARATHON", label: "MINI MARATHON", icon: "timer", dot: "bg-amber-400" },
];

const INK = "border border-[#283343]";
const HARD_SHADOW = "shadow-[0_16px_36px_rgba(0,0,0,0.2)]";

function MicroLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
      {children}
    </p>
  );
}

interface ParticipantCardProps {
  employee: any;
  index: number;
  onAnimalClick: (animal: Animal) => void;
  onViewFile: (employee: Employees) => void;
}

function ParticipantCard({
  employee,
  index,
  onAnimalClick,
  onViewFile,
}: ParticipantCardProps) {
  const isPaid = employee?.payment === true;
  const animals: any[] = employee?.Animal ?? [];
  const vipItems: any[] = employee?.Items_vip ?? [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.05, 0.5),
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{ y: -4 }}
      className={`relative flex flex-col overflow-hidden rounded-xl bg-[#1d2736] ${INK} ${HARD_SHADOW}`}
    >
      {/* Bib header strip */}
      <div className="flex items-start justify-between gap-3 bg-[#283343] px-5 pt-4 pb-3">
        <div>
          <MicroLabel>Bib No.</MicroLabel>
          <p className="mt-0.5 text-2xl font-black tabular-nums tracking-tight text-white">
            {employee.nameBib}
            {employee.numberBib}
          </p>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${INK} ${
            employee.sex === "M"
              ? "bg-sky-400/15 text-sky-300"
              : "bg-pink-400/15 text-pink-300"
          }`}
        >
          <span className="material-symbols-outlined">
            {employee.sex === "M" ? "male" : "female"}
          </span>
        </div>
      </div>

      {/* Status stamp */}
      <span
        className={`absolute right-4 top-[4.5rem] rotate-6 rounded-md border-2 px-2 py-0.5 text-[16px] font-black uppercase tracking-widest ${
          isPaid
            ? "border-green-700 bg-green-50 text-green-700"
            : "border-amber-400 bg-amber-400/10 text-amber-300"
        }`}
      >
        {isPaid ? "ชำระแล้ว" : "รอตรวจสอบ"}
      </span>

      {/* Runner identity */}
      <div className="px-5 pb-4 pt-3">
        <h3 className="text-base font-bold text-white">
          {employee.firstName} {employee.lastName}
        </h3>
        <p className="mt-1 flex items-center gap-1.5 text-[11px] tabular-nums text-slate-400">
          <span className="material-symbols-outlined text-sm">fingerprint</span>
          {employee.participantId}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-slate-400">
          <span className="material-symbols-outlined text-sm">mail</span>
          {employee.email}
        </p>
      </div>

      {/* Perforation */}
      <div className="mx-5 border-t border-dashed border-[#3a4657]" />

      {/* Details */}
      <div className="flex-1 space-y-2 px-5 py-4 text-xs text-slate-300">
        <div className="group relative flex items-start gap-2">
          <span className="material-symbols-outlined text-base text-slate-500">
            home
          </span>
          <span className="max-w-[200px] truncate">
            {employee?.address || "ไม่ระบุที่อยู่"}
          </span>
          {employee?.address?.length > 25 && (
            <div className="invisible absolute bottom-full left-0 z-10 mb-2 w-64 whitespace-normal rounded-lg bg-[#121a2a] px-3 py-1.5 text-[11px] text-slate-100 shadow-lg group-hover:visible">
              {employee.address}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-slate-500">
            phone
          </span>
          <span className="tabular-nums">
            {employee?.phone || "ไม่ระบุเบอร์โทร"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-base text-slate-500">
            checkroom
          </span>
          {`ไซส์เสื้อ: ${employee?.size_sh?.size || "ไม่ระบุ"} ${
            employee?.size_sh?.s_width || ""
          } ${employee?.size_sh?.s_high || ""}`}
        </div>

        {employee?.typeBib === "VIP" && employee?.nameBib !== "FANCY-" && (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-blue-500">
              directions_run
            </span>
            {employee.age ? "MINI MARATHON" : "FUN RUN"}
          </div>
        )}

        {employee?.typeBib === "VIP" && employee?.nameBib === "FANCY-" && (
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-purple-500">
              star
            </span>
            VIP
          </div>
        )}

        {animals.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {animals.map((animal: any) => (
              <button
                type="button"
                key={animal.animalId}
                onClick={() => onAnimalClick(animal)}
                className={`flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-800 ${INK} border-green-700 transition-transform hover:-translate-y-0.5`}
              >
                <span className="material-symbols-outlined text-sm">pets</span>
                {animal.name}
              </button>
            ))}
          </div>
        )}

        {vipItems.map((s2: any, i: number) =>
          s2.items === "trophy" ? (
            <div key={i} className="flex items-center gap-2 text-slate-400">
              <span className="material-symbols-outlined text-base">
                rewarded_ads
              </span>
              ถ้วยรางวัล
            </div>
          ) : (
            <div key={i} className="flex items-center gap-2 text-slate-400">
              <span className="material-symbols-outlined text-base">
                apparel
              </span>
              <span>{s2?.model_shirt === "Shirt4KM" ? "4 KM" : "Shirt VIP"}</span>
              <span>
                {`${s2?.size_sh?.size || "ไม่ระบุ"} ${
                  s2?.size_sh?.s_width || ""
                } ${s2?.size_sh?.s_high || ""}`}
              </span>
            </div>
          ),
        )}
      </div>

      {/* Ticket footer */}
      <div className="mt-auto flex items-center justify-between border-t border-[#3a4657] bg-[#283343] px-5 py-3">
        <p className="text-sm font-black tabular-nums text-white">
          {employee?.typeBib === "VIP" ? "1,500" : "500"}
          <span className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            THB
          </span>
        </p>
        <button
          onClick={() => onViewFile(employee)}
          className="flex items-center gap-1.5 rounded-lg bg-[#121a2a] px-3 py-1.5 text-[11px] font-bold text-slate-100 transition-colors hover:bg-sky-500 hover:text-[#121a2a]"
        >
          <span className="material-symbols-outlined text-sm">visibility</span>
          ดูเอกสาร
        </button>
      </div>
    </motion.article>
  );
}

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

  const visibleParticipants = filteredUsers();
  const paidCount = visibleParticipants.filter(
    (participant) => participant.payment === true,
  ).length;
  const pendingCount = visibleParticipants.length - paidCount;

  return (
    <div className="min-h-screen  px-4 py-5 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1680px]">
        <motion.header
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-2xl border border-[#283343] bg-[#1d2736] px-5 py-6 text-slate-50 shadow-[0_20px_60px_rgba(0,0,0,0.24)] sm:px-8 sm:py-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[24px] border-sky-400/10" />
          <div className="pointer-events-none absolute bottom-0 right-10 h-1 w-32 bg-sky-400" />
          
          <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sky-300">
                VETRUN / PAYMENT DESK
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight sm:text-5xl">
                  ตรวจสอบการชำระเงิน
                </h1>
                <span className="rounded-full border border-[#3a4657] bg-[#121a2a] px-3 py-1 text-xs font-bold text-slate-300">
                  {selectedYear ? selectedYear.getFullYear() + 543 : "ปีปัจจุบัน"}
                </span>
              </div>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                ตรวจสอบหลักฐานการชำระเงินและข้อมูลผู้สมัครจากรายการเดียว
                พร้อมกรองตามประเภทการแข่งขันได้ทันที
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/dashboard/finance/projectDatabase/pages/vetrun/Sale_Shirt",
                  )
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#3a4657] px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:border-sky-400 hover:text-sky-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
              >
                <span className="material-symbols-outlined text-lg">apparel</span>
                ข้อมูลสั่งซื้อเสื้อ
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  aria-expanded={isOpen}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-sky-400 px-4 py-2.5 text-sm font-black text-[#121a2a] transition hover:bg-sky-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 sm:w-auto"
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
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute right-0 z-60 mt-2 w-full min-w-56 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-black/20 sm:w-56"
                    >
                      <ExportMenu
                        exportData={visibleParticipants}
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.header>

        <main className="mt-8">
          <section
            aria-label="สรุปสถานะการชำระเงิน"
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            <div className="flex items-center justify-between rounded-xl border border-[#283343] bg-[#1d2736] px-5 py-4 shadow-sm">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  รายการที่แสดง
                </p>
                <p className="mt-1 text-3xl font-black tabular-nums text-white">
                  {visibleParticipants.length}
                </p>
              </div>
              <span className="material-symbols-outlined rounded-lg bg-[#283343] p-2 text-2xl text-slate-200">
                groups
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-emerald-400/30 bg-[#1d2736] px-5 py-4 shadow-sm">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                  ชำระแล้ว
                </p>
                <p className="mt-1 text-3xl font-black tabular-nums text-emerald-300">
                  {paidCount}
                </p>
              </div>
              <span className="material-symbols-outlined rounded-lg bg-[#283343] p-2 text-2xl text-emerald-300">
                check_circle
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-amber-400/30 bg-[#1d2736] px-5 py-4 shadow-sm">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-700">
                  รอตรวจสอบ
                </p>
                <p className="mt-1 text-3xl font-black tabular-nums text-amber-700">
                  {pendingCount}
                </p>
              </div>
              <span className="material-symbols-outlined rounded-lg bg-[#283343] p-2 text-2xl text-amber-300">
                pending
              </span>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-[#283343] bg-[#1d2736] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:p-6">
            <div className="flex flex-col gap-5 border-b border-[#3a4657] pb-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-400/15 text-sky-300">
                    <span className="material-symbols-outlined">confirmation_number</span>
                  </span>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
                      รายชื่อผู้สมัคร
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-400">
                      เลือกประเภทการแข่งขันหรือค้นหาด้วยชื่อและหมายเลข Bib
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative w-full lg:max-w-sm">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  search
                </span>
                <input
                  type="search"
                  aria-label="ค้นหาผู้สมัคร"
                  placeholder="ค้นหาชื่อหรือหมายเลข Bib..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="min-h-11 w-full rounded-lg border border-[#3a4657] bg-[#121a2a] py-2.5 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    aria-label="ล้างคำค้นหา"
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-[#283343] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-pressed={activeTab === tab.id}
                  className={`group relative flex min-h-16 items-center gap-2 rounded-lg border px-3 py-2 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
                    activeTab === tab.id
                      ? "border-sky-400 bg-[#121a2a] text-white shadow-[0_6px_18px_rgba(56,189,248,0.18)]"
                      : "border-[#3a4657] bg-[#283343] text-slate-300 hover:border-sky-400/60 hover:bg-[#121a2a]"
                  }`}
                >
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${tab.dot}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-black uppercase tracking-wide">
                      {tab.label}
                    </span>
                    {tab.sublabel && (
                      <span className={`mt-0.5 block truncate text-[10px] ${
                        activeTab === tab.id ? "text-slate-400" : "text-slate-500"
                      }`}>
                        {tab.sublabel}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:w-52">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  calendar_today
                </span>
                <ThaiYearPicker
                  selectedYear={selectedYear !== null ? selectedYear : new Date()}
                  onChange={handerChangeYear}
                />
              </div>
              <p className="text-xs font-medium text-slate-400">
                แสดง {visibleParticipants.length} รายการในกลุ่ม {TABS.find((tab) => tab.id === activeTab)?.label}
              </p>
            </div>

            <div className="mt-6">
              {isLoading ? (
                <div role="status" className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#3a4657] bg-[#121a2a]">
                  <span className="material-symbols-rounded animate-spin text-4xl text-sky-300">
                    progress_activity
                  </span>
                  <p className="text-sm font-medium text-slate-300">กำลังโหลดข้อมูล...</p>
                </div>
              ) : visibleParticipants.length === 0 ? (
                <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-[#3a4657] bg-[#121a2a] px-6 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-600">search_off</span>
                  <h3 className="mt-3 text-base font-black text-white">ไม่พบข้อมูลผู้สมัคร</h3>
                  <p className="mt-1 max-w-sm text-sm text-slate-400">
                    ลองเปลี่ยนประเภทการแข่งขันหรือใช้คำค้นหาอื่น
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                  {visibleParticipants.map((employee, index) => (
                    <ParticipantCard
                      key={employee.participantId ?? index}
                      employee={employee}
                      index={index}
                      onAnimalClick={handleAnimalClick}
                      onViewFile={handleViewFile}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <AnimalDetailModal
          animal={selectedAnimal}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
        <EmployeeDetailModal
          employee={selectedEmployee}
          isOpen={modalOpenEmployee}
          onClose={() => setModalOpenEmployee(false)}
          onSuccess={() => setIsUpdated(true)}
        />
      </div>
    </div>
  );
}
