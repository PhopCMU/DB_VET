import { motion } from "framer-motion";
import { FC, useEffect, useState } from "react";
import Modal from "react-modal";
import { InputField, SelectedField } from "../Input/InputField";
import { toast } from "react-toastify";
import {
  Cmuvc_Create_Sponsor,
  Cmuvc_Create_Sponsor_Boot,
} from "@/app/routers/cmuvc/PostRouter";
import { LoadingModal } from "../Modal";
import {
  Cmuvc_Edit_Sponsor,
  Cmuvc_Edit_Sponsor_Boot,
} from "@/app/routers/cmuvc/PutRouter";

interface companysProps {
  address: string;
  companyId: string;
  name: string;
  createAt?: string;
  updateAt?: string;
}

interface foodsProps {
  foodId: string;
  foodType: string;
  createAt?: string;
  updateAt?: string;
}

interface selectedDataProps {
  companys: companysProps[];
  foods: foodsProps[];
}

export interface SponsorsProps {
  formDataEdit?: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedSponsor: any) => void;

  title: string; // รับค่า main || pre
  headerTitle: string; // ชื่อหัวข้อ
  selectedData: selectedDataProps | any;
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

export const ModalCreateSponsor: FC<SponsorsProps> = ({
  isOpen,
  formDataEdit,
  onClose,
  onUpdate,
  title,
  headerTitle,
  selectedData,
}) => {
  const [formData, setFormData] = useState<any>({
    prefix: "",
    companyId: "",
    foodId: "",
    ce: "",
    fname: "",
    lname: "",
    email: "",
    organization: "",
  });

  const [onUploadProgress, setOnUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && formDataEdit) {
      setFormData({
        prefix: formDataEdit.prefix || "DVM",
        companyId: formDataEdit.companyId || "",
        foodId: formDataEdit.foodId || "",
        ce: formDataEdit.ce || "",
        fname: formDataEdit.fname || "",
        lname: formDataEdit.lname || "",
        email: formDataEdit.email || "",
        phone: formDataEdit.phone || "",
        organization: formDataEdit.organization || "",
      });
    }
  }, [isOpen, formDataEdit]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    // อนุญาตเฉพาะ A-Z, a-z และช่องว่าง (สำหรับชื่อ-นามสกุล)
    let filteredValue = value;
    if (name === "fname" || name === "lname") {
      filteredValue = value.replace(/[^A-Za-z]/g, "");
    }
    setFormData((prev: any) => ({
      ...prev,
      [name]: filteredValue,
    }));
  };

  const handleSubmit = async () => {
    if (!headerTitle) return toast.warn("ไม่มีข้อมูล header title");
    if (!formData.ce) return toast.warn("กรุณากรอกข้อมูล CE");
    if (!formData.fname) return toast.warn("กรุณากรอกข้อมูลชื่อ");
    if (!formData.lname) return toast.warn("กรุณากรอกข้อมูลนามสกุล");
    if (!formData.email) return toast.warn("กรุณากรอกข้อมูลอีเมล");
    if (!formData.phone) return toast.warn("กรุณากรอกข้อมูลเบอร์โทร");
    if (headerTitle !== "sponsor") {
      if (!formData.organization) return toast.warn("กรุณากรอกข้อมูลหน่วยงาน");
    }
    if (!formData.companyId) return toast.warn("กรุณากรอกข้อมูลบริษัท");
    if (!formData.foodId) return toast.warn("กรุณากรอกข้อมูลอาหาร");

    setIsLoading(true);
    setOnUploadProgress(0);

    try {
      const payload = {
        title: headerTitle,
        prefix: formData.prefix,
        ce: formData.ce,
        fname: formData.fname,
        lname: formData.lname,
        email: formData.email,
        phone: formData.phone,
        organization: headerTitle !== "sponsor" && formData.organization,
        companyId: formData.companyId,
        foodId: formData.foodId,
        sponserParticipantId:
          formDataEdit?.sponserParticipantId ||
          formDataEdit?.sponserBootId ||
          null,
      };

      let response: any = null;

      // console.log(formDataEdit || payload);
      if (headerTitle === "sponsor") {
        if (formDataEdit?.sponserBootId) {
          response = await Cmuvc_Edit_Sponsor_Boot(
            payload,

            setOnUploadProgress,
          );
        } else {
          response = await Cmuvc_Create_Sponsor_Boot(
            payload,

            setOnUploadProgress,
          );
        }
      } else {
        if (formDataEdit?.sponserParticipantId) {
          response = await Cmuvc_Edit_Sponsor(
            payload,

            setOnUploadProgress,
          );
        } else {
          response = await Cmuvc_Create_Sponsor(
            payload,

            setOnUploadProgress,
          );
        }
      }

      // Filter out undefined and empty string fields
      // const filteredPayload = Object.fromEntries(
      //   Object.entries(payload).filter(
      //     ([_, value]) => value !== undefined && value !== ""
      //   )
      // );

      if (!response.success) return toast.error("ไม่สามารถบันทึกข้อมูลได้");

      setIsLoading(false);
      // console.log(response);
      onUpdate(response.success);
      setFormData({
        prefix: "",
        companyId: "",
        foodId: "",
        ce: "",
        fname: "",
        lname: "",
        email: "",
        organization: "",
      });
    } catch (error: any) {
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      prefix: "",
      companyId: "",
      foodId: "",
      ce: "",
      fname: "",
      lname: "",
      email: "",
      organization: "",
    });
    onClose();
  };

  if (!isOpen) return null;
  return (
    <Modal
      isOpen={isOpen}
      ariaHideApp={false}
      contentLabel="Edit Modal Main"
      className="fixed inset-0 flex items-center justify-center z-30"
      overlayClassName="fixed inset-0"
      onRequestClose={handleCancel}
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

        <div className="flex flex-col gap-2">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-col-1 md:grid-cols-2 gap-2"
          >
            <InputField
              label="เลขใบอนุญาต"
              name="ce"
              value={formData.ce}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  badge
                </span>
              }
              required
              placeholder="กรุณากรอกเลขใบอนุญาต"
            />
            <InputField
              label="คำนำหน้า"
              name="prefix"
              value={formData.prefix || "DVM"}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  badge
                </span>
              }
              required
              placeholder="กรุณากรอกคำนำหน้า"
            />

            <InputField
              label="ชื่อ"
              name="fname"
              value={formData.fname}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  badge
                </span>
              }
              required
              pattern="[A-Za-z\s]+"
              title="กรุณากรอกเป็นภาษาอังกฤษเท่านั้น"
              placeholder="กรุณากรอกชื่อ"
            />

            <InputField
              label="นามสกุล"
              name="lname"
              value={formData.lname}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  badge
                </span>
              }
              required
              pattern="[A-Za-z\s]+"
              title="กรุณากรอกเป็นภาษาอังกฤษเท่านั้น"
              placeholder="กรุณากรอกนามสกุล"
            />

            <InputField
              label="เบอร์โทร"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  call
                </span>
              }
              required
              placeholder="กรุณากรอกเบอร์โทร"
            />

            <InputField
              label="อีเมล"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  alternate_email
                </span>
              }
              required
              placeholder="กรุณากรอกอีเมล"
            />
          </motion.div>

          {headerTitle !== "sponsor" && (
            <InputField
              label="หน่วยงาน"
              name="organization"
              value={formData.organization}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  home_repair_service
                </span>
              }
              required
              placeholder="กรุณากรอกหน่วยงาน"
            />
          )}

          <SelectedField
            label="บริษัท"
            name="companyId"
            value={formData.companyId}
            onChange={handleInputChange}
            icon={
              <span className="material-symbols-outlined text-gray-400">
                inventory
              </span>
            }
            options={
              (selectedData?.companys?.length > 0 &&
                selectedData.companys.map((s: any) => ({
                  value: s.companyId,
                  label: s.name,
                }))) ||
              []
            }
            required
            placeholder="พิมพ์ค้น หรือ เลือกบริษัท..."
          />

          <SelectedField
            label="อาหาร"
            name="foodId"
            value={formData.foodId}
            onChange={handleInputChange}
            icon={
              <span className="material-symbols-outlined text-gray-400">
                inventory
              </span>
            }
            options={
              (selectedData?.foods?.length > 0 &&
                selectedData.foods.map((f: any) => ({
                  value: f.foodId,
                  label: f.foodType,
                }))) ||
              []
            }
            required
            placeholder="กรุณาเลือกอาหาร"
          />

          <button
            onClick={handleSubmit}
            className="mt-5 group relative bg-yellow-500/10 backdrop-yellow-sm text-yellow-700 px-5 py-2.5 flex items-center justify-center gap-2 rounded-xl border border-yellow-300/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-yellow-500/20 hover:text-yellow-800 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:scale-110">
              save
            </span>
            <span className="font-medium">บันทึก</span>
          </button>
        </div>
      </motion.div>
    </Modal>
  );
};
