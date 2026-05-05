import Link from "next/link";
import { motion } from "framer-motion";
import { useUser } from "@/app/context/UserContext";

interface SubMenu {
  name: string;
  part: string;
  icon?: string;
  submenuId: string; // ✅ ใช้ submenuId ตรงกับฐานข้อมูล
}

interface Menu {
  name: string;
  part?: string;
  icon?: string;
  subMenus?: SubMenu[];
  menuId: string;
}

interface MenuItemProps {
  menu: Menu;
  pathname: string;
  openDropdown: string | null;
  setOpenDropdown: (name: string | null) => void;
  setTextHeader: (text: string) => void;
  isExpanded: boolean;
}

export default function MenuItem({
  menu,
  pathname,
  openDropdown,
  setOpenDropdown,
  setTextHeader,
  isExpanded,
}: MenuItemProps) {
  const { userData, isSuperAdmin } = useUser();

  const accountId = userData?.userId;

  // 🟢 กำหนด ID ของเมนูสาธารณะ (Dashboard)
  const PUBLIC_MENU_ID = "b76cee63-7e99-419f-aca8-576737be5968";
  const FREE_SUBMENU_ID = "4974b013-23e5-4a4a-8f9b-3ca388fa280f"; // ✅ นี่คือ Dashboard

  // 🔐 ฟังก์ชันตรวจสอบสิทธิ์การเข้าถึงเมนู
  const hasAccess = (): boolean => {
    if (!accountId || !userData.UserPermission) return false;

    // ✅ 1. ถ้าเป็นเมนูสาธารณะ (Dashboard) → ให้เข้าถึงได้ทันที
    if (menu.menuId === PUBLIC_MENU_ID) {
      return true;
    }

    // ✅ 2. ถ้าเป็น Super Admin → เข้าถึงทุกเมนูได้
    if (isSuperAdmin) {
      return true;
    }

    const userPermissions = userData.UserPermission;

    // ✅ 3. ถ้าเมนูไม่มี subMenus (เช่น เมนูเดี่ยว) → ตรวจสอบสิทธิ์ตรงที่ menuId
    if (!menu.subMenus || menu.subMenus.length === 0) {
      const hasDirectAccess = userPermissions.some(
        (perm: any) => perm.submenuId === menu.menuId
      );
      return hasDirectAccess;
    }

    // ✅ 4. ถ้ามี subMenus → ต้องมีสิทธิ์ใน submenu ใดๆ หรือเป็น submenu ฟรี
    const accessibleSubMenus = menu.subMenus.filter(
      (subMenu) =>
        subMenu.submenuId === FREE_SUBMENU_ID || // submenu ฟรี
        userPermissions.some(
          (perm: any) => perm.submenuId === subMenu.submenuId
        )
    );

    return accessibleSubMenus.length > 0;
  };

  // ❌ ถ้าไม่มีสิทธิ์ และไม่ใช่ Dashboard หรือ Super Admin → ไม่แสดงเมนู
  if (!hasAccess()) {
    return null;
  }

  // 🖼️ ฟังก์ชันแสดงเมนู
  function renderMenuItem() {
    const isActive =
      (menu.part && pathname === menu.part) ||
      (menu.subMenus && menu.subMenus.some((item) => pathname === item.part));
    const isOpen = openDropdown === menu.name;

    // ✅ Super Admin เข้าถึง submenu ทั้งหมด
    const accessibleSubMenus = isSuperAdmin
      ? menu.subMenus ?? []
      : menu.subMenus?.filter((subMenu) =>
          userData?.UserPermission?.some(
            (perm: any) => perm.submenuId === subMenu.submenuId
          )
        ) ?? [];

    return (
      <div className="relative">
        {/* เมนูแบบ Dropdown (มี subMenus) */}
        {menu.subMenus ? (
          <>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOpenDropdown(isOpen ? null : menu.name)}
              className={`w-full text-left py-3 px-3 rounded-lg flex items-center justify-between ${
                isActive ? "bg-blue-600/30 text-white" : "hover:bg-gray-700/50"
              }`}
            >
              <div className="flex items-center">
                <span className="material-symbols-outlined text-white/90 text-[12px]">
                  {menu.icon || "dashboard"}
                </span>
                <motion.span
                  className="ml-3 hidden md:block text-[12px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isExpanded ? 1 : 0 }}
                >
                  {menu.name}
                </motion.span>
              </div>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                className="hidden md:block"
              >
                <span className="material-symbols-outlined text-[12px]">
                  expand_more
                </span>
              </motion.span>
            </motion.button>

            {/* เมนูย่อย (subMenus) */}
            {/* เมนูย่อย (subMenus) */}
            <motion.div
              initial="hidden"
              animate={isOpen ? "visible" : "hidden"}
              variants={{
                hidden: { opacity: 0, height: 0 },
                visible: { opacity: 1, height: "auto" },
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="pl-2 ml-2 border-l-2 border-gray-600/30" // ❌ ลบ overflow-hidden ออก
            >
              {accessibleSubMenus.map((subMenu) => (
                <Link
                  key={subMenu.submenuId}
                  href={subMenu.part ?? ""}
                  onClick={() => setTextHeader(subMenu.name)}
                  className={`flex items-center py-2 px-3 rounded-lg my-1 ${
                    pathname === subMenu.part
                      ? "bg-blue-600/20 text-white"
                      : "hover:bg-gray-700/30"
                  }`}
                >
                  <span className="material-symbols-outlined text-[12px] text-white/70">
                    {subMenu.icon || "description"}
                  </span>
                  <motion.span
                    className="ml-3 hidden md:block text-[12px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isExpanded ? 1 : 0 }}
                  >
                    {subMenu.name}
                  </motion.span>
                </Link>
              ))}
            </motion.div>
          </>
        ) : (
          /* เมนูแบบเดี่ยว (ไม่มี subMenus) เช่น Dashboard */
          <Link
            href={menu.part || "#"}
            onClick={() => setTextHeader(menu.name)}
            className={`flex items-center py-3 px-1 rounded-lg ${
              pathname === menu.part
                ? "bg-blue-600/30 text-white"
                : "hover:bg-gray-700/50"
            }`}
          >
            <span className="material-symbols-outlined text-white/90 text-[12px]">
              {menu.icon || "dashboard"}
            </span>
            <motion.span
              className="ml-3 hidden md:block text-[12px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: isExpanded ? 1 : 0 }}
            >
              {menu.name}
            </motion.span>
          </Link>
        )}
      </div>
    );
  }

  // ✅ แสดงเมนูหากผ่านการตรวจสอบ (หรือเป็น Dashboard)
  return renderMenuItem();
}
