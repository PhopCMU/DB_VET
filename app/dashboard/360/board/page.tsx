"use client";

import { RolefetchDataListUser } from "@/app/routers/360/GetRouter";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  Tabsfaculty,
  TabsHIS,
  TabsOffice,
  TabsSanbox,
  TabsVphcap,
} from "./menus";
import { exportMultipleSheetsToExcel } from "@/utils/exportToExcel";
import { Modal360 } from "@/components/(360)/360_Modal";
import ThaiYearPicker from "@/components/ThaiYearPicker";
import { config } from "@/config/config_api";
import { UserIcon } from "lucide-react";

export default function Page() {
  const [userData, setUserData] = useState<any>([]);
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<any>("อาจารย์");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [checkedRows, setCheckedRows] = useState<Set<any>>(new Set());
  const [isAllChecked, setIsAllChecked] = useState<boolean>(false);
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // DatePicker
  const [selectedYear, setSelectedYear] = useState<Date>(new Date());

  function safeImageUrl(base: string, path: unknown): string | undefined {
    if (typeof path !== "string" || !path) return undefined;
    if (/^(data:|javascript:|\/\/)/i.test(path)) return undefined;
    return base + path;
  }

  const organizations = [
    { id: "1", name: "สำนักงานคณะ" },
    { id: "2", name: "สำนักวิชาสัตวแพทยศาสตร์" },
    { id: "3", name: "โรงพยาบาลสัตว์มหาวิทยาลัยเชียงใหม่" },
    // { id: "4", name: "ศูนย์สัตวแพทย์สาธารณสุขและอาหารปลอดภัย" },
    { id: "5", name: "กลุ่มภารกิจยุทธศาสตร์เชิงรุก (บริหารรูปแบบ Sanbox)" },
  ];

  const getCurrentTabs = (orgId: any) => {
    switch (orgId) {
      case "1":
        return TabsOffice;
      case "2":
        return Tabsfaculty;
      case "3":
        return TabsHIS;
      case "4":
        //   return TabsVphcap;
        // case "5":
        return TabsSanbox;
      default:
        return Tabsfaculty;
    }
  };

  // ตรวจสอบ localStorage และดึงข้อมูลเริ่มต้น
  useEffect(() => {
    const fetchInitialData = async () => {
      const storedType = localStorage.getItem("typeTab");
      const defaultOrg = organizations[0];
      const orgToFetch = storedType
        ? organizations.find((org) => org.name === storedType) || defaultOrg
        : defaultOrg;

      setSelectedOrg(orgToFetch);

      setIsLoading(true); // เริ่มโหลด

      const response = await RolefetchDataListUser(
        selectedYear.getFullYear(),
        orgToFetch.name,
      );

      setIsLoading(false); // โหลดเสร็จ

      if (response.success) {
        setUserData(response.data);
        localStorage.setItem("typeTab", orgToFetch.name);
        setActiveTab(getCurrentTabs(orgToFetch.id)[0].key as any);
      }

      // เซ็ต selectedUser เป็น null เมื่อโหลดเสร็จ
      setSelectedUser(null);
    };

    fetchInitialData();
  }, []);

  const handleCardClick = async (org: any) => {
    setSelectedOrg(org);
    setIsLoading(true);
    const response = await RolefetchDataListUser(
      selectedYear.getFullYear(),
      org.name,
    );
    setIsLoading(false);
    if (response.success) {
      localStorage.setItem("typeTab", org.name);
      setUserData(response.data);
      setActiveTab(getCurrentTabs(org.id)[0].key as any);
    }
  };

  // Filter users based on tab and search query
  const filteredUsers = userData.filter((user: any) => {
    const matchesTab = user.positiontitle_th === activeTab;
    const matchesSearch = Object.values(user).some(
      (val: any) =>
        val &&
        typeof val === "string" &&
        val.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    return matchesTab && matchesSearch;
  });
  // Toggle checkbox
  const toggleRow = (accountId: string) => {
    setCheckedRows((prev) => {
      const newCheckedRows = new Set(prev);
      const exists = Array.from(newCheckedRows).some(
        (r: any) => r.accountId === accountId,
      );

      if (exists) {
        // Remove if already exists
        const arr = Array.from(newCheckedRows);
        const filtered = arr.filter((r: any) => r.accountId !== accountId);
        return new Set(filtered);
      } else {
        // Add if not exists
        newCheckedRows.add({ accountId });
        return newCheckedRows;
      }
    });

    // Update isAllChecked status
    setIsAllChecked(false);
  };

  const handleSelectAll = () => {
    const newIsAllChecked = !isAllChecked;
    setIsAllChecked(newIsAllChecked);

    setCheckedRows((prev) => {
      const newCheckedRows = new Set(prev);

      if (newIsAllChecked) {
        // เพิ่มทุกแถวใน filteredUsers ลงใน checkedRows
        filteredUsers.forEach((user: any) => {
          const row = { accountId: user.accountId };
          const exists = Array.from(newCheckedRows).some(
            (r: any) => r.accountId === user.accountId,
          );
          if (!exists) {
            newCheckedRows.add(row);
          }
        });
      } else {
        // ลบออกทั้งหมด
        return new Set();
      }

      return newCheckedRows;
    });
  };

  useEffect(() => {
    if (filteredUsers.length === 0) return;

    const allSelected = filteredUsers.every((user: any) =>
      Array.from(checkedRows).some((r: any) => r.accountId === user.accountId),
    );
    setIsAllChecked(allSelected);
  }, [checkedRows, filteredUsers]);

  const handleExportExcel = async () => {
    if (checkedRows.size === 0) return;

    const exportData: { [key: string]: any[] } = {};

    // เปลี่ยน Set เป็น Array
    const selectedAccountIds = Array.from(checkedRows).map(
      (row: any) => row.accountId,
    );

    // กรองข้อมูลผู้ใช้ตามที่เลือก
    const selectedUserList = filteredUsers.filter((user: any) =>
      selectedAccountIds.includes(user.accountId),
    );

    // สร้างข้อมูล Excel
    selectedUserList.forEach((user: any) => {
      const sheetName = user.fullname_th || `User ${user.accountId}`;
      const evaluationData = user.evaluation_B.map(
        (evalData: any, index: number) => ({
          No: index + 1,
          ผู้ประเมิน: evalData.assessor,
          ID_การประเมิน: evalData.evaluationId,
          Topic1: evalData.topic1,
          Topic2: evalData.topic2,
          Topic3: evalData.topic3,
          Topic4: evalData.topic4,
          Topic5: evalData.topic5,
          Topic6: evalData.topic6,
          Topic7: evalData.topic7,
          Topic8: evalData.topic8,
          Topic9: evalData.topic9,
          Topic10: evalData.topic10,
          Topic11: evalData.topic11,
          Topic12: evalData.topic12,
          Total:
            evalData.topic1 +
            evalData.topic2 +
            evalData.topic3 +
            evalData.topic4 +
            evalData.topic5 +
            evalData.topic6 +
            evalData.topic7 +
            evalData.topic8 +
            evalData.topic9 +
            evalData.topic10 +
            evalData.topic11 +
            evalData.topic12,
          comment: evalData.comment,
        }),
      );
      exportData[sheetName] = evaluationData;
    });

    exportMultipleSheetsToExcel(exportData, "รายงาน_ตามระเบียบ.xlsx");
  };

  // Calculate average score from all evaluations
  const calculateAverageScore = (evaluation_B: any) => {
    if (selectedOrg.id === "3") {
      const total = evaluation_B.reduce((sum: number, evaluation: any) => {
        return (
          sum +
          (evaluation.topic1 +
            evaluation.topic2 +
            evaluation.topic3 +
            evaluation.topic4 +
            evaluation.topic5) /
            5
        );
      }, 0);
      return total / evaluation_B.length;
    } else if (selectedOrg.id === "1") {
      const total = evaluation_B.reduce((sum: number, evaluation: any) => {
        return (
          sum +
          (evaluation.topic1 +
            evaluation.topic2 +
            evaluation.topic3 +
            evaluation.topic4 +
            evaluation.topic5 +
            evaluation.topic6 +
            evaluation.topic7 +
            evaluation.topic8 +
            evaluation.topic9 +
            evaluation.topic10 +
            evaluation.topic11 +
            evaluation.topic12) /
            12
        );
      }, 0);
      return total / evaluation_B.length;
    } else if (
      selectedUser.level3agency_th ===
        "ศูนย์เวชศาสตร์ชันสูตรและนวัตกรรมด้านสุขภาพสัตว์" &&
      selectedOrg.id === "5"
    ) {
      const total = evaluation_B.reduce((sum: number, evaluation: any) => {
        return (
          sum +
          (evaluation.topic1 +
            evaluation.topic2 +
            evaluation.topic3 +
            evaluation.topic4 +
            evaluation.topic5 +
            evaluation.topic6 +
            evaluation.topic7 +
            evaluation.topic8 +
            evaluation.topic9 +
            evaluation.topic10 +
            evaluation.topic11 +
            evaluation.topic12) /
            12
        );
      }, 0);
      return total / evaluation_B.length;
    } else {
      const total = evaluation_B.reduce((sum: number, evaluation: any) => {
        return (
          sum +
          (evaluation.topic1 +
            evaluation.topic2 +
            evaluation.topic3 +
            evaluation.topic4 +
            evaluation.topic5 +
            evaluation.topic6 +
            evaluation.topic7 +
            evaluation.topic8 +
            evaluation.topic9) /
            9
        );
      }, 0);
      return total / evaluation_B.length;
    }
  };

  // Calculate total score for a single evaluation
  const calculateTotalScore = (evaluation_B: any) => {
    if (selectedOrg.id === "3") {
      return (
        evaluation_B.topic1 +
        evaluation_B.topic2 +
        evaluation_B.topic3 +
        evaluation_B.topic4 +
        evaluation_B.topic5
      );
    } else {
      return (
        evaluation_B.topic1 +
        evaluation_B.topic2 +
        evaluation_B.topic3 +
        evaluation_B.topic4 +
        evaluation_B.topic5 +
        evaluation_B.topic6 +
        evaluation_B.topic7 +
        evaluation_B.topic8 +
        evaluation_B.topic9
      );
    }
  };

  // ค้นหาคะแนนสูงสุดจากการประเมินทั้งหมด
  const findMaxScore = (evaluation_B: any) => {
    const scores =
      evaluation_B &&
      evaluation_B.map((evaluation_B: any) =>
        calculateTotalScore(evaluation_B),
      );
    return Math.max(...scores);
  };

  // Format date
  const formatDate = (dateString: any) => {
    const options: any = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("th-TH", options);
  };

  // Datepicker ปรับการแสดงผลเป็น พ.ศ.
  // const renderCustomHeader = ({
  //   date,
  //   changeYear,
  // }: {
  //   date: Date;
  //   changeYear: (year: number) => void;
  // }) => {
  //   const buddhistYear = date.getFullYear() + 543;

  //   return (
  //     <div className="flex justify-center">
  //       <select
  //         value={buddhistYear}
  //         onChange={(e) => changeYear(parseInt(e.target.value) - 543)}
  //         className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  //       >
  //         {Array.from({ length: 100 }, (_, i) => {
  //           const year = new Date().getFullYear() + 543 - 50 + i;
  //           return (
  //             <option key={year} value={year}>
  //               {year}
  //             </option>
  //           );
  //         })}
  //       </select>
  //     </div>
  //   );
  // };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Preview Modal */}
      <Modal360
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        title="ผลการประเมิน"
        // formData={selectedUser}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {selectedUser ? (
            <>
              {/* User Profile Header */}
              <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-gray-50 rounded-xl">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                    {selectedUser.imageprofile ? (
                      <img
                        src={selectedUser.imageprofile || ""}
                        alt={selectedUser.fullname_th}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="material-symbols-rounded text-3xl text-blue-500">
                        account_circle
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    {selectedUser.fullname_th}
                    {selectedUser.nickname && (
                      <span className="text-sm font-normal text-gray-500">
                        ({selectedUser.nickname})
                      </span>
                    )}
                    <span className="text-[12px] font-normal text-gray-500">
                      # {selectedUser.ratenumber || "N/A"}
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <span className="material-symbols-rounded text-base mr-1">
                        badge
                      </span>
                      {selectedUser.accountId}
                    </div>

                    <div className="flex items-center text-gray-600">
                      <span className="material-symbols-rounded text-base mr-1">
                        work
                      </span>
                      {selectedUser.positiontitle_th}
                    </div>

                    <div className="flex items-center text-gray-600 col-span-2">
                      <span className="material-symbols-rounded text-base mr-1">
                        apartment
                      </span>
                      {selectedUser.level3agency_th}
                    </div>
                  </div>
                </div>
              </div>

              {/* Evaluation Summary Card */}
              <motion.div
                whileHover={{ y: -2 }}
                className="bg-white p-5 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="material-symbols-rounded text-blue-500">
                      summarize
                    </span>
                    สรุปผลการประเมิน
                  </h4>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center">
                    <span className="material-symbols-rounded text-sm mr-1">
                      checklist
                    </span>
                    {selectedUser.evaluation_B.length} ครั้ง
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Average Score */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 flex items-center">
                      <span className="material-symbols-rounded text-base mr-1">
                        star
                      </span>
                      คะแนนเฉลี่ย
                    </div>
                    <div className="text-2xl font-bold text-blue-800 mt-1">
                      {calculateAverageScore(selectedUser.evaluation_B).toFixed(
                        1,
                      )}
                    </div>
                  </div>

                  {/* Last Evaluation */}
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-600 flex items-center">
                      <span className="material-symbols-rounded text-base mr-1">
                        event
                      </span>
                      ประเมินล่าสุด
                    </div>
                    <div className="text-sm font-medium text-green-800 mt-1">
                      {selectedUser.evaluation_B?.length > 0 ? (
                        <div className="text-sm font-medium text-green-800 mt-1">
                          {formatDate(
                            selectedUser.evaluation_B.at(-1).updatedAt,
                          )}
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-gray-400 mt-1">
                          -
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Highest Score */}
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-600 flex items-center">
                      <span className="material-symbols-rounded text-base mr-1">
                        trending_up
                      </span>
                      คะแนนสูงสุด
                    </div>
                    <div className="text-2xl font-bold text-purple-800 mt-1">
                      {findMaxScore(selectedUser.evaluation_B)}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Evaluation Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="material-symbols-rounded text-blue-500">
                    list_alt
                  </span>
                  รายละเอียดการประเมิน
                </h4>

                {selectedUser.evaluation_B.map(
                  (evaluation_B: any, index: number) => (
                    <motion.div
                      key={evaluation_B.evaluationId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white p-5 rounded-xl shadow-sm border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium px-2.5 py-1 bg-gray-100 text-gray-800 rounded-full">
                            การประเมินครั้งที่ {index + 1}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(evaluation_B.createdAt)}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          คะแนนรวม: {calculateTotalScore(evaluation_B)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                        {/* Topic 1 */}

                        <div className="p-2 border border-blue-100 rounded-lg">
                          <div className="text-xs text-blue-600">
                            หัวข้อที่ 1
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[12px] text-gray-500 font-medium">
                              {selectedOrg && selectedOrg.id === "3"
                                ? "ความรับผิดชอบ ตรงต่อเวลา การรักษาระเบียบวินัย"
                                : "การมุ่งผลสัมฤทธิ์"}
                            </span>
                            <span className="text-blue-800 font-bold">
                              {evaluation_B.topic1}
                            </span>
                          </div>
                        </div>

                        {/* Topic 2 */}
                        <div className="p-2 border border-green-100 rounded-lg">
                          <div className="text-xs text-green-600">
                            หัวข้อที่ 2
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[12px] text-gray-500 font-medium">
                              {selectedOrg && selectedOrg.id === "3"
                                ? "ความตั้งใจในการทำงาน"
                                : "บริการที่ดี"}
                            </span>
                            <span className="text-green-800 font-bold">
                              {evaluation_B.topic2}
                            </span>
                          </div>
                        </div>

                        {/* Topic 3 */}
                        <div className="p-2 border border-purple-100 rounded-lg">
                          <div className="text-xs text-purple-600">
                            หัวข้อที่ 3
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[12px] text-gray-500 font-medium">
                              {selectedOrg && selectedOrg.id === "3"
                                ? "มนุษย์สัมพันธ์และการทำงานร่วมกับผู้อื่น"
                                : "การสั่งสมความเชี่ยวชาญในงานอาชีพ"}
                            </span>
                            <span className="text-purple-800 font-bold">
                              {evaluation_B.topic3}
                            </span>
                          </div>
                        </div>

                        {/* Topic 4 */}
                        <div className="p-2 border border-amber-100 rounded-lg">
                          <div className="text-xs text-amber-600">
                            หัวข้อที่ 4
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[12px] text-gray-500 font-medium">
                              {selectedOrg && selectedOrg.id === "3"
                                ? "ความมีน้ำใจ"
                                : "การยึดมั่นในความถูกต้องชอบธรรมและจริยธรรม"}
                            </span>
                            <span className="text-amber-800 font-bold">
                              {evaluation_B.topic4}
                            </span>
                          </div>
                        </div>

                        {/* Topic 5 */}
                        <div className="p-2 border border-pink-100 rounded-lg">
                          <div className="text-xs text-pink-600">
                            หัวข้อที่ 5
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[12px] text-gray-500 font-medium">
                              {selectedOrg && selectedOrg.id === "3"
                                ? "การร่วมมือในกิจกรรมของส่วนรวม"
                                : "การทำงานเป็นทีม"}
                            </span>
                            <span className="text-pink-800 font-bold">
                              {evaluation_B.topic5}
                            </span>
                          </div>
                        </div>

                        {/* Topic 6 */}
                        {evaluation_B.topic6 && (
                          <div className="p-2 border border-rose-100 rounded-lg">
                            <div className="text-xs text-rose-600">
                              หัวข้อที่ 6
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[12px] text-gray-500 font-medium">
                                การคิดวิเคราะห์
                              </span>
                              <span className="text-rose-800 font-bold">
                                {evaluation_B.topic6}
                              </span>
                            </div>
                          </div>
                        )}
                        {evaluation_B.topic7 && (
                          <div className="p-2 border border-emerald-100 rounded-lg">
                            <div className="text-xs text-emerald-600">
                              หัวข้อที่ 7
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[12px] text-gray-500 font-medium">
                                การตรวจสอบความถูกต้องตามกระบวนงาน
                              </span>
                              <span className="text-emerald-800 font-bold">
                                {evaluation_B.topic7}
                              </span>
                            </div>
                          </div>
                        )}
                        {evaluation_B.topic8 && (
                          <div className="p-2 border border-teal-100 rounded-lg">
                            <div className="text-xs text-teal-600">
                              หัวข้อที่ 8
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[12px] text-gray-500 font-medium">
                                การสืบเสาะหาข้อมูล
                              </span>
                              <span className="text-teal-800 font-bold">
                                {evaluation_B.topic8}
                              </span>
                            </div>
                          </div>
                        )}
                        {evaluation_B.topic9 && (
                          <div className="p-2 border border-cyan-100 rounded-lg">
                            <div className="text-xs text-cyan-600">
                              หัวข้อที่ 9
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[12px] text-gray-500 font-medium">
                                การมองภาพองค์รวม
                              </span>
                              <span className="text-cyan-800 font-bold">
                                {evaluation_B.topic9}
                              </span>
                            </div>
                          </div>
                        )}

                        {evaluation_B.topic10 && (
                          <div className="p-2 border border-cyan-100 rounded-lg">
                            <div className="text-xs text-teal-600">
                              หัวข้อที่ 10
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[12px] text-gray-500 font-medium">
                                ความรู้เกี่ยวกับงานในหน้าที่ กฎ
                                ระเบียบที่เกี่ยวข้องในงาน
                              </span>
                              <span className="text-cyan-800 font-bold">
                                {evaluation_B.topic10}
                              </span>
                            </div>
                          </div>
                        )}

                        {evaluation_B.topic11 && (
                          <div className="p-2 border border-cyan-100 rounded-lg">
                            <div className="text-xs text-blue-600">
                              หัวข้อที่ 11
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[12px] text-gray-500 font-medium">
                                ความรวดเร็วของงานที่ได้ปฏิบัติหรือได้รับมอบหมาย
                              </span>
                              <span className="text-cyan-800 font-bold">
                                {evaluation_B.topic11}
                              </span>
                            </div>
                          </div>
                        )}

                        {evaluation_B.topic12 && (
                          <div className="p-2 border border-cyan-100 rounded-lg">
                            <div className="text-xs text-blue-600">
                              หัวข้อที่ 12
                            </div>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[12px] text-gray-500 font-medium">
                                ความถูกต้องของงานที่ได้ปฎิบัติหรือได้รับมอบหมาย
                              </span>
                              <span className="text-cyan-800 font-bold">
                                {evaluation_B.topic12}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {evaluation_B.comment && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="material-symbols-rounded text-sm">
                              comment
                            </span>
                            ข้อคิดเห็นเพิ่มเติม
                          </div>
                          <p className="text-sm text-gray-700 mt-1">
                            {evaluation_B.comment}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  ),
                )}
              </div>

              {/* Footer Actions */}
              <motion.div
                className="flex justify-end gap-3 pt-4 border-t border-gray-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                >
                  ปิดหน้าต่าง
                </motion.button>
              </motion.div>
            </>
          ) : (
            <></>
          )}
        </motion.div>
      </Modal360>

      <motion.div className="flex flex-col gap-6 max-w-7xl mx-auto">
        {/* Header with Guidance */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <span className="material-symbols-rounded text-2xl">
                assessment
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  ระบบการประเมินผล คณะกรรมการตามระเบียบ
                  <span className="material-symbols-rounded text-blue-500 text-xl">
                    verified
                  </span>
                </h1>
                <span className="material-symbols-rounded text-gray-400 hover:text-gray-600 cursor-pointer">
                  more_vert
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                คลิกที่การ์ดด้านล่างเพื่อเลือกหน่วยงานและดูรายชื่อผู้เข้าร่วมการประเมิน
                ใช้ช่องค้นหาเพื่อกรองข้อมูลตามชื่อหรือรายละเอียดอื่นๆ
              </p>

              {/* <motion.div
                whileHover={{ x: 2 }}
                className="mt-4 inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <span className="text-sm font-medium">เริ่มต้นใช้งาน</span>
                <span className="material-symbols-rounded text-lg">
                  arrow_forward
                </span>
              </motion.div> */}
            </div>
          </div>
        </motion.div>

        {/* Organization Cards */}
        <div className="flex flex-nowrap overflow-x-auto pb-4 gap-3 scrollbar-hide">
          {organizations.map((org: any) => (
            <motion.div
              key={org.id}
              className={`flex-shrink-0 w-80 px-5 py-4 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedOrg?.id === org.id
                  ? "bg-blue-600 text-white shadow-xl ring-2 ring-blue-300 ring-offset-2"
                  : "bg-white text-gray-800 border border-gray-200 shadow-md hover:shadow-lg hover:border-blue-300"
              }`}
              whileHover={{
                y: -2,
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick(org)}
            >
              {/* Icon and Title */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`p-3 rounded-lg flex-shrink-0 ${
                    selectedOrg?.id === org.id ? "bg-white/20" : "bg-blue-50"
                  }`}
                >
                  <span
                    className={`material-symbols-rounded text-2xl ${
                      selectedOrg?.id === org.id
                        ? "text-white"
                        : "text-blue-600"
                    }`}
                  >
                    {org.icon || "corporate_fare"}
                  </span>
                </div>

                <h3
                  className={`text-base font-semibold line-clamp-2 flex-1 leading-tight ${
                    selectedOrg?.id === org.id ? "text-white" : "text-gray-800"
                  }`}
                >
                  {org.name}
                </h3>
              </div>

              {/* Status Indicator */}
              <div
                className={`flex items-center gap-2 text-sm ${
                  selectedOrg?.id === org.id ? "text-blue-100" : "text-gray-600"
                }`}
              >
                {selectedOrg?.id === org.id ? (
                  <>
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/30">
                      <span className="material-symbols-rounded text-base text-white">
                        check
                      </span>
                    </span>
                    <span className="font-medium">กำลังแสดงข้อมูล</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-rounded text-base">
                      touch_app
                    </span>
                    <span>คลิกเพื่อเลือก</span>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <AnimatePresence>
          {selectedOrg && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
              {/* Header Section */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="material-symbols-rounded text-blue-500">
                      groups
                    </span>
                    รายชื่อผู้เข้าร่วมการประเมิน
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    หน่วยงาน:{" "}
                    <span className="font-medium text-blue-600">
                      {selectedOrg.name}
                    </span>
                  </p>
                </div>

                {/* Search and Export */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Year */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="relative w-full sm:w-72"
                  >
                    <ThaiYearPicker
                      selectedYear={selectedYear}
                      onChange={setSelectedYear}
                    />
                  </motion.div>

                  {/* Search Box */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="relative w-full sm:w-72"
                  >
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-rounded text-gray-400">
                        search
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อหรือรหัส..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 placeholder-gray-400 text-gray-700"
                    />
                  </motion.div>

                  {/* Export Button */}
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExportExcel}
                    disabled={checkedRows.size === 0}
                    className={`inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      checkedRows.size > 0
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <span className="material-symbols-rounded mr-2">
                      download
                    </span>
                    ส่งออกข้อมูล ({checkedRows.size})
                  </motion.button>
                </div>
              </div>

              {/* Remark */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Info Box */}
                <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                  <div className="flex items-start">
                    <span className="material-symbols-outlined text-blue-500 mt-0.5 mr-2">
                      info
                    </span>
                    <div>
                      <h3 className="text-sm font-medium text-blue-800">
                        คำแนะนำการใช้งาน
                      </h3>
                      <p className="mt-1 text-sm text-blue-500">
                        Export ข้อมูลให้เฉพาะ ผู้ที่ได้รับการประเมินแล้วเท่านั้น{" "}
                        <span className="text-blue-600 font-medium">
                          [ส่งออกข้อมูลได้ที่ละกลุ่ม เท่านั้น]
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Tabs */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex overflow-x-auto pb-2 mb-6 gap-2 scrollbar-hide"
              >
                {getCurrentTabs(selectedOrg.id).map((tab) => (
                  <motion.button
                    key={tab.key}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex-shrink-0 flex items-center px-4 py-2 rounded-xl transition-all duration-200 ${
                      activeTab === tab.key
                        ? `bg-gradient-to-r from-${tab.color}-100 to-${tab.color}-50 text-${tab.color}-700 shadow-sm border border-${tab.color}-200 font-medium`
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    <span
                      className={`material-symbols-rounded mr-2 text-lg ${
                        activeTab === tab.key
                          ? `text-${tab.color}-600`
                          : "text-gray-500"
                      }`}
                    >
                      {tab.icon}
                    </span>
                    <span className="text-sm whitespace-nowrap">
                      {tab.label}
                    </span>
                  </motion.button>
                ))}
              </motion.div>

              {/* Loading State */}
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12"
                >
                  <span className="material-symbols-rounded text-4xl text-blue-500 animate-spin mb-3">
                    progress_activity
                  </span>
                  <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {/* Header Summary */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isAllChecked}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition"
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        เลือกทั้งหมด ({filteredUsers?.length || 0} คน)
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600">
                        {
                          Array.from(checkedRows).filter((r: any) =>
                            filteredUsers?.some(
                              (u: any) => u.accountId === r.accountId,
                            ),
                          ).length
                        }
                      </span>
                      <span className="text-gray-500">
                        {" "}
                        / {filteredUsers?.length || 0} เลือก
                      </span>
                    </div>
                  </div>

                  {/* User List Cards */}
                  <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden bg-white">
                    {filteredUsers?.map((user: any, index: number) => {
                      const isChecked = Array.from(checkedRows).some(
                        (row: any) => row.accountId === user.accountId,
                      );
                      const hasEvaluation = user.evaluation_B?.length > 0;

                      return (
                        <motion.div
                          key={user.accountId}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`py-4 px-4 transition-all duration-200 ${
                            isChecked
                              ? "bg-blue-50 border-l-4 border-l-blue-500"
                              : "hover:bg-gray-50/50"
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* Checkbox */}
                            <div className="flex items-center pt-1">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleRow(user.accountId)}
                                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition cursor-pointer"
                              />
                            </div>

                            {/* User Profile */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="flex-shrink-0">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center overflow-hidden shadow-sm border border-blue-200">
                                  {user.imageprofile ? (
                                    <img
                                      className="h-full w-full object-contain"
                                      src={safeImageUrl(
                                        config.URL_API,
                                        user.imageprofile,
                                      )}
                                      alt={`${user.fullname_th}'s profile`}
                                    />
                                  ) : (
                                    <UserIcon className="h-6 w-6 text-white" />
                                  )}
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-semibold text-gray-900 truncate">
                                    {user.fullname_th}
                                  </h3>
                                  {hasEvaluation && (
                                    <span
                                      className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100"
                                      title="เคยประเมินแล้ว"
                                    >
                                      <span className="material-symbols-rounded text-sm text-green-600">
                                        check
                                      </span>
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">
                                    <span className="material-symbols-rounded text-xs mr-0.5 align-text-bottom">
                                      badge
                                    </span>
                                    ID: {user.accountId}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="material-symbols-rounded text-sm text-gray-400">
                                    location_on
                                  </span>
                                  <span className="text-xs text-gray-600 truncate">
                                    {user.level3agency_th}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {hasEvaluation ? (
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsOpenModal(true);
                                  }}
                                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors whitespace-nowrap"
                                >
                                  <span className="material-symbols-rounded text-sm mr-1">
                                    visibility
                                  </span>
                                  {user.evaluation_B.length} ครั้ง
                                </motion.button>
                              ) : (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 whitespace-nowrap">
                                  <span className="material-symbols-rounded text-sm mr-1">
                                    schedule
                                  </span>
                                  รอการประเมิน
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom Export Button */}
              {filteredUsers?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end mt-6"
                >
                  <motion.button
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExportExcel}
                    disabled={checkedRows.size === 0}
                    className={`inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      checkedRows.size > 0
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    <span className="material-symbols-rounded mr-2">
                      download
                    </span>
                    ส่งออกข้อมูล ({checkedRows.size})
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
