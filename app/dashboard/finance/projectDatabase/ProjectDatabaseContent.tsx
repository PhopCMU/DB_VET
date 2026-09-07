"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import { getProject } from "@/app/routers/getService";
import {
  ProjectModel,
  ProjectWithPermissions,
} from "@/app/model/projectModel";
import { useRouter, useSearchParams } from "next/navigation";
import { AnatomyPage } from "./pages/anatomy/page";
import CmuvcPage from "./pages/cmuvc/page";
import VetRunPage from "./pages/vetrun/page";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { configTime } from "@/config/config_time";
import PermissionGuard from "@/components/Guards/PermissionGuard";
import TsarPage from "./pages/tsar/page";
import {
  ArrowUpRight,
  CalendarDays,
  FolderKanban,
  Layers3,
  Search,
  X,
} from "lucide-react";

const submenuIdFinance = "e432a5bf-eda0-4638-848d-26df9194f57e";

const moduleCardStyles: Record<string, { label: string; accent: string }> = {
  anatomy: { label: "Anatomy", accent: "bg-rose-500" },
  cmuvc: { label: "CMUVC", accent: "bg-sky-500" },
  tsar: { label: "TSAR", accent: "bg-amber-500" },
  vetrun: { label: "Vet Run", accent: "bg-emerald-500" },
};

export default function RegisterProjectDatabasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData, loading, isSuperAdmin } = useUser();
  const [projectData, setProjectData] = useState<ProjectWithPermissions[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<
    ProjectWithPermissions[]
  >([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
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
  const [matchedProject, setMatchedProject] =
    useState<ProjectWithPermissions | null>(null);

  // หา project ที่ตรงกับ projectId + database (super admin ไม่ต้องตรวจสอบ permission)
  useEffect(() => {
    if (!projectId || !database || !userData?.userId) {
      setMatchedProject(null);
      return;
    }

    const match = projectData.find((p) => {
      if (isSuperAdmin) {
        return p.projectId === projectId && p.database === database;
      }
      return (
        p.projectId === projectId &&
        p.database === database &&
        p.UserPermission.some(
          (perm) =>
            perm.userId === userData.userId &&
            perm.submenuId === submenuIdFinance &&
            perm.view === true,
        )
      );
    });

    setMatchedProject(match || null);
  }, [projectId, database, projectData, userData?.userId, isSuperAdmin]);

  // ตรวจสอบความถูกต้องของ projectId และ database
  useEffect(() => {
    if (projectData.length > 0) {
      const valid = projectData.some((p) => {
        if (isSuperAdmin) {
          return p.projectId === projectId && p.database === database;
        }
        return (
          p.projectId === projectId &&
          p.database === database &&
          p.UserPermission.some(
            (perm) =>
              perm.userId === userData?.userId &&
              perm.submenuId === submenuIdFinance &&
              perm.view === true,
          )
        );
      });

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
  }, [projectId, database, projectData, isSuperAdmin, router, userData?.userId]);

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
        const allProjects = await getProject();

        let filtered: ProjectWithPermissions[];
        if (isSuperAdmin) {
          filtered = allProjects;
        } else {
          filtered = allProjects.filter((project) =>
            project.UserPermission.some(
              (perm) =>
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
  const displayProjects = searchQuery.trim()
    ? filteredProjects
    : projectData;
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
      <div className="relative flex min-h-screen flex-col bg-[#f3f7f5]">
        <PermissionGuard submenuIdCode={submenuIdFinance} />
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-emerald-950/10 bg-[#f3f7f5]/90 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-5 py-5 sm:px-8"
          >
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-sm shadow-emerald-950/20">
                <FolderKanban aria-hidden="true" size={22} strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <h1
                  id="project-library-heading"
                  className="truncate text-lg font-bold text-emerald-950 sm:text-xl"
                >
                  โครงการหรือสัมมนา
                </h1>
                <p className="mt-0.5 text-xs font-medium text-emerald-800/65">
                  คลังข้อมูลโครงการ {displayProjects.length} รายการ
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-expanded={isSearchOpen}
              aria-label={isSearchOpen ? "ปิดค้นหา" : "ค้นหาโครงการ"}
              className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:px-4 ${
                isSearchOpen
                  ? "bg-white text-emerald-950 ring-1 ring-emerald-950/10 hover:bg-emerald-50"
                  : "bg-emerald-700 text-white shadow-sm shadow-emerald-950/20 hover:bg-emerald-800"
              }`}
            >
              {isSearchOpen ? (
                <X aria-hidden="true" size={18} />
              ) : (
                <Search aria-hidden="true" size={18} />
              )}
              <span className="hidden sm:inline">
                {isSearchOpen ? "ปิดค้นหา" : "ค้นหาโครงการ"}
              </span>
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
            <div className="mx-auto max-w-[1600px] px-5 pb-5 sm:px-8">
              <div className="relative">
                <Search
                  aria-hidden="true"
                  size={19}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-emerald-800/55"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  placeholder="ค้นหาโครงการ (ชื่อหรือคำอธิบาย)..."
                  aria-label="ค้นหาโครงการ"
                  className="w-full rounded-lg border border-emerald-950/10 bg-white py-3.5 pl-12 pr-11 text-sm text-emerald-950 placeholder:text-emerald-950/45 shadow-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      handleSearch("");
                    }}
                    aria-label="ล้างคำค้นหา"
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-emerald-800/60 transition hover:bg-emerald-50 hover:text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                  >
                    <X aria-hidden="true" size={17} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Project Grid */}
        <section
          aria-labelledby="project-library-heading"
          className="mx-auto w-full max-w-[1600px] flex-1 px-5 py-8 sm:px-8 sm:py-10"
        >
          {currentProjects.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
            >
              {currentProjects.map((project, index) => (
                <motion.article
                  key={project.projectId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(index, 8) * 0.04,
                  }}
                  whileHover={{ y: -3 }}
                  className="group relative flex min-h-[250px] flex-col overflow-hidden rounded-lg border border-emerald-950/10 bg-white p-5 text-left shadow-[0_8px_22px_-16px_rgba(6,78,59,0.45)] transition-[border-color,box-shadow] hover:border-emerald-700/30 hover:shadow-[0_18px_36px_-20px_rgba(6,78,59,0.5)] focus-within:border-emerald-700 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-emerald-700"
                >
                  <button
                    type="button"
                    onClick={() => handleRouter(project)}
                    aria-label={`เปิดดูโครงการ ${project.name}`}
                    className="absolute inset-0 z-10 cursor-pointer rounded-lg focus:outline-none"
                  />
                  {(() => {
                    const moduleStyle = moduleCardStyles[project.database] ?? {
                      label: project.database || "General",
                      accent: "bg-slate-500",
                    };

                    return (
                      <>
                        <div
                          aria-hidden="true"
                          className={`absolute inset-x-0 top-0 h-1 ${moduleStyle.accent}`}
                        />
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800 transition-colors group-hover:bg-emerald-100">
                            <Layers3 aria-hidden="true" size={20} strokeWidth={1.8} />
                          </div>
                          <span className="max-w-[65%] truncate rounded-md bg-emerald-950/[0.06] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-950/70">
                            {moduleStyle.label}
                          </span>
                        </div>

                        <div className="mt-5">
                          <p className="text-xs font-semibold text-emerald-800/60">
                            โครงการ {String(indexOfFirstProject + index + 1).padStart(2, "0")}
                          </p>
                          <h2 className="mt-1.5 line-clamp-2 text-lg font-bold leading-snug text-emerald-950">
                            {project.name}
                          </h2>
                        </div>

                        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-emerald-950/65">
                          {project.description || "ไม่มีคำอธิบายสำหรับโครงการนี้"}
                        </p>

                        <div className="mt-5 flex items-end justify-between gap-3 border-t border-emerald-950/10 pt-4">
                          <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-emerald-950/60">
                            <CalendarDays aria-hidden="true" size={15} />
                            <span className="truncate">
                              {dayjs(project.createdAt).format(configTime.FULL_TIME)}
                            </span>
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-emerald-800">
                            เปิดดู
                            <ArrowUpRight
                              aria-hidden="true"
                              size={17}
                              className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            />
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </motion.article>
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
        </section>

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
