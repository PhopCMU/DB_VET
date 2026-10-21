"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Mic,
  CalendarCheck,
  Building2,
  List,
  Store,
  Stethoscope,
  CalendarDays,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import { useUser } from "@/app/context/UserContext";
import ParticipantsList_Main from "./components/ParticipantsList_Main";
import ParticipantsList_Pre from "./components/ParticipantsList_Pre";
import SponsorsList from "./components/SponsorsList";
import Loading from "@/components/Loadings/Loading";
import VetList from "./components/VetList";
import InternshipRAtList from "./components/InternshipList_RA";
import StudentsList from "./components/StudentsList";
import SettingsPanel from "./components/SettingsPanel";
import PersonnelList from "./components/PersonnelList";
import Dashboards from "./components/Dashboards";
import SponsorsBootsList from "./components/SponsorsBootsList";
import Events from "./components/Events";
import packageVersion from "@/package.json";

// Menu theme — single green accent for the whole CMUVC section (used sparingly: icon + active state only)
const menuTheme = {
  accent: "bg-[#176b56]",
  text: "text-[#176b56]",
  active: "bg-[#e8f2ed] text-[#125844]",
  ring: "ring-[#c9ded2]",
};

export default function CmuvcPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboards");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const { loading } = useUser();

  if (loading) return <Loading />;

  const toggleMenu = () => {
    setCollapsed((prev) => !prev);
  };

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="flex h-screen  overflow-hidden">
      {/* Side Menu */}
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: collapsed ? 76 : 260 }}
        transition={{
          type: "spring",
          damping: 32,
          stiffness: 300,
          mass: 0.8,
        }}
        className="bg-white flex flex-col border-r border-[#e4e9e4]"
      >
        {/* Header */}
        <div className="h-16 shrink-0 px-4 flex items-center justify-between border-b border-gray-100">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                key="brand"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.2 } }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                className="flex items-center gap-2.5 min-w-0"
              >
                <div className="w-9 h-9 shrink-0 rounded-xl bg-[#176b56] flex items-center justify-center shadow-sm">
                  <Stethoscope className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-[15px] text-[#173c34] leading-tight truncate">
                    CMUVC
                  </h2>
                  <p className="text-[11px] text-gray-400 leading-tight truncate">
                    ระบบจัดการงานสัมมนา
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            onClick={toggleMenu}
            aria-label={collapsed ? "ขยายเมนู" : "ย่อเมนู"}
            whileTap={{ scale: 0.92 }}
            transition={{ duration: 0.15 }}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors duration-150 shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </motion.button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 text-sm overflow-y-auto overflow-x-hidden scrollbar-thin">
          {/* Dashboards */}
          <MenuItem
            active={activeMenu === "dashboards"}
            onClick={() => setActiveMenu("dashboards")}
            icon={LayoutDashboard}
            label="แดชบอร์ด"
            subLabel="Dashboards"
            collapsed={collapsed}
          />

          {/* Participants Dropdown */}
          <MenuItem
            active={
              activeMenu === "participants_main" ||
              activeMenu === "participants_pre"
            }
            icon={Users}
            label="ผู้เข้าร่วมงาน"
            subLabel="Participants"
            collapsed={collapsed}
            isDropdown
            isOpen={openDropdown === "participants"}
            toggleDropdown={() => toggleDropdown("participants")}
          >
            <MenuItem
              active={activeMenu === "participants_main"}
              onClick={() => setActiveMenu("participants_main")}
              icon={Mic}
              label="งานสัมมนาหลัก"
              collapsed={collapsed}
              isSubItem
            />
            <MenuItem
              active={activeMenu === "participants_pre"}
              onClick={() => setActiveMenu("participants_pre")}
              icon={CalendarCheck}
              label="กิจกรรมก่อนสัมมนา"
              collapsed={collapsed}
              isSubItem
            />
          </MenuItem>

          {/* Sponsors Dropdown */}
          <MenuItem
            active={activeMenu === "sponsors" || activeMenu === "sponsor_boot"}
            icon={Building2}
            label="ผู้สนับสนุน"
            subLabel="Sponsors"
            collapsed={collapsed}
            isDropdown
            isOpen={openDropdown === "sponsors"}
            toggleDropdown={() => toggleDropdown("sponsors")}
          >
            <MenuItem
              active={activeMenu === "sponsors"}
              onClick={() => setActiveMenu("sponsors")}
              icon={List}
              label="รายชื่อผู้สนับสนุน"
              collapsed={collapsed}
              isSubItem
            />
            <MenuItem
              active={activeMenu === "sponsor_boot"}
              onClick={() => setActiveMenu("sponsor_boot")}
              icon={Store}
              label="ผู้สนับสนุนบูธ"
              collapsed={collapsed}
              isSubItem
            />
          </MenuItem>

          {/* Veterinary Dropdown */}
          <MenuItem
            active={activeMenu === "vet"}
            icon={Stethoscope}
            label="สัตวแพทย์"
            subLabel="Veterinary"
            collapsed={collapsed}
            isDropdown
            isOpen={openDropdown === "veterinary"}
            toggleDropdown={() => toggleDropdown("veterinary")}
          >
            <MenuItem
              active={activeMenu === "vet"}
              onClick={() => setActiveMenu("vet")}
              icon={Stethoscope}
              label="รายชื่อสัตวแพทย์"
              collapsed={collapsed}
              isSubItem
            />
          </MenuItem>

          {/* Students */}
          {/* <MenuItem
            active={activeMenu === "students"}
            onClick={() => setActiveMenu("students")}
            icon={GraduationCap}
            label="Students"
            collapsed={collapsed}
            theme={menuThemes.students}
          /> */}

          {/* Personnel Dropdown */}
          {/* <MenuItem
            active={activeMenu === "personnel"}
            icon={BadgeCheck}
            label="Personnel"
            collapsed={collapsed}
            isDropdown
            isOpen={openDropdown === "personnel"}
            toggleDropdown={() => toggleDropdown("personnel")}
            theme={menuThemes.personnel}
          >
            <MenuItem
              active={activeMenu === "personnel"}
              onClick={() => setActiveMenu("personnel")}
              icon={UserCog}
              label="Person List"
              collapsed={collapsed}
              isSubItem
              theme={menuThemes.personnel}
            />
          </MenuItem> */}

          {/* Events */}
          <MenuItem
            active={activeMenu === "events"}
            onClick={() => setActiveMenu("events")}
            icon={CalendarDays}
            label="การเข้าร่วมกิจกรรม"
            subLabel="Events"
            collapsed={collapsed}
          />

          {/* Settings */}
          <MenuItem
            active={activeMenu === "settings"}
            onClick={() => setActiveMenu("settings")}
            icon={Settings}
            label="ตั้งค่า"
            subLabel="Settings"
            collapsed={collapsed}
          />
        </nav>

        {/* Footer */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2 } }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="px-4 py-3 border-t border-gray-100"
            >
              <div className="text-[11px] text-gray-400 text-center">
                v{packageVersion.version} © 2026 CMUVC
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#f4f6f4] p-3 sm:p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, y: 8 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
            }}
            exit={{
              opacity: 0,
              y: -8,
              transition: { duration: 0.15, ease: [0.4, 0, 1, 1] },
            }}
            className="min-h-full"
            style={{
              willChange: "opacity, transform",
              backfaceVisibility: "hidden",
            }}
          >
            {activeMenu === "dashboards" && <Dashboards />}
            {activeMenu === "participants_main" && <ParticipantsList_Main />}
            {activeMenu === "participants_pre" && <ParticipantsList_Pre />}
            {activeMenu === "sponsors" && <SponsorsList />}
            {activeMenu === "sponsor_boot" && <SponsorsBootsList />}
            {activeMenu === "vet" && <VetList />}
            {activeMenu === "internship_RA" && <InternshipRAtList />}
            {activeMenu === "students" && <StudentsList />}
            {activeMenu === "personnel" && <PersonnelList />}
            {activeMenu === "events" && <Events />}
            {activeMenu === "settings" && <SettingsPanel />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// Menu Item Component
interface MenuItemProps {
  active?: boolean;
  icon: React.ElementType;
  label: string;
  subLabel?: string;
  onClick?: () => void;
  collapsed?: boolean;
  isDropdown?: boolean;
  isOpen?: boolean;
  toggleDropdown?: () => void;
  children?: React.ReactNode;
  isSubItem?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  active = false,
  icon: Icon,
  label,
  subLabel,
  onClick,
  collapsed = false,
  isDropdown = false,
  isOpen = false,
  toggleDropdown,
  children,
  isSubItem = false,
}) => {
  return (
    <div>
      <motion.button
        onClick={isDropdown ? toggleDropdown : onClick}
        aria-expanded={isDropdown ? isOpen : undefined}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.12 }}
        className={`w-full text-left flex items-center gap-2.5 rounded-lg transition-colors duration-150 ${
          isSubItem ? "pl-8 pr-2.5 py-2 text-[13px]" : "px-2.5 py-2.5"
        } ${
          active
            ? `${menuTheme.active} font-medium`
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        } ${collapsed ? "justify-center px-0" : ""} relative group`}
      >
        {/* Active accent bar */}
        {active && !collapsed && (
          <motion.span
            layoutId={isSubItem ? undefined : "activeIndicator"}
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full ${menuTheme.accent}`}
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
          />
        )}

        {/* Icon */}
        <Icon
          className={`shrink-0 ${
            isSubItem ? "w-4 h-4" : "w-[18px] h-[18px]"
          } ${active ? menuTheme.text : "text-gray-400 group-hover:text-gray-500"}`}
          strokeWidth={2}
        />

        {!collapsed && (
          <span className="flex-1 flex items-center justify-between min-w-0 gap-2">
            <span className="min-w-0">
              <span className="block truncate leading-snug">{label}</span>
              {subLabel && (
                <span className="block truncate text-[11px] font-normal leading-snug text-gray-400">
                  {subLabel}
                </span>
              )}
            </span>

            {isDropdown && (
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="shrink-0"
              >
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </motion.span>
            )}
          </span>
        )}

        {/* Tooltip for collapsed state */}
        {collapsed && (
          <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap pointer-events-none z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            {label}
          </span>
        )}
      </motion.button>

      {/* Dropdown content */}
      {isDropdown && !collapsed && (
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: "auto",
                opacity: 1,
                transition: {
                  height: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
                  opacity: { duration: 0.15 },
                },
              }}
              exit={{
                height: 0,
                opacity: 0,
                transition: {
                  height: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
                  opacity: { duration: 0.1 },
                },
              }}
              className="overflow-hidden"
            >
              <div className="mt-0.5 space-y-0.5 pb-0.5">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
