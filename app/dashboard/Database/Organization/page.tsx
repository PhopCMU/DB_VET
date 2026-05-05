"use client";
import { GetDepartments_Role, GetUsers_Role } from "@/app/routers/getService";
import { useVisitor } from "@/lib/fingerprintjs-shim";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AssignDepartmentModal,
  MainDepartmentCreate,
  SubDepartmentModalCreate,
} from "@/components/ModalCreated/Department";
import { useToast } from "@/app/hooks/useToast";
import ToastNotification from "@/components/Tooltips/ToastNotification";
import { MainDepartment, Personnel } from "@/app/model/roleModel";
import React from "react";
import { JobPositionModal } from "@/components/ModalCreated/JobPosition";
import PermissionGuard from "@/components/Guards/PermissionGuard";

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allPersonnel, setAllPersonnel] = useState<Personnel[]>([]); // เก็บข้อมูลทั้งหมด
  const [mainDepartments, setMainDepartments] = useState<MainDepartment[]>([]);
  const [dataMainDepartments, setDataMainDepartments] =
    useState<MainDepartment>();
  const [selectedMainId, setSelectedMainId] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Personnel | null>(null);
  const [isModalOpenCreateDepartment, setIsModalOpenCreateDepartment] =
    useState(false);
  const [isModalOpenCreateSubDepartment, setIsModalOpenCreateSubDepartment] =
    useState(false);
  const [isModalOpenCreateJob, setIsModalOpenCreateJob] = useState(false);
  const [isUpdated, setIsUpdated] = useState<boolean>(false);

  const [showLeftColumn, setShowLeftColumn] = useState(true);
  const [showRightColumn, setShowRightColumn] = useState(true);
  const { toast, showToast, hideToast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5); // จำนวนต่อหน้า
  const [loading, setLoading] = useState(true);
  const hasUsers = useRef(false);
  const hasDepratments = useRef(false);

  const { data } = useVisitor({ extendedResult: true }, { immediate: true });
  const visitorId = data?.visitorId ?? "";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response: any = await GetUsers_Role(visitorId);
      if (response.success) {
        setAllPersonnel(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentDatas = async () => {
    try {
      const response: any = await GetDepartments_Role(visitorId);
      if (response.success) {
        setMainDepartments(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  // ดึงข้อมูลทั้งหมดครั้งเดียว
  useEffect(() => {
    if (!hasUsers.current) {
      hasUsers.current = true;
      fetchUsers(); // โหลดครั้งแรก
    }
  }, [visitorId]);

  useEffect(() => {
    if (!hasDepratments.current) {
      hasDepratments.current = true;
      fetchDepartmentDatas();
    }
  }, []);

  useEffect(() => {
    if (isUpdated) {
      fetchUsers();
      fetchDepartmentDatas();
      setIsUpdated(false);
    }
  }, [isUpdated, fetchUsers, fetchDepartmentDatas]);

  // กรองข้อมูลตามคำค้นหา
  const filteredPersonnel = allPersonnel.filter((person) =>
    Object.values(person).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  // คำนวณ pagination
  const totalPages = Math.ceil(filteredPersonnel.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPersonnel = filteredPersonnel.slice(
    startIndex,
    startIndex + pageSize,
  );

  // จัดการเปลี่ยนหน้า
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset หน้าเป็น 1 เมื่อค้นหา
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading personnel data...</p>
      </div>
    );
  }

  const handleOpenModalCreateMainDepartment = () => {
    setIsModalOpenCreateDepartment(true);
  };

  const handleOpenModalCreateSubDepartment = (
    mainDepartmentId: MainDepartment,
  ) => {
    setDataMainDepartments(mainDepartmentId);
    setIsModalOpenCreateSubDepartment(true);
  };

  const handleOpenModalAssignDepartment = (personnel: Personnel) => {
    setSelectedUser(personnel);
    setIsAssignModalOpen(true);
  };

  const handleOpenModalCreateJob = () => {
    setIsModalOpenCreateJob(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 mb-20">
      <PermissionGuard submenuIdCode="e8bf3da9-ab93-4c7a-bf0c-bbb46ff90e12" />
      {/* ToastNotification */}
      <ToastNotification
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      {/* Assingnment */}
      <AssignDepartmentModal
        fromMainDepartment={mainDepartments}
        fromPersonnel={selectedUser}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        visitorId={visitorId}
        title="กําหนดหน่วยงาน"
        onUpdate={async (updateAssignment) => {
          if (!updateAssignment) return null;
          showToast("กําหนดหน่วยงานสําเร็จ", "success");
          setIsUpdated(true);
          setIsAssignModalOpen(false);
        }}
      />
      {/* DepartmentCreated */}
      <MainDepartmentCreate
        isOpen={isModalOpenCreateDepartment}
        title="สร้างหน่วยงานหลัก"
        visitorId={visitorId}
        onClose={() => setIsModalOpenCreateDepartment(false)}
        onUpdate={async (updatedMainDepartment) => {
          if (!updatedMainDepartment) return null;
          showToast("สร้างหน่วยงานหลักสําเร็จ", "success");
          setIsUpdated(true);
          setIsModalOpenCreateDepartment(false);
        }}
      />
      {/* sub-department */}
      <SubDepartmentModalCreate
        isOpen={isModalOpenCreateSubDepartment}
        title="สร้างหน่วยงานย่อย"
        visitorId={visitorId}
        onClose={() => setIsModalOpenCreateSubDepartment(false)}
        fromMainDepartment={dataMainDepartments}
        onUpdate={async (updatedSubDepartment) => {
          if (!updatedSubDepartment) return null;
          showToast("สร้างหน่วยงานย่อยสําเร็จ", "success");
          setIsUpdated(true);
          setIsModalOpenCreateSubDepartment(false);
        }}
      />
      {/* Job Position */}
      <JobPositionModal
        isOpen={isModalOpenCreateJob}
        title="สร้างตำแหน่งงาน"
        visitorId={visitorId}
        onClose={() => setIsModalOpenCreateJob(false)}
        onUpdate={async (updateJobPosition) => {
          if (!updateJobPosition) return null;
          showToast("สร้างหน่วยงานย่อยสําเร็จ", "success");
          setIsUpdated(true);
          setIsModalOpenCreateSubDepartment(false);
        }}
      />
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Left Column - Personnel List */}
        {showLeftColumn && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full col-span-5 md:col-span-3 space-y-6"
          >
            {/* Header with Gradient */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent">
                  Personnel Management
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  Manage your organization's human resources
                </p>
              </div>
            </div>
            {/* Search - Modern Gradient Border */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-blue-50 to-blue-100 p-0.5 rounded-xl shadow-sm"
            >
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg px-4 py-3 shadow-inner border border-blue-100">
                  <span className="material-symbols-outlined text-blue-400 mr-3">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name, department, position, or email..."
                    className="bg-transparent w-full outline-none text-gray-700 placeholder-blue-300"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <motion.button
                      onClick={() => setSearchTerm("")}
                      className="ml-2 text-blue-300 hover:text-blue-600"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                    >
                      <span className="material-symbols-outlined">close</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
            {/* Table - Enhanced with Gradient Accents */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">
                        Personnel
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">
                        Position
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-blue-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedPersonnel.length > 0 ? (
                      paginatedPersonnel.map((person, index) => (
                        <motion.tr
                          key={person.userId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="hover:bg-blue-50/30 group transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-inner border border-blue-100">
                                {person.image ? (
                                  <img
                                    src={person.image}
                                    alt="avatar"
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <span className="material-symbols-outlined text-blue-400">
                                    person
                                  </span>
                                )}
                              </div>
                              <div className="ml-4 flex flex-col gap-1">
                                <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {person.firstname_TH} {person.lastname_TH}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {person.firstname_EN} {person.lastname_EN}
                                </div>
                                <div className="text-xs text-blue-400">
                                  {person.cmuitaccount}
                                </div>
                                <div className="text-[10px] text-blue-900">
                                  {person.userId}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              {person.DepartmentMembership.length > 0 ? (
                                <motion.div
                                  className="flex flex-col gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-200 transition-colors"
                                  whileHover={{ scale: 1.02 }}
                                >
                                  {/* Main Department */}
                                  <div className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-blue-500 text-sm">
                                      corporate_fare
                                    </span>
                                    <div>
                                      <p className="text-[12px] text-gray-400">
                                        หน่วยงานหลัก
                                      </p>
                                      <p className="text-xs font-medium text-gray-700">
                                        {person.DepartmentMembership[0]
                                          ?.subDepartment?.mainDepartment
                                          ?.name_TH || (
                                          <span className="text-gray-400">
                                            ไม่ระบุ
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Sub Department */}
                                  <div className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-blue-400 text-sm">
                                      account_tree
                                    </span>
                                    <div>
                                      <p className="text-[12px] text-gray-400">
                                        หน่วยงานย่อย
                                      </p>
                                      <p className="text-xs font-medium text-gray-700">
                                        {person.DepartmentMembership[0]
                                          ?.subDepartment?.name_TH || (
                                          <span className="text-gray-400">
                                            ไม่ระบุ
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              ) : (
                                <motion.div
                                  onClick={() =>
                                    handleOpenModalAssignDepartment(person)
                                  }
                                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-50 text-gray-500 border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
                                  whileHover={{
                                    scale: 1.05,
                                    backgroundColor: "rgba(243, 244, 246, 1)",
                                  }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <span className="material-symbols-outlined text-sm">
                                    warning
                                  </span>
                                  <span className="text-xs font-medium">
                                    ยังไม่ได้ระบุ
                                  </span>
                                  <span className="material-symbols-outlined text-sm ml-1 text-gray-400">
                                    chevron_right
                                  </span>
                                </motion.div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs text-gray-900">
                              {person.jobpositionId ? (
                                <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-green-50 to-green-100 text-green-600 border border-green-200">
                                  {person.jobposition}
                                </span>
                              ) : (
                                <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-500 border border-gray-200">
                                  ยังไม่ได้ระบุ
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <motion.div
                              className="flex flex-col items-end space-y-2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ staggerChildren: 0.1 }}
                            >
                              {/* View Button */}
                              <motion.button
                                className="group relative px-1.5 pt-1 rounded-full bg-blue-50/50 hover:bg-blue-100 transition-colors shadow-sm"
                                whileHover={{
                                  scale: 1.1,
                                  backgroundColor: "rgba(219, 234, 254, 1)",
                                }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                <span className="material-symbols-outlined text-blue-500">
                                  visibility
                                </span>
                                <span className="absolute right-full mr-2 px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                  View Details
                                </span>
                              </motion.button>

                              {/* Edit Button */}
                              <motion.button
                                className="group relative px-1.5 pt-1 rounded-full bg-green-50/50 hover:bg-green-100 transition-colors shadow-sm"
                                whileHover={{
                                  scale: 1.1,
                                  backgroundColor: "rgba(209, 250, 229, 1)",
                                }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                <span className="material-symbols-outlined text-green-500">
                                  edit
                                </span>
                                <span className="absolute right-full mr-2 px-2 py-1 text-xs font-medium text-white bg-green-500 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                  Edit
                                </span>
                              </motion.button>

                              {/* Delete Button */}
                              <motion.button
                                className="group relative px-1.5 pt-1 rounded-full bg-red-50/50 hover:bg-red-100 transition-colors shadow-sm"
                                whileHover={{
                                  scale: 1.1,
                                  backgroundColor: "rgba(254, 226, 226, 1)",
                                }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                <span className="material-symbols-outlined text-red-500">
                                  delete
                                </span>
                                <span className="absolute right-full mr-2 px-2 py-1 text-xs font-medium text-white bg-red-500 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                  Delete
                                </span>
                              </motion.button>
                            </motion.div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <span className="material-symbols-outlined text-5xl mb-4 text-blue-200">
                              search_off
                            </span>
                            <p className="text-gray-500">
                              No personnel found matching your search criteria
                            </p>
                            <button
                              onClick={() => setSearchTerm("")}
                              className="mt-4 text-blue-500 hover:text-blue-600 flex items-center"
                            >
                              <span className="material-symbols-outlined mr-1">
                                refresh
                              </span>
                              Clear search
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Gradient Enhanced */}
              <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100/30">
                <div className="text-sm text-blue-500 mb-2 sm:mb-0">
                  Showing{" "}
                  <span className="font-semibold">
                    {paginatedPersonnel.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold">
                    {filteredPersonnel.length}
                  </span>{" "}
                  results
                </div>
                <div className="flex items-center space-x-1">
                  <motion.button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-full ${
                      currentPage === 1
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-blue-500 hover:bg-blue-100"
                    }`}
                    whileHover={{ scale: currentPage === 1 ? 1 : 1.1 }}
                    whileTap={{ scale: currentPage === 1 ? 1 : 0.9 }}
                  >
                    <span className="material-symbols-outlined">
                      chevron_left
                    </span>
                  </motion.button>

                  {Array.from({ length: totalPages }, (_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <motion.button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            currentPage === page
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                              : "text-blue-500 hover:bg-blue-50"
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {page}
                        </motion.button>
                      );
                    }
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2 text-blue-300">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <motion.button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-full ${
                      currentPage === totalPages
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-blue-500 hover:bg-blue-100"
                    }`}
                    whileHover={{ scale: currentPage === totalPages ? 1 : 1.1 }}
                    whileTap={{ scale: currentPage === totalPages ? 1 : 0.9 }}
                  >
                    <span className="material-symbols-outlined">
                      chevron_right
                    </span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Right Column - Department Management */}
        {showRightColumn && (
          <>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6 col-span-5 md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              {/* Department Management */}
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <div className="p-2 rounded-lg bg-white text-blue-600 shadow-sm border border-blue-100">
                    <span className="material-symbols-outlined text-2xl">
                      corporate_fare
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      จัดการหน่วยงาน
                    </h2>
                    <p className="text-xs text-blue-500">
                      Department Management System
                    </p>
                  </div>
                </div>

                {/* Add Main Department Button */}
                <button
                  onClick={() => handleOpenModalCreateMainDepartment()}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <span className="material-symbols-outlined">domain_add</span>
                  <span className="font-medium">เพิ่มหน่วยงานหลัก</span>
                </button>

                {/* Department List */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800">
                      <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-2 rounded-full">
                        account_tree
                      </span>
                      หน่วยงานหลักและหน่วยงานย่อย
                    </h3>
                  </div>

                  {mainDepartments.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-full inline-block mb-3">
                        <span className="material-symbols-outlined text-4xl text-blue-400">
                          folder_off
                        </span>
                      </div>
                      <p className="text-gray-500 mb-2">ยังไม่มีหน่วยงานหลัก</p>
                      <p className="text-sm text-gray-400">
                        เริ่มต้นโดยการเพิ่มหน่วยงานหลัก
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {mainDepartments.map((mainDept) => (
                        <div
                          key={mainDept.mainDepartmentId}
                          className="border border-gray-200 rounded-xl overflow-hidden bg-white"
                        >
                          {/* Main Department Header */}
                          <div
                            className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                              selectedMainId === mainDept.mainDepartmentId
                                ? "bg-gradient-to-r from-blue-50 to-blue-100"
                                : "bg-white hover:bg-gray-50"
                            }`}
                            onClick={() =>
                              selectedMainId === mainDept.mainDepartmentId
                                ? setSelectedMainId(null)
                                : setSelectedMainId(mainDept.mainDepartmentId)
                            }
                          >
                            <div className="flex items-center gap-3">
                              <span className="material-symbols-outlined text-blue-500">
                                {selectedMainId === mainDept.mainDepartmentId
                                  ? "folder_open"
                                  : "folder"}
                              </span>
                              <span className="font-medium text-gray-800 text-sm">
                                {mainDept.name_TH}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full border border-blue-200">
                                {mainDept.subDepartments.length}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenModalCreateSubDepartment(mainDept);
                                }}
                                className="text-white bg-green-500 px-2 py-1 rounded-lg shadow-sm cursor-pointer flex items-center gap-1 hover:bg-green-600 transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  add
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Sub Departments */}
                          <AnimatePresence>
                            {selectedMainId === mainDept.mainDepartmentId && (
                              <motion.div
                                className="bg-gray-50 border-t border-gray-200 p-3 space-y-3"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{
                                  height: "auto",
                                  opacity: 1,
                                }}
                                exit={{
                                  height: 0,
                                  opacity: 0,
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                {mainDept.subDepartments.length > 0 ? (
                                  mainDept.subDepartments.map((subDept) => (
                                    <div
                                      key={subDept.subDepartmentId}
                                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-blue-400 text-sm">
                                          subdirectory_arrow_right
                                        </span>
                                        <span className="text-sm text-gray-700">
                                          {subDept.name_TH}
                                        </span>
                                      </div>
                                      <div className="flex gap-2">
                                        <button className="text-gray-400 hover:text-blue-600 p-1 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                                          <span className="material-symbols-outlined text-sm">
                                            edit
                                          </span>
                                        </button>
                                        <button className="text-gray-400 hover:text-red-600 p-1 bg-red-50 rounded-full hover:bg-red-100 transition-colors">
                                          <span className="material-symbols-outlined text-sm">
                                            delete
                                          </span>
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-4 text-gray-400 text-sm">
                                    <div className="bg-blue-50 p-3 rounded-full inline-block mb-2">
                                      <span className="material-symbols-outlined">
                                        folder_off
                                      </span>
                                    </div>
                                    <p>ยังไม่มีหน่วยงานย่อย</p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenModalCreateSubDepartment(
                                          mainDept,
                                        );
                                      }}
                                      className="text-blue-500 text-xs mt-2 flex items-center justify-center gap-1 mx-auto hover:text-blue-600 transition-colors"
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        add
                                      </span>
                                      เพิ่มหน่วยงานย่อย
                                    </button>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Job Title Section */}
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <div className="p-2 rounded-lg bg-white text-blue-600 shadow-sm border border-blue-100">
                    <span className="material-symbols-outlined text-2xl">
                      business_center
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      จัดการตำแหน่ง
                    </h2>
                    <p className="text-xs text-blue-500">
                      Position Management System
                    </p>
                  </div>
                </div>

                {/* Add Position Button */}
                <button
                  onClick={() => handleOpenModalCreateJob()}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <span className="material-symbols-outlined">add</span>
                  <span className="font-medium">เพิ่มตำแหน่ง</span>
                </button>

                {/* Job List Container */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-2 rounded-full">
                        list_alt
                      </span>
                      ตำแหน่งทั้งหมด
                    </h3>
                  </div>

                  {/* Empty State */}
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="bg-blue-50 p-4 rounded-full mb-4">
                      <span className="material-symbols-outlined text-4xl text-blue-400">
                        work_outline
                      </span>
                    </div>
                    <h4 className="text-gray-600 font-medium mb-1">
                      ยังไม่มีตำแหน่งที่บันทึก
                    </h4>
                    <p className="text-gray-400 text-sm">
                      เริ่มต้นโดยการเพิ่มตำแหน่งใหม่
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* ถ้าทั้งสองคอลัมน์ถูกซ่อน แสดงข้อความแจ้ง */}
        {!showLeftColumn && !showRightColumn && (
          <div className="col-span-5 text-center py-10 text-gray-500">
            <span className="material-symbols-outlined text-6xl mb-2">
              hide_source
            </span>
            <p>ทั้งสองคอลัมน์ถูกซ่อน</p>
            <div className="mt-4 space-x-4">
              <button
                onClick={() => setShowLeftColumn(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                แสดง Personnel
              </button>
              <button
                onClick={() => setShowRightColumn(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                แสดง Departments
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
