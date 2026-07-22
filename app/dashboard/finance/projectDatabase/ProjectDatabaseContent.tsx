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
import TsarPage from "./pages/tsar/page";

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
    null,
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
            perm.view === true,
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
            perm.view === true,
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
                perm.view === true,
            ),
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
        project.description.toLowerCase().includes(text.toLowerCase()),
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
    indexOfLastProject,
  );

  // เปลี่ยนไปยังโครงการ
  const handleRouter = (project: ProjectModel) => {
    router.push(
      `/dashboard/finance/projectDatabase?Project=${project.projectId}&Module=${project.database}`,
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
          className="mx-4 my-6 flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 text-center"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 ring-1 ring-rose-100">
            <span className="material-symbols-outlined text-3xl text-rose-500">
              search_off
            </span>
          </div>

          <h3 className="text-lg font-semibold text-slate-800 tracking-tight">
            ไม่พบโครงการ หรือไม่มีสิทธิ์เข้าถึง
          </h3>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
            โครงการที่คุณค้นหาอาจไม่มีอยู่ หรือคุณไม่มีสิทธิ์ในการเข้าถึง
            หากต้องการสิทธิ์การเข้าถึง โปรดติดต่อผู้ดูแลระบบ
          </p>

          <button
            onClick={() => router.replace("/dashboard")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            <span className="material-symbols-outlined text-base">home</span>
            กลับหน้าหลัก
          </button>
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
      case "tsar":
        return <TsarPage />;
      default:
        return <div className="text-center py-10">โครงการทั่วไป</div>;
    }
  };

  // ตรวจสอบว่าควรแสดงหน้าโฮมหรือไม่
  const shouldRenderHome =
    (!projectId && !database) || (!matchedProject && projectId && database);

  if (loading)
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center justify-center min-h-screen bg-slate-50"
      >
        <div className="relative w-10 h-10">
          <div className="w-10 h-10 border-4 border-slate-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-10 h-10 border-4 border-t-emerald-600 border-transparent rounded-full animate-spin"></div>
        </div>
        <motion.span
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-slate-500 font-medium mt-3 text-sm tracking-wide"
        >
          กำลังโหลดข้อมูล...
        </motion.span>
      </div>
    );

  // ถ้าไม่มีโครงการเลย (แม้จะไม่ใช่ super admin ก็ตาม)
  if (projectData.length === 0 && !isSuperAdmin) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6"
      >
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_20px_60px_-15px_rgba(15,23,42,0.15)]">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 2.2,
              ease: "easeInOut",
              repeat: Infinity,
            }}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-100"
          >
            <span className="material-symbols-outlined text-3xl text-amber-500">
              lock
            </span>
          </motion.div>

          <h2 className="text-xl font-semibold text-slate-800 tracking-tight">
            ยังไม่ได้รับสิทธิ์เข้าถึงโปรเจกต์
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            คุณยังไม่มีสิทธิ์เข้าถึงโปรเจกต์ในส่วนทะเบียนนี้
            หากคิดว่าเป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ
          </p>

          <div className="mt-8 flex flex-col gap-2.5">
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500">
              <span className="material-symbols-outlined text-base">
                contact_support
              </span>
              ติดต่อผู้ดูแลระบบ
            </button>

            <button
              onClick={() => router.replace("/dashboard")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              <span className="material-symbols-outlined text-base">home</span>
              กลับหน้าหลัก
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const renderPageHome = () => {
    return (
      <div className="relative flex min-h-screen flex-col bg-slate-50">
        <PermissionGuard submenuIdCode={submenuIdFinance} />
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex w-full items-center justify-between px-6 py-5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 ring-1 ring-emerald-100">
                <span className="material-symbols-outlined text-2xl text-emerald-600">
                  folder_code
                </span>
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                  โครงการหรือสัมมนา
                </h1>
                <p className="text-xs text-slate-400">
                  {displayProjects.length} โครงการทั้งหมด
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-expanded={isSearchOpen}
              aria-label={isSearchOpen ? "ปิดค้นหา" : "ค้นหาโครงการ"}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
                isSearchOpen
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {isSearchOpen ? "close" : "search"}
              </span>
              <span>{isSearchOpen ? "ปิดค้นหา" : "ค้นหาโครงการ"}</span>
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
            <div className="mx-auto max-w-7xl px-6 pb-5">
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  placeholder="ค้นหาโครงการ (ชื่อหรือคำอธิบาย)..."
                  aria-label="ค้นหาโครงการ"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-transparent focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      handleSearch("");
                    }}
                    aria-label="ล้างคำค้นหา"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  >
                    <span className="material-symbols-outlined text-base">
                      close
                    </span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Project Grid */}
        <div className="mx-auto w-full flex-1 px-6 py-8">
          {currentProjects.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {currentProjects.map((project, index) => (
                <motion.div
                  key={project.projectId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(index, 8) * 0.04,
                  }}
                  whileHover={{ y: -4 }}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleRouter(project)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleRouter(project);
                    }
                  }}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg hover:shadow-slate-200/60  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
                >
                  <div className="flex h-full flex-col p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 ring-1 ring-emerald-100 transition-colors group-hover:bg-emerald-100">
                        <span className="material-symbols-outlined text-xl text-emerald-600">
                          folder
                        </span>
                      </div>
                      <h2 className="line-clamp-1 text-base font-semibold text-slate-800">
                        {project.name}
                      </h2>
                    </div>
                    <p className="mb-5 line-clamp-3 flex-grow text-sm leading-relaxed text-slate-500">
                      {project.description || "ไม่มีคำอธิบาย"}
                    </p>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-500">
                        {dayjs(project.createdAt).format(configTime.FULL_TIME)}
                      </span>
                      <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 transition-transform group-hover:translate-x-0.5">
                        ดูรายละเอียด
                        <span className="material-symbols-outlined text-base">
                          arrow_forward
                        </span>
                      </span>
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
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                <span className="material-symbols-outlined text-3xl text-slate-400">
                  folder_off
                </span>
              </div>
              <h3 className="mb-1.5 text-base font-semibold text-slate-700">
                {searchQuery ? "ไม่พบโครงการที่ค้นหา" : "ยังไม่มีโครงการ"}
              </h3>
              <p className="mb-6 max-w-md text-center text-sm text-slate-400">
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
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
                >
                  <span className="material-symbols-outlined text-base">
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
          totalPages,
        );
      } else {
        pageNumbers.push(
          1,
          ellipsis,
          currentPage - 1,
          currentPage,
          currentPage + 1,
          ellipsis,
          totalPages,
        );
      }
    }

    return (
      <nav
        aria-label="เปลี่ยนหน้าโครงการ"
        className="fixed bottom-6 right-6 z-10 flex items-center gap-1 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-lg shadow-slate-200/60 backdrop-blur-md"
      >
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          aria-label="หน้าก่อนหน้า"
          className="rounded-xl px-2.5 py-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <span className="material-symbols-outlined text-lg">
            chevron_left
          </span>
        </button>
        {pageNumbers.map((number, index) => (
          <button
            key={index}
            onClick={() => typeof number === "number" && setCurrentPage(number)}
            aria-current={number === currentPage ? "page" : undefined}
            disabled={number === ellipsis}
            className={`min-w-[36px] rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              number === currentPage
                ? "bg-emerald-600 text-white shadow-sm"
                : number === ellipsis
                  ? "cursor-default bg-transparent text-slate-300"
                  : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          aria-label="หน้าถัดไป"
          className="rounded-xl px-2.5 py-2 text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <span className="material-symbols-outlined text-lg">
            chevron_right
          </span>
        </button>
      </nav>
    );
  };

  return (
    <div key={`${projectId}-${database}`}>
      {shouldRenderHome ? (
        renderPageHome()
      ) : matchedProject ? (
        renderProjectContent()
      ) : (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95"
        >
          <div className="relative h-12 w-12">
            <div className="h-12 w-12 rounded-full border-4 border-slate-100"></div>
            <div className="absolute left-0 top-0 h-12 w-12 animate-spin rounded-full border-4 border-t-emerald-600 border-transparent"></div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 text-sm font-medium text-slate-500"
          >
            กำลังโหลด...
          </motion.p>
        </div>
      )}
    </div>
  );
}
