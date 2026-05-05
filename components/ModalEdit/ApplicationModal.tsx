import { useToast } from "@/app/hooks/useToast";
import { MenuItem, SubMenu } from "@/app/model/menuModel";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import ToastNotification from "../Tooltips/ToastNotification";
import { LoadingModal } from "../Modal";
import { InputField } from "../Input/InputField";
import {
  PutEditMenu_Role,
  PutEditSubMenu_Role,
} from "@/app/routers/updateService";
import { motion } from "framer-motion";

interface MenuEditModalProps {
  formMenu: MenuItem | null; // ใช้สำหรับรับข้อมูลเมนูที่จะแก้ไข
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedMenu: MenuItem | null) => void;
  visitorId: string | null;
  title: string;
}

interface SubMenuEditModalProps {
  formSubMenu: SubMenu | null; // ใช้สำหรับรับข้อมูลเมนูที่
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedSubMenu: SubMenu | null) => void;
  visitorId: string | null;
  title: string;
}

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2, ease: "easeIn" },
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const MenuEditModal: React.FC<MenuEditModalProps> = ({
  formMenu,
  isOpen,
  onClose,
  onUpdate,
  visitorId,
  title,
}) => {
  const [editedMenu, setEditedMenu] = useState<MenuItem | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast, showToast, hideToast } = useToast();

  // อัปเดต editedMenu เมื่อ formMenu เปลี่ยน
  useEffect(() => {
    if (isOpen && formMenu) {
      setEditedMenu({ ...formMenu });
    }
  }, [formMenu, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedMenu((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = async () => {
    if (!editedMenu || !editedMenu?.menuId) {
      return showToast("ข้อมูลไม่สมบูรณ์", "warning");
    }
    if (!editedMenu.name) return showToast("กรุณากรอกชื่อเมนู", "warning");
    if (!editedMenu.icon) return showToast("กรุณาใส่ไอคอน", "warning");
    if (!editedMenu.part) return showToast("กรุณากำหนดเส้นทาง", "warning");
    if (!editedMenu.position === null)
      return showToast("กรุณากำหนดดำแหน่ง", "warning");

    const payload = {
      menuId: editedMenu.menuId,
      name: editedMenu.name,
      icon: editedMenu.icon,
      part: editedMenu.part,
      position: editedMenu.position,
    };

    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([_, value]) => value !== undefined && value !== ""
      )
    );

    setIsLoading(true);
    setUploadProgress(0);

    try {
      const response = await PutEditMenu_Role(
        filteredPayload as MenuItem,
        visitorId,
        setUploadProgress
      );

      if (!response) {
        return showToast("ไม่สามารถบันทึกข้อมูลได้", "error");
      }

      if (response.success) {
        onUpdate(response?.data as MenuItem);
        setIsLoading(false);
        onClose(); // ปิด modal หลังบันทึกสำเร็จ
      } else {
        showToast("บันทึกข้อมูลไม่สำเร็จ", "error");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to update:", error);
      showToast("บันทึกข้อมูลไม่สำเร็จ", "error");
    }
  };

  const handleCancel = () => {
    setEditedMenu(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      ariaHideApp={false}
      contentLabel="Animal Edit Modal"
      className="fixed inset-0 flex items-center justify-center z-30"
      overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm"
      onRequestClose={handleCancel}
    >
      {/* Overlay Animation */}
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        // onClick={handleCancel}
      />

      {/* Modal Content Animation */}
      <motion.div
        className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-2xl md:w-2xl mx-auto my-10 outline-none border border-white/20 relative"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <ToastNotification
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />

        <LoadingModal isOpen={isLoading} progress={uploadProgress} />

        <motion.div
          className="space-y-4 p-6 bg-white rounded-xl shadow-md border border-gray-100"
          variants={contentVariants}
        >
          <motion.div
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="material-symbols-outlined text-3xl text-indigo-500">
              menu
            </span>
            <h2 className="text-2xl font-bold text-gray-800">
              {title || "แก้ไขข้อมูลเมนู"}
            </h2>
          </motion.div>

          {editedMenu ? (
            <>
              {/* Input Fields with individual animations */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <InputField
                  label="ชื่อเมนู"
                  name="name"
                  value={editedMenu.name}
                  onChange={handleInputChange}
                  icon={
                    <span className="material-symbols-outlined text-gray-400">
                      edit_note
                    </span>
                  }
                />
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <InputField
                  label="ไอคอน"
                  name="icon"
                  value={editedMenu.icon}
                  onChange={handleInputChange}
                  icon={
                    <span className="material-symbols-outlined text-gray-400">
                      {editedMenu.icon}
                    </span>
                  }
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <InputField
                  label="Module Path"
                  name="part"
                  value={editedMenu.part || ""}
                  onChange={handleInputChange}
                  icon={
                    <span className="material-symbols-outlined text-gray-400">
                      conversion_path
                    </span>
                  }
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <InputField
                  label="ลำดับการแสดง"
                  name="position"
                  type="number"
                  value={editedMenu.position}
                  onChange={handleInputChange}
                  min="0"
                  icon={
                    <span className="material-symbols-outlined text-gray-400">
                      add_location
                    </span>
                  }
                />
              </motion.div>

              <motion.div
                className="mt-6 flex justify-end gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  ยกเลิก
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="material-symbols-outlined">save</span>
                  <span>บันทึก</span>
                </motion.button>
              </motion.div>
            </>
          ) : (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              กำลังโหลดข้อมูล...
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </Modal>
  );
};

export const SubMenuEditModal: React.FC<SubMenuEditModalProps> = ({
  formSubMenu,
  isOpen,
  onClose,
  onUpdate,
  visitorId,
  title,
}) => {
  const [editedSubMenu, setEditedSubMenu] = useState<SubMenu | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast, showToast, hideToast } = useToast();

  // อัปเดต editedSubMenu เมื่อ formSubMenu เปลี่ยน
  useEffect(() => {
    if (isOpen && formSubMenu) {
      setEditedSubMenu({ ...formSubMenu });
    }
  }, [formSubMenu, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditedSubMenu((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSave = async () => {
    if (!editedSubMenu || !editedSubMenu.submenuId) {
      return showToast("ข้อมูลไม่สมบูรณ์", "warning");
    }

    if (!editedSubMenu.name)
      return showToast("กรุณากรอกชื่อเมนูย่อย", "warning");
    if (!editedSubMenu.icon) return showToast("กรุณาใส่ไอคอน", "warning");
    if (!editedSubMenu.part) return showToast("กรุณากำหนดเส้นทาง", "warning");
    if (editedSubMenu.position === null)
      return showToast("กรุณากำหนดตำแหน่ง", "warning");

    const payload = {
      submenuId: editedSubMenu.submenuId,
      menuId: editedSubMenu.menuId,
      name: editedSubMenu.name,
      icon: editedSubMenu.icon,
      part: editedSubMenu.part,
      position: editedSubMenu.position,
    };

    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([_, value]) => value !== undefined && value !== ""
      )
    );

    setIsLoading(true);
    setUploadProgress(0);

    if (!filteredPayload.submenuId) {
      return showToast("ไม่มีไอดีของเมนูย่อย", "warning");
    }

    if (!filteredPayload.menuId) {
      return showToast("ไม่มีไอดีของเมนูหลัก", "warning");
    }

    try {
      const response = await PutEditSubMenu_Role(
        filteredPayload as SubMenu | any, // ออย่าลืมเปลี่ยน any เป็น SubMenu
        visitorId,
        setUploadProgress
      );

      if (!response) {
        return showToast("ไม่สามารถบันทึกข้อมูลได้", "error");
      }

      if (response.success) {
        onUpdate(response?.data as SubMenu);
        setIsLoading(false);
        onClose(); // ปิด modal หลังบันทึกสำเร็จ
      } else {
        showToast("บันทึกข้อมูลไม่สำเร็จ", "error");
        setIsLoading(false);
      }
    } catch (error) {
      showToast("ข้อผิดพลาด", "error");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedSubMenu(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      ariaHideApp={false}
      contentLabel="Animal Edit Modal"
      className="fixed inset-0 flex items-center justify-center z-30"
      overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm"
      onRequestClose={handleCancel}
    >
      {/* Overlay Animation */}
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        // onClick={handleCancel}
      />

      {/* Modal Content Animation */}
      <motion.div
        className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-2xl md:w-2xl mx-auto my-10 outline-none border border-white/20 relative"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <ToastNotification
          isVisible={toast.isVisible}
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />

        <LoadingModal isOpen={isLoading} progress={uploadProgress} />

        <motion.div
          className="space-y-4 p-6 bg-white rounded-xl shadow-md border border-gray-100"
          variants={contentVariants}
        >
          <motion.div
            className="flex items-center gap-3 mb-6"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="material-symbols-outlined text-3xl text-indigo-500">
              menu
            </span>
            <h2 className="text-2xl font-bold text-gray-800">
              {title || "แก้ไขข้อมูลเมนู"}
            </h2>
          </motion.div>

          {editedSubMenu ? (
            <>
              {/* Input Fields with individual animations */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <InputField
                  label="ชื่อเมนู"
                  name="name"
                  value={editedSubMenu.name}
                  onChange={handleInputChange}
                  icon={
                    <span className="material-symbols-outlined text-gray-400">
                      edit_note
                    </span>
                  }
                />
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <InputField
                  label="ไอคอน"
                  name="icon"
                  value={editedSubMenu.icon}
                  onChange={handleInputChange}
                  icon={
                    <span className="material-symbols-outlined text-gray-400">
                      {editedSubMenu.icon}
                    </span>
                  }
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <InputField
                  label="Module Path"
                  name="part"
                  value={editedSubMenu.part || ""}
                  onChange={handleInputChange}
                  icon={
                    <span className="material-symbols-outlined text-gray-400">
                      conversion_path
                    </span>
                  }
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <InputField
                  label="ลำดับการแสดง"
                  name="position"
                  type="number"
                  value={editedSubMenu.position || ""}
                  onChange={handleInputChange}
                  min="0"
                  icon={
                    <span className="material-symbols-outlined text-gray-400">
                      add_location
                    </span>
                  }
                />
              </motion.div>

              <motion.div
                className="mt-6 flex justify-end gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  ยกเลิก
                </motion.button>
                <motion.button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="material-symbols-outlined">save</span>
                  <span>บันทึก</span>
                </motion.button>
              </motion.div>
            </>
          ) : (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              กำลังโหลดข้อมูล...
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </Modal>
  );
};
