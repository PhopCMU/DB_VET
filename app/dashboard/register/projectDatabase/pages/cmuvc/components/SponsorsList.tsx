import { usePermission } from "@/app/context/UsePermission";
import { useUser } from "@/app/context/UserContext";
import { Delete_Sponsor } from "@/app/routers/cmuvc/DeleteRouter";
import {
  GetSelector,
  GetSponsorParticipantList,
} from "@/app/routers/cmuvc/GetRouter";
import PermissionGuard from "@/components/Guards/PermissionGuard";
import Loading from "@/components/Loadings/Loading";
import { LoadingModal } from "@/components/Modal";
import { ModalCreateSponsor } from "@/components/ModalCreated/Sponsor";
import ThaiYearPicker from "@/components/ThaiYearPicker";
import ExportMenu from "@/utils/ExportOptions";
import { useVisitor } from "@/lib/fingerprintjs-shim";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

const SUB_MENU_ID = "9b940740-d1e9-4a41-af0d-4e1faa90464d";
const PROJECT_ID = "ee9ce62b-2e02-4682-9ecf-9f9b564ee5e3";

type SponsorType = "main" | "pre" | "tsar";

export default function SponsorsList() {
  const { loading } = useUser();
  const [sponsorsParticipants, setSponsorsParticipants] = useState<any[]>([]);
  const [id, setId] = useState<string>("");
  const [setectorData, setSetectorData] = useState<any[]>([]);
  const [formDataEdit, setFormDataEdit] = useState<any>({});

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<Date | null>(new Date());
  const [selectedTitleTheme, setSelectedTitleTheme] =
    useState<SponsorType>("main");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [onUploadProgress, setOnUploadProgress] = useState<number>(0);
  const [isOpenDropdownExport, setIsOpenDropdownExport] =
    useState<boolean>(false);
  const [title, setTitle] = useState<string>("");

  // กำหนดตัวแปรสำหรับดีบาวน์ เวลา search
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const { canView, canCreate, canEdit, canDelete } = usePermission(
    SUB_MENU_ID,
    PROJECT_ID,
  );

  const [isOpenCreateSponsor, setIsOpenCreateSponsor] =
    useState<boolean>(false);

  if (loading) return <Loading />;

  const fetchData = async (date: Date, title: string) => {
    if (!date) return toast.warn("ไม่มีข้อมูลวันที่");
    if (!title) return toast.warn("ไม่มีข้อมูล title");

    try {
      const response = await GetSponsorParticipantList(date, title);

      if (!response.success) return toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
      setSponsorsParticipants(response.data);
    } catch (error) {
      toast.error("Failed to fetch theme data:", { autoClose: 2000 });
    }
  };

  const filtered = useMemo(() => {
    if (!sponsorsParticipants) return [];
    return sponsorsParticipants.filter((p: any) => {
      const fullName = `${p.fname.trim()} ${p.lname.trim()}`;
      const lowerSearchTerm = searchTerm.toLowerCase();

      return (
        p.fname.toLowerCase().includes(lowerSearchTerm) ||
        p.lname.toLowerCase().includes(lowerSearchTerm) ||
        fullName.toLowerCase().includes(lowerSearchTerm) ||
        p.companys.name.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [sponsorsParticipants, searchTerm]);

  const fetchSelectorData = async () => {
    try {
      const response = await GetSelector();
      if (!response.success)
        return toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล Selector");
      setSetectorData(response.data);
    } catch (error) {
      toast.error("Failed to fetch theme data:", { autoClose: 2000 });
    }
  };

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (selectedYear) {
      debounceTimer.current = setTimeout(() => {
        fetchData(
          new Date() || selectedYear,

          selectedTitleTheme || "main",
        ); // Make sure to use the correct date
        fetchSelectorData();
      }, 1000);
    }
  }, [selectedYear]);

  const handerChangeYear = async (date: Date) => {
    setSelectedYear(date);
    await fetchData(
      date || new Date(),

      selectedTitleTheme || "main",
    );
  };

  const handleCancelDelete = () => {
    setId("");
  };

  const handleConfirmDelete = async () => {
    if (!id) return toast.warn("ไม่มีข้อมูล ID");

    setIsLoading(true);
    setOnUploadProgress(0);

    try {
      // toast.success("ลบข้อมูลเรียบร้อยแล้ว" + id, { autoClose: 2000 });

      const resopnse = await Delete_Sponsor(id, setOnUploadProgress);

      if (!resopnse.success)
        return toast.error(resopnse.message, { autoClose: 2000 });

      toast.success("ลบข้อมูลเรียบร้อยแล้ว", { autoClose: 2000 });
      await fetchData(
        selectedYear || new Date(),

        selectedTitleTheme,
      );
      setId("");
      setIsLoading(false);
    } catch (error: any) {
      toast.error("Failed:" + error.message, { autoClose: 2000 });
    }
  };

  return (
    <>
      <PermissionGuard submenuIdCode={SUB_MENU_ID} />
      {/* Modal && Loading */}
      <ModalCreateSponsor
        isOpen={isOpenCreateSponsor}
        onClose={() => setIsOpenCreateSponsor(false)}
        title={title}
        headerTitle={selectedTitleTheme}
        selectedData={setectorData}
        formDataEdit={formDataEdit || null}
        onUpdate={async (updatedSponsor: any) => {
          if (!updatedSponsor)
            return toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
          await fetchData(selectedYear || new Date(), selectedTitleTheme);
          toast.success("เพิ่มข้อมูลสปอนเซอร์เรียบร้อยแล้ว");
          setIsOpenCreateSponsor(false);
          setFormDataEdit(null);
        }}
      />

      <LoadingModal isOpen={isLoading} progress={onUploadProgress} />

      <div>
        <div className="rounded-2xl border border-[#e4e9e4] bg-white p-5 shadow-[0_8px_30px_-24px_rgba(30,54,46,0.45)] sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#176b56] text-white shadow-sm">
                <span className="material-symbols-rounded text-2xl">
                  handshake
                </span>
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-[#243a32] md:text-2xl">
                  รายชื่อผู้สนับสนุน
                </h1>
                <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-[#718078]">
                  ตรวจสอบและจัดการรายชื่อผู้เข้าร่วมจากผู้สนับสนุน
                  <span className="rounded-full bg-[#f4efe5] px-2.5 py-0.5 text-xs font-semibold text-[#8a6a33]">
                    พ.ศ. {selectedYear ? selectedYear.getFullYear() + 543 : "-"}
                  </span>
                </p>
              </div>
            </div>

            {/* ตัวเลือกประเภทงาน */}
            <div
              role="tablist"
              aria-label="ประเภทงาน"
              className="grid grid-cols-3 gap-1.5 rounded-xl bg-[#eef3ef] p-1.5"
            >
              {[
                { name: "Main Conference", title: "main" },
                { name: "Pre-Congress", title: "pre" },
                { name: "TSAR", title: "tsar" },
              ].map((type) => {
                const active = selectedTitleTheme === type.title;
                return (
                  <button
                    key={type.title}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      fetchData(new Date(), type.title);
                      setSelectedTitleTheme(type.title as SponsorType);
                    }}
                    className={`h-10 whitespace-nowrap rounded-lg px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#176b56]/20 ${
                      active
                        ? "bg-white text-[#125844] shadow-sm ring-1 ring-[#d8e0da]"
                        : "text-[#617168] hover:text-[#243a32]"
                    }`}
                  >
                    {type.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-5 flex flex-col gap-1 rounded-2xl border border-[#e4e9e4] bg-white p-5 shadow-[0_8px_30px_-24px_rgba(30,54,46,0.45)] sm:p-6"
          >
            {/* Toolbar */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <p className="text-sm text-[#718078]">
                พบ{" "}
                <span className="font-semibold text-[#176b56]">
                  {filtered.length.toLocaleString("th-TH")}
                </span>{" "}
                รายชื่อ
                {searchTerm ? " ตามเงื่อนไขค้นหา" : ""}
              </p>

              {/* Controls Section */}
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                {/* Year Picker */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
                  className="relative w-full sm:w-56"
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
                    type="search"
                    placeholder="ค้นหาชื่อ นามสกุล หรือ บริษัท..."
                    aria-label="ค้นหารายชื่อผู้สนับสนุน"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-11 w-full rounded-xl border border-[#d8e0da] bg-[#fbfcfa] pl-10 pr-9 text-sm text-[#243a32] outline-none transition placeholder:text-[#9aa8a0] focus:border-[#32745d] focus:ring-4 focus:ring-[#32745d]/10"
                  />
                  {searchTerm && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      whileHover={{ scale: 1.1 }}
                    >
                      <span className="material-symbols-rounded text-gray-400 hover:text-gray-600">
                        close
                      </span>
                    </motion.button>
                  )}
                </motion.div>

                {/* Add Button */}
                <button
                  type="button"
                  onClick={() => {
                    setFormDataEdit(null);
                    setIsOpenCreateSponsor(true);
                    setTitle("เพิ่มข้อมูล");
                  }}
                  disabled={!canCreate}
                  className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-[#176b56] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125844] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#176b56]/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <span className="material-symbols-rounded text-lg">
                    person_add
                  </span>
                  เพิ่มข้อมูล
                </button>

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
                        setIsOpenDropdownExport(!isOpenDropdownExport);
                      }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`${
                      canView && canCreate && canEdit
                        ? "flex items-center border border-[#c8d8cf] bg-white text-[#176b56] hover:bg-[#edf5f0]"
                        : "flex cursor-not-allowed items-center border border-gray-200 bg-gray-100 text-gray-400"
                    } h-11 w-full gap-1.5 rounded-xl px-4 text-sm font-semibold shadow-sm transition-colors sm:w-auto`}
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
                      {isOpenDropdownExport ? "expand_less" : "expand_more"}
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {isOpenDropdownExport && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 z-40 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-gray-200 overflow-hidden"
                        style={{
                          boxShadow:
                            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <div className="py-1.5">
                          <ExportMenu
                            exportData={filtered}
                            isOpen={isOpenDropdownExport}
                            setIsOpen={setIsOpenDropdownExport}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </div>

            {/* Info Box */}
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#f6f8f5] px-4 py-3 text-xs text-[#718078] ring-1 ring-[#e7ede8]">
              <span className="material-symbols-outlined mt-0.5 text-base text-[#176b56]">
                info
              </span>
              <p>
                แก้ไขข้อมูลและส่งออกเป็น Excel / CSV
                ได้เฉพาะผู้ที่ได้รับสิทธิ์เข้าถึงข้อมูลเท่านั้น
              </p>
            </div>

            {/* Field Add Sponsor Container */}

            {/* Loading Stat */}
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <span className="material-symbols-rounded mb-3 animate-spin text-4xl text-[#176b56]">
                  progress_activity
                </span>
                <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
              </motion.div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-xl border border-[#e4e9e4]">
                <table className="min-w-full divide-y divide-[#edf0ed]">
                  <thead className="hidden bg-[#f6f8f5] md:table-header-group">
                    <tr>
                      {[
                        { key: "name", label: "รายชื่อ", align: "text-left" },
                        {
                          key: "companys",
                          label: "หน่วยงาน/บริษัท",
                          align: "text-left",
                        },
                        {
                          key: "others",
                          label: "ข้อมูลอื่นๆ",
                          align: "text-left",
                        },
                        {
                          key: "actions",
                          label: "การจัดการ",
                          align: "text-right",
                        },
                      ].map((header) => (
                        <th
                          key={header.key}
                          scope="col"
                          className={`px-4 py-3.5 text-xs font-semibold text-[#52645b] ${header.align}`}
                        >
                          {header.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf0ed] bg-white">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-14 text-center">
                          <p className="text-sm font-semibold text-[#34483e]">
                            ไม่พบข้อมูล
                          </p>
                          <p className="mt-1 text-xs text-[#718078]">
                            ลองเปลี่ยนปี ประเภทงาน หรือคำค้นหาอีกครั้ง
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((user: any, index: number) => (
                        <tr
                          key={index}
                          className="grid grid-cols-2 gap-2 p-3 transition-colors hover:bg-[#f9fbf9] md:table-row md:p-0"
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
                                    phone
                                  </span>
                                  {user.phone}
                                </div>
                                <div className="text-[10px] text-gray-500 flex items-center mt-1">
                                  <span className="material-symbols-rounded text-[10px] mr-1">
                                    email
                                  </span>
                                  {user.email}
                                </div>
                              </div>
                              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#e8f2ed] text-sm font-semibold text-[#176b56]">
                                {index + 1}
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 w-72">
                            <div className="flex items-center">
                              <div>
                                {/* องค์กร */}
                                <div className="text-[12px] text-gray-500 flex items-center mt-1 group relative">
                                  <span className="material-symbols-rounded text-gray-400 text-base mr-1">
                                    home
                                  </span>
                                  <span className="truncate max-w-[180px]">
                                    {user?.organization?.length > 100
                                      ? `${user.organization.substring(
                                          0,
                                          100,
                                        )}...`
                                      : user?.organization || "ไม่ระบุองค์กร"}
                                  </span>
                                  {user?.organization?.length > 100 && (
                                    <div className="absolute bottom-full left-0 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap invisible group-hover:visible z-10">
                                      {user.organization}
                                    </div>
                                  )}
                                </div>

                                {/* ที่อยู่ */}
                                <div className="text-[12px] text-gray-500 flex items-center mt-1 group relative">
                                  <span className="material-symbols-rounded text-gray-400 text-base mr-1">
                                    home_work
                                  </span>
                                  <span className="truncate max-w-[180px]">
                                    {`${user?.companys?.name || ""}`.trim()
                                      .length > 100
                                      ? `${`${user.companys?.name}`
                                          .trim()
                                          .substring(0, 100)}...`
                                      : `${
                                          user?.companys?.name || ""
                                        }`.trim() || "ไม่ระบุที่อยู่"}
                                  </span>
                                  {`${user?.companys?.name || ""} `.trim()
                                    .length > 100 && (
                                    <div className="absolute bottom-full left-0 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-normal w-[250px] break-words invisible group-hover:visible z-10">
                                      {`${user?.companys?.name || ""}`.trim()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700 ">
                            <div className="flex flex-col items-start">
                              <div className="text-[12px] text-gray-500 flex items-center mt-1 group relative">
                                <span className="material-symbols-rounded text-gray-400 text-base mr-1">
                                  confirmation_number
                                </span>
                                <span className="truncate max-w-[180px]">
                                  {user.ce}
                                </span>
                              </div>
                              <div className="text-[12px] text-gray-500 flex items-center mt-1 group relative">
                                <span className="material-symbols-rounded text-gray-400 text-base mr-1">
                                  group
                                </span>
                                <span className="truncate max-w-[180px]">
                                  {user?.categorys?.categoryType
                                    ? (user.categorys?.categoryType).length > 20
                                      ? `${(user.categorys?.categoryType).substring(
                                          0,
                                          20,
                                        )}...`
                                      : user.categorys?.categoryType
                                    : "ไม่ระบุข้อมูล"}
                                </span>
                                {user?.categorys?.categoryType?.length > 20 && (
                                  <div className="absolute bottom-full left-0 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-normal w-[250px] break-words invisible group-hover:visible z-10">
                                    {user.categorys?.categoryType}
                                  </div>
                                )}
                              </div>

                              <div className="text-[12px] text-gray-500 flex items-center mt-1">
                                <span className="material-symbols-rounded text-gray-400 text-base mr-1">
                                  {user.foods?.foodType === "Regular"
                                    ? "dinner_dining"
                                    : " egg_alt"}
                                </span>

                                <span
                                  className={`${
                                    user?.payments
                                      ? "text-green-500"
                                      : "text-rose-500"
                                  }`}
                                >
                                  {user?.foods?.foodType === "Regular"
                                    ? "อาหารปกติ"
                                    : "มังสวิรัติ"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="whitespace-nowrap flex flex-col justify-between gap-5 px-3 py-4">
                            <div className="inline-flex item-center justify-end gap-2">
                              {id === user.sponserParticipantId ? (
                                <>
                                  {/* ยืนยันลบ */}
                                  <button
                                    onClick={handleConfirmDelete}
                                    className="group flex items-center justify-center gap-1 px-3 py-1 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-inner cursor-pointer"
                                  >
                                    <span className="material-symbols-rounded text-base group-hover:scale-110 transition-transform duration-300">
                                      delete_forever
                                    </span>
                                    <span>ยืนยันลบ</span>
                                  </button>

                                  {/* ยกเลิก */}
                                  <button
                                    onClick={handleCancelDelete}
                                    className="group flex items-center justify-center gap-1 px-3 py-1 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 shadow-inner cursor-pointer"
                                  >
                                    <span className="material-symbols-rounded text-base group-hover:scale-110 transition-transform duration-300">
                                      close
                                    </span>
                                    <span>ยกเลิก</span>
                                  </button>
                                </>
                              ) : (
                                <>
                                  {/* แก้ไข */}
                                  <button
                                    onClick={() => {
                                      if (canView && canEdit) {
                                        setIsOpenCreateSponsor(true);
                                        setTitle("แก้ไขข้อมูล");
                                        setFormDataEdit(user); // handleOpenModalEdit(user);
                                      }
                                    }}
                                    className={`group flex items-center justify-center gap-1 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                                      canView && canEdit
                                        ? "bg-[#e8f2ed] text-[#125844] hover:bg-[#dcebe2]"
                                        : "cursor-not-allowed bg-gray-100 text-gray-400"
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
                                      {canView && canEdit ? "edit" : "edit_off"}
                                    </span>
                                    <span className="">
                                      {canView && canEdit
                                        ? "แก้ไข"
                                        : "ไม่ได้รับสิทธิ์"}
                                    </span>
                                  </button>

                                  {/* ลบ */}
                                  <button
                                    onClick={() => {
                                      if (canView && canDelete) {
                                        setId(user.sponserParticipantId);
                                      }
                                    }}
                                    className={`group flex items-center justify-center gap-1 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                                      canView && canDelete
                                        ? "bg-red-50 text-red-700 hover:bg-red-100"
                                        : "cursor-not-allowed bg-gray-100 text-gray-400"
                                    }`}
                                    disabled={!canView || !canDelete}
                                  >
                                    <span
                                      className={`material-symbols-rounded text-base transition-transform duration-300 ${
                                        canView && canDelete
                                          ? "group-hover:scale-110"
                                          : ""
                                      }`}
                                    >
                                      {canView && canDelete
                                        ? "delete"
                                        : "delete_forever"}
                                    </span>
                                    <span className="">
                                      {canView && canDelete
                                        ? "ลบ"
                                        : "ไม่ได้รับสิทธิ์"}
                                    </span>
                                  </button>
                                </>
                              )}
                            </div>
                            {/* Date Update */}
                            <div className="flex justify-end gap-2 text-xs text-gray-400">
                              {user.updateAt ? (
                                <div className="inline-flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">
                                    schedule
                                  </span>
                                  <span
                                    className={
                                      dayjs(user.updateAt).isSame(
                                        dayjs().startOf("day"),
                                        "day",
                                      )
                                        ? "text-green-600"
                                        : "text-amber-600"
                                    }
                                  >
                                    {dayjs(user.updateAt).isSame(
                                      dayjs().startOf("day"),
                                      "day",
                                    )
                                      ? `วันนี้ ${dayjs(user.updateAt).format(
                                          "HH:mm",
                                        )}`
                                      : dayjs(user.updateAt).format(
                                          "DD/MM/YYYY HH:mm",
                                        )}
                                  </span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">
                                    schedule
                                  </span>
                                  <span>ยังไม่ได้แก้ไข</span>
                                </div>
                              )}
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
    </>
  );
}
