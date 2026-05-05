import { usePermission } from "@/app/context/UsePermission";
import { useUser } from "@/app/context/UserContext";
import { CmuvcParticipant } from "@/app/model/cmuvc/dashboardModel";
import { Delete_Participant } from "@/app/routers/cmuvc/DeleteRouter";
import { GetParticipantList_Main } from "@/app/routers/cmuvc/GetRouter";
import { ConfirmModal } from "@/components/ConfirmModal/ConfirmModal";
import PermissionGuard from "@/components/Guards/PermissionGuard";
import { LoadingModal } from "@/components/Modal";
import { ModalEditParticipant_Main } from "@/components/ModalEdit/CmuvcMainModal";

import ThaiYearPicker from "@/components/ThaiYearPicker";
import ExportMenu from "@/utils/ExportOptions";
import { useVisitor } from "@/lib/fingerprintjs-shim";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

const SUB_MENU_ID = "9b940740-d1e9-4a41-af0d-4e1faa90464d";
const PROJECT_ID = "ee9ce62b-2e02-4682-9ecf-9f9b564ee5e3";

export default function ParticipantsList_Pre() {
  const { userData, loading } = useUser();
  const { data } = useVisitor({ extendedResult: true });
  const [selectedYear, setSelectedYear] = useState<Date | null>(new Date());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataParticipants, setDataParticipant] = useState<
    CmuvcParticipant[] | null
  >(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isOpenDropdownExport, setIsOpenDropdownExport] =
    useState<boolean>(false);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState<boolean>(false);
  const [participantId, setParticipantId] = useState<string | undefined>("");
  const [onUploadProgress, setOnUploadProgress] = useState<number>(0);
  const [formData, setFormData] = useState<CmuvcParticipant>();
  const hasData = useRef(false);

  if (!userData) return loading;
  const visitorId = data?.visitorId ?? "";

  const { canView, canCreate, canEdit, canDelete } = usePermission(
    SUB_MENU_ID,
    PROJECT_ID,
  );

  const headerTitle = "pre";

  const fetchDataParticipantsPre = async (date: Date) => {
    if (!selectedYear) return toast.warn("NOT DATE");
    setIsLoading(true);
    try {
      const response = await GetParticipantList_Main(
        date || new Date(),
        visitorId,
        headerTitle,
      );

      if (!response.success) return toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");

      setDataParticipant(response.data);
    } catch (error) {
      console.error("Failed to fetch theme data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!dataParticipants) return [];
    return dataParticipants.filter((p) => {
      const fullName = `${p.fname.trim()} ${p.lname.trim()}`;
      const lowerSearchTerm = searchTerm.toLowerCase();

      return (
        p.fname.toLowerCase().includes(lowerSearchTerm) ||
        p.lname.toLowerCase().includes(lowerSearchTerm) ||
        fullName.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [dataParticipants, searchTerm]);

  useEffect(() => {
    if (!hasData.current) {
      fetchDataParticipantsPre(new Date());
      hasData.current = true;
    }
  }, []);

  useEffect(() => {
    if (isUpdated && hasData.current) {
      fetchDataParticipantsPre(new Date());
      setIsUpdated(false);
    }
  }, [isUpdated]);

  const handerChangeYear = async (date: Date) => {
    setSelectedYear(date);
    await fetchDataParticipantsPre(date || new Date());
  };

  const handleOpenModalEdit = (data: CmuvcParticipant) => {
    setFormData(data);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!participantId) return toast.warn("ไม่มีมีข้อมูลไอดีของผู้เข้าร่วม");

    setIsLoading(true);
    setOnUploadProgress(0);

    try {
      const response = await Delete_Participant(
        participantId,
        visitorId,
        headerTitle,
        setOnUploadProgress,
      );
      if (!response.success)
        return toast.error("Message: เกิดข้อผิดพลาดในการลบข้อมูล");
      setIsModalConfirmOpen(false);
      await fetchDataParticipantsPre(selectedYear || new Date());
      setIsLoading(false);
      toast.success(`ลบข้อมูลผู้เข้าร่วมสำเร็จ`);
    } catch (error: any) {
      toast.error(`Error message: ${error?.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PermissionGuard submenuIdCode={SUB_MENU_ID} />
      <ModalEditParticipant_Main
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="แก้ไขข้อมูลผู้เข้าร่วม"
        formData={formData as any}
        headerTitle={headerTitle}
        visitorId={data?.visitorId || ""}
        onUpdate={async (updateds: CmuvcParticipant) => {
          if (!updateds) return toast.error("ไม่สามารถดำเนินการแก้ไขข้อมูลได้");
          toast.success("แก้ไขเมนูสำเร็จ");
          setIsUpdated(true);
          setIsModalOpen(false);
        }}
      />

      <ConfirmModal
        isOpen={isModalConfirmOpen}
        onClose={() => setIsModalConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="ยืนยันการลบข้อมูล"
        message="ข้อมูลที่ถูกลบจะไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่?"
        confirmText="ลบข้อมูล"
        confirmColor="red"
        cancelText="ยกเลิก"
        icon="warning"
      />

      <LoadingModal isOpen={isLoading} progress={onUploadProgress} />
      <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-50 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:border-blue-100 hover:bg-blue-50/20 group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors duration-300">
              <span className="material-symbols-rounded text-3xl">
                assessment
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                Names of Participants in the Pre Congress
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full"
                >
                  {selectedYear ? selectedYear.getFullYear() + 543 : ""}
                </motion.span>
              </h1>
              <p className="text-sm text-gray-600 mb-4">
                Review of the Participant List for the Event
              </p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col gap-1"
          >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-inner">
                      <span className="material-symbols-rounded text-blue-600 text-3xl">
                        groups
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold text-gray-800">
                        รายชื่อทั้งหมด
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <p className="text-[12px]">
                        จำนวนผู้เข้าร่วมที่ลงทะเบียนทั้งหมด{" "}
                        <span className="font-semibold text-blue-600 ml-1 px-2 py-1 bg-blue-50 rounded-lg">
                          {filtered.length} ท่าน
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 placeholder-gray-400 text-gray-700 hover:border-gray-300"
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-5"
            >
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
                      สามารถแก้ไขข้อมูลผู้เข้าร่วมและส่งออกข้อมูลเป็นไฟล์ Excel
                      และ CSV
                    </p>
                    <p className=" text-[12px] text-red-500">
                      หมายเหตุ ต้องได้รับสิทธิ์การเข้าถึงข้อมูลก่อนเท่านั้น
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Loading Stat */}
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
                          key: "แพ็คเกจ",
                          label: "แพ็คเกจ",
                          icon: "package_2",
                        },

                        { key: "สถานะ", label: "สถานะ", icon: "priority_high" },
                        {
                          key: "การจัดการ",
                          label: "การจัดการ",
                          icon: "border_color",
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
                    {filtered.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-3 py-2 md:px-4 md:py-3 text-center text-sm text-gray-700"
                        >
                          ไม่พบข้อมูล
                        </td>
                      </tr>
                    ) : (
                      filtered.map((user: CmuvcParticipant, index: number) => (
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
                                  ID: {user.participantId}
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
                                    {user?.packages?.category_en
                                      ? (user.packages?.category_en).length > 20
                                        ? `${(user.packages?.category_en).substring(
                                            0,
                                            20,
                                          )}...`
                                        : user.packages?.category_en
                                      : "ไม่ระบุข้อมูล"}
                                  </span>
                                  {user?.packages?.category_en?.length > 20 && (
                                    <div className="absolute bottom-full left-0 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-normal w-[250px] break-words invisible group-hover:visible z-10">
                                      {user.packages?.category_en}
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

                          <td className="whitespace-nowrap flex flex-col justify-between gap-5 px-3 py-4">
                            <div className="inline-flex item-center justify-end gap-2">
                              {/* แก้ไข */}
                              <button
                                onClick={() => {
                                  if (canView && canEdit) {
                                    handleOpenModalEdit(user);
                                  }
                                }}
                                className={`group flex items-center justify-center gap-1 px-3 py-1 rounded-xl text-sm font-light  ${
                                  canView && canEdit
                                    ? "text-yellow-600 bg-gradient-to-b from-yellow-50 to-yellow-100/50 hover:from-yellow-100 hover:to-yellow-200/70 hover:text-yellow-700 border border-yellow-200/60 hover:border-yellow-300/80 hover:shadow-md cursor-pointer shadow-inner font-medium"
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
                                  {canView && canEdit ? "edit" : "edit_off"}
                                </span>
                                <span className="transition-all duration-300">
                                  {canView && canEdit
                                    ? "แก้ไข"
                                    : "ไม่ได้รับสิทธิ์"}
                                </span>
                              </button>

                              {/* ลบ */}
                              <button
                                onClick={() => {
                                  setIsModalConfirmOpen(true);
                                  setParticipantId(user?.participantId);
                                }}
                                className={`group flex items-center justify-center gap-1 px-3 py-1 rounded-xl text-sm font-light  ${
                                  canView && canDelete
                                    ? "text-red-600 bg-gradient-to-b from-red-50 to-red-100/50 hover:from-red-100 hover:to-red-200/70 hover:text-red-700 border border-red-200/60 hover:border-red-300/80 hover:shadow-md cursor-pointer shadow-inner font-medium"
                                    : "text-gray-400/80 bg-gradient-to-b from-gray-50 to-gray-100/50 border border-gray-200/60 cursor-not-allowed"
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
                                <span className="transition-all duration-300">
                                  {canView && canDelete
                                    ? "ลบ"
                                    : "ไม่ได้รับสิทธิ์"}
                                </span>
                              </button>
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
