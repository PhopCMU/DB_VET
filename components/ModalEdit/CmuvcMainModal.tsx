import { CmuvcParticipant, Package } from "@/app/model/cmuvc/dashboardModel";
import { motion } from "framer-motion";
import { FC, useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import { InputField, SelectedField } from "../Input/InputField";
import { toast } from "react-toastify";
import { GetPackage } from "@/app/routers/cmuvc/GetRouter";
import { LoadingModal } from "../Modal";
import { PutEditParticipant } from "@/app/routers/cmuvc/PutRouter";

interface MainEditModalProps {
  formData: CmuvcParticipant;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedParticipant: CmuvcParticipant) => void;
  visitorId: string;
  title: string;
  headerTitle: string;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

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

export const ModalEditParticipant_Main: FC<MainEditModalProps> = ({
  formData,
  isOpen,
  onClose,
  onUpdate,
  visitorId,
  title,
  headerTitle,
}) => {
  const [edited, setEdited] = useState<CmuvcParticipant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [onUploadProgress, setOnUploadProgress] = useState<number>(0);
  const [dataPackages, setDataPackages] = useState<Package[]>();

  const hasDataPackage = useRef(false);

  const fetchPackages = async () => {
    if (!visitorId) return toast.warn("ไม่มีข้อมูล ID ประจำ Browser");

    try {
      const response = await GetPackage(visitorId, headerTitle);
      if (!response.success) return toast.error("ไม่สามารถดึงข้อมูล Package");
      setDataPackages(response.data);
    } catch (error: any) {
      toast.error(`เกิดข้อผิดพลาดในการดึง Package`);
    }
  };

  useEffect(() => {
    if (visitorId && !hasDataPackage.current) {
      fetchPackages();
      hasDataPackage.current = true;
    }
    // Reset เมื่อ visitorId เปลี่ยน (กรณีต้องการ refetch เมื่อ visitorId เปลี่ยน)
    return () => {
      if (!visitorId) hasDataPackage.current = false;
    };
  }, [visitorId]);

  // อัปเดต editedMenu เมื่อ formData เปลี่ยน
  useEffect(() => {
    if (isOpen && formData) {
      setEdited({ ...formData });
    }
  }, [formData, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEdited((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleCancel = () => {
    setEdited(null);
    onClose();
  };

  const handleSave = async () => {
    if (!formData?.participantId)
      return toast.warn("ไม่ได้ระบุไอดีผู้เข้าร่วม");
    if (!edited?.fname) return toast.warn("ท่านไม่ได้กรอกชื่อ");
    if (!edited?.lname) return toast.warn("ท่านไม่ได้กรอกนามสกุล");
    if (!edited?.email) return toast.warn("ท่านไม่ได้กรอกอีเมล");
    if (!edited?.price) return toast.warn("ท่านไม่ได้กรอกราคาค่าลงทะเบียน");
    if (!edited?.packages) return toast.warn("ท่านไม่ได้แพ็คเกจ");

    const payload = {
      participantId: formData?.participantId,
      fname: edited?.fname,
      lname: edited?.lname,
      email: edited?.email,
      price: edited?.price,
      package: edited?.packagesId,
    };

    const filteredPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([_, value]) => value !== undefined && value !== ""
      )
    );

    const title = headerTitle;

    setIsLoading(true);
    setOnUploadProgress(0);

    try {
      const response = await PutEditParticipant(
        filteredPayload as any,
        visitorId,
        title,
        setOnUploadProgress
      );

      if (!response.success)
        return toast.error("ไม่สามารถแก้ไขข้อมูลได้"), setIsLoading(false);

      onUpdate(response.success as any);
      setIsLoading(false);
      onClose();
    } catch (error) {
      toast.error(`เกิดข้อผิดพลาดในการแก้ไขข้อมูล`);
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <Modal
      isOpen={isOpen}
      ariaHideApp={false}
      contentLabel="Edit Modal Main"
      className="fixed inset-0 flex items-center justify-center z-30"
      overlayClassName="fixed inset-0"
      // onRequestClose={handleCancel}
    >
      <motion.div
        className="fixed inset-0 bg-black/50"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        // onClick={handleCancel}
      />
      <motion.div
        className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl md:w-2xl mx-auto my-10 outline-none border border-white/20 relative"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <LoadingModal isOpen={isLoading} progress={onUploadProgress} />

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-between items-center"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow-inner">
              <span className="material-symbols-outlined text-3xl text-indigo-600">
                menu
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {title || "แก้ไขข้อมูลเมนู"}
            </h2>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="group flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-b from-white to-gray-50 border border-gray-200 hover:from-red-50 hover:to-red-100 text-gray-400 hover:text-red-600 transition-all duration-300 shadow-sm hover:shadow-md mb-6"
            onClick={handleCancel}
          >
            <span className="material-symbols-outlined text-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-90">
              close
            </span>
          </motion.button>
        </motion.div>

        {edited ? (
          <div className="flex flex-col gap-2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid grid-col-1 gap-2"
            >
              <InputField
                label="ชื่อ"
                name="fname"
                value={edited.fname}
                onChange={handleInputChange}
                icon={
                  <span className="material-symbols-outlined text-gray-400">
                    badge
                  </span>
                }
                required
              />

              <InputField
                label="นามสกุล"
                name="fname"
                value={edited.lname}
                onChange={handleInputChange}
                icon={
                  <span className="material-symbols-outlined text-gray-400">
                    badge
                  </span>
                }
                required
              />

              <InputField
                label="อีเมล"
                name="email"
                value={edited.email}
                onChange={handleInputChange}
                icon={
                  <span className="material-symbols-outlined text-gray-400">
                    alternate_email
                  </span>
                }
                required
              />

              <InputField
                label="ราคา"
                name="price"
                value={edited.price}
                spec="col-span-1"
                onChange={handleInputChange}
                icon={
                  <span className="material-symbols-outlined text-gray-400">
                    attach_money
                  </span>
                }
                required
              />
            </motion.div>

            <SelectedField
              label="Package"
              name="packagesId" // ต้องให้ name ตรงกับ key ใน formData
              value={edited.packagesId}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  inventory
                </span>
              }
              // options={
              //   dataPackages?.map((pkg: Package) => ({
              //     value: pkg.packageId,
              //     label: `${pkg.category_th} [ ${pkg.category_en} ]`,
              //   })) || []
              // }
              options={
                dataPackages?.map((pkg: Package) => ({
                  value: pkg.packageId,
                  label: `${pkg.category_en}`,
                })) || []
              }
              required
            />

            <button
              onClick={handleSave}
              className="mt-5 group relative bg-yellow-500/10 backdrop-yellow-sm text-yellow-700 px-5 py-2.5 flex items-center justify-center gap-2 rounded-xl border border-yellow-300/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-yellow-500/20 hover:text-yellow-800 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:scale-110">
                edit
              </span>
              <span className="font-medium">แก้ไขข้อมูล</span>
            </button>
          </div>
        ) : (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            กำลังโหลดข้อมูล...
          </motion.p>
        )}
      </motion.div>
    </Modal>
  );
};
