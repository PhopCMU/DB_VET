"use client";
import { useEffect, useRef, useState } from "react";
import { menuSidebar } from "@/app/routers/getService";
import {
  SubMenu,
  FormData,
  Menu,
  MenuItem,
  SubMenuId,
  MenuId,
  MenuSidebarResponse,
} from "@/app/model/menuModel";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { postAddMenu, postAddSubMenu } from "@/app/routers/postService";
import {
  AlertConfirm,
  AlertMessageFailed,
  AlertMessageSuccess,
} from "@/components/AlertMessage";
import { useMenuStore } from "@/store/menuStore";
import { reMoveMenu, reMoveSubMenu } from "@/app/routers/deleteService";
import { useUser } from "@/app/context/UserContext";
import { useToast } from "@/app/hooks/useToast";
import ToastNotification from "@/components/Tooltips/ToastNotification";
import { useVisitor } from "@/lib/fingerprintjs-shim";
import {
  MenuEditModal,
  SubMenuEditModal,
} from "@/components/ModalEdit/ApplicationModal";

import PermissionGuard from "@/components/Guards/PermissionGuard";
import { usePermission } from "@/app/context/UsePermission";

export default function ManageApplicationPage() {
  const SUB_MENU_ID = "aac000ba-a57e-475c-8884-69ec5c5d8482";
  const [menus, setMenus] = useState<MenuSidebarResponse[]>([]);
  const [menuForm, setMenuForm] = useState<FormData>({
    name: "",
    icon: "",
    part: "",
    position: "9999",
  });
  const [submenuForm, setSubmenuForm] = useState<FormData>({
    name: "",
    icon: "",
    part: "",
    position: "9999",
  });

  const [editMenu, setEditMenu] = useState<MenuItem | null>(null);
  const [editSubmenu, setEditSubmenu] = useState<SubMenu | null>(null);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [showSubmenuForm, setShowSubmenuForm] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateFailed, setUpdateFailed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<SubMenuId | null>(null);
  const [confirmDeleteMenu, setConfirmDeleteMenu] = useState<MenuId | null>(
    null,
  );
  const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
  const [isModalOpenEditSub, setIsModalOpenEditSub] = useState(false);
  const [message, setMessage] = useState("");
  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const [alert, setAlert] = useState<{
    message: string;
    variant: "success" | "error" | "warning" | "info";
  } | null>(null);

  const hasMenu = useRef(false);

  const { userData, isSuperAdmin } = useUser();
  const { data } = useVisitor();
  const { toast, showToast, hideToast } = useToast();
  const { fetchMenuData } = useMenuStore();

  // ฟังก์ชันคัดลอกข้อความ
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setAlert({
          message: `คัดลอก ${label} สำเร็จ: ${text}`,
          variant: "info",
        });
        setTimeout(() => setAlert(null), 2000); // ปิด Alert อัตโนมัติใน 2 วินาที
      })
      .catch(() => {
        setAlert({
          message: `คัดลอก ${label} ไม่สำเร็จ`,
          variant: "error",
        });
      });
  };

  const fetchMenuDataList = async () => {
    try {
      const result: any = await menuSidebar();
      if (result) {
        setMenus(result || []);
      }
    } catch (error) {
      console.error("Failed to fetch menu data:", error);
    }
  };

  useEffect(() => {
    if (!hasMenu.current) {
      fetchMenuDataList();
      hasMenu.current = true;
    }
  }, []);

  useEffect(() => {
    if (isUpdated && hasMenu.current) {
      fetchMenuDataList();
      fetchMenuData();
      setIsUpdated(false);
    }
  }, [isUpdated]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    setForm: React.Dispatch<React.SetStateAction<FormData>>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMenuSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newMenu: Menu = {
      name: menuForm.name,
      icon: menuForm.icon,
      part: menuForm.part,
      position: menuForm.position ? parseInt(menuForm.position) : null,
    };
    const updatedMenu = await postAddMenu(newMenu);
    if (updatedMenu) {
      setUpdateSuccess(true);
      setMessage("เพิ่มข้อมูลเมนูสำเร็จ");
      showToast("เพิ่มข้อมูลเมนูสำเร็จ", "success");
      await fetchMenuDataList();
      await fetchMenuData();
      setMenuForm({ name: "", icon: "", part: "", position: "" });
      setShowMenuForm(false);
    } else {
      setUpdateFailed(true);
      setMessage("Update Failed");
    }
  };

  const handleSubmenuSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMenuId) return;
    const newSubmenu: SubMenu = {
      menuId: selectedMenuId,
      name: submenuForm.name,
      icon: submenuForm.icon,
      part: submenuForm.part,
      position: submenuForm.position ? parseInt(submenuForm.position) : null,
    };
    const updatedSubMenu = await postAddSubMenu(newSubmenu);
    if (updatedSubMenu) {
      setUpdateSuccess(true);
      setMessage("เพิ่มข้อมูลเมนูย่อยสำเร็จ");
      showToast("เพิ่มข้อมูลเมนูย่อยสำเร็จ", "success");
      await fetchMenuDataList();
      await fetchMenuData();
      setSubmenuForm({ name: "", icon: "", part: "", position: "" });
      setSelectedMenuId(null);
      setShowSubmenuForm(false);
    } else {
      setUpdateFailed(true);
      setMessage("Update Failed");
    }
  };

  const handleRemoveMenu = async () => {
    const menuUuid: any = confirmDeleteMenu;
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(menuUuid)) {
      setAlert({
        message: "รหัสเมนูไม่ถูกต้อง: ต้องเป็น UUID",
        variant: "error",
      });
      setConfirmDelete(null);
      return;
    }
    if (menuUuid) {
      const remove = await reMoveMenu(menuUuid);
      if (remove) {
        setUpdateSuccess(true);
        setMessage("ลบข้อมูลเมนูสำเร็จ");
        showToast("ลบข้อมูลเมนูสำเร็จ", "success");
        await fetchMenuDataList();
        await fetchMenuData();
      } else {
        setUpdateFailed(true);
        setMessage("Remove Failed");
      }
    }
  };

  const handleRemoveSubMenu = async () => {
    const subId: any = confirmDelete;
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(subId)) {
      setAlert({
        message: "รหัสเมนูย่อยไม่ถูกต้อง: ต้องเป็น UUID",
        variant: "error",
      });
      setConfirmDelete(null);
      return;
    }
    if (subId) {
      const remove = await reMoveSubMenu(subId);
      if (remove) {
        setUpdateSuccess(true);
        setMessage("ลบข้อมูลเมนูย่อยสำเร็จ");
        showToast("ลบข้อมูลเมนูย่อยสำเร็จ", "success");
        await fetchMenuDataList();
        await fetchMenuData();
      } else {
        setUpdateFailed(true);
        setMessage("Remove Failed");
      }
    }
  };

  const handleOpenModalEdit = (menu: MenuItem) => {
    setEditMenu(menu);
    setIsModalOpenEdit(true);
  };

  const handleOpenModalEditSub = (submenu: SubMenu) => {
    setEditSubmenu(submenu);
    setIsModalOpenEditSub(true);
  };

  const pathToBreadcrumb = (path: string): string => {
    if (!path) return "";

    // ตัด / ตัวแรกออก แล้วแยกเป็นส่วนๆ
    const parts = path.slice(1).split("/");

    // กรองค่าว่างออก (กรณี path สิ้นสุดด้วย /)
    const filteredParts = parts.filter((part) => part !== "");

    // ถ้าไม่มี part เหลือ ให้ return ค่าว่าง
    if (filteredParts.length === 0) return "";

    // ดึง part ตัวสุดท้าย
    const lastPart = filteredParts[filteredParts.length - 1];

    // จัดรูปแบบ: เปลี่ยน - เป็น space, ตัวแรกพิมพ์ใหญ่
    const formatted = lastPart
      .replace(/-/g, " ")
      .replace(/^\w/, (c) => c.toUpperCase());

    // เพิ่ม " → " ไว้ข้างหน้า
    return ` → ${formatted}`;
  };

  const { canCreate, canEdit, canDelete } = usePermission(SUB_MENU_ID, "");

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const formVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8 mb-20">
      <PermissionGuard submenuIdCode="aac000ba-a57e-475c-8884-69ec5c5d8482" />
      <div className="max-w-7xl mx-auto">
        {/* ToastNotification */}
        <ToastNotification
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />

        {/* Edit Menu */}
        <MenuEditModal
          formMenu={editMenu}
          isOpen={isModalOpenEdit}
          title="แก้ไขเมนู"
          visitorId={data?.visitorId || ""}
          onClose={() => setIsModalOpenEdit(false)}
          onUpdate={async (updatedMenu: any) => {
            if (!updatedMenu) return;
            showToast("แก้ไขเมนูสำเร็จ", "success");
            await fetchMenuData();
            setIsUpdated(true);
            setIsModalOpenEdit(false);
          }}
        />

        {/* Edit SubMenu */}
        <SubMenuEditModal
          formSubMenu={editSubmenu}
          isOpen={isModalOpenEditSub}
          title="แก้ไขเมนูย่อย"
          visitorId={data?.visitorId || ""}
          onClose={() => setIsModalOpenEditSub(false)}
          onUpdate={async (updatedSubMenu: any) => {
            if (!updatedSubMenu) return;
            showToast("แก้ไขเมนูย่อยสำเร็จ", "success");

            await fetchMenuData();
            setIsUpdated(true);
            setIsModalOpenEditSub(false);
          }}
        />
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Application & Modules
          </h1>
          <motion.button
            onClick={() => isSuperAdmin && setShowMenuForm(true)}
            className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-lg shadow-md ${
              isSuperAdmin
                ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                : "bg-gray-400 cursor-not-allowed opacity-80"
            } duration-200`}
            whileHover={
              isSuperAdmin
                ? {
                    scale: 1.03,
                    boxShadow: "0 4px 6px -1px rgba(37, 99, 235, 0.4)",
                  }
                : {}
            }
            whileTap={isSuperAdmin ? { scale: 0.97 } : {}}
            disabled={!isSuperAdmin}
          >
            <span className="material-symbols-outlined text-lg">
              {isSuperAdmin ? "add" : "block"}
            </span>
            <span className="font-medium">
              {isSuperAdmin ? "สร้างเมนูหลัก" : "ไม่มีสิทธิ์สร้างเมนูหลัก"}
            </span>
          </motion.button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-500">
                menu
              </span>
              รายการเมนูทั้งหมด
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ชื่อเมนู
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ตำแหน่ง
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Module Path
                  </th>

                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    การจัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {menus.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 text-center text-gray-500 italic"
                    >
                      <div className="flex flex-col items-center justify-center py-8">
                        <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">
                          inbox
                        </span>
                        ยังไม่มีเมนูที่สร้าง
                      </div>
                    </td>
                  </tr>
                ) : (
                  menus?.map((menu: any) => (
                    <React.Fragment key={menu.menuId}>
                      {/* เมนูหลัก */}
                      <motion.tr
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        className="hover:bg-blue-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          <div className="flex items-center gap-3">
                            {menu.icon && (
                              <motion.span
                                whileHover={{ scale: 1.1 }}
                                className="material-symbols-outlined text-blue-600 bg-blue-100/80 p-2 rounded-lg shadow-sm group-hover:bg-blue-200/50 transition-colors"
                              >
                                {menu.icon}
                              </motion.span>
                            )}
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2 group">
                                <span className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                                  {menu.name}
                                </span>
                                <motion.span
                                  whileHover={{ scale: 1.1 }}
                                  className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full"
                                >
                                  เมนูหลัก
                                </motion.span>
                              </div>
                              <motion.span
                                whileHover={{ scale: 1.02 }}
                                className="font-light text-xs text-gray-500 hover:text-blue-600 cursor-pointer transition-colors inline-flex items-center gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(menu.menuId, "รหัสเมนูหลัก");
                                }}
                                title="คลิกเพื่อคัดลอก"
                              >
                                {menu.menuId}
                                <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                  content_copy
                                </span>
                              </motion.span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200/50">
                            {menu.position}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200/50">
                            {menu.part ? menu.part : "-"}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* ปุ่มเพิ่มเมนูย่อย */}

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                if (canCreate) {
                                  setSelectedMenuId(menu.menuId);
                                  setShowSubmenuForm(true);
                                } else {
                                  () => {};
                                }
                              }}
                              className={`${
                                canCreate
                                  ? " text-white bg-blue-500 hover:bg-blue-600 "
                                  : " bg-gray-400 cursor-not-allowed text-white"
                              } text-xs inline-flex items-center gap-x-1 px-3 py-1.5 rounded-lg shadow-sm font-medium`}
                              title="เพิ่มเมนูย่อย"
                            >
                              <span className="material-symbols-outlined text-sm">
                                {canCreate ? "add" : "do_not_disturb_off"}
                              </span>
                              {canCreate ? "เพิ่มเมนูย่อย" : "ไม่ได้รับสิทธิ์"}
                            </motion.button>

                            {/* ปุ่มแก้ไข */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                if (canEdit) {
                                  handleOpenModalEdit(menu);
                                }
                              }}
                              className={`text-xs inline-flex items-center gap-x-1 px-3 py-1.5 rounded-lg shadow-sm font-medium ${
                                canEdit
                                  ? "text-white bg-amber-500 hover:bg-amber-600"
                                  : "text-gray-100 bg-gray-400 cursor-not-allowed"
                              }`}
                              title={canEdit ? "แก้ไข" : "ไม่มีสิทธิ์แก้ไข"}
                            >
                              <span className="material-symbols-outlined text-sm">
                                {canEdit ? "edit" : "edit_off"}
                              </span>
                              {canEdit ? "แก้ไข" : "ไม่มีสิทธิ์แก้ไข"}
                            </motion.button>

                            {/* ปุ่มลบ */}
                            {menu.subMenus.length === 0 && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  if (canDelete) {
                                    setConfirmDeleteMenu(menu.menuId);
                                  }
                                }}
                                className={`text-xs inline-flex items-center gap-x-1 px-3 py-1.5 rounded-lg shadow-sm font-medium ${
                                  canDelete
                                    ? "text-white bg-red-500 hover:bg-red-600"
                                    : "text-gray-100 bg-gray-400 cursor-not-allowed"
                                }`}
                                title={canDelete ? "ลบ" : "ไม่มีสิทธิ์ลบ"}
                              >
                                <span className="material-symbols-outlined text-sm">
                                  delete{" "}
                                  {canDelete ? "delete" : "delete_forever"}
                                </span>
                                {canDelete ? "ลบ" : "ไม่มีสิทธิ์ลบ"}
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>

                      {/* เมนูย่อย */}
                      {menu.subMenus.map((submenu: any) => (
                        <motion.tr
                          key={submenu.submenuId}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          className="bg-gray-50/50 hover:bg-gray-100/50 transition-colors group"
                        >
                          <td className="px-6 py-4 pl-16">
                            <div className="flex items-center gap-3">
                              {submenu.icon && (
                                <motion.span
                                  whileHover={{ scale: 1.1 }}
                                  className="material-symbols-outlined text-gray-600 bg-gray-200/70 p-2 rounded-lg shadow-sm group-hover:bg-gray-300/50 transition-colors"
                                >
                                  {submenu.icon}
                                </motion.span>
                              )}
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 group">
                                  <span className="text-gray-700 group-hover:text-blue-700 transition-colors">
                                    {submenu.name}
                                  </span>
                                  <motion.span
                                    whileHover={{ scale: 1.1 }}
                                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full"
                                  >
                                    เมนูย่อย
                                  </motion.span>
                                </div>
                                <motion.span
                                  whileHover={{ scale: 1.02 }}
                                  className="font-light text-xs text-gray-500 hover:text-blue-600 cursor-pointer transition-colors inline-flex items-center gap-1"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(
                                      submenu.submenuId,
                                      "รหัสเมนูย่อย",
                                    );
                                  }}
                                  title="คลิกเพื่อคัดลอก"
                                >
                                  {submenu.submenuId}
                                  <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                    content_copy
                                  </span>
                                </motion.span>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200/50">
                              {submenu.position || "-"}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200/50">
                              {submenu.part
                                ? pathToBreadcrumb(submenu.part)
                                : "-"}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {/* ปุ่มแก้ไข */}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  if (canEdit) {
                                    handleOpenModalEditSub(submenu);
                                  }
                                }}
                                className={`text-xs inline-flex items-center gap-x-1 px-3 py-1.5 rounded-lg shadow-sm font-medium ${
                                  canEdit
                                    ? "text-white bg-amber-500 hover:bg-amber-600"
                                    : "text-gray-100 bg-gray-400 cursor-not-allowed"
                                }`}
                                title={canEdit ? "แก้ไข" : "ไม่มีสิทธิ์แก้ไข"}
                              >
                                <span className="material-symbols-outlined text-sm">
                                  {canEdit ? "edit" : "edit_off"}
                                </span>
                                {canEdit ? "แก้ไข" : "ไม่มีสิทธิ์แก้ไข"}
                              </motion.button>

                              {/* ปุ่มลบ */}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  if (canDelete) {
                                    setConfirmDelete(submenu.submenuId);
                                  }
                                }}
                                className={`text-xs inline-flex items-center gap-x-1 px-3 py-1.5 rounded-lg shadow-sm font-medium ${
                                  canDelete
                                    ? "text-white bg-red-500 hover:bg-red-600"
                                    : "text-gray-100 bg-gray-400 cursor-not-allowed"
                                }`}
                                title={canDelete ? "ลบ" : "ไม่มีสิทธิ์ลบ"}
                              >
                                <span className="material-symbols-outlined text-sm">
                                  {canDelete ? "delete" : "contract_delete"}
                                </span>
                                {canDelete ? "ลบ" : "ไม่มีสิทธิ์ลบ"}
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Form: เพิ่มเมนูหลัก */}
        <AnimatePresence>
          {showMenuForm && (
            <motion.div
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
                whileHover={{ scale: 1.005 }}
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <span className="material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      {editMenu ? "edit_note" : "create_new_folder"}
                    </span>
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                      {editMenu ? "แก้ไขเมนูหลัก" : "สร้างเมนูหลัก"}
                    </span>
                  </h2>
                </div>

                {/* Form */}
                <form onSubmit={handleMenuSubmit} className="p-6 space-y-5">
                  {/* ชื่อเมนู */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                        ชื่อเมนู
                      </span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={menuForm.name}
                      onChange={(e) => handleChange(e, setMenuForm)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white/80 shadow-sm "
                      required
                    />
                  </div>

                  {/* ไอคอน */}
                  <div className="space-y-1">
                    <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                        Icon
                      </span>
                      <span
                        onAbort={() =>
                          window.open(
                            "https://fonts.google.com/icons",
                            "_blank",
                          )
                        }
                        className="text-xs text-gray-500 ml-1 hover:text-blue-600 cursor-pointer"
                      >
                        https://fonts.google.com/icons
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="icon"
                        placeholder="เช่น: dashboard"
                        value={menuForm.icon}
                        onChange={(e) => handleChange(e, setMenuForm)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white/80 shadow-sm  pr-10"
                      />
                      {menuForm.icon && (
                        <span className="absolute right-3 top-2.5 material-symbols-outlined text-gray-500">
                          {menuForm.icon}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Path */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                        Module Path
                      </span>
                    </label>
                    <input
                      type="text"
                      name="part"
                      value={menuForm.part}
                      onChange={(e) => handleChange(e, setMenuForm)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white/80 shadow-sm "
                    />
                  </div>

                  {/* ลำดับการแสดง */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                        ลำดับการแสดง
                      </span>
                    </label>
                    <input
                      type="number"
                      name="position"
                      value={menuForm.position}
                      onChange={(e) => {
                        const value = e.target.value;
                        // ป้องกันค่าติดลบ หรือค่าว่าง
                        if (value === "" || parseFloat(value) >= 0) {
                          handleChange(e, setSubmenuForm);
                        }
                      }}
                      onKeyDown={(e) => {
                        // ป้องกันการพิมพ์เครื่องหมายลบ (-), e, E
                        if (e.key === "-" || e.key === "e" || e.key === "E") {
                          e.preventDefault();
                        }
                      }}
                      min="0"
                      step="1"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white/80 shadow-sm "
                    />
                  </div>

                  {/* ปุ่มดำเนินการ */}
                  <div className="flex gap-3 pt-5">
                    <motion.button
                      type="submit"
                      whileHover={{
                        scale: 1.03,
                        boxShadow: "0 4px 12px -2px rgba(59, 130, 246, 0.3)",
                        background:
                          "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg shadow-md hover:shadow-lg  font-medium"
                    >
                      <span className="drop-shadow-sm">บันทึก</span>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{
                        scale: 1.03,
                        backgroundColor: "rgba(249, 250, 251, 0.9)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowMenuForm(false);
                        setEditMenu(null);
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50/80 bg-white/90 shadow-sm  font-medium"
                    >
                      ยกเลิก
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form: เพิ่มเมนูย่อย */}
        <AnimatePresence>
          {showSubmenuForm && (
            <motion.div
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
                whileHover={{ scale: 1.005 }}
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <span className="material-symbols-outlined text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      {editSubmenu ? "edit_note" : "playlist_add"}
                    </span>
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                      {editSubmenu ? "แก้ไขเมนูย่อย" : "สร้างเมนูย่อย"}
                    </span>
                  </h2>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmenuSubmit} className="p-6 space-y-5">
                  {/* เมนูหลัก */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                        เมนูหลัก
                      </span>
                    </label>
                    <select
                      value={selectedMenuId || ""}
                      onChange={(e) => setSelectedMenuId(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white/80 shadow-sm "
                      required
                      disabled={!!editSubmenu}
                    >
                      <option value="">-- เลือกเมนูหลัก --</option>
                      {menus.map((menu: any) => (
                        <option key={menu.menuId} value={menu.menuId}>
                          {menu.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ชื่อเมนูย่อย */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                        ชื่อเมนูย่อย
                      </span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={submenuForm.name}
                      onChange={(e) => handleChange(e, setSubmenuForm)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white/80 shadow-sm "
                      required
                    />
                  </div>

                  {/* ไอคอน */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                        ไอคอน
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="icon"
                        value={submenuForm.icon}
                        onChange={(e) => handleChange(e, setSubmenuForm)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white/80 shadow-sm  pr-10"
                      />
                      {submenuForm.icon && (
                        <span className="absolute right-3 top-2.5 material-symbols-outlined text-gray-500">
                          {submenuForm.icon}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Path */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                        Path
                      </span>
                    </label>
                    <input
                      type="text"
                      name="part"
                      value={submenuForm.part}
                      onChange={(e) => handleChange(e, setSubmenuForm)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white/80 shadow-sm "
                    />
                  </div>

                  {/* ลำดับการแสดง */}
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-transparent bg-clip-text">
                        ลำดับการแสดง
                      </span>
                    </label>
                    <input
                      type="number"
                      name="position"
                      value={submenuForm.position}
                      onChange={(e) => {
                        const value = e.target.value;
                        // ป้องกันค่าติดลบ หรือค่าว่าง
                        if (value === "" || parseFloat(value) >= 0) {
                          handleChange(e, setSubmenuForm);
                        }
                      }}
                      onKeyDown={(e) => {
                        // ป้องกันการพิมพ์เครื่องหมายลบ (-), e, E
                        if (e.key === "-" || e.key === "e" || e.key === "E") {
                          e.preventDefault();
                        }
                      }}
                      min="0"
                      step="1"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white/80 shadow-sm"
                    />
                  </div>

                  {/* ปุ่มดำเนินการ */}
                  <div className="flex gap-3 pt-5">
                    <motion.button
                      type="submit"
                      whileHover={{
                        scale: 1.03,
                        boxShadow: "0 4px 12px -2px rgba(16, 185, 129, 0.3)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-md hover:shadow-lg  font-medium"
                    >
                      <span className="drop-shadow-sm">บันทึก</span>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowSubmenuForm(false);
                        setEditSubmenu(null);
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50/80 bg-white/90 shadow-sm  font-medium"
                    >
                      ยกเลิก
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alerts */}
        {updateSuccess && (
          <AlertMessageSuccess
            message={message}
            onClose={() => setUpdateSuccess(false)}
          />
        )}
        {updateFailed && (
          <AlertMessageFailed
            message={message}
            onClose={() => setUpdateFailed(false)}
          />
        )}
        {confirmDelete && (
          <AlertConfirm
            message="คุณแน่ใจหรือไม่ว่าต้องการลบเมนูย่อยนี้?"
            variant="warning"
            onClose={() => setConfirmDelete(null)}
            onConfirm={() => handleRemoveSubMenu()}
          />
        )}
        {confirmDeleteMenu && (
          <AlertConfirm
            message="คุณแน่ใจหรือไม่ว่าต้องการลบเมนูนี้?"
            variant="warning"
            onClose={() => setConfirmDeleteMenu(null)}
            onConfirm={() => handleRemoveMenu()}
          />
        )}
        {alert && (
          <AlertConfirm
            message={alert.message}
            variant={alert.variant}
            onClose={() => setAlert(null)}
          />
        )}
      </div>
    </div>
  );
}
