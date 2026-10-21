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
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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

  const inputClass =
    "w-full rounded-xl border border-[#d8e0da] bg-white px-4 py-2.5 text-sm text-[#243a32] outline-none transition placeholder:text-[#9aa8a0] focus:border-[#32745d] focus:ring-4 focus:ring-[#32745d]/10 disabled:cursor-not-allowed disabled:bg-gray-100";
  const labelClass = "mb-1.5 block text-sm font-medium text-[#42544b]";

  return (
    <>
      <fieldset
        disabled={isSubmitting}
        className="space-y-6 disabled:opacity-60 transition-opacity"
      >
        <div>
          <label className={labelClass}>
            ตำแหน่ง{" "}
            <span className="font-normal text-[#94a39a]">
              (เช่น ศ. / รศ. / ผศ. / ดร.)
            </span>{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="prefix"
            value={data.prefix}
            onChange={handleChange}
            className={inputClass}
            placeholder="ระบุตำแหน่ง"
          />
        </div>

        {/* ชื่อ-นามสกุล ภาษาไทย */}
        <div className="space-y-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#718078]">
            <span className="material-symbols-outlined text-sm">translate</span>
            ชื่อ-นามสกุล (ภาษาไทย) <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>ชื่อ</label>
              <input
                type="text"
                name="fname"
                value={data.fname}
                onChange={handleChange}
                className={inputClass}
                placeholder="ชื่อ"
              />
            </div>
            <div>
              <label className={labelClass}>นามสกุล</label>
              <input
                type="text"
                name="lname"
                value={data.lname}
                onChange={handleChange}
                className={inputClass}
                placeholder="นามสกุล"
              />
            </div>
          </div>
        </div>

        {/* ชื่อ-นามสกุล ภาษาอังกฤษ */}
        <div className="space-y-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#718078]">
            <span className="material-symbols-outlined text-sm">language</span>
            ชื่อ-นามสกุล (ภาษาอังกฤษ)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                name="fname_EN"
                value={data.fname_EN}
                onChange={handleChange}
                className={inputClass}
                placeholder="First Name"
              />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                name="lname_EN"
                value={data.lname_EN}
                onChange={handleChange}
                className={inputClass}
                placeholder="Last Name"
              />
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>เลขใบอนุญาต</label>
          <input
            type="text"
            name="number_ce"
            value={data.number_ce}
            onChange={handleChange}
            className={inputClass}
            placeholder="ระบุเลขใบอนุญาต"
          />
        </div>
      </fieldset>

      <div className="flex justify-end gap-2 border-t border-[#e4e9e4] pt-4">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-[#d8e0da] bg-white px-5 text-sm font-semibold text-[#52645b] transition hover:bg-[#f4f6f4] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-base">close</span>
          ยกเลิก
        </button>
        <button
          onClick={handleSubmitClick}
          disabled={isSubmitting}
          className="inline-flex h-11 min-w-[140px] items-center justify-center gap-1.5 rounded-xl bg-[#176b56] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125844] disabled:cursor-not-allowed disabled:opacity-70"
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

      if (!vet.number_ce) return false; // ป้องกัน null/undefined

      const fullName = `${vet.fname.trim()} ${vet.lname.trim()}`.toLowerCase();
      const fname = vet.fname.toLowerCase();
      const lname = vet.lname.toLowerCase();
      const ce = vet.number_ce.toLocaleString();

      return (
        fname.includes(term) || lname.includes(term) || fullName.includes(term) || ce.includes(term)
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

  const handleExportExcel = async () => {
    if (!canView || filteredVet.length === 0) {
      showToast("ไม่มีข้อมูลสำหรับส่งออก", "warning");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const toExcelDate = (value: string | null) => {
        if (!value) return "";
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "" : date;
      };
      const worksheet = workbook.addWorksheet("รายชื่อสัตวแพทย์", {
        properties: { tabColor: { argb: "FF2563EB" } },
        pageSetup: {
          paperSize: 9,
          orientation: "landscape",
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
        },
      });
      const columns = [
        { name: "รหัสบัญชี", width: 22 },
        { name: "คำนำหน้า", width: 16 },
        { name: "ชื่อ", width: 20 },
        { name: "นามสกุล", width: 22 },
        { name: "ชื่อภาษาอังกฤษ", width: 24 },
        { name: "นามสกุลภาษาอังกฤษ", width: 26 },
        { name: "เลขใบอนุญาต", width: 20 },
        { name: "วันที่สร้างข้อมูล", width: 22 },
        { name: "วันที่แก้ไขข้อมูล", width: 22 },
      ];
      const rows = filteredVet.map((vet) => [
        String(vet.accountId ?? ""),
        vet.prefix ?? "",
        vet.fname ?? "",
        vet.lname ?? "",
        vet.fname_EN ?? "",
        vet.lname_EN ?? "",
        vet.number_ce?.toString() ?? "",
        toExcelDate(vet.createAt),
        toExcelDate(vet.updateAt),
      ]);

      worksheet.addTable({
        name: "VetList",
        ref: "A1",
        headerRow: true,
        totalsRow: false,
        style: {
          theme: "TableStyleMedium2",
          showRowStripes: true,
          showColumnStripes: false,
        },
        columns: columns.map(({ name }) => ({ name, filterButton: true })),
        rows,
      });

      columns.forEach((column, index) => {
        worksheet.getColumn(index + 1).width = column.width;
      });
      worksheet.views = [{ state: "frozen", ySplit: 1 }];
      worksheet.getRow(1).height = 30;
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { name: "Tahoma", bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF1E3A8A" },
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
      });

      worksheet.getColumn(7).alignment = { horizontal: "left" };
      [8, 9].forEach((columnIndex) => {
        worksheet.getColumn(columnIndex).numFmt = "dd/mm/yyyy hh:mm";
        worksheet.getColumn(columnIndex).alignment = { horizontal: "center" };
      });
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.font = { name: "Tahoma" };
        }
      });
      worksheet.pageSetup.printTitlesRow = "1:1";

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const exportDate = new Date().toISOString().slice(0, 10);
      saveAs(blob, `vet-list_${exportDate}.xlsx`);
      showToast("ส่งออกไฟล์ Excel สำเร็จ", "success");
    } catch {
      showToast("ไม่สามารถส่งออกไฟล์ Excel ได้ กรุณาลองใหม่อีกครั้ง", "error");
    }
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
      <div>
        <LoadingModal isOpen={isLoading} progress={onUploadProgress} />
        <ToastNotification
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />

        <div className="rounded-2xl border border-[#e4e9e4] bg-white p-5 shadow-[0_8px_30px_-24px_rgba(30,54,46,0.45)] md:p-6">
          {/* Header Section */}
          <div className="mb-6 flex flex-col gap-4 border-b border-[#eef1ee] pb-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#176b56] text-white shadow-sm">
                <span className="material-symbols-outlined text-2xl">
                  stethoscope
                </span>
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-[#243a32] md:text-2xl">
                  รายชื่ออาจารย์และสัตวแพทย์
                </h1>
                <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-[#718078]">
                  จัดการข้อมูลผู้เข้าร่วมโครงการ
                  <span className="rounded-full bg-[#e8f2ed] px-2.5 py-0.5 text-xs font-semibold text-[#176b56]">
                    ทั้งหมด {filteredVet.length.toLocaleString("th-TH")} คน
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportExcel}
                disabled={!canView || filteredVet.length === 0}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-[#c8d8cf] bg-white px-4 text-sm font-semibold text-[#176b56] transition hover:bg-[#edf5f0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#176b56]/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">
                  download
                </span>
                ส่งออก Excel
              </button>

              {/* ปุ่มเพิ่มข้อมูล (toggle dropdown) */}
              <button
                onClick={() => canCreate && toggleAddPanel()}
                disabled={!canCreate}
                className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#176b56] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125844] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#176b56]/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-lg">
                  {isAddOpen ? "expand_less" : "person_add"}
                </span>
                {canCreate
                  ? isAddOpen
                    ? "ปิดฟอร์ม"
                    : "เพิ่มข้อมูล"
                  : "ไม่มีสิทธิ์เพิ่มข้อมูล"}
              </button>
            </div>
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
                <div className="rounded-2xl border border-[#cfe2d6] bg-[#f0f7f3] p-5 md:p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-[#243a32]">
                      <span className="material-symbols-outlined rounded-lg bg-[#dcebe2] p-2 text-[#176b56]">
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
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xl text-[#94a39a]">
                search
              </span>
              <input
                type="search"
                placeholder="ค้นหาชื่อ, นามสกุล หรือเลขใบอนุญาต..."
                aria-label="ค้นหารายชื่อสัตวแพทย์"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl border border-[#d8e0da] bg-[#fbfcfa] pl-10 pr-3 text-sm text-[#243a32] outline-none transition placeholder:text-[#9aa8a0] focus:border-[#32745d] focus:ring-4 focus:ring-[#32745d]/10"
              />
            </div>
            <p className="text-xs tabular-nums text-[#718078]">
              แสดง {filteredVet.length.toLocaleString("th-TH")} จาก{" "}
              {vets.length.toLocaleString("th-TH")} คน
            </p>
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden border border-[#e4e9e4]">
            <div className="max-h-[600px] overflow-auto">
              <table className="min-w-full divide-y divide-[#edf0ed]">
                <thead className="sticky top-0 z-10 bg-[#f6f8f5] shadow-[0_1px_0_#e4e9e4]">
                  <tr>
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-left text-xs font-semibold text-[#52645b]"
                    >
                      ชื่อ-นามสกุล
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-left text-xs font-semibold text-[#52645b]"
                    >
                      เลขใบอนุญาต
                    </th>
                    <th
                      scope="col"
                      className="px-5 py-3.5 text-right text-xs font-semibold text-[#52645b]"
                    >
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#edf0ed]">
                  {filteredVet.length > 0 ? (
                    filteredVet.map((vet) => (
                      <Fragment key={vet.accountId}>
                        <tr className="transition-colors hover:bg-[#f9fbf9]">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8f2ed] text-sm font-semibold text-[#176b56]">
                                {vet.fname.trim().charAt(0) || "?"}
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

                          <td className="px-5 py-4 whitespace-nowrap">
                            <div
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                vet.number_ce
                                  ? "bg-[#e8f4ed] text-[#18794e]"
                                  : "bg-[#f4efe5] text-[#8a6a33]"
                              }`}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {vet.number_ce ? "verified" : "report"}
                              </span>
                              {vet.number_ce ? vet.number_ce : "ยังไม่ได้ระบุ"}
                            </div>
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap text-right">
                            <div className="flex flex-col items-end gap-3">
                              {/* ปุ่มจัดการ (ไม่มี animation) */}
                              <div className="flex justify-end gap-2">
                                {selectedAccountId === vet.accountId ? (
                                  <>
                                    <button
                                      onClick={handleConfirmDelete}
                                      className="flex items-center gap-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                                    >
                                      <span className="material-symbols-outlined text-base">
                                        delete_forever
                                      </span>
                                      ยืนยันลบ
                                    </button>

                                    <button
                                      onClick={handleCancelDelete}
                                      className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                                    >
                                      <span className="material-symbols-outlined text-base">
                                        close
                                      </span>
                                      ยกเลิก
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() =>
                                        canEdit && toggleEditPanel(vet)
                                      }
                                      disabled={!canEdit}
                                      className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                                        canEdit
                                          ? editingAccountId === vet.accountId
                                            ? "border border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            : "bg-[#e8f2ed] text-[#125844] hover:bg-[#dcebe2]"
                                          : "cursor-not-allowed bg-gray-100 text-gray-400"
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-base">
                                        {!canEdit
                                          ? "edit_off"
                                          : editingAccountId === vet.accountId
                                            ? "expand_less"
                                            : "edit"}
                                      </span>
                                      {canEdit
                                        ? editingAccountId === vet.accountId
                                          ? "ปิดฟอร์ม"
                                          : "แก้ไข"
                                        : "ไม่มีสิทธิ์"}
                                    </button>

                                    <button
                                      onClick={() =>
                                        canDelete &&
                                        handleDeleteClick(vet.accountId)
                                      }
                                      disabled={!canDelete}
                                      className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                                        canDelete
                                          ? "bg-red-50 text-red-700 hover:bg-red-100"
                                          : "cursor-not-allowed bg-gray-100 text-gray-400"
                                      }`}
                                    >
                                      <span className="material-symbols-outlined text-base">
                                        {canDelete ? "delete" : "block"}
                                      </span>
                                      {canDelete ? "ลบ" : "ไม่มีสิทธิ์ลบ"}
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
                                className="border-t border-[#d8e6dd] bg-[#f0f7f3] p-0"
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
                                      <h3 className="flex items-center gap-2 text-base font-semibold text-[#243a32]">
                                        <span className="material-symbols-outlined rounded-lg bg-[#dcebe2] p-1.5 text-lg text-[#176b56]">
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
                        <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                          <span className="material-symbols-outlined mb-4 text-5xl text-[#c3ccc5]">
                            search_off
                          </span>
                          <p className="mb-1 text-sm font-semibold text-[#34483e]">
                            ไม่พบข้อมูลผู้เข้าร่วม
                          </p>
                          <p className="text-xs text-[#718078]">
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
