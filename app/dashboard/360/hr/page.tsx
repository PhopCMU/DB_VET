"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@/app/model/360/userModel";
import { fetchDataListUser, encryptPayload } from "@/app/routers/360/GetRouter";
import Swal from "sweetalert2";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  X,
  Save,
  Upload,
  User as UserIcon,
  Users,
  Briefcase,
  Building,
  Mail,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { config } from "@/config/config_api";
import { createDataUser, updateDataUser } from "@/app/routers/360/PostRouter";
import { deleteDataUser } from "@/app/routers/360/DeleteRouter";

type StatusFilter = "all" | "active" | "inactive";

// Prevents XSS via injected imageprofile values
function safeImageUrl(base: string, path: unknown): string | undefined {
  if (typeof path !== "string" || !path) return undefined;
  if (/^(data:|javascript:|\/\/)/i.test(path)) return undefined;
  return base + path;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "-";
  }
}

// API call wrapper - throws error on failure
const fetchUsers = async (): Promise<{ success: boolean; data: User[] }> => {
  const resp = await fetchDataListUser();
  if (!resp.success) {
    throw new Error(resp.message || "Failed to fetch users.");
  }
  return { success: true, data: Array.isArray(resp.data) ? resp.data : [] };
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Multi-filter states
  const [nameQuery, setNameQuery] = useState("");
  const [positionQuery, setPositionQuery] = useState("");
  const [deptQuery, setDeptQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Debounced values
  const [debouncedName, setDebouncedName] = useState("");
  const [debouncedPosition, setDebouncedPosition] = useState("");
  const [debouncedDept, setDebouncedDept] = useState("");

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const h = setTimeout(() => setDebouncedName(nameQuery), 300);
    return () => clearTimeout(h);
  }, [nameQuery]);

  useEffect(() => {
    const h = setTimeout(() => setDebouncedPosition(positionQuery), 300);
    return () => clearTimeout(h);
  }, [positionQuery]);

  useEffect(() => {
    const h = setTimeout(() => setDebouncedDept(deptQuery), 300);
    return () => clearTimeout(h);
  }, [deptQuery]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetchUsers();
      setUsers(response.data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "ไม่สามารถโหลดข้อมูลได้",
        text:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง",
        background: "#1f2937",
        color: "#fff",
      });
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenModal = (user: User | null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleSaveUser = async (formData: User) => {
    try {
      const { imageprofile, ...userData } = formData;
      const encryptedData = encryptPayload(userData);
      const formDataToSend = new FormData();

      if (selectedUser?.accountId) {
        formDataToSend.append("accountId", selectedUser.accountId);
      }
      formDataToSend.append("encryptedData", encryptedData);

      if (imageprofile instanceof File) {
        formDataToSend.append("file", imageprofile);
      }

      const response = selectedUser
        ? await updateDataUser(formDataToSend)
        : await createDataUser(formDataToSend);

      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: selectedUser ? "อัปเดตข้อมูลสำเร็จ" : "เพิ่มบุคลากรสำเร็จ",
          timer: 2000,
          showConfirmButton: false,
          background: "#1f2937",
          color: "#fff",
        });
        loadUsers();
        handleCloseModal();
      } else {
        throw new Error(response.message || "Operation failed");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text:
          error instanceof Error ? error.message : "ไม่สามารถบันทึกข้อมูลได้",
        background: "#1f2937",
        color: "#fff",
      });
    }
  };

  const handleDeleteUser = async (userId: string, fullname: string) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ",
      html: `คุณต้องการลบบุคลากร <strong>${fullname || userId}</strong> ใช่หรือไม่?<br/><small>การกระทำนี้ไม่สามารถย้อนกลับได้</small>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      try {
        const response = await deleteDataUser(userId);
        if (response.success) {
          Swal.fire({
            title: "ลบสำเร็จ",
            text: `ลบ ${fullname} เรียบร้อยแล้ว`,
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
            background: "#1f2937",
            color: "#fff",
          });
          loadUsers();
        } else {
          throw new Error(response.message || "Failed to delete user.");
        }
      } catch (error) {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: error instanceof Error ? error.message : "ไม่สามารถลบข้อมูลได้",
          icon: "error",
          background: "#1f2937",
          color: "#fff",
        });
      }
    }
  };

  // AND-logic multi-filter (memoised for performance)
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const name = debouncedName.toLowerCase();
      const pos = debouncedPosition.toLowerCase();
      const dept = debouncedDept.toLowerCase();

      if (name) {
        const match =
          (user.fullname_th?.toLowerCase().includes(name) ?? false) ||
          (user.nickname?.toLowerCase().includes(name) ?? false) ||
          (user.fullname_en?.toLowerCase().includes(name) ?? false);
        if (!match) return false;
      }

      if (pos) {
        if (!(user.positiontitle_th?.toLowerCase().includes(pos) ?? false))
          return false;
      }

      if (dept) {
        const match =
          (user.level1agency_th?.toLowerCase().includes(dept) ?? false) ||
          (user.level2agency_th?.toLowerCase().includes(dept) ?? false) ||
          (user.level3agency_th?.toLowerCase().includes(dept) ?? false);
        if (!match) return false;
      }

      if (statusFilter === "active" && !user.workingstatus) return false;
      if (statusFilter === "inactive" && user.workingstatus) return false;

      return true;
    });
  }, [users, debouncedName, debouncedPosition, debouncedDept, statusFilter]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedName, debouncedPosition, debouncedDept, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const currentItems = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const paginate = (p: number) => setCurrentPage(p);
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const clearFilters = () => {
    setNameQuery("");
    setPositionQuery("");
    setDeptQuery("");
    setStatusFilter("all");
  };

  const hasActiveFilters =
    !!nameQuery || !!positionQuery || !!deptQuery || statusFilter !== "all";

  // Latest updatedAt across all records
  const latestUpdated = useMemo(() => {
    if (!users.length) return null;
    return (
      [...users].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )[0]?.updatedAt ?? null
    );
  }, [users]);

  // Active filter chips
  const activeChips: { label: string; onRemove: () => void }[] = [];
  if (nameQuery)
    activeChips.push({
      label: `ชื่อ: ${nameQuery}`,
      onRemove: () => setNameQuery(""),
    });
  if (positionQuery)
    activeChips.push({
      label: `ตำแหน่ง: ${positionQuery}`,
      onRemove: () => setPositionQuery(""),
    });
  if (deptQuery)
    activeChips.push({
      label: `หน่วยงาน: ${deptQuery}`,
      onRemove: () => setDeptQuery(""),
    });
  if (statusFilter !== "all")
    activeChips.push({
      label: statusFilter === "active" ? "สถานะ: Active" : "สถานะ: Inactive",
      onRemove: () => setStatusFilter("all"),
    });

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="w-full mx-auto">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-6 flex flex-wrap gap-4 justify-between items-start">
          {/* Title block */}
          <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg shadow-blue-500/30">
                <Users className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  รายชื่อบุคลากร
                </h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  <p
                    className="text-sm text-gray-500 flex items-center gap-1.5"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    <span
                      className="w-1.5 h-1.5 bg-blue-500 rounded-full"
                      aria-hidden="true"
                    />
                    แสดงผล:{" "}
                    <span className="font-semibold text-gray-700">
                      {filteredUsers.length}
                    </span>{" "}
                    รายการ
                  </p>
                  {latestUpdated && (
                    <p className="text-sm text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      อัปเดตล่าสุด: {formatDate(latestUpdated)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Create button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleOpenModal(null)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all duration-200 flex items-center gap-2 font-medium"
          >
            <Plus size={20} aria-hidden="true" />+ Create
          </motion.button>
        </div>

        {/* ── Filter Bar ────────────────────────────────────── */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* (A) Name */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="filter-name"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                ชื่อ
              </label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                  aria-hidden="true"
                />
                <input
                  id="filter-name"
                  type="text"
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  placeholder="ค้นหาชื่อ-สกุล / ชื่อเล่น…"
                  aria-label="ค้นหาด้วยชื่อ"
                  className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 bg-white transition-all"
                />
                {nameQuery && (
                  <button
                    onClick={() => setNameQuery("")}
                    aria-label="ล้างชื่อ"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* (B) Position */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="filter-position"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                ตำแหน่ง
              </label>
              <div className="relative">
                <Briefcase
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                  aria-hidden="true"
                />
                <input
                  id="filter-position"
                  type="text"
                  value={positionQuery}
                  onChange={(e) => setPositionQuery(e.target.value)}
                  placeholder="เช่น ผู้ช่วยศาสตราจารย์"
                  aria-label="ค้นหาด้วยตำแหน่ง"
                  className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 bg-white transition-all"
                />
                {positionQuery && (
                  <button
                    onClick={() => setPositionQuery("")}
                    aria-label="ล้างตำแหน่ง"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* (C) Department */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="filter-dept"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                หน่วยงาน
              </label>
              <div className="relative">
                <Building
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                  aria-hidden="true"
                />
                <input
                  id="filter-dept"
                  type="text"
                  value={deptQuery}
                  onChange={(e) => setDeptQuery(e.target.value)}
                  placeholder="คณะ/สำนักวิชา/หน่วยงาน…"
                  aria-label="ค้นหาด้วยหน่วยงาน"
                  className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 bg-white transition-all"
                />
                {deptQuery && (
                  <button
                    onClick={() => setDeptQuery("")}
                    aria-label="ล้างหน่วยงาน"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* (D) Status + Clear */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="filter-status"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide"
              >
                สถานะ
              </label>
              <div className="flex gap-2">
                <select
                  id="filter-status"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as StatusFilter)
                  }
                  aria-label="กรองสถานะ"
                  className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 bg-white transition-all"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    aria-label="ล้างตัวกรองทั้งหมด"
                    title="ล้างตัวกรองทั้งหมด"
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl border border-red-100 transition-all text-xs font-medium flex items-center gap-1 whitespace-nowrap"
                  >
                    <Filter size={14} aria-hidden="true" />
                    ล้าง
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
              {activeChips.map((chip) => (
                <span
                  key={chip.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100"
                >
                  {chip.label}
                  <button
                    onClick={chip.onRemove}
                    aria-label={`ลบตัวกรอง ${chip.label}`}
                    className="hover:text-blue-900 ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Table ─────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex justify-center items-center h-72">
            <div className="text-center">
              <div className="relative mx-auto w-16 h-16 mb-4">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users
                    className="w-6 h-6 text-blue-600 animate-pulse"
                    aria-hidden="true"
                  />
                </div>
              </div>
              <p className="text-gray-500 font-medium">กำลังโหลดข้อมูล…</p>
            </div>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-gray-100 mb-6"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-white text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-4 text-left w-14">
                        <span className="sr-only">รูปประจำตัว</span>
                      </th>
                      <th className="px-4 py-4 text-left">ชื่อ-สกุล</th>
                      <th className="px-4 py-4 text-left">CMU Account</th>
                      <th className="px-4 py-4 text-left">หน่วยงาน</th>
                      <th className="px-4 py-4 text-left">ตำแหน่ง</th>
                      <th className="px-4 py-4 text-left">ประเภท</th>
                      <th className="px-4 py-4 text-center">เลขอัตรา</th>
                      <th className="px-4 py-4 text-center">สถานะ</th>
                      <th className="px-4 py-4 text-left">อัปเดต</th>
                      <th className="px-4 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentItems.length > 0 ? (
                      currentItems.map((user, index) => {
                        const imgSrc = safeImageUrl(
                          config.URL_API,
                          user.imageprofile,
                        );
                        const initials = (
                          user.fullname_th ||
                          user.cmuaccount ||
                          "?"
                        )
                          .trim()
                          .charAt(0)
                          .toUpperCase();

                        return (
                          <motion.tr
                            key={user.accountId}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.025 }}
                            className="hover:bg-blue-50/40 transition-colors duration-150 group"
                          >
                            {/* Profile */}
                            <td className="px-4 py-3">
                              <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                {imgSrc ? (
                                  <img
                                    src={imgSrc}
                                    alt={`รูป ${user.fullname_th}`}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <span className="text-white font-bold text-base select-none">
                                    {initials}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Name */}
                            <td className="px-4 py-3 min-w-[160px]">
                              <p className="text-sm font-semibold text-gray-900 leading-tight">
                                {user.fullname_th || user.cmuaccount || "-"}
                              </p>
                              {user.nickname && (
                                <span className="mt-0.5 inline-block text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                  {user.nickname}
                                </span>
                              )}
                            </td>

                            {/* CMU Account */}
                            <td className="px-4 py-3 min-w-[160px]">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Mail
                                  className="w-3.5 h-3.5 flex-shrink-0"
                                  aria-hidden="true"
                                />
                                {user.cmuaccount || "-"}
                              </div>
                            </td>

                            {/* Department */}
                            <td className="px-4 py-3 min-w-[200px]">
                              <p className="text-sm text-gray-800 leading-tight">
                                {user.level1agency_th || "-"}
                              </p>
                              {(user.level2agency_th ||
                                user.level3agency_th) && (
                                <p className="text-xs text-gray-400 mt-0.5 leading-tight">
                                  {[user.level2agency_th, user.level3agency_th]
                                    .filter(Boolean)
                                    .join(" / ")}
                                </p>
                              )}
                            </td>

                            {/* Position */}
                            <td className="px-4 py-3 min-w-[140px]">
                              {user.positiontitle_th ? (
                                <span className="text-sm text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                                  {user.positiontitle_th}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400 italic">
                                  -
                                </span>
                              )}
                            </td>

                            {/* Type */}
                            <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                              {user.accounttype_th || "-"}
                            </td>

                            {/* Rate No. */}
                            <td className="px-4 py-3 text-center text-sm text-gray-600">
                              {user.ratenumber || "-"}
                            </td>

                            {/* Status badge */}
                            <td className="px-4 py-3 text-center">
                              {user.workingstatus ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                                  <CheckCircle
                                    className="w-3 h-3"
                                    aria-hidden="true"
                                  />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full border border-red-100">
                                  <XCircle
                                    className="w-3 h-3"
                                    aria-hidden="true"
                                  />
                                  Inactive
                                </span>
                              )}
                            </td>

                            {/* Updated */}
                            <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                              {formatDate(user.updatedAt)}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleOpenModal(user)}
                                  aria-label={`แก้ไข ${user.fullname_th}`}
                                  title="แก้ไข"
                                  className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all duration-150 shadow-sm"
                                >
                                  <Edit2 size={15} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() =>
                                    handleDeleteUser(
                                      user.accountId,
                                      user.fullname_th || user.cmuaccount,
                                    )
                                  }
                                  aria-label={`ลบ ${user.fullname_th}`}
                                  title="ลบ"
                                  className="p-2 text-red-500 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-150 shadow-sm"
                                >
                                  <Trash2 size={15} />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={10} className="px-6 py-20 text-center">
                          <div className="inline-flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <Users
                                className="w-8 h-8 text-gray-400"
                                aria-hidden="true"
                              />
                            </div>
                            <p className="text-gray-500 font-medium">
                              ไม่พบข้อมูลตามเงื่อนไขที่ค้นหา
                            </p>
                            {hasActiveFilters && (
                              <button
                                onClick={clearFilters}
                                className="text-sm text-blue-600 hover:underline"
                              >
                                ล้างตัวกรอง
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  goToFirstPage={goToFirstPage}
                  goToLastPage={goToLastPage}
                  goToPreviousPage={goToPreviousPage}
                  goToNextPage={goToNextPage}
                  paginate={paginate}
                />
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <UserModal
            user={selectedUser}
            onClose={handleCloseModal}
            onSave={handleSaveUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
// ==================== UserModal Component ====================
function UserModal({
  user,
  onClose,
  onSave,
}: {
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
}) {
  const [formData, setFormData] = useState<User>(
    user || {
      accountId: "",
      accounttype_th: "",
      cmuaccount: "",
      createdAt: "",
      fullname_th: "",
      level1agency_th: "",
      level2agency_th: "",
      level3agency_th: "",
      positiontitle_th: "",
      ratenumber: "",
      updatedAt: "",
      workingstatus: true,
    },
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    typeof user?.imageprofile === "string" ? user.imageprofile : null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set initial preview if user has an image
    if (user?.imageprofile && typeof user.imageprofile === "string") {
      const objectUrl = config.URL_API + user.imageprofile;
      setPreviewUrl(objectUrl);
    }
    // Cleanup function for object URLs
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [user]); // Only re-run if user changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }) as User);
  };

  const validateFile = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (file.size > maxSize) {
      Swal.fire("Error", "File size must be less than 5MB", "error");
      return false;
    }
    if (!allowedTypes.includes(file.type)) {
      Swal.fire("Error", "Only JPG, PNG, WEBP images are allowed", "error");
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    if (e.target.files?.[0] && validateFile(e.target.files[0])) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, imageprofile: file }) as User);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      // If no file is selected or validation fails, reset to original or null
      setFormData(
        (prev) =>
          ({ ...prev, imageprofile: user?.imageprofile || null }) as User,
      );
      setPreviewUrl(
        typeof user?.imageprofile === "string" ? user.imageprofile : null,
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {user ? "Edit User" : "Create New User"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Picture */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture{" "}
                <span className="text-red-500">* ขนาดไฟล์ไม่เกิน 2MB</span>
              </label>
              <div className="flex items-center space-x-6">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile Preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <UserIcon className="h-10 w-10 text-white" />
                  )}
                </div>
                <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg px-4 py-2 border border-gray-300 transition-colors duration-200 flex items-center gap-2">
                  <Upload size={18} />
                  Upload Image
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                  />
                </label>
                {formData.imageprofile && (
                  <button
                    type="button"
                    onClick={() => {
                      if (previewUrl?.startsWith("blob:")) {
                        URL.revokeObjectURL(previewUrl);
                      }
                      setFormData(
                        (prev) => ({ ...prev, imageprofile: null }) as User,
                      );
                      setPreviewUrl(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อ-สกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="fullname_th"
                value={formData.fullname_th}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อเล่น
              </label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CMU Account <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cmuaccount"
                value={formData.cmuaccount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                required
                disabled={!!user} // Disable edit for existing user if needed
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ตำแหน่ง
              </label>
              <input
                type="text"
                name="positiontitle_th"
                value={formData.positiontitle_th || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ประเภทบัญชี
              </label>
              <input
                type="text"
                name="accounttype_th"
                value={formData.accounttype_th || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หน่วยงานระดับ 2
              </label>
              <input
                type="text"
                name="level2agency_th"
                value={formData.level2agency_th || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                หน่วยงานระดับ 3
              </label>
              <input
                type="text"
                name="level3agency_th"
                value={formData.level3agency_th || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลขที่อัตรา
              </label>
              <input
                type="text"
                name="ratenumber"
                value={formData.ratenumber || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 mt-6 pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save User
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ==================== Pagination Component ====================
const Pagination = ({
  currentPage,
  totalPages,
  goToFirstPage,
  goToLastPage,
  goToPreviousPage,
  goToNextPage,
  paginate,
}: {
  currentPage: number;
  totalPages: number;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  paginate: (page: number) => void;
}) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | null = null;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l !== null) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="py-5 border-t border-gray-200 flex justify-center items-center space-x-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={goToFirstPage}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="First page"
      >
        <ChevronsLeft size={18} />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={goToPreviousPage}
        disabled={currentPage === 1}
        className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Previous page"
      >
        <ChevronLeft size={18} />
      </motion.button>

      <div className="flex space-x-1">
        {getPageNumbers().map((page, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => typeof page === "number" && paginate(page)}
            disabled={page === "..."}
            className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
              currentPage === page
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                : page === "..."
                  ? "bg-transparent text-gray-600 cursor-default"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {page}
          </motion.button>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={goToNextPage}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Next page"
      >
        <ChevronRight size={18} />
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={goToLastPage}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Last page"
      >
        <ChevronsRight size={18} />
      </motion.button>
    </div>
  );
};
