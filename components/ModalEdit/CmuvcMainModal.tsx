import { CmuvcParticipant, Package } from "@/app/model/cmuvc/dashboardModel";
import { motion } from "framer-motion";
import { FC, useEffect, useRef, useState } from "react";
import Modal from "react-modal";
import { InputField, SelectedField } from "../Input/InputField";
import { toast } from "react-toastify";
import { getFoods, GetPackage } from "@/app/routers/cmuvc/GetRouter";
import { LoadingModal } from "../Modal";
import { PutEditParticipant } from "@/app/routers/cmuvc/PutRouter";
import { Cmuvc_Create_Participant_Admin } from "@/app/routers/cmuvc/PostRouter";

const allowedExtensions = [
  ".jpeg",
  ".png",
  ".jpg",
  ".webp",
  ".gif",
  ".bmp",
  ".tiff",
  ".avif",
];

// ฟังก์ชันกรองเฉพาะตัวอักษรภาษาอังกฤษและช่องว่าง
const filterEnglishOnly = (value: string) => {
  return value.replace(/[^A-Za-z\s.]/g, ""); // ลบทุกอย่างที่ไม่ใช่ A-Z, a-z หรือช่องว่าง
};

interface MainEditModalProps {
  formData: CmuvcParticipant;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedParticipant: CmuvcParticipant) => void;
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
  title,
  headerTitle,
}) => {
  const [edited, setEdited] = useState<CmuvcParticipant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [onUploadProgress, setOnUploadProgress] = useState<number>(0);
  const [dataPackages, setDataPackages] = useState<Package[]>();

  const hasDataPackage = useRef(false);

  const fetchPackages = async () => {
    try {
      const response = await GetPackage(headerTitle);
      if (!response.success) return toast.error("ไม่สามารถดึงข้อมูล Package");
      setDataPackages(response.data);
    } catch (error: any) {
      toast.error(`เกิดข้อผิดพลาดในการดึง Package`);
    }
  };

  useEffect(() => {
    if (!hasDataPackage.current) {
      fetchPackages();
      hasDataPackage.current = true;
    }
    // Reset เมื่อ headerTitle เปลี่ยน (กรณีต้องการ refetch เมื่อ headerTitle เปลี่ยน)
    return () => {
      hasDataPackage.current = false;
    };
  }, [headerTitle]);

  // อัปเดต editedMenu เมื่อ formData เปลี่ยน
  useEffect(() => {
    if (isOpen && formData) {
      setEdited({ ...formData });
    }
  }, [formData, isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
        ([_, value]) => value !== undefined && value !== "",
      ),
    );

    const title = headerTitle;

    setIsLoading(true);
    setOnUploadProgress(0);

    try {
      const response = await PutEditParticipant(
        filteredPayload as any,

        title,
        setOnUploadProgress,
      );

      if (!response.success)
        return (toast.error("ไม่สามารถแก้ไขข้อมูลได้"), setIsLoading(false));

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

interface FoodOption {
  foodId: string;
  foodType: string;
}

interface CreateParticipantForm {
  prefix: string;
  fname: string;
  lname: string;
  phone: string;
  email: string;
  organization: string;
  country: string;
  address: string;
  subDistrict: string;
  district: string;
  province: string;
  zipCode: string;
  ce: string;
  packagesId: string;
  foodId: string;
  price: string;
  payments: boolean;
  Imagepayment: File | null;
}

const emptyCreateParticipantForm: CreateParticipantForm = {
  prefix: "",
  fname: "",
  lname: "",
  phone: "",
  email: "",
  organization: "",
  country: "",
  address: "",
  subDistrict: "",
  district: "",
  province: "",
  zipCode: "",
  ce: "",
  packagesId: "",
  foodId: "",
  price: "",
  payments: true,
  Imagepayment: null,
};

interface MainCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (created: CmuvcParticipant) => void;
  headerTitle: string;
}

// คำนวณราคาปัจจุบันของแพ็คเกจตามช่วงเวลา (Early Bird / Regular Rate)
const getCurrentPackageRate = (pkg: Package): number => {
  const today = new Date();
  const isEarlyBirdPassed = today > new Date(pkg.endEarlyBird);
  return isEarlyBirdPassed ? pkg.regularRate : pkg.earlyBird;
};

export const ModalCreateParticipant_Main: FC<MainCreateModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  headerTitle,
}) => {
  const [form, setForm] = useState<CreateParticipantForm>(
    emptyCreateParticipantForm,
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [onUploadProgress, setOnUploadProgress] = useState<number>(0);
  const [dataPackages, setDataPackages] = useState<Package[]>();
  const [dataFoods, setDataFoods] = useState<FoodOption[]>();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const hasFetchedOptions = useRef(false);

  const fetchOptions = async () => {
    try {
      const [packageResponse, foodResponse] = await Promise.all([
        GetPackage(headerTitle),
        getFoods(),
      ]);

      if (packageResponse.success) setDataPackages(packageResponse.data);
      if (foodResponse) setDataFoods(foodResponse as FoodOption[]);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลตัวเลือก");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setForm(emptyCreateParticipantForm);
      if (!hasFetchedOptions.current) {
        fetchOptions();
        hasFetchedOptions.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "packagesId") {
      const selected = dataPackages?.find((pkg) => pkg.packageId === value);
      setForm((prev) => ({
        ...prev,
        packagesId: value,
        price: selected ? String(getCurrentPackageRate(selected)) : prev.price,
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      phone: e.target.value.replace(/\D/g, ""),
    }));
  };

  const handleCancel = () => {
    setForm(emptyCreateParticipantForm);
    if (previewImage) URL.revokeObjectURL(previewImage);
    setPreviewImage(null);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name
      .slice(file.name.lastIndexOf("."))
      .toLowerCase();

    if (allowedExtensions.includes(fileExtension)) {
      setForm((prev) => ({ ...prev, Imagepayment: file }));
      if (previewImage) URL.revokeObjectURL(previewImage);
      setPreviewImage(URL.createObjectURL(file));
    } else {
      toast.warn(
        `ประเภทไฟล์ไม่ถูกต้อง อนุญาตเฉพาะ: ${allowedExtensions.join(", ")}`,
      );
      e.target.value = "";
    }
  };

  const handleRemoveFile = () => {
    if (previewImage) URL.revokeObjectURL(previewImage);
    setPreviewImage(null);
    setForm((prev) => ({ ...prev, Imagepayment: null }));
  };

  const handleCreate = async () => {
    if (!form.prefix.trim()) return toast.warn("กรุณากรอกคำนำหน้า");
    if (!form.fname.trim()) return toast.warn("กรุณากรอกชื่อ");
    if (!form.lname.trim()) return toast.warn("กรุณากรอกนามสกุล");
    if (!/^\d{9,10}$/.test(form.phone))
      return toast.warn("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return toast.warn("กรุณากรอกอีเมลให้ถูกต้อง");
    if (!form.packagesId) return toast.warn("กรุณาเลือกแพ็คเกจ");
    if (!form.price || Number(form.price) <= 0)
      return toast.warn("กรุณากรอกราคาค่าลงทะเบียน");
    if (!form.Imagepayment) return toast.warn("กรุณาแนบสลิปการชำระเงิน");

    const payload: Partial<CmuvcParticipant> = {
      prefix: form.prefix.trim(),
      fname: form.fname.trim(),
      lname: form.lname.trim(),
      phone: form.phone,
      email: form.email.trim(),
      organization: form.organization.trim(),
      country: form.country.trim(),
      address: form.address.trim(),
      subDistrict: form.subDistrict.trim(),
      district: form.district.trim(),
      province: form.province.trim(),
      zipCode: form.zipCode.trim(),
      ce: form.ce.trim(),
      packagesId: form.packagesId,
      foodId: form.foodId,
      price: Number(form.price),
      payments: form.payments,
    };

    setIsLoading(true);
    setOnUploadProgress(0);

    try {
      const response = await Cmuvc_Create_Participant_Admin(
        payload,
        form.Imagepayment,
        headerTitle,
        setOnUploadProgress,
      );

      if (!response.success) {
        setIsLoading(false);
        return toast.error(
          response.message || "ไม่สามารถเพิ่มข้อมูลผู้เข้าร่วมได้",
        );
      }

      onCreated(response.data as CmuvcParticipant);
      handleRemoveFile();
      setForm(emptyCreateParticipantForm);
      setIsLoading(false);
      onClose();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      ariaHideApp={false}
      contentLabel="Create Participant Modal"
      className="fixed inset-0 flex items-center justify-center z-40 p-4"
      overlayClassName="fixed inset-0"
    >
      <motion.div
        className="fixed inset-0 bg-black/50"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      />
      <motion.div
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl max-w-3xl md:w-3xl mx-auto my-10 outline-none border border-white/20 relative max-h-[85vh] overflow-y-auto"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <LoadingModal isOpen={isLoading} progress={onUploadProgress} />

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex justify-between items-start"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-inner">
              <span className="material-symbols-outlined text-3xl text-blue-600">
                person_add
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                เพิ่มผู้เข้าร่วมใหม่
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                เพิ่มข้อมูลผู้เข้าร่วมโดยเจ้าหน้าที่ (หลังบ้าน)
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="group flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-b from-white to-gray-50 border border-gray-200 hover:from-red-50 hover:to-red-100 text-gray-400 hover:text-red-600 transition-all duration-300 shadow-sm hover:shadow-md mb-6 shrink-0"
            onClick={handleCancel}
          >
            <span className="material-symbols-outlined text-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-90">
              close
            </span>
          </motion.button>
        </motion.div>

        <div className="flex flex-col gap-5">
          {/* ข้อมูลส่วนตัว */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <InputField
              label="คำนำหน้า"
              name="prefix"
              value={form.prefix}
              onChange={handleInputChange}
              placeholder="Mr. / Mrs. / Dr."
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  badge
                </span>
              }
              required
            />
            <InputField
              label="ชื่อ"
              name="fname"
              value={form.fname}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  person
                </span>
              }
              required
            />
            <InputField
              label="นามสกุล"
              name="lname"
              value={form.lname}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  person
                </span>
              }
              required
            />
          </motion.div>

          {/* ข้อมูลติดต่อ */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <InputField
              label="อีเมล"
              name="email"
              type="email"
              value={form.email}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  alternate_email
                </span>
              }
              required
            />
            <InputField
              label="เบอร์โทรศัพท์"
              name="phone"
              value={form.phone}
              onChange={handlePhoneChange}
              maxLength={10}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  call
                </span>
              }
              required
            />
          </motion.div>

          {/* หน่วยงาน / ที่อยู่ */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <InputField
              label="องค์กร/หน่วยงาน"
              name="organization"
              value={form.organization}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  home_work
                </span>
              }
            />
            <InputField
              label="ประเทศ"
              name="country"
              value={form.country}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  language
                </span>
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            <InputField
              label="ที่อยู่ออกใบเสร็จรับเงิน"
              name="address"
              value={form.address}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  home
                </span>
              }
            />
            <InputField
              label="ตำบล/แขวง"
              name="subDistrict"
              value={form.subDistrict}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  location_on
                </span>
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          >
            <InputField
              label="อำเภอ/เขต"
              name="district"
              value={form.district}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  location_on
                </span>
              }
            />
            <InputField
              label="จังหวัด"
              name="province"
              value={form.province}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  map
                </span>
              }
            />
            <InputField
              label="รหัสไปรษณีย์"
              name="zipCode"
              value={form.zipCode}
              onChange={handleInputChange}
              maxLength={5}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  markunread_mailbox
                </span>
              }
            />
          </motion.div>

          {/* แพ็คเกจและการชำระเงิน */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-blue-50/50 border border-blue-100 rounded-xl p-4"
          >
            <SelectedField
              label="แพ็คเกจ"
              name="packagesId"
              value={form.packagesId}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  inventory
                </span>
              }
              options={
                dataPackages?.map((pkg) => ({
                  value: pkg.packageId,
                  label: `${pkg.category_en} - ฿${getCurrentPackageRate(
                    pkg,
                  ).toLocaleString("th-TH")}`,
                })) || []
              }
              required
            />
            <InputField
              label="ราคา (บาท)"
              name="price"
              type="number"
              value={form.price}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  attach_money
                </span>
              }
              required
            />
            <SelectedField
              label="อาหาร"
              name="foodId"
              value={form.foodId}
              onChange={handleInputChange}
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  restaurant
                </span>
              }
              options={
                dataFoods?.map((food) => ({
                  value: food.foodId,
                  label: food.foodType,
                })) || []
              }
            />
            <InputField
              label="CE-Vet No. (ถ้ามี)"
              name="ce"
              value={form.ce}
              onChange={handleInputChange}
              placeholder="00-00000/2569"
              icon={
                <span className="material-symbols-outlined text-gray-400">
                  badge
                </span>
              }
            />
          </motion.div>

          {/* แนบสลิปการชำระเงิน */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.17 }}
            className="space-y-2"
          >
            <label className="block text-sm font-medium text-gray-700">
              สลิปการชำระเงิน <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg px-4 py-2.5 border border-dashed border-gray-300 transition-colors duration-200 flex items-center gap-2 w-fit">
                <span className="material-symbols-outlined text-lg">
                  upload_file
                </span>
                <span className="text-sm font-medium">แนบสลิป</span>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/avif"
                  className="hidden"
                />
              </label>
              {form.Imagepayment && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-red-600 hover:text-red-700 text-sm font-medium w-fit"
                >
                  ลบไฟล์
                </button>
              )}
            </div>
            {previewImage && (
              <div className="mt-1 p-2 bg-white rounded-xl border border-gray-200 shadow-sm w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImage}
                  alt="Preview สลิปการชำระเงิน"
                  className="rounded-lg max-h-64 w-auto object-contain mx-auto"
                />
              </div>
            )}
          </motion.div>

          {/* สถานะการชำระเงิน */}
          <motion.label
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="flex items-center gap-2 cursor-pointer w-fit"
          >
            <input
              type="checkbox"
              checked={form.payments}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, payments: e.target.checked }))
              }
              className="w-4 h-4 accent-green-600 cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700">
              ยืนยันว่าชำระเงินแล้ว
            </span>
          </motion.label>

          <button
            onClick={handleCreate}
            className="mt-2 group relative bg-blue-500/10 backdrop-blue-sm text-blue-700 px-5 py-2.5 flex items-center justify-center gap-2 rounded-xl border border-blue-300/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-500/20 hover:text-blue-800 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:scale-110">
              add_circle
            </span>
            <span className="font-medium">เพิ่มผู้เข้าร่วม</span>
          </button>
        </div>
      </motion.div>
    </Modal>
  );
};
