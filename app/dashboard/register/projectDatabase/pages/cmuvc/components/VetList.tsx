import { usePermission } from "@/app/context/UsePermission";
import { useUser } from "@/app/context/UserContext";
import { CmuvcVet } from "@/app/model/cmuvc/dashboardModel";
import { Delete_Vets } from "@/app/routers/cmuvc/DeleteRouter";
import { GetVet } from "@/app/routers/cmuvc/GetRouter";
import { Cmuvc_Create_Vet_Router_CryptoJS } from "@/app/routers/cmuvc/PostRouter";
import { PutEditVetlist } from "@/app/routers/cmuvc/PutRouter";
import PermissionGuard from "@/components/Guards/PermissionGuard";
import Loading from "@/components/Loadings/Loading";
import { LoadingModal } from "@/components/Modal";
import ToastNotification from "@/components/Tooltips/ToastNotification";
import dayjs from "dayjs";

import { AnimatePresence, motion } from "framer-motion";
import { Fragment, memo, useEffect, useMemo, useRef, useState } from "react";

type FormMode = "add" | "edit";

type VetFormData = Omit<CmuvcVet, "accountId" | "createAt" | "updateAt">;

const emptyVetForm: VetFormData = {
  prefix: "",
  fname: "",
  lname: "",
  fname_EN: "",
  lname_EN: "",
  number_ce: "",
};

const vetToFormData = (vet: CmuvcVet): VetFormData => ({
  prefix: vet.prefix,
  fname: vet.fname,
  lname: vet.lname,
  fname_EN: vet.fname_EN || "",
  lname_EN: vet.lname_EN || "",
  number_ce: vet.number_ce || "",
});

interface VetFormProps {
  initialData: VetFormData;
  submitLabel: string;
  submittingLabel: string;
  onCancel: () => void;
  onSubmit: (data: VetFormData) => Promise<void>;
}

// ฟอร์มกรอกข้อมูลสัตวแพทย์ แยกออกมาเป็น component ของตัวเอง พร้อม state ภายใน
// เพื่อไม่ให้การพิมพ์แต่ละตัวอักษรไปสั่ง re-render ทั้งตาราง (แก้ปัญหาพิมพ์กระตุก)
const VetForm = memo(function VetForm({
  initialData,
  submitLabel,
  submittingLabel,
  onCancel,
  onSubmit,
}: VetFormProps) {
  const [data, setData] = useState<VetFormData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitClick = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <fieldset
        disabled={isSubmitting}
        className="space-y-6 disabled:opacity-60 transition-opacity"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ตำแหน่ง (เช่น ศ./ศ.พิเศษ/รศ./ผศ./ดร.)
          </label>
          <input
            type="text"
            name="prefix"
            value={data.prefix}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="ระบุตำแหน่ง"
          />
        </div>

        {/* ชื่อ-นามสกุล ภาษาไทย */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">translate</span>
            ชื่อ-นามสกุล (ภาษาไทย)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อ
              </label>
              <input
                type="text"
                name="fname"
                value={data.fname}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="ชื่อ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                นามสกุล
              </label>
              <input
                type="text"
                name="lname"
                value={data.lname}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="นามสกุล"
              />
            </div>
          </div>
        </div>

        {/* ชื่อ-นามสกุล ภาษาอังกฤษ */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">language</span>
            ชื่อ-นามสกุล (ภาษาอังกฤษ)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="fname_EN"
                value={data.fname_EN}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="First Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lname_EN"
                value={data.lname_EN}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Last Name"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            เลขใบอนุญาต
          </label>
          <input
            type="text"
            name="number_ce"
            value={data.number_ce}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="ระบุเลขใบอนุญาต"
          />
        </div>
      </fieldset>

      <div className="flex justify-end gap-3 pt-4 border-t border-blue-200/70">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-base">close</span>
          ยกเลิก
        </button>
        <button
          onClick={handleSubmitClick}
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md disabled:opacity-70 disabled:cursor-not-allowed min-w-[140px] justify-center"
        >
          {isSubmitting ? (
            <>
              <span className="material-symbols-outlined text-base animate-spin">
                progress_activity
              </span>
              {submittingLabel}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-base">check</span>
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </>
  );
});

const SUB_MENU_ID = "9b940740-d1e9-4a41-af0d-4e1faa90464d";
const PROJECT_ID = "ee9ce62b-2e02-4682-9ecf-9f9b564ee5e3";

// หน้ารายชื่อผู้เข้าร่วม VET
export default function VetList() {
  const { userData, loading } = useUser();
  const [vets, setVets] = useState<CmuvcVet[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>("add");
  const [currentVets, setCurrentVets] = useState<CmuvcVet | null>(null);
  const [onUploadProgress, setOnUploadProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadData, setLoadData] = useState<boolean>(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ isVisible: false, message: "", type: "success" });

  const hasVets = useRef(false);

  if (loading) return <Loading />;

  const filteredVet = useMemo(() => {
    // ป้องกันกรณี vets ยังไม่มีข้อมูล
    if (!Array.isArray(vets) || vets.length === 0) return [];

    // แปลง searchTerm ให้เป็น lowercase ครั้งเดียว
    const term = searchTerm.toLowerCase().trim();

    // ถ้าไม่มีคำค้นหา ให้ return ทั้งหมดทันที (เพื่อ performance)
    if (term === "") return vets;

    return vets.filter((vet) => {
      if (!vet.fname || !vet.lname) return false; // ป้องกัน null/undefined

      const fullName = `${vet.fname.trim()} ${vet.lname.trim()}`.toLowerCase();
      const fname = vet.fname.toLowerCase();
      const lname = vet.lname.toLowerCase();

      return (
        fname.includes(term) || lname.includes(term) || fullName.includes(term)
      );
    });
  }, [vets, searchTerm]); // เพียงพอ: คำนวณใหม่เมื่อ vets หรือ searchTerm เปลี่ยน

  const fetchVets = async () => {
    const response = await GetVet();
    if (response.success) {
      const data = response.data as CmuvcVet[];
      setVets(data);
      setLoadData(true);
    }
  };

  // Function to show toast
  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning",
  ) => {
    setToast({ isVisible: true, message, type });
  };

  // Function to hide toast
  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  useEffect(() => {
    if (!hasVets.current) {
      fetchVets();
      hasVets.current = true;
    }
  }, []);

  if (!userData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">ไม่พบข้อมูลผู้ใช้</p>
      </div>
    );
  }

  const { canCreate, canEdit, canDelete, canView } = usePermission(
    SUB_MENU_ID,
    PROJECT_ID,
  );

  if (!loadData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  // เปิด/ปิด Dropdown เพิ่มสัตวแพทย์ (ใต้ Header Section)
  const toggleAddPanel = () => {
    if (isAddOpen) {
      setIsAddOpen(false);
      return;
    }
    setFormMode("add");
    setCurrentVets(null);
    setEditingAccountId(null);
    setIsAddOpen(true);
  };

  // เปิด/ปิด Dropdown แก้ไขสัตวแพทย์ (ในแถวของตาราง)
  const toggleEditPanel = (vet: CmuvcVet) => {
    if (editingAccountId === vet.accountId) {
      setEditingAccountId(null);
      return;
    }
    setFormMode("edit");
    setCurrentVets(vet);
    setIsAddOpen(false);
    setEditingAccountId(vet.accountId);
  };

  // ปิดฟอร์ม (ยกเลิกการเพิ่ม/แก้ไข)
  const closeForm = () => {
    setIsAddOpen(false);
    setEditingAccountId(null);
  };

  const handleDeleteClick = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  // ยกเลิกการยืนยันลบ (กลับไปแสดงปุ่มแก้ไข/ลบตามปกติ)
  const handleCancelDelete = () => {
    setSelectedAccountId("");
  };

  // ลบข้อมูลสัตวแพทย์
  const deleteVet = async (accountId: string) => {
    if (!accountId.trim()) {
      showToast("ไม่พบข้อมูลสัตวแพทย์ที่ต้องการลบ", "error");
      return;
    }
    setOnUploadProgress(0);

    const response: any = await Delete_Vets(accountId, setOnUploadProgress);
    if (response.success) {
      showToast("ลบข้อมูลสัตวแพทย์สําเร็จ", "success");
      await fetchVets();
      setSelectedAccountId("");
    } else {
      showToast("เกิดข้อผิดพลาดในการลบข้อมูล", "error");
    }
  };

  const handleConfirmDelete = () => {
    deleteVet(selectedAccountId);
  };

  // บันทึกข้อมูลสัตวแพทย์
  const submitVetForm = async (data: VetFormData) => {
    if (!data.prefix.trim()) {
      showToast("กรุณากรอกตำแหน่ง", "error");
      return;
    }
    if (!data.fname.trim()) {
      showToast("กรุณากรอกชื่อ", "error");
      return;
    }
    if (!data.lname.trim()) {
      showToast("กรุณากรอกนามสกุล", "error");
      return;
    }
    if (formMode === "add") {
      const newVet: CmuvcVet = {
        ...data,
        createAt: new Date().toISOString(),
        updateAt: null,
      };

      setOnUploadProgress(0);

      const response = await Cmuvc_Create_Vet_Router_CryptoJS(
        newVet,
        setOnUploadProgress,
      );

      if (response.success) {
        closeForm();
        await fetchVets();
        showToast("เพิ่มข้อมูลสำเร็จ", "success"); // Show success toast
      } else {
        showToast("ข้อผิดพลาดในการเพิ่มข้อมูล", "error"); // Show error toast
      }
    } else if (formMode === "edit" && currentVets) {
      setOnUploadProgress(0);
      const editVet: CmuvcVet = {
        ...currentVets,
        ...data,
        updateAt: new Date().toISOString(),
      };
      const response = await PutEditVetlist(editVet, setOnUploadProgress);

      if (response.success) {
        closeForm();
        await fetchVets();
        showToast("อัพเดทข้อมูลสำเร็จ", "success"); // Show success toast
      } else {
        showToast("เกิดข้อผิดพลาดในการอัพเดทข้อมูล", "error"); // Show error toast
      }
    }
  };

  return (
    <>
      <PermissionGuard submenuIdCode={SUB_MENU_ID} />
      <div className="bg-gray-50 min-h-screen p-4 md:p-6">
        <LoadingModal isOpen={isLoading} progress={onUploadProgress} />
        <ToastNotification
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />

        <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 mb-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <span className="material-symbols-outlined text-blue-600 text-3xl">
                    groups
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    รายชื่ออาจารย์และสัตวแพทย์
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                    <p className="text-gray-600 flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-gray-500 text-base">
                        description
                      </span>
                      จัดการข้อมูลผู้เข้าร่วมโครงการ
                    </p>
                    <p className="text-blue-700 flex items-center gap-2 text-sm font-medium bg-blue-50 px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined text-blue-600 text-base">
                        checklist
                      </span>
                      รายชื่อทั้งหมด: {filteredVet.length} คน
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ปุ่มเพิ่มข้อมูล (toggle dropdown) */}
            <button
              onClick={() => canCreate && toggleAddPanel()}
              disabled={!canCreate}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl min-w-[160px] justify-center ${
                canCreate
                  ? isAddOpen
                    ? "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                    : "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } transition-all duration-200`}
            >
              <span className="material-symbols-outlined">
                {isAddOpen ? "expand_less" : "add"}
              </span>
              <span className="font-medium">
                {canCreate
                  ? isAddOpen
                    ? "ปิดฟอร์ม"
                    : "เพิ่มข้อมูล"
                  : "ไม่มีสิทธิ์เพิ่มข้อมูล"}
              </span>
            </button>
          </div>

          {/* Dropdown เพิ่มข้อมูล (ใต้ Header Section) */}
          <AnimatePresence initial={false}>
            {isAddOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 md:p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-600 bg-blue-100 p-2 rounded-lg">
                        person_add
                      </span>
                      เพิ่มข้อมูลสัตวแพทย์
                    </h3>
                    <button
                      onClick={closeForm}
                      className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-white/60"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <VetForm
                    initialData={emptyVetForm}
                    submitLabel="เพิ่มข้อมูล"
                    submittingLabel="กำลังเพิ่มข้อมูล..."
                    onCancel={closeForm}
                    onSubmit={submitVetForm}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter Section */}
          <div className="bg-gray-50 p-4 rounded-xl mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ, นามสกุล หรือ accountId..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      บัญชีผู้ใช้
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      เลขใบอนุญาต
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVet.length > 0 ? (
                    filteredVet.map((vet) => (
                      <Fragment key={vet.accountId}>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-600 text-sm">
                                  person
                                </span>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-900">
                                  {vet.prefix} {vet.fname.trim()}{" "}
                                  {vet.lname.trim()}
                                </span>
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                  {vet.fname_EN || vet.lname_EN ? (
                                    <span className="text-sm text-gray-700">
                                      {(vet.fname_EN || "").trim()}{" "}
                                      {(vet.lname_EN || "").trim()}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400 italic">
                                      ยังไม่ได้ระบุ English Name
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                                vet.number_ce
                                  ? "bg-green-100 text-green-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              <span className="material-symbols-outlined text-xs">
                                {vet.number_ce ? "verified" : "report"}
                              </span>
                              {vet.number_ce ? vet.number_ce : "ยังไม่ได้ระบุ"}
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex flex-col items-end gap-3">
                              {/* ปุ่มจัดการ (ไม่มี animation) */}
                              <div className="flex justify-end gap-2">
                                {selectedAccountId === vet.accountId ? (
                                  <>
                                    <button
                                      onClick={handleConfirmDelete}
                                      className="flex items-center gap-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-base">
                                        delete_forever
                                      </span>
                                      <span className="text-sm">ยืนยันลบ</span>
                                    </button>

                                    <button
                                      onClick={handleCancelDelete}
                                      className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-base">
                                        close
                                      </span>
                                      <span className="text-sm">ยกเลิก</span>
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() =>
                                        canEdit && toggleEditPanel(vet)
                                      }
                                      disabled={!canEdit}
                                      className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                                        canEdit
                                          ? editingAccountId === vet.accountId
                                            ? "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                                            : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      } transition-colors`}
                                    >
                                      <span className="material-symbols-outlined text-base">
                                        {!canEdit
                                          ? "edit_off"
                                          : editingAccountId === vet.accountId
                                            ? "expand_less"
                                            : "edit"}
                                      </span>
                                      <span className="text-sm">
                                        {canEdit
                                          ? editingAccountId === vet.accountId
                                            ? "ปิดฟอร์ม"
                                            : "แก้ไข"
                                          : "ไม่มีสิทธิ์"}
                                      </span>
                                    </button>

                                    <button
                                      onClick={() =>
                                        canDelete &&
                                        handleDeleteClick(vet.accountId)
                                      }
                                      disabled={!canDelete}
                                      className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                                        canDelete
                                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      } transition-colors`}
                                    >
                                      <span className="material-symbols-outlined text-base">
                                        {canDelete ? "delete" : "block"}
                                      </span>
                                      <span className="text-sm">
                                        {canDelete ? "ลบ" : "ไม่มีสิทธิ์ลบ"}
                                      </span>
                                    </button>
                                  </>
                                )}
                              </div>

                              {/* แสดงเวลาอัปเดต */}
                              <div className="flex justify-end gap-2 text-xs text-gray-400">
                                {vet.updateAt ? (
                                  <div className="inline-flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">
                                      schedule
                                    </span>
                                    <span
                                      className={
                                        dayjs(vet.updateAt).isSame(
                                          dayjs().startOf("day"),
                                          "day",
                                        )
                                          ? "text-green-600"
                                          : "text-amber-600"
                                      }
                                    >
                                      {dayjs(vet.updateAt).isSame(
                                        dayjs().startOf("day"),
                                        "day",
                                      )
                                        ? `วันนี้ ${dayjs(vet.updateAt).format(
                                            "HH:mm",
                                          )}`
                                        : dayjs(vet.updateAt).format(
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
                            </div>
                          </td>
                        </tr>
                        <AnimatePresence initial={false}>
                          {editingAccountId === vet.accountId && (
                            <motion.tr
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <td
                                colSpan={4}
                                className="p-0 bg-blue-50/60 border-t border-blue-100"
                              >
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    duration: 0.25,
                                    ease: "easeInOut",
                                  }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-5 md:p-6 space-y-6">
                                    <div className="flex items-center justify-between">
                                      <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-600 bg-blue-100 p-1.5 rounded-lg text-lg">
                                          edit
                                        </span>
                                        แก้ไขข้อมูลสัตวแพทย์
                                      </h3>
                                      <button
                                        onClick={closeForm}
                                        className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-white/60"
                                      >
                                        <span className="material-symbols-outlined">
                                          close
                                        </span>
                                      </button>
                                    </div>

                                    <VetForm
                                      initialData={vetToFormData(vet)}
                                      submitLabel="อัปเดตข้อมูล"
                                      submittingLabel="กำลังอัปเดตข้อมูล..."
                                      onCancel={closeForm}
                                      onSubmit={submitVetForm}
                                    />
                                  </div>
                                </motion.div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                          <span className="material-symbols-outlined text-5xl mb-4 opacity-50">
                            search_off
                          </span>
                          <p className="text-lg font-medium text-gray-500 mb-1">
                            ไม่พบข้อมูลผู้เข้าร่วม
                          </p>
                          <p className="text-sm">
                            ลองเปลี่ยนคำค้นหาหรือตรวจสอบข้อมูลอีกครั้ง
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
