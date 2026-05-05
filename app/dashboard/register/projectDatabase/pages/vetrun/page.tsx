"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useUser } from "@/app/context/UserContext";
import Loading from "@/components/Loadings/Loading";
import { Dashboards } from "./components/Dashboards";
import Participants from "./components/Participants";
import AddLogoSponsors from "./components/AddLogoSponsors";
import { Settings } from "./components/Settings";

export default function VetRunPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboards");
  const [openDropdown, setOpenDropdown] = useState(null);

  const { loading } = useUser();

  if (loading) return <Loading />;

  const toggleMenu = () => {
    setCollapsed((prev) => !prev);
  };

  const toggleDropdown = (dropdown: any) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Side Menu */}
      <motion.aside
        initial={{ width: 256 }}
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ type: "spring", damping: 20 }}
        className="bg-white border-r border-gray-200 flex flex-col"
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          {!collapsed && (
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl text-gray-800 inline-flex items-center gap-1"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "2rem" }}
              >
                menu_open
              </span>
              VET RUN
            </motion.h2>
          )}
          <button
            onClick={toggleMenu}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span className="material-symbols-outlined">
              {collapsed ? "chevron_right" : "chevron_left"}
            </span>
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 text-[12px]">
          {/* Dashboards */}
          <MenuItem
            active={activeMenu === "dashboards"}
            onClick={() => setActiveMenu("dashboards")}
            icon="space_dashboard"
            label="Dashboards"
            collapsed={collapsed}
          />

          {/* Participants Dropdown */}
          <MenuItem
            active={activeMenu === "participants"}
            icon="groups"
            label="Participants"
            collapsed={collapsed}
            isDropdown
            isOpen={openDropdown === "participants_main"}
            toggleDropdown={() => toggleDropdown("participants_main")}
          >
            <MenuItem
              active={activeMenu === "participants"}
              onClick={() => setActiveMenu("participants")}
              icon="adaptive_audio_mic"
              label="List Participants"
              collapsed={collapsed}
              isSubItem
            />
          </MenuItem>

          {/* Sponsors Dropdown */}

          <MenuItem
            active={activeMenu === "sponsors"}
            icon="corporate_fare"
            label="Sponsors"
            collapsed={collapsed}
            isDropdown
            isOpen={openDropdown === "sponsors"}
            toggleDropdown={() => toggleDropdown("sponsors")}
          >
            <MenuItem
              active={activeMenu === "sponsors"}
              onClick={() => setActiveMenu("sponsors")}
              icon="list_alt"
              label="Add Logos"
              collapsed={collapsed}
              isSubItem
            />
          </MenuItem>

          {/* Settings */}
          <MenuItem
            active={activeMenu === "settings"}
            onClick={() => setActiveMenu("settings")}
            icon="settings"
            label="Settings"
            collapsed={collapsed}
          />
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMenu}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            {activeMenu === "dashboards" && <Dashboards />}
            {activeMenu === "participants" && <Participants />}
            {activeMenu === "sponsors" && <AddLogoSponsors />}
            {activeMenu === "settings" && <Settings />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// Menu Item Component
const MenuItem = ({
  active,
  icon,
  label,
  onClick,
  collapsed,
  isDropdown = false,
  isOpen = false,
  toggleDropdown,
  children,
  isSubItem = false,
}: any) => {
  return (
    <div className={`${isSubItem ? "ml-1" : ""}`}>
      <motion.button
        onClick={isDropdown ? toggleDropdown : onClick}
        whileHover={{
          backgroundColor: active ? "#EFF6FF" : "#F9FAFB",
          x: !collapsed ? 2 : 0,
        }}
        whileTap={{ scale: 0.98 }}
        className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg  ${
          active
            ? "bg-blue-50 text-blue-600 font-medium"
            : "text-gray-700 hover:bg-gray-50"
        } ${isSubItem ? "pl-5" : ""} ${
          collapsed ? "justify-center" : ""
        } relative overflow-hidden`}
      >
        {/* Active indicator */}
        {active && !collapsed && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 w-1 h-6 bg-blue-600/50 rounded-r-full"
            initial={false}
          />
        )}

        {/* Icon with subtle background */}
        <motion.span
          className={`material-symbols-outlined flex items-center justify-center ${
            active ? "text-blue-600/50" : "text-gray-500"
          } ${collapsed ? "text-2xl" : "text-xl"}`}
        >
          {icon}
        </motion.span>

        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex items-center justify-between"
          >
            <span>{label}</span>

            {isDropdown && (
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className={`material-symbols-outlined text-xl ${
                  active ? "text-blue-500/40" : "text-gray-400"
                }`}
              >
                expand_more
              </motion.span>
            )}
          </motion.div>
        )}
      </motion.button>

      {/* Dropdown content */}
      {isDropdown && !collapsed && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden pl-2"
              style={{ originY: 0 }}
            >
              <div className="border-l-2 border-gray-100 pl-1 py-1 space-y-1">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
