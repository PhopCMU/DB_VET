import { usePermission } from "@/app/context/UsePermission";
import { useUser } from "@/app/context/UserContext";
import { CmuvcStudents } from "@/app/model/cmuvc/dashboardModel";
import { Delete_Students } from "@/app/routers/cmuvc/DeleteRouter";
import { GetStudents } from "@/app/routers/cmuvc/GetRouter";
import { Cmuvc_Create_Student_Router_CryptoJS } from "@/app/routers/cmuvc/PostRouter";
import { PutEditStudentlist } from "@/app/routers/cmuvc/PutRouter";
import { ConfirmModal } from "@/components/ConfirmModal/ConfirmModal";
import PermissionGuard from "@/components/Guards/PermissionGuard";
import Loading from "@/components/Loadings/Loading";
import { LoadingModal } from "@/components/Modal";
import ToastNotification from "@/components/Tooltips/ToastNotification";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

const SUB_MENU_ID = "9b940740-d1e9-4a41-af0d-4e1faa90464d";
const PROJECT_ID = "ee9ce62b-2e02-4682-9ecf-9f9b564ee5e3";

// หน้ารายชื่อผู้เข้าร่วม Students
export default function StudentsList() {
  type FormMode = "add" | "edit";
  const { userData, loading } = useUser();
  const [students, setStudents] = useState<CmuvcStudents[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string | "all">("all");
  const [levelCounts, setLevelCounts] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<FormMode>("add");
  const [loadData, setLoadData] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [onUploadProgress, setOnUploadProgress] = useState<number>(0);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState<boolean>(false);
  const [currentStudent, setCurrentStudent] = useState<CmuvcStudents | null>(
    null
  );
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ isVisible: false, message: "", type: "success" });
  const [formData, setFormData] = useState<
    Omit<CmuvcStudents, "studentId" | "createAt" | "updateAt">
  >({
    studentCode: "",
    prefix: "นางสาว",
    fname: "",
    lname: "",
    level: "",
  });

  const hasStudent = useRef(false);

  if (loading) return <Loading />;

  const fetchDataStudent = async () => {
    const response = await GetStudents();
    if (response.success) {
      const data = response.data as CmuvcStudents[];
      setStudents(data);
      setLoadData(true);

      // นับจำนวนนักเรียนแต่ละชั้นปี
      const counts = data.reduce((acc: Record<string, number>, student) => {
        acc[student.level] = (acc[student.level] || 0) + 1;
        return acc;
      }, {});
      setLevelCounts(counts);
    } else {
      console.error("Error fetching students:", response.message);
      setLoadData(true);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const fullName = `${s.fname.trim()} ${s.lname.trim()}`;
      const matchesSearch =
        s.fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fullName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel = selectedLevel === "all" || s.level === selectedLevel;
      return matchesSearch && matchesLevel;
    });
  }, [students, searchTerm, selectedLevel]);

  useEffect(() => {
    if (!hasStudent.current) {
      fetchDataStudent();
      hasStudent.current = true;
    }
  }, []);

  if (!userData) {
    return <div>ไม่พบข้อมูลผู้ใช้</div>;
  }

  const { canCreate, canEdit, canDelete, canView } = usePermission(
    SUB_MENU_ID,
    PROJECT_ID
  );

  if (!loadData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  // เปิด Modal เพิ่มนักเรียน
  const openAddModal = () => {
    setFormMode("add");
    setCurrentStudent(null);
    setFormData({
      studentCode: "",
      prefix: "นางสาว",
      fname: "",
      lname: "",
      level: "",
    });
    setIsModalOpen(true);
  };

  // เปิด Modal แก้ไขนักเรียน
  const openEditModal = (student: CmuvcStudents) => {
    setFormMode("edit");
    setCurrentStudent(student);
    setFormData({
      studentCode: student.studentCode,
      prefix: student.prefix,
      fname: student.fname,
      lname: student.lname,
      level: student.level,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (studeuntId: string) => {
    setSelectedStudentId(studeuntId);
    setIsModalConfirmOpen(true);
  };

  // ลบข้อมูลนักเรียน
  const deleteStudent = async (studentId: string) => {
    if (!studentId.trim()) return showToast("กรุณาเลือกข้อมูล", "error");

    setIsLoading(true);
    setIsModalConfirmOpen(false);
    setOnUploadProgress(0);

    try {
      const response = await Delete_Students(studentId, setOnUploadProgress);

      if (response.success) {
        showToast("ลบข้อมูลสำเร็จ", "success");
        await fetchDataStudent();
        setIsLoading(false);
      } else {
        showToast("เกิดข้อผิดพลาดในการลบข้อมูล", "error");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      showToast("ข้อผิดพลาด", "error");
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = () => {
    deleteStudent(selectedStudentId);
  };

  // บันทึกข้อมูลนักเรียน
  const handleSubmit = async () => {
    if (!formData.studentCode.trim())
      return showToast("กรุณากรอกรหัสนักศึกษา", "warning");
    if (!formData.prefix.trim())
      return showToast("กรุณากรอกตำแหน่ง", "warning");
    if (!formData.fname.trim()) return showToast("กรุณากรอกชื่อ", "warning");
    if (!formData.lname.trim()) return showToast("กรุณากรอกนามสกุล", "warning");
    if (!formData.level.trim()) return showToast("กรุณากรอกชั้นปี", "warning");

    if (formMode === "add") {
      const newStudent: CmuvcStudents = {
        ...formData,
        createAt: new Date().toISOString(),
        updateAt: null,
      };

      setIsLoading(true);
      setOnUploadProgress(0);

      try {
        const response = await Cmuvc_Create_Student_Router_CryptoJS(
          newStudent,
          setOnUploadProgress
        );

        if (response.success) {
          showToast("เพิ่มข้อมูลสำเร็จ", "success");
          await fetchDataStudent();
          setIsModalOpen(false);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error creating student:", error);
        showToast("เกิดข้อผิดพลาด", "error");
        setIsLoading(false);
      }
    } else if (formMode === "edit" && currentStudent) {
      const updatedStudent: CmuvcStudents = {
        ...currentStudent,
        ...formData,
        updateAt: new Date().toISOString(),
      };

      setIsLoading(true);
      setOnUploadProgress(0);

      try {
        const response = await PutEditStudentlist(
          updatedStudent,
          setOnUploadProgress
        );

        if (response.success) {
          setIsModalOpen(false);
          setTimeout(async () => {
            await fetchDataStudent();
            setIsLoading(false);
            showToast("แก้ไขข้อมูลสำเร็จ", "success");
          }, 1000);
        }
      } catch (error) {
        console.error("Error updating student:", error);
        showToast("ข้อผิดพลาด", "error");
        setIsLoading(false);
      }
    }
  };

  // เปลี่ยนค่าในฟอร์ม
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    let processedValue = value;

    if (name === "studentCode") {
      // รับเฉพาะตัวเลข 0-9 และจำกัดความยาวไม่เกิน 9 ตัว
      processedValue = value.replace(/[^0-9]/g, "").slice(0, 9);
    } else if (name === "level") {
      // หรือถ้าต้องการให้เป็น "ม.4", "3" ได้ ให้ปรับ regex ตามต้องการ
      processedValue = value.replace(/[^0-9]/g, "").slice(0, 1); // สมมุติว่า level ไม่เกิน 2 หลัก (เช่น 1-12)
    }
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  // Function to show toast
  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => {
    setToast({ isVisible: true, message, type });
  };

  // Function to hide toast
  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  return (
    <>
      <PermissionGuard submenuIdCode={SUB_MENU_ID} />
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <LoadingModal isOpen={isLoading} progress={onUploadProgress} />
        <ToastNotification
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
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

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="material-symbols-outlined text-blue-600 bg-blue-100 p-2 rounded-lg">
                groups
              </span>
              <span>
                รายชื่อผู้นักเรียนชั้นปี 4 - 6
                <span className="block text-sm font-normal text-gray-500 mt-1">
                  จัดการข้อมูลผู้เข้าร่วมโครงการ
                </span>
              </span>
            </h1>
          </div>

          {/* ปุ่มเพิ่มนักเรียน (ไม่มี animation) */}
          <button
            onClick={() => {
              if (!canCreate) return;
              openAddModal();
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl ${
              canCreate
                ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            } transition-all duration-200`}
            disabled={!canCreate}
          >
            <span className="material-symbols-outlined text-lg">
              {canCreate ? "add" : "block"}
            </span>
            <span className="font-medium">
              {canCreate ? "เพิ่มนักเรียน" : "ไม่มีสิทธิ์"}
            </span>
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-5 md:p-6">
          {/* Filters Section */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ, นามสกุล หรือรหัสนักศึกษา..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Level Filter */}
              <div className="w-full md:w-64">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    filter_alt
                  </span>
                  <select
                    value={selectedLevel}
                    onChange={(e) =>
                      setSelectedLevel(
                        e.target.value === "all" ? "all" : e.target.value
                      )
                    }
                    className="w-full pl-11 pr-10 py-3 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="all">ทั้งหมด (ทุกชั้นปี)</option>
                    {Object.keys(levelCounts).map((level) => (
                      <option key={level} value={level}>
                        ชั้นปี {level} ({levelCounts[level]} คน)
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards (ไม่มี animation) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Object.entries(levelCounts).map(([level, count]) => (
              <div
                key={level}
                className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">
                      ชั้นปี {level}
                    </p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">
                      {count}{" "}
                      <span className="text-sm font-normal text-gray-500">
                        คน
                      </span>
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-blue-600">
                      school
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Students Table */}
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      รหัสนักศึกษา
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ชั้นปี
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <tr
                        key={student.studentId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-600 text-sm">
                                  person
                                </span>
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-900">
                                  {student.prefix} {student.fname.trim()}{" "}
                                  {student.lname.trim()}
                                </span>
                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">
                                    fingerprint
                                  </span>
                                  {student.studentCode}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              ชั้นปี {student.level}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex flex-col items-end gap-3">
                            {/* ปุ่มจัดการ (ไม่มี animation) */}
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() =>
                                  canEdit && openEditModal(student)
                                }
                                className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                                  canEdit
                                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                } transition-colors`}
                                disabled={!canEdit}
                              >
                                <span className="material-symbols-outlined text-base">
                                  {canEdit ? "edit" : "edit_off"}
                                </span>
                                <span className="text-sm">
                                  {canEdit ? "แก้ไข" : "ไม่มีสิทธิ์"}
                                </span>
                              </button>
                              <button
                                onClick={() =>
                                  canDelete &&
                                  handleDeleteClick(student.studentId)
                                }
                                className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                                  canDelete
                                    ? "bg-red-50 text-red-700 hover:bg-red-100"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                } transition-colors`}
                                disabled={!canDelete}
                              >
                                <span className="material-symbols-outlined text-base">
                                  {canDelete ? "delete" : "block"}
                                </span>
                                <span className="text-sm">
                                  {canDelete ? "ลบ" : "ไม่มีสิทธิ์ลบ"}
                                </span>
                              </button>
                            </div>

                            {/* แสดงเวลาอัปเดต */}
                            <div className="flex justify-end gap-2 text-xs text-gray-400">
                              {(() => {
                                if (!student.updateAt) {
                                  return (
                                    <>
                                      <span>แก้ไขล่าสุด:</span>
                                      <span className="text-gray-400 ml-1">
                                        ยังไม่ได้แก้ไข
                                      </span>
                                    </>
                                  );
                                }

                                const updatedAt = dayjs(student.updateAt);
                                const today = dayjs().startOf("day");
                                const isToday = updatedAt.isSame(today, "day");

                                return (
                                  <div className="inline-flex items-center gap-1">
                                    <span className="material-symbols-outlined">
                                      schedule
                                    </span>
                                    <span
                                      className={`ml-1 ${
                                        isToday
                                          ? "text-green-600"
                                          : "text-amber-600"
                                      }`}
                                    >
                                      {isToday
                                        ? `วันนี้ ${updatedAt.format("HH:mm")}`
                                        : `${updatedAt.format(
                                            "DD/MM/YYYY HH:mm"
                                          )}`}
                                    </span>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                          <span className="material-symbols-outlined text-5xl mb-4 opacity-50">
                            search_off
                          </span>
                          <p className="text-lg font-medium text-gray-500 mb-1">
                            ไม่พบข้อมูล
                          </p>
                          <p className="text-sm">
                            ลองเปลี่ยนคำค้นหาหรือตัวกรองดูอีกครั้ง
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

        {/* Add/Edit Modal (ใช้ AnimatePresence + motion แค่ตรงนี้) */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-30"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Content (เหมือนเดิม) */}
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-600 bg-blue-100 p-2 rounded-lg">
                      {formMode === "add" ? "person_add" : "edit"}
                    </span>
                    {formMode === "add"
                      ? "เพิ่มนักเรียน"
                      : "แก้ไขข้อมูลนักเรียน"}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  {/* ฟอร์ม (เหมือนเดิม) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      คำนำหน้า
                    </label>
                    <div className="relative">
                      <select
                        name="prefix"
                        value={formData.prefix}
                        onChange={handleInputChange}
                        className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none transition-all"
                      >
                        <option value="นาย">นาย</option>
                        <option value="นางสาว">นางสาว</option>
                        <option value="นาง">นาง</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                        expand_more
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รหัสนักศึกษา
                    </label>
                    <input
                      type="text"
                      name="studentCode"
                      value={formData.studentCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="ระบุรหัสนักศึกษา"
                    />
                    <p className="text-red-500 text-xs mt-2">
                      ※ กรอกได้เฉพาะตัวเลขเท่านั้น
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ชื่อ
                      </label>
                      <input
                        type="text"
                        name="fname"
                        value={formData.fname}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
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
                        value={formData.lname}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="นามสกุล"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชั้นปี
                    </label>
                    <input
                      type="number"
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      min="1"
                      max="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      placeholder="ระบุชั้นปี"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">
                      close
                    </span>
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
                  >
                    <span className="material-symbols-outlined text-base">
                      check
                    </span>
                    {formMode === "add" ? "เพิ่มนักเรียน" : "อัปเดตข้อมูล"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
