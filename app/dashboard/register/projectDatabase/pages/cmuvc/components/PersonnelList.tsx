import { usePermission } from "@/app/context/UsePermission";
import { useUser } from "@/app/context/UserContext";
import { CmuvcPersonnel } from "@/app/model/cmuvc/dashboardModel";
import { Delete_Personnel } from "@/app/routers/cmuvc/DeleteRouter";
import { GetPersonnel } from "@/app/routers/cmuvc/GetRouter";
import { Cmuvc_Create_Person_Router_CryptoJs } from "@/app/routers/cmuvc/PostRouter";
import { PutEditPersonlist } from "@/app/routers/cmuvc/PutRouter";
import { ConfirmModal } from "@/components/ConfirmModal/ConfirmModal";
import PermissionGuard from "@/components/Guards/PermissionGuard";
import { InputField } from "@/components/Input/InputField";
import Loading from "@/components/Loadings/Loading";
import { LoadingModal } from "@/components/Modal";
import { useVisitor } from "@/lib/fingerprintjs-shim";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { div } from "framer-motion/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

type FormMode = "add" | "edit";

const SUB_MENU_ID = "9b940740-d1e9-4a41-af0d-4e1faa90464d";
const PROJECT_ID = "ee9ce62b-2e02-4682-9ecf-9f9b564ee5e3";

export default function PersonnelList() {
  const { userData, loading } = useUser();
  const [formMode, setFormMode] = useState<FormMode>("add");
  const [loadData, setLoadData] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [onUploadProgress, setOnUploadProgress] = useState<number>(0);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState<boolean>(false);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>("");
  const [currentPerson, setCurrentPerson] = useState<CmuvcPersonnel | null>(
    null,
  );
  const [personnels, setPersonnels] = useState<CmuvcPersonnel[]>([]);
  const [formData, setFormData] = useState<CmuvcPersonnel>({
    fname: "",
    lname: "",
    prefix: "",
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { data } = useVisitor();
  const visitorId = data?.visitorId ?? "";

  const hasPersonnel = useRef(false);

  if (loading) return <Loading />;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const fetchPersonnel = async () => {
    const response = await GetPersonnel();

    if (!response.success)
      return toast.error(`Error fetching personnel: ${response.message}`);

    const data = response.data as CmuvcPersonnel[];
    setPersonnels(data);
    setLoadData(true);
  };

  const filtered = useMemo(() => {
    // ถ้าไม่มี personnels หรือเป็น array ว่าง ให้คืนค่า array ว่าง
    if (!personnels || personnels.length === 0) return [];

    // ถ้าไม่มี searchTerm ให้แสดงทั้งหมด
    if (!searchTerm) return personnels;

    return personnels.filter((personnel) => {
      const fullname = `${personnel.fname.trim()} ${personnel.lname.trim()}`;
      const lowerSearchTerm = searchTerm.toLowerCase();

      return (
        personnel.fname.toLowerCase().includes(lowerSearchTerm) ||
        personnel.lname.toLowerCase().includes(lowerSearchTerm) ||
        fullname.toLowerCase().includes(lowerSearchTerm)
      );
    });
  }, [personnels, searchTerm]); // พึ่งพา personnels และ searchTerm

  useEffect(() => {
    if (!hasPersonnel.current) {
      fetchPersonnel();
      hasPersonnel.current = true;
    }
  }, []);

  if (!userData) {
    return <div>ไม่พบข้อมูลผู้ใช้</div>;
  }

  const { canCreate, canEdit, canDelete, canView } = usePermission(
    SUB_MENU_ID,
    PROJECT_ID,
  );

  if (!loadData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  const openAddModal = () => {
    setFormMode("add");
    setCurrentPerson(null);
    setFormData({
      prefix: "",
      fname: "",
      lname: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (person: CmuvcPersonnel) => {
    setFormMode("edit");
    setCurrentPerson(person);
    setFormData({
      prefix: person.prefix,
      fname: person.fname,
      lname: person.lname,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (personnelId: string) => {
    setSelectedPersonnelId(personnelId);
    setIsModalConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    DeletePerson(selectedPersonnelId);
  };

  const DeletePerson = async (personneld: string) => {
    if (!personneld.trim()) return toast.warn("กรุณาเลือกข้อมูล");

    setIsLoading(true);
    setOnUploadProgress(0);
    try {
      const response = await Delete_Personnel(
        personneld,
        visitorId,
        setOnUploadProgress,
      );

      if (!response.success)
        return toast.error("Message: เกิดข้อผิดพลาดในการลบข้อมูล");

      setIsModalConfirmOpen(false);
      await fetchPersonnel();
      setIsLoading(false);
      toast.success(`ลบข้อมูลเจ้าหน้าที่สำเร็จ`);
    } catch (error: any) {
      toast.error(`Error message: ${error?.message}`);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.prefix.trim()) {
      toast.warn("กรุณากรอกคำนำหน้า");
      return;
    }
    if (!formData.fname.trim()) {
      toast.warn("กรุณากรอกชื่อ");
      return;
    }
    if (!formData.lname.trim()) {
      toast.warn("กรุณากรอกนามสกุล");
      return;
    }
    if (formMode === "add") {
      const newPerson: CmuvcPersonnel = {
        ...formData,
        createAt: new Date().toISOString(),
        updateAt: null,
      };

      setIsLoading(true);
      setOnUploadProgress(0);

      try {
        const response = await Cmuvc_Create_Person_Router_CryptoJs(
          newPerson,
          visitorId,
          setOnUploadProgress,
        );

        if (!response.success)
          return (
            toast.error(
              `${
                response.message
                  ? response.message
                  : "Message: ข้อผิดพลาดในการเพิ่มข้อมูล"
              } `,
            ),
            setIsLoading(false)
          );

        await fetchPersonnel();
        setIsLoading(false);
        setIsModalOpen(false);
        toast.success(`บันทึกข้อมูลเจ้าหน้าที่สำเร็จ`);
      } catch (error: any) {
        toast.error(`Error message: ${error?.message}`);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    } else if (formMode === "edit" && currentPerson) {
      if (formData.personnelId) return toast.warn("ไม่มีไอดีบุคลากร");

      if (!formData.prefix.trim()) {
        toast.warn("กรุณากรอกคำนำหน้า");
        return;
      }
      if (!formData.fname.trim()) {
        toast.warn("กรุณากรอกชื่อ");
        return;
      }
      if (!formData.lname.trim()) {
        toast.warn("กรุณากรอกนามสกุล");
        return;
      }

      setIsLoading(true);
      setOnUploadProgress(0);

      const editPerson: CmuvcPersonnel = {
        ...currentPerson,
        ...formData,
      };

      try {
        const response = await PutEditPersonlist(
          editPerson,
          visitorId,
          setOnUploadProgress,
        );

        if (!response.success)
          return (
            toast.error(`Message: ข้อผิดพลาดในการแก้ไขข้อมูล`),
            setIsLoading(false)
          );

        await fetchPersonnel();
        setIsLoading(false);
        setIsModalOpen(false);
        toast.success(`แก้ไขข้อมูลเจ้าหน้าที่สำเร็จ`);
      } catch (error: any) {
        toast.error(`Error message: ${error?.message}`);
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <PermissionGuard submenuIdCode={SUB_MENU_ID} />
      <div className="bg-gray-50 min-h-screen p-4 md:p-6">
        <LoadingModal isOpen={isLoading} progress={onUploadProgress} />
        <ConfirmModal
          isOpen={isModalConfirmOpen}
          onClose={() => setIsModalConfirmOpen(false)}
          onConfirm={handleConfirmDelete}
          title="ยืนยันการลบข้อมูล"
          message="ข้อมูลที่ถูกลบจะไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่?"
          confirmText="ลบข้อมูล"
          confirmColor="red"
          cancelText="ยกเลิก"
          icon="warning"
        />
        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 mb-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            {/* Title Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <span className="material-symbols-outlined text-blue-600 text-3xl">
                    groups
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    รายชื่อเจ้าหน้าที่ และพนักงาน
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                    <p className="text-gray-600 flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-gray-500 text-base">
                        description
                      </span>
                      จัดการข้อมูลผู้เข้าร่วมโครงการ
                    </p>
                    <p className="text-blue-700 flex items-center gap-2 text-sm font-medium bg-blue-50 px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined text-blue-600 text-base">
                        checklist
                      </span>
                      รายชื่อทั้งหมด: {filtered.length} คน
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button - ตัด motion.button ออก */}
            <button
              onClick={() => canCreate && openAddModal()}
              disabled={!canCreate}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl min-w-[160px] justify-center ${
                canCreate
                  ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } transition-all duration-200`}
            >
              <span className="material-symbols-outlined">add</span>
              <span className="font-medium">
                {canCreate ? "เพิ่มข้อมูล" : "ไม่มีสิทธิ์เพิ่มข้อมูล"}
              </span>
            </button>
          </div>

          {/* Filters Section - ตัด motion.div ออก */}
          <div className="bg-gray-50 p-4 rounded-xl mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ, นามสกุล หรือ personnelId..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      บัญชีผู้ใช้
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การจัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.length > 0 ? (
                    filtered.map((person) => (
                      // ตัด motion.tr ออก ใช้ tr ธรรมดา
                      <tr
                        key={person.personnelId}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="material-symbols-outlined text-blue-600 text-sm">
                                person
                              </span>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {person.prefix} {person.fname.trim()}{" "}
                                {person.lname.trim()}
                              </span>
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">
                                  fingerprint
                                </span>
                                {person.personnelId}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex flex-col items-end gap-3">
                            {/* ตัด motion.div และ motion.button ออก */}
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => canEdit && openEditModal(person)}
                                disabled={!canEdit}
                                className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                                  canEdit
                                    ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                } transition-colors`}
                              >
                                <span className="material-symbols-outlined text-base">
                                  {canEdit ? "edit" : "edit_off"}
                                </span>
                                <span className="text-sm">
                                  {canEdit ? "แก้ไข" : "ไม่มีสิทธิ์"}
                                </span>
                              </button>

                              <button
                                onClick={() =>
                                  canDelete &&
                                  handleDeleteClick(person.personnelId)
                                }
                                disabled={!canDelete}
                                className={`flex items-center gap-1 px-4 py-2 rounded-lg ${
                                  canDelete
                                    ? "bg-red-50 text-red-700 hover:bg-red-100"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                } transition-colors`}
                              >
                                <span className="material-symbols-outlined text-base">
                                  {canDelete ? "delete" : "block"}
                                </span>
                                <span className="text-sm">
                                  {canDelete ? "ลบ" : "ไม่มีสิทธิ์ลบ"}
                                </span>
                              </button>
                            </div>

                            {/* แสดงเวลาอัปเดต */}
                            <div className="flex justify-end gap-2 text-xs text-gray-400">
                              {person.updateAt ? (
                                <div className="inline-flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">
                                    schedule
                                  </span>
                                  <span
                                    className={
                                      dayjs(person.updateAt).isSame(
                                        dayjs().startOf("day"),
                                        "day",
                                      )
                                        ? "text-green-600"
                                        : "text-amber-600"
                                    }
                                  >
                                    {dayjs(person.updateAt).isSame(
                                      dayjs().startOf("day"),
                                      "day",
                                    )
                                      ? `วันนี้ ${dayjs(person.updateAt).format(
                                          "HH:mm",
                                        )}`
                                      : dayjs(person.updateAt).format(
                                          "DD/MM/YYYY HH:mm",
                                        )}
                                  </span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">
                                    schedule
                                  </span>
                                  <span>ยังไม่ได้แก้ไข</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                          <span className="material-symbols-outlined text-5xl mb-4 opacity-50">
                            search_off
                          </span>
                          <p className="text-lg font-medium text-gray-500 mb-1">
                            ไม่พบข้อมูลผู้เข้าร่วม
                          </p>
                          <p className="text-sm">
                            ลองเปลี่ยนคำค้นหาหรือตรวจสอบข้อมูลอีกครั้ง
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal - ใช้ AnimatePresence + motion เฉพาะตรงนี้ */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-30"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-600 bg-blue-100 p-2 rounded-lg">
                      {formMode === "add" ? "person_add" : "edit"}
                    </span>
                    {formMode === "add"
                      ? "เพิ่มข้อมูลเจ้าหน้าที่"
                      : "แก้ไขข้อมูลเจ้าหน้าที่"}
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 gap-4">
                    {/* ตัด motion.div และ animation บนไอคอนออก */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
                        เพศ
                      </label>
                      <div className="relative">
                        <select
                          name="prefix"
                          value={formData?.prefix}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white transition-all hover:border-indigo-300"
                        >
                          <option value="">-- คำนำหน้า --</option>
                          <option value="นาย">นาย</option>
                          <option value="นาง">นาง</option>
                          <option value="นางสาว">นางสาว</option>
                        </select>
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {formData?.prefix === "นาง" ||
                          formData?.prefix === "นางสาว" ? (
                            <span className="material-symbols-outlined text-pink-500">
                              female
                            </span>
                          ) : formData?.prefix === "นาย" ? (
                            <span className="material-symbols-outlined text-blue-500">
                              male
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </div>

                    <InputField
                      type="text"
                      label="ชื่อ"
                      name="fname"
                      value={formData?.fname}
                      onChange={handleInputChange}
                      required
                      icon={
                        <span className="material-symbols-outlined text-gray-400">
                          edit_note
                        </span>
                      }
                    />

                    <InputField
                      type="text"
                      label="นามสกุล"
                      name="lname"
                      value={formData?.lname}
                      onChange={handleInputChange}
                      required
                      icon={
                        <span className="material-symbols-outlined text-gray-400">
                          edit_note
                        </span>
                      }
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">
                      close
                    </span>
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
                  >
                    <span className="material-symbols-outlined text-base">
                      check
                    </span>
                    {formMode === "add" ? "เพิ่มข้อมูล" : "อัปเดตข้อมูล"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
