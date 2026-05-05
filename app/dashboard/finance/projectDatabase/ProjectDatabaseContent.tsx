"use client";
import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import { getProject } from "@/app/routers/getService";
import { ProjectModel } from "@/app/model/projectModel";
import { useRouter, useSearchParams } from "next/navigation";
import { AnatomyPage } from "./pages/anatomy/page";
import CmuvcPage from "./pages/cmuvc/page";
import VetRunPage from "./pages/vetrun/page";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { configTime } from "@/config/config_time";
import PermissionGuard from "@/components/Guards/PermissionGuard";

const submenuIdFinance = "e432a5bf-eda0-4638-848d-26df9194f57e";

export default function RegisterProjectDatabasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData, loading, isSuperAdmin } = useUser();
  const [projectData, setProjectData] = useState<ProjectModel[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectModel[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const hasProjects = useRef(false);
  const projectsPerPage = 8;

  const [module, setModule] = useState<string | null>(null);
  const [project, setProject] = useState<string | null>(null);

  // อ่านค่าจาก query หรือ localStorage ครั้งแรก
  useEffect(() => {
    const initialModule =
      searchParams.get("Module") || localStorage.getItem("module");
    const initialProject =
      searchParams.get("Project") || localStorage.getItem("project");

    setModule(initialModule);
    setProject(initialProject);
  }, [searchParams]);

  const [database, setDatabase] = useState<string | null>(module);
  const [projectId, setProjectId] = useState<string | null>(project);
  const [matchedProject, setMatchedProject] = useState<ProjectModel | null>(
    null
  );

  // หา project ที่ตรงกับ projectId + database (super admin ไม่ต้องตรวจสอบ permission)
  useEffect(() => {
    if (!projectId || !database || !userData?.userId) {
      setMatchedProject(null);
      return;
    }

    const match = projectData.find((p: any) => {
      if (isSuperAdmin) {
        return p.projectId === projectId && p.database === database;
      }
      return (
        p.projectId === projectId &&
        p.database === database &&
        p.UserPermission.some(
          (perm: any) =>
            perm.userId === userData.userId &&
            perm.submenuId === submenuIdFinance &&
            perm.view === true
        )
      );
    });

    setMatchedProject(match || null);
  }, [projectId, database, projectData, userData?.userId, isSuperAdmin]);

  // ตรวจสอบว่า projectId และ database ตรงกับ project ที่มีสิทธิ์ (หรือ super admin)
  const isValidProject = () => {
    if (!projectId || !database) return false;

    return projectData.some((p: any) => {
      if (isSuperAdmin) {
        return p.projectId === projectId && p.database === database;
      }
      return (
        p.projectId === projectId &&
        p.database === database &&
        p.UserPermission.some(
          (perm: any) =>
            perm.userId === userData?.userId &&
            perm.submenuId === submenuIdFinance &&
            perm.view === true
        )
      );
    });
  };

  // ตรวจสอบความถูกต้องของ projectId และ database
  useEffect(() => {
    if (projectData.length > 0) {
      const valid = isValidProject();
      if (!valid) {
        localStorage.removeItem("module");
        localStorage.removeItem("project");
        setDatabase(null);
        setProjectId(null);
        setMatchedProject(null);
        router.replace("/dashboard/finance/projectDatabase");
      } else {
        if (projectId) localStorage.setItem("project", projectId);
        if (database) localStorage.setItem("module", database);
      }
    }
  }, [projectId, database, projectData, isSuperAdmin, userData?.userId]);

  // ดักจับการเปลี่ยนแปลงจาก URL
  useEffect(() => {
    const newDatabase = searchParams.get("Module");
    const newProjectId = searchParams.get("Project");

    setDatabase(newDatabase);
    setProjectId(newProjectId);

    if (newDatabase) localStorage.setItem("module", newDatabase);
    if (newProjectId) localStorage.setItem("project", newProjectId);
  }, [searchParams]);

  // ดึงข้อมูลโครงการ
  useEffect(() => {
    if (!userData?.userId) return;

    const fetchProjects = async () => {
      try {
        const allProjects: any = await getProject();

        let filtered;
        if (isSuperAdmin) {
          filtered = allProjects;
        } else {
          filtered = allProjects.filter((project: any) =>
            project.UserPermission.some(
              (perm: any) =>
                perm.userId === userData?.userId &&
                perm.submenuId === submenuIdFinance &&
                perm.view === true
            )
          );
        }

        setProjectData(filtered);
        setFilteredProjects(filtered);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    // ✅ ดึงข้อมูลทุกครั้งที่ userId หรือ isSuperAdmin เปลี่ยน
    fetchProjects();
  }, [userData?.userId, isSuperAdmin]);

  // ค้นหาโครงการ
  const handleSearch = (text: string) => {
    if (text.trim() === "") {
      setFilteredProjects([]);
      return;
    }
    const results = projectData.filter(
      (project) =>
        project.name.toLowerCase().includes(text.toLowerCase()) ||
        project.description.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredProjects(results);
    setCurrentPage(1);
  };

  // แบ่งหน้า
  const displayProjects =
    filteredProjects.length > 0 ? filteredProjects : projectData;
  const totalPages = Math.ceil(displayProjects.length / projectsPerPage);
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = displayProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  // เปลี่ยนไปยังโครงการ
  const handleRouter = (project: ProjectModel) => {
    router.push(
      `/dashboard/finance/projectDatabase?Project=${project.projectId}&Module=${project.database}`
    );
  };

  // แสดงหน้าโครงการตาม database
  const renderProjectContent = () => {
    if (!matchedProject) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center min-h-[60vh] bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 mx-4 my-6"
        >
          <motion.div
            animate={{
              y: [0, -5, 0],
              rotate: [0, 2, -2, 0],
            }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className="mb-6 p-5 bg-white/80 backdrop-blur-sm rounded-full shadow-inner border border-gray-200"
          >
            <span className="material-symbols-outlined text-5xl text-gray-400">
              search_off
            </span>
          </motion.div>

          <motion.h3
            className="text-2xl font-semibold text-gray-700 mb-3 flex items-center"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="material-symbols-outlined text-red-400 mr-2">
              error
            </span>
            ไม่พบโครงการหรือไม่มีสิทธิ์เข้าถึง
          </motion.h3>

          <motion.p
            className="text-gray-500 max-w-md text-center mb-6"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            โครงการที่คุณค้นหาอาจไม่มีอยู่หรือคุณไม่มีสิทธิ์ในการเข้าถึง
          </motion.p>

          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={() => router.replace("/dashboard")}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700  shadow-md flex items-center"
            >
              <span className="material-symbols-outlined mr-2">home</span>
              กลับหน้าหลัก
            </button>
          </motion.div>

          <motion.div
            className="mt-8 text-sm text-gray-400 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="material-symbols-outlined mr-1 text-base">
              info
            </span>
            หากต้องการสิทธิ์การเข้าถึง โปรดติดต่อผู้ดูแลระบบ
          </motion.div>
        </motion.div>
      );
    }

    switch (matchedProject.database) {
      case "anatomy":
        return <AnatomyPage />;
      case "cmuvc":
        return <CmuvcPage />;
      case "vetrun":
        return <VetRunPage />;
      default:
        return <div className="text-center py-10">โครงการทั่วไป</div>;
    }
  };

  // ตรวจสอบว่าควรแสดงหน้าโฮมหรือไม่
  const shouldRenderHome =
    (!projectId && !database) || (!matchedProject && projectId && database);

  if (loading)
    return (
      <>
        <div className="relative w-5 h-5">
          <div className="w-5 h-5 border-2 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-5 h-5 border-2 border-t-[#325e8c] border-transparent rounded-full animate-spin"></div>
        </div>
        <motion.span
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-[#325e8c] font-medium ml-2 text-sm"
        >
          กำลังโหลด...
        </motion.span>
      </>
    );

  // ถ้าไม่มีโครงการเลย (แม้จะไม่ใช่ super admin ก็ตาม)
  if (projectData.length === 0 && !isSuperAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6"
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 1.5,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200"
        >
          <span className="material-symbols-outlined text-6xl text-gray-400">
            folder_off
          </span>
        </motion.div>

        <motion.h2
          className="text-2xl md:text-3xl font-bold text-gray-700 mb-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="material-symbols-outlined align-middle mr-2">
            warning
          </span>
          ยังไม่ได้รับสิทธิเข้าถึงโปรเจกต์
        </motion.h2>

        <motion.p
          className="text-gray-500 mb-8 max-w-md text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          คุณยังไม่มีสิทธิ์เข้าถึงโปรเจกต์ในส่วนทะเบียนนี้
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700  shadow-md flex items-center justify-center">
            <span className="material-symbols-outlined mr-2">
              contact_support
            </span>
            ติดต่อผู้ดูแลระบบ
          </button>

          <button
            onClick={() => router.replace("/dashboard")}
            className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50  shadow-sm flex items-center justify-center"
          >
            <span className="material-symbols-outlined mr-2">home</span>
            กลับหน้าหลัก
          </button>
        </motion.div>

        <motion.div
          className="mt-12 text-gray-400 text-sm flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="material-symbols-outlined mr-1 text-base">info</span>
          หากคุณคิดว่าเป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ
        </motion.div>
      </motion.div>
    );
  }

  const renderPageHome = () => {
    return (
      <div className="min-h-screen flex flex-col relative">
        <PermissionGuard submenuIdCode={submenuIdFinance} />
        {/* Header */}
        <div className="bg-white shadow-sm">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full mx-auto text-gray-800 py-6 px-6 flex justify-between items-center"
          >
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-blue-600 text-3xl">
                folder_code
              </span>
              <h1 className="text-2xl font-semibold text-gray-800">
                โครงการหรือสัมมนา
              </h1>
            </div>

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`px-4 py-2 rounded-lg   flex items-center space-x-2 shadow-sm ${
                isSearchOpen
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isSearchOpen ? (
                <>
                  <span className="material-symbols-outlined text-sm">
                    close
                  </span>
                  <span className="text-sm">ปิดค้นหา</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">
                    search
                  </span>
                  <span className="text-sm">ค้นหาโครงการ</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isSearchOpen ? "auto" : 0,
              opacity: isSearchOpen ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 pb-6">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  placeholder="ค้นหาโครงการ (ชื่อหรือคำอธิบาย)..."
                  className="w-full p-4 pl-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm "
                />
                <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  search
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Project Grid */}
        <div className="w-full mx-auto py-6">
          {currentProjects.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {currentProjects.map((project) => (
                <motion.div
                  key={project.projectId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{
                    y: -8,
                    boxShadow: "0 15px 30px -5px rgba(0,0,0,0.1)",
                  }}
                  className="bg-white shadow-md overflow-hidden cursor-pointer border border-gray-100 hover:border-blue-100  "
                  onClick={() => handleRouter(project)}
                >
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <span className="material-symbols-outlined text-blue-600 text-2xl">
                          folder
                        </span>
                      </div>
                      <h2 className="font-semibold text-gray-800 text-lg line-clamp-1">
                        {project.name}
                      </h2>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3 mb-5 flex-grow">
                      {project.description || "ไม่มีคำอธิบาย"}
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                        {dayjs(project.createdAt).format(configTime.FULL_TIME)}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1 transition-colors">
                        <span>ดูรายละเอียด</span>
                        <span className="material-symbols-outlined text-base">
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <div className="p-6 bg-gray-50 rounded-full mb-6">
                <span className="material-symbols-outlined text-gray-400 text-5xl">
                  folder_off
                </span>
              </div>
              <h3 className="text-xl font-medium text-gray-500 mb-2">
                {searchQuery ? "ไม่พบโครงการที่ค้นหา" : "ยังไม่มีโครงการ"}
              </h3>
              <p className="text-gray-400 mb-6 text-center max-w-md">
                {searchQuery
                  ? "ลองใช้คำค้นหาอื่นหรือล้างการค้นหาเพื่อดูโครงการทั้งหมด"
                  : "เมื่อมีโครงการหรือสัมมนาใหม่ จะแสดงที่นี่"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    handleSearch("");
                  }}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span className="material-symbols-outlined text-sm">
                    refresh
                  </span>
                  <span>ล้างการค้นหา</span>
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && renderPagination()}
      </div>
    );
  };

  // ส่วนแสดง Pagination
  const renderPagination = () => {
    const pageNumbers = [];
    const ellipsis = "...";

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 4) {
        pageNumbers.push(1, 2, 3, 4, 5, ellipsis, totalPages);
      } else if (currentPage > totalPages - 4) {
        pageNumbers.push(
          1,
          ellipsis,
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pageNumbers.push(
          1,
          ellipsis,
          currentPage - 1,
          currentPage,
          currentPage + 1,
          ellipsis,
          totalPages
        );
      }
    }

    return (
      <div className="fixed bottom-6 right-6 flex items-center gap-1 bg-white/80 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-200">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-100 rounded-lg disabled:opacity-40 hover:bg-gray-200 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">
            chevron_left
          </span>
        </button>
        {pageNumbers.map((number, index) => (
          <button
            key={index}
            onClick={() => typeof number === "number" && setCurrentPage(number)}
            className={`px-3 py-1 rounded-lg min-w-[36px]  ${
              number === currentPage
                ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md"
                : number === ellipsis
                ? "bg-transparent text-gray-400 cursor-default"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
            disabled={number === ellipsis}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-100 rounded-lg disabled:opacity-40 hover:bg-gray-200 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">
            chevron_right
          </span>
        </button>
      </div>
    );
  };

  return (
    <div key={`${projectId}-${database}`}>
      {shouldRenderHome ? (
        renderPageHome()
      ) : matchedProject ? (
        renderProjectContent()
      ) : (
        <div className="fixed inset-0 bg-white/95 flex flex-col items-center justify-center z-50">
          {/* Simple but elegant spinner */}
          <div className="relative w-16 h-16">
            <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>

          {/* Text with fade animation */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-gray-700 font-medium"
          >
            กำลังโหลด...
          </motion.p>
        </div>
      )}
    </div>
  );
}
