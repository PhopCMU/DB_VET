"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { useMenuStore } from "@/store/menuStore";
import UserSection from "./UserSection";
import MenuItem from "./MenuItem";
import { useUser } from "@/app/context/UserContext";
import Loading from "../Loadings/Loading";

export default function Sidebar({
  setTextHeader,
}: {
  setTextHeader: (text: string) => void;
}) {
  const pathname = usePathname();
  const { menuData, fetchMenuData } = useMenuStore();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const { userData, loading } = useUser();

  // ดึงข้อมูลเมื่อโหลด
  useEffect(() => {
    fetchMenuData();
  }, [pathname, fetchMenuData]);

  // เปิด dropdown เมนูที่ active
  useEffect(() => {
    const activeMenu = menuData.find((menu) =>
      menu.subMenus?.some((item: any) => pathname === item.part)
    );
    setOpenDropdown(activeMenu ? activeMenu.name : null);
  }, [menuData, pathname]);

  // ตรวจขนาดหน้าจอเพื่อ toggle isExpanded
  useEffect(() => {
    const handleResize = () => setIsExpanded(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  if (loading) return <Loading />;
  return (
    <motion.aside
      initial={isExpanded ? "expanded" : "collapsed"}
      animate={isExpanded ? "expanded" : "collapsed"}
      variants={{
        expanded: { width: 256 },
        collapsed: { width: 64 },
      }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-b from-gray-800 to-gray-900 text-white p-4 fixed top-0 left-0 z-20 shadow-xl flex flex-col"
      style={{ height: "100vh", overflowY: "auto" }} // ✅ สำคัญมาก
    >
      <UserSection userData={userData} isExpanded={isExpanded} />

      <nav className="mt-4 text-sm space-y-1 flex-1">
        {menuData.map((menu) => (
          <MenuItem
            key={menu.name}
            menu={menu}
            pathname={pathname}
            openDropdown={openDropdown}
            setOpenDropdown={setOpenDropdown}
            setTextHeader={setTextHeader}
            isExpanded={isExpanded}
          />
        ))}
      </nav>
    </motion.aside>
  );
}
