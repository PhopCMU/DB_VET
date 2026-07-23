import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Menu,
} from "lucide-react";
import ParticipantsList_Tsar from "./components/ParticipantsList_Tsar";
import { useUser } from "@/app/context/UserContext";
import Loading from "@/components/Loadings/Loading";
import { useState } from "react";
import packageVersion from "@/package.json";

const menuThemes = {
  tsar: {
    accent: "bg-violet-500",
    text: "text-violet-600",
    active: "bg-violet-50 text-violet-700",
    ring: "ring-violet-200",
  },
};

export default function TsarPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState("tsar");
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
        className="bg-white flex flex-col  "
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
                <div className="w-8 h-8 shrink-0 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Menu className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-[15px] text-gray-900 leading-tight truncate">
                    TSAR DATA
                  </h2>
                  <p className="text-[11px] text-gray-400 leading-tight truncate">
                    Management System
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
            active={activeMenu === "tsar"}
            onClick={() => setActiveMenu("tsar")}
            icon={LayoutDashboard}
            label="TSAR Participants"
            collapsed={collapsed}
            theme={menuThemes.tsar}
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
      <main className="flex-1 p-2 overflow-auto">
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
            className="bg-white p-4"
            style={{
              willChange: "opacity, transform",
              backfaceVisibility: "hidden",
            }}
          >
            {activeMenu === "tsar" && <ParticipantsList_Tsar />}
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
  onClick?: () => void;
  collapsed?: boolean;
  isDropdown?: boolean;
  isOpen?: boolean;
  toggleDropdown?: () => void;
  children?: React.ReactNode;
  isSubItem?: boolean;
  theme?: {
    accent: string;
    text: string;
    active: string;
    ring: string;
  };
}

const defaultTheme = {
  accent: "bg-gray-400",
  text: "text-gray-600",
  active: "bg-gray-100 text-gray-800",
  ring: "ring-gray-200",
};

const MenuItem: React.FC<MenuItemProps> = ({
  active = false,
  icon: Icon,
  label,
  onClick,
  collapsed = false,
  isDropdown = false,
  isOpen = false,
  toggleDropdown,
  children,
  isSubItem = false,
  theme,
}) => {
  const currentTheme = theme || defaultTheme;

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
            ? `${currentTheme.active} font-medium`
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        } ${collapsed ? "justify-center px-0" : ""} relative group`}
      >
        {/* Active accent bar */}
        {active && !collapsed && (
          <motion.span
            layoutId={isSubItem ? undefined : "activeIndicator"}
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full ${currentTheme.accent}`}
            transition={{ type: "spring", stiffness: 500, damping: 40 }}
          />
        )}

        {/* Icon */}
        <Icon
          className={`shrink-0 ${
            isSubItem ? "w-4 h-4" : "w-[18px] h-[18px]"
          } ${active ? currentTheme.text : "text-gray-400 group-hover:text-gray-500"}`}
          strokeWidth={2}
        />

        {!collapsed && (
          <span className="flex-1 flex items-center justify-between min-w-0">
            <span className="truncate">{label}</span>

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
