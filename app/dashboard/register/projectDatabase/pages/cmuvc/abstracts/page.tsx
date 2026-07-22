"use client";
import { AbstractDataModel } from "@/app/model/cmuvc/abstractModel";
import {
  fetchDataListAbstractUser,
  getAdstractType,
  getFoods,
} from "@/app/routers/cmuvc/GetRouter";
import {
  ModalEditAbstract,
  ModalEditFileAbstract,
} from "@/components/(CMUVC)/cmuvc_Modal";
import ThaiYearPicker from "@/components/ThaiYearPicker";
import { useEffect, useRef, useState } from "react";
import ExportMenu from "@/utils/ExportOptions";
import PermissionGuard from "@/components/Guards/PermissionGuard";
import { useVisitor } from "@/lib/fingerprintjs-shim";
import { toast } from "react-toastify";
import { usePermission } from "@/app/context/UsePermission";
import { ConfirmModal } from "@/components/ConfirmModal/ConfirmModal";
import { Delete_Abstract } from "@/app/routers/cmuvc/DeleteRouter";
import { LoadingModal } from "@/components/Modal";

const SUB_MENU_ID = "1c5ffa3b-3c71-4986-a87f-5987ab4ed248";

export default function AbstractsPage() {
  const { data } = useVisitor({ extendedResult: true });
  const [selectedYear, setSelectedYear] = useState<Date | null>(new Date());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState<boolean>(false);
  const [abstractData, setAbstractData] = useState<AbstractDataModel[]>([]);
  const [abstractId, setAbstractId] = useState<string | undefined>("");
  const [onChangeFileAbstract, setOnChangeFileAbstract] =
    useState<AbstractDataModel>();

  const [isModalFileOpen, setIsModalFileOpen] = useState<boolean>(false);
  const [onUploadProgress, setOnUploadProgress] = useState<number>(0);

  const [foods, setFoods] = useState<any[] | undefined>();
  const [abstractType, setAbstractType] = useState<any[] | undefined>();

  const hasData = useRef(false);
  const visitorId = data?.visitorId ?? "";

  const { canView, canCreate, canEdit, canDelete } = usePermission(SUB_MENU_ID);

  const fetchFoods = async (): Promise<void> => {
    const data = await getFoods();
    if (data !== undefined) {
      setFoods(data);
    }
  };

  const fetchAbstractType = async (): Promise<void> => {
    const data = await getAdstractType(); // แก้ไขจาก getAdstractType
    if (data !== undefined) {
      setAbstractType(data);
    }
  };

  const fetchData = async (date: Date) => {
    setIsLoading(true);
    try {
      if (date !== null) {
        const response: any = await fetchDataListAbstractUser(date);
        if (response.success) {
          setAbstractData(response.result);
        }
      } else {
        toast.error("กรุณาเลือกปี");
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  // รวม useEffect เป็นอันเดียว
  useEffect(() => {
    if (!hasData.current) {
      fetchData(selectedYear || new Date());
      hasData.current = true;
    } else if (isUpdated) {
      fetchData(selectedYear || new Date());
      setIsUpdated(false);
    }
  }, [isUpdated, selectedYear]);

  const handerChangeYear = async (date: Date) => {
    setSelectedYear(date);
    await fetchData(date || new Date());
  };

  const handleViewFile = (abstract: AbstractDataModel) => {
    setOnChangeFileAbstract(abstract);
    setIsModalFileOpen(true);
  };

  const handleEditAbstract = async (abstract: AbstractDataModel) => {
    await fetchFoods();
    await fetchAbstractType();
    setOnChangeFileAbstract(abstract);
    setIsModalOpen(true);
  };

  const handleDeleteAbstractOpen = async (abstractId: string) => {
    setAbstractId(abstractId);
    setIsModalConfirmOpen(true);
  };

  const handleDeleteAbstract = async () => {
    if (!abstractId) return toast.error("ID ไม่ถูกต้อง");

    setIsLoading(true);
    setOnUploadProgress(0);

    try {
      const response = await Delete_Abstract(
        abstractId,
        visitorId,
        setOnUploadProgress,
      );

      if (!response.success)
        return toast.error("Message: เกิดข้อผิดพลาดในการลบข้อมูล");

      setIsModalConfirmOpen(false);
      await fetchData(selectedYear || new Date());
      setIsLoading(false);
      toast.success(`ลบข้อมูลสําเร็จ`);
    } catch (error: any) {
      toast.error(`Error message: ${error?.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = abstractData.filter((user: any) => {
    const matchesSearch = Object.values(user).some(
      (val: any) =>
        val &&
        typeof val === "string" &&
        val.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    return matchesSearch;
  });

  const totalPaidStudents = filteredUsers?.filter(
    (s) => s.statusAbstract === "Accepted",
  ).length;

  const totalPendingStudents = filteredUsers?.filter(
    (s) => s.statusAbstract === "Pending",
  ).length;

  return (
    <>
      <PermissionGuard submenuIdCode={SUB_MENU_ID} />
      <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-50 min-h-screen">
        <ConfirmModal
          isOpen={isModalConfirmOpen}
          onClose={() => setIsModalConfirmOpen(false)}
          onConfirm={handleDeleteAbstract}
          title="ยืนยันการลบข้อมูล"
          message="ข้อมูลที่ถูกลบจะไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่?"
          confirmText="ลบข้อมูล"
          confirmColor="red"
          cancelText="ยกเลิก"
          icon="warning"
        />

        <ModalEditAbstract
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="แก้ไขข้อมูลนำเสนอผลงาน"
          formData={onChangeFileAbstract ?? ({} as any)}
          foodsData={foods ?? ({} as any)}
          abstractTypeData={abstractType ?? ({} as any)}
          onSave={() => {}}
          onSuccess={() => setIsUpdated(true)}
        />

        {isModalFileOpen && (
          <ModalEditFileAbstract
            isOpen={isModalFileOpen}
            onClose={() => setIsModalFileOpen(false)}
            title="ตรวจสอบเอกสาร & แก้ไขเอกสาร"
            formData={onChangeFileAbstract ?? ({} as any)}
            onSave={() => {}}
            onSuccess={() => setIsUpdated(true)}
          />
        )}

        <LoadingModal isOpen={isLoading} progress={onUploadProgress} />

        {/* Header with Guidance */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 transition-colors duration-300">
              <span className="material-symbols-rounded text-3xl">
                assessment
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                Abstracts
                <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  New
                </span>
              </h1>
              <p className="text-sm text-gray-600 mb-4">
                Manage and review abstract submissions for CMUVC 2025.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <span className="material-symbols-rounded text-blue-500 bg-blue-50 p-2 rounded-lg text-3xl">
                  groups
                </span>
                <span>
                  รายชื่อผู้ส่งเอกสารนำเสนอผลงาน
                  <span className="ml-2 text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full align-middle">
                    Updated
                  </span>
                </span>
              </h2>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Year Picker */}
              <div className="relative w-full sm:w-60 mr-3">
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
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
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
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                  >
                    <span className="material-symbols-rounded text-gray-400 hover:text-gray-600">
                      close
                    </span>
                  </button>
                )}
              </div>

              {/* Export Button */}
              <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => canView && canCreate && setIsOpen(!isOpen)}
                  className={`${
                    canView && canCreate
                      ? "bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                      : "pointer-events-none text-gray-500"
                  } shadow-sm w-full sm:w-auto flex items-center gap-1 px-4 py-2.5 hover:scale-105 transition-all`}
                >
                  <span className="material-symbols-outlined">
                    {canView && canCreate ? "download" : "lock"}
                  </span>
                  <span>
                    {canView && canCreate ? "ส่งออกข้อมูล" : "ไม่สามารถส่งออก"}
                  </span>
                </button>

                {isOpen && (
                  <div className="absolute right-0 z-40 mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-gray-100 overflow-hidden animate-scaleIn">
                    <div className="py-1">
                      <ExportMenu
                        exportData={abstractData}
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Box */}
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
                  แก้ไขข้อมูลไฟล์เอกสาร ข้อมูลส่วนตัว
                  และเปลี่ยนวิธีการนำเสนอผลงาน
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-200 rounded-full opacity-20"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-emerald-100 rounded-lg shadow-inner">
                  <span className="material-symbols-outlined text-emerald-600 text-2xl">
                    check_circle
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-emerald-800">
                    สำเร็จ
                  </h3>
                  <p className="mt-1 text-3xl font-bold text-emerald-900">
                    {totalPaidStudents}
                    <span className="text-base font-normal ml-1">บทความ</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-200 rounded-full opacity-20"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-amber-100 rounded-lg shadow-inner">
                  <span className="material-symbols-outlined text-amber-600 text-2xl">
                    pending
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-amber-800">
                    รอตรวจสอบ
                  </h3>
                  <p className="mt-1 text-3xl font-bold text-amber-900">
                    {totalPendingStudents}
                    <span className="text-base font-normal ml-1">บทความ</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-xl border border-cyan-100 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-cyan-200 rounded-full opacity-20"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-cyan-100 rounded-lg shadow-inner">
                  <span className="material-symbols-outlined text-cyan-600 text-2xl">
                    attach_file
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-cyan-800">ทั้งหมด</h3>
                  <p className="mt-1 text-3xl font-bold text-cyan-900">
                    {filteredUsers?.length}
                    <span className="text-base font-normal ml-1">บทความ</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="material-symbols-rounded text-4xl text-blue-500 animate-spin mb-3">
                progress_activity
              </span>
              <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead
                  className={`bg-gradient-to-r from-blue-50 to-blue-100 hidden md:table-header-group`}
                >
                  <tr>
                    {[
                      {
                        key: "ผู้นำเสนอผลงาน",
                        label: "ผู้นำเสนอผลงาน",
                        icon: "summarize",
                      },
                      {
                        key: "ประเภท",
                        label: "ประเภท",
                        icon: "unknown_document",
                      },

                      { key: "สถานะ", label: "สถานะ", icon: "priority_high" },
                      {
                        key: "ตรวจเอกสาร",
                        label: "ตรวจเอกสาร",
                        icon: "description",
                      },
                      { key: "แก้ไข", label: "แก้ไข", icon: "edit_note" },
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
                {filteredUsers?.length === 0 ? (
                  <tbody>
                    <tr>
                      <td colSpan={6} className="py-16">
                        <div className="flex flex-col items-center justify-center text-center">
                          <span className="material-symbols-rounded text-5xl text-blue-400/70 mb-4">
                            search_off
                          </span>
                          <p className="text-gray-500 font-medium">
                            ไม่พบข้อมูลผู้ลงทะเบียน
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                ) : (
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers?.map((user: any, index: number) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50/40 transition-all duration-200 even:bg-gray-50/30"
                      >
                        {/* User Info */}
                        <td className="py-5 pl-6 pr-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-blue-700 font-semibold text-sm shadow-sm">
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 text-gray-900 font-medium">
                                <span className="material-symbols-rounded text-blue-500 text-base">
                                  account_circle
                                </span>
                                {user.fname} {user.lname}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                <span className="material-symbols-rounded text-gray-400 text-sm">
                                  title
                                </span>
                                {user.titleAbstarct ?? "ไม่มีข้อมูล"}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span className="material-symbols-rounded text-gray-400 text-sm">
                                  email
                                </span>
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Abstract Type */}
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-2 text-gray-700">
                            <span className="material-symbols-rounded text-blue-400 text-lg">
                              description
                            </span>
                            <span className="text-sm">
                              {user.abstractType.adstractType ?? "ไม่มีข้อมูล"}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-rounded text-lg">
                              {user.statusAbstract === "Pending"
                                ? "pending"
                                : user.statusAbstract === "Accepted"
                                  ? "check_circle"
                                  : "cancel"}
                            </span>
                            <span
                              className={`text-sm font-medium px-2.5 py-1 rounded-full ${
                                user.statusAbstract === "Pending"
                                  ? "bg-amber-100 text-amber-800"
                                  : user.statusAbstract === "Accepted"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.statusAbstract}
                            </span>
                          </div>
                        </td>

                        {/* View File Button */}
                        <td className="px-4 py-5">
                          <button
                            onClick={() => canView && handleViewFile(user)}
                            disabled={!canView}
                            className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                              canView
                                ? "text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 cursor-pointer"
                                : "text-gray-400 bg-gray-100 cursor-not-allowed"
                            }`}
                          >
                            <span
                              className={`material-symbols-rounded transition-transform duration-200 ${
                                canView ? "group-hover:scale-110" : ""
                              }`}
                            >
                              {canView ? "description" : "lock"}
                            </span>
                            <span>{canView ? "View" : "Locked"}</span>
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="px-4 py-5">
                          <div className="flex flex-col gap-2">
                            {/* Edit Button */}
                            <button
                              onClick={() =>
                                canEdit && handleEditAbstract(user)
                              }
                              disabled={!canEdit}
                              className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                                canEdit
                                  ? "text-green-600 bg-green-50 hover:bg-green-100 hover:text-green-700 cursor-pointer"
                                  : "text-gray-400 bg-gray-100 cursor-not-allowed"
                              }`}
                            >
                              <span
                                className={`material-symbols-rounded transition-transform duration-200 ${
                                  canEdit ? "group-hover:scale-110" : ""
                                }`}
                              >
                                {canEdit ? "edit" : "lock"}
                              </span>
                              <span>{canEdit ? "Edit" : "Locked"}</span>
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() =>
                                canDelete &&
                                handleDeleteAbstractOpen(user.abstractId)
                              }
                              disabled={!canDelete}
                              className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                                canDelete
                                  ? "text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 cursor-pointer"
                                  : "text-gray-400 bg-gray-100 cursor-not-allowed"
                              }`}
                            >
                              <span
                                className={`material-symbols-rounded transition-transform duration-200 ${
                                  canDelete ? "group-hover:scale-110" : ""
                                }`}
                              >
                                {canDelete ? "delete" : "lock"}
                              </span>
                              <span>{canDelete ? "Delete" : "Locked"}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
