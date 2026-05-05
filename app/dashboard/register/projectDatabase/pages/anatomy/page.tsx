"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LoadingModal,
  ModalAlertWarning,
  ModalEditFileStudent,
  ModalEditStudent,
} from "@/components/Modal";
import { fetchDataListuser } from "@/app/routers/anatomy/GetRouter";
import {
  StudentData,
  StudentUpdateSroceProp,
} from "@/app/model/anatomy/studentModel";
import {
  AddCertificateRouter,
  AddScoreRouter,
} from "@/app/routers/anatomy/PostRouter";

export const AnatomyPage = () => {
  const [activeTab, setActiveTab] = useState<"all" | "score" | "cert">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [checkedRows, setCheckedRows] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalFileOpen, setIsModalFileOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const [selectedStudent, setSelectedStudent] = useState<
    StudentData[] | undefined
  >();

  const [editedStudent, setEditedStudent] = useState<StudentData | null>(null);
  const [editedFileStudent, setEditedFileStudent] =
    useState<StudentData | null>(null);

  const [isUpdated, setIsUpdated] = useState<boolean>(false);
  const [scoresData, setScoresData] = useState<StudentUpdateSroceProp>({});
  const [certificateData, setCertificateData] = useState<any>({});
  const [isModalAlertOpen, setIsModalAlertOpen] = useState(false);
  const [isModalMessageOpen, setIsModalMessageOpen] = useState<string | null>(
    null
  );
  const [isOpen, setIsOpen] = useState(false);

  const fatchDataUser = async () => {
    const response: any = await fetchDataListuser();
    if (response.status === 200 || response.success) {
      setSelectedStudent(response.data);
    }
  };

  useEffect(() => {
    fatchDataUser();
    setIsUpdated(false);
  }, [isUpdated]);

  const handleEditFileStudent = (student: any) => {
    setEditedFileStudent(student);
    setIsModalFileOpen(true);
  };

  const filteredStudents = selectedStudent?.filter((student: StudentData) =>
    Object.values(student).some((val: any) =>
      val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const toggleRow = (id: string) => {
    const newChecked = new Set(checkedRows);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedRows(newChecked);
  };

  const handleEditStudent = (student: any) => {
    setEditedStudent(student);
    setIsModalOpen(true);
  };

  const termToSubjectMap: { [key: string]: string } = {
    "1": "รอบคัดเลือก",
    "2": "รอบชิงชนะเลิศ (บรรยาย)",
    "3": "รอบชิงชนะเลิศ (ปฏิบัติ)",
  };

  const updateScore = (studentId: string, term: string, value: string) => {
    setScoresData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [term]: value,
      },
    }));
  };

  const updateCertificate = (studentId: string, link: string) => {
    setCertificateData((prev: any) => ({
      ...prev,
      [studentId]: link,
    }));
  };

  const handleSendScores = async () => {
    setIsLoading(true);
    setUploadProgress(0);
    const payload = Array.from(checkedRows).flatMap((studentId) =>
      [1, 2, 3].map((term) => ({
        term: String(term),
        subject: termToSubjectMap[String(term)],
        score: Number(
          scoresData[studentId]?.[String(term)] ||
            getScoreByTerm(
              filteredStudents?.find(
                (s: StudentData) => s.studentId === studentId
              )?.scores || [],
              String(term)
            )
        ),
        studentId,
      }))
    );

    const response = await AddScoreRouter(
      { updates: payload },
      setUploadProgress
    );

    if (response.success) {
      setTimeout(async () => {
        await fatchDataUser();
        setCheckedRows(new Set());
        setScoresData({});
        setIsLoading(false);
      }, 2000);
      // Reset scores
    } else {
      setIsLoading(false);
      setIsModalMessageOpen(response.message || "");
      setIsModalAlertOpen(true);
    }
  };

  const handleSendCertificates = async () => {
    if (checkedRows.size === 0) return;

    const invalidUrls: string[] = [];
    const validData = Array.from(checkedRows).reduce((acc, studentId) => {
      const url = certificateData[studentId]?.trim();

      // เช็กว่า URL เริ่มด้วย https://
      if (!url || !url.startsWith("https://")) {
        invalidUrls.push(studentId);
      } else {
        acc.push({ studentId, downloadUrl: url });
      }

      return acc;
    }, [] as { studentId: string; downloadUrl: string }[]);

    // ถ้ามี URL ไม่ถูกต้อง
    if (invalidUrls.length > 0) {
      setIsModalAlertOpen(true);
      setIsModalMessageOpen(
        `กรุณาตรวจสอบลิงก์ใบรับรองสำหรับนักเรียน ID: ${invalidUrls.join(
          ", "
        )}\nลิงก์ต้องเริ่มด้วย "https://"`
      );
      return;
    }
    setIsLoading(true);
    setUploadProgress(0);

    const response = await AddCertificateRouter(
      { updates: validData },
      setUploadProgress
    );

    if (response.success) {
      setTimeout(async () => {
        await fatchDataUser();
        setCheckedRows(new Set());
        setCertificateData({});
        setIsLoading(false);
      }, 2000);
    } else {
      setIsLoading(false);
      setIsModalMessageOpen(response.message || "");
      setIsModalAlertOpen(true);
    }
  };

  const getScoreByTerm = (scores: any[], term: string) => {
    const score = scores.find((s) => s.term === term);
    return score ? score.score : "";
  };

  const exportOptions = [
    {
      id: 1,
      label: "PDF",
      icon: "picture_as_pdf",
      action: () => handleExport("pdf"),
    },
    {
      id: 2,
      label: "Excel",
      icon: "table_view",
      action: () => handleExport("excel"),
    },
    {
      id: 3,
      label: "CSV",
      icon: "file_download",
      action: () => handleExport("csv"),
    },
  ];

  const handleExport = (type: any) => {
    console.log(`Exporting as ${type}`);
    setIsOpen(false);
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Modal Edit */}
      <ModalEditStudent
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="แก้ไขข้อมูลนักเรียน"
        formData={editedStudent ?? ({} as StudentData)}
        onSave={() => {}}
        onSuccess={() => {
          setIsUpdated(true); // บอกให้โหลดข้อมูลใหม่
        }}
      />

      {isModalFileOpen && (
        <ModalEditFileStudent
          isOpen={isModalFileOpen}
          onClose={() => setIsModalFileOpen(false)}
          title="ตรวจสอบเอกสาร & แก้ไขเอกสาร"
          formData={editedFileStudent ?? ({} as StudentData)}
          onSave={() => {}}
          onSuccess={() => {
            setIsUpdated(true); // บอกให้โหลดข้อมูลใหม่
          }}
        />
      )}

      {/* ModalAlert Messages */}
      {isModalAlertOpen && (
        <ModalAlertWarning
          details={isModalMessageOpen || ""}
          onClose={() => setIsModalAlertOpen(false)}
        />
      )}

      {/* loading */}
      <LoadingModal isOpen={isLoading} progress={uploadProgress} />

      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-1 md:mb-2 flex  items-center space-x-2">
          <span className="material-symbols-outlined mr-1 text-lg md:text-xl">
            folder
          </span>
          ระบบจัดการผู้เข้าสอบ
        </h1>
        <div className="flex justify-between">
          <p className="text-sm md:text-base text-gray-600">
            จัดการข้อมูลผู้เข้าสอบและผลคะแนน
          </p>
        </div>
      </div>

      {/* Tabs - ปรับสำหรับมือถือ */}
      <div className="flex overflow-x-auto pb-2 mb-4 md:mb-6 gap-2">
        {[
          {
            key: "all",
            label: "รายชื่อทั้งหมด",
            icon: "list_alt",
            color: "blue",
          },
          {
            key: "score",
            label: "ลงผลคะแนน",
            icon: "edit_note",
            color: "green",
          },
          {
            key: "cert",
            label: "E-Certificate",
            icon: "verified",
            color: "purple",
          },
        ].map((tab) => (
          <motion.button
            key={tab.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-shrink-0 flex items-center px-4 py-2 md:px-5 md:py-2.5 rounded-lg transition-all duration-200 border ${
              activeTab === tab.key
                ? `bg-${tab.color}-100 text-${tab.color}-700 border-${tab.color}-300 shadow-sm font-medium`
                : "text-gray-600 hover:bg-gray-100 border-gray-200"
            }`}
          >
            <span className="material-symbols-outlined mr-1 md:mr-2 text-base md:text-lg">
              {tab.icon}
            </span>
            <span className="text-sm md:text-base">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Search Box */}
      <div className="mb-4 md:mb-6 relative w-full">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="material-symbols-outlined text-gray-400">
            search
          </span>
        </div>
        <input
          type="text"
          placeholder="ค้นหาด้วยชื่อ, เลขประจำตัว..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-8 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm md:text-base"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <span className="material-symbols-outlined text-gray-400 hover:text-gray-600 text-sm">
              close
            </span>
          </button>
        )}
      </div>

      {/* Info Bar */}
      <div className="mb-3 md:mb-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
        <p className="text-xs md:text-sm text-gray-500">
          แสดงผล {filteredStudents?.length} จาก {selectedStudent?.length} รายการ
        </p>
        <div className="flex justify-end">
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-xs md:text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <span className="material-symbols-outlined mr-1 text-sm">
                download
              </span>
              ส่งออกข้อมูล
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 z-20 mt-2 w-56 bg-white rounded-xl shadow-xl ring-1 ring-gray-100 overflow-hidden"
                >
                  <div className="py-2">
                    {exportOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={option.action}
                        className="flex items-center w-full gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
                      >
                        <span className="material-symbols-outlined text-base">
                          {option.icon}
                        </span>
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        {/* All Students Table - ปรับสำหรับมือถือ */}
        {activeTab === "all" && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead
                className={`bg-gradient-to-r from-blue-50 to-blue-100 hidden md:table-header-group`}
              >
                <tr>
                  {[
                    "เลขที่นั่ง",
                    "ชื่อ-นามสกุล",
                    "เบอร์โทร",
                    "โรงเรียน",
                    "หนังสือยินยอม",
                    "ตรวจเอกสาร",
                    "แก้ไข",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-3 py-2 md:px-4 md:py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents?.map((student: StudentData) => (
                  <tr
                    key={student.studentId}
                    className="hover:bg-blue-50 transition-colors grid grid-cols-2 md:table-row gap-2 p-3 md:p-0"
                  >
                    {/* สำหรับ Mobile View */}
                    <td className="md:hidden col-span-2 font-medium text-gray-900 border-b pb-2 flex justify-between items-center">
                      <span>{student.fname}</span>
                      <span className="text-sm font-normal text-gray-500">
                        #{student.examSeatNumber}
                      </span>
                    </td>

                    <td className="hidden md:table-cell px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.examSeatNumber}
                    </td>

                    <td className="hidden md:table-cell px-3 py-2 md:px-4 md:py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {student.fname}
                    </td>

                    <td className="flex justify-between md:table-cell px-3 py-1 md:px-4 md:py-3 text-sm text-gray-500">
                      <span className="md:hidden">เบอร์โทร:</span>
                      <span>{student.phone}</span>
                    </td>

                    <td className="flex justify-between md:table-cell px-3 py-1 md:px-4 md:py-3 text-sm text-gray-500">
                      <span className="md:hidden">โรงเรียน:</span>
                      <span className="truncate max-w-[150px] md:max-w-none">
                        {student.school}
                      </span>
                    </td>

                    <td className="col-span-2 md:col-span-1 flex justify-between md:table-cell px-3 py-1 md:px-4 md:py-3 text-sm text-blue-600">
                      <span className="md:hidden">หนังสือยินยอม:</span>
                      <div className=" flex items-center justify-end md:justify-start">
                        <>
                          {student.paperPDPA ? (
                            <>
                              <span className="material-symbols-outlined text-base mr-1 text-green-800">
                                task
                              </span>
                              <span className="text-green-800">สำเร็จ</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-base mr-1 text-red-800">
                                scan_delete
                              </span>
                              <span className="text-red-800">รอตรวจ</span>
                            </>
                          )}
                        </>
                      </div>
                    </td>

                    <td className="col-span-2 md:col-span-1 flex justify-between md:table-cell px-3 py-1 md:px-4 md:py-3 text-sm text-blue-600">
                      <span className="md:hidden">ตรวจเอกสาร:</span>

                      <button
                        onClick={() => handleEditFileStudent(student)}
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center justify-end md:justify-start "
                      >
                        <span className="material-symbols-outlined text-base mr-1">
                          list_alt
                        </span>
                        <span className="md:hidden">ตรวจเอกสาร</span>
                      </button>
                    </td>

                    <td className="col-span-2 md:col-span-1 flex justify-between md:table-cell px-3 py-1 md:px-4 md:py-3 text-sm text-blue-600">
                      <span className="md:hidden">แก้ไข:</span>

                      <button
                        onClick={() => handleEditStudent(student)}
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center justify-end md:justify-start"
                      >
                        <span className="material-symbols-outlined text-base mr-1">
                          edit
                        </span>
                        <span className="md:hidden">แก้ไข</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Score Entry Table - ปรับสำหรับมือถือ */}
        {activeTab === "score" && (
          <div className="p-2 md:p-4">
            <div className="mb-3 md:mb-4 bg-green-50 border-l-4 border-green-500 p-3 md:p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="material-symbols-outlined text-green-400 text-sm md:text-base">
                    info
                  </span>
                </div>
                <div className="ml-2 md:ml-3">
                  <h3 className="text-xs md:text-sm font-medium text-green-800">
                    คำแนะนำ
                  </h3>
                  <div className="mt-1 text-xs md:text-sm text-green-700">
                    <p>
                      กรอกเป็นตัวเลขจำนวนเต็ม เท่านั้น ช่องไหนไม่มี
                      คะแนนให้ว่างไว้ ระบบจะ set เป็น 0 ให้
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-green-50 to-green-100 hidden md:table-header-group">
                  <tr>
                    <th className="px-3 py-2 w-8 md:w-10">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const allIds = new Set(
                            selectedStudent?.map((s) => s.studentId)
                          );
                          setCheckedRows(e.target.checked ? allIds : new Set());
                        }}
                        className="h-3 w-3 md:h-4 md:w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </th>
                    {[
                      "ชื่อ-นามสกุล",
                      "รอบคัดเลือก",
                      "รอบชิงชนะเลิศ (บรรยาย)",
                      "รอบชิงชนะเลิศ (ปฏิบัติ)",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents?.map((student: StudentData) => (
                    <tr
                      key={student.studentId}
                      className={
                        checkedRows.has(student.studentId)
                          ? "bg-green-50"
                          : "hover:bg-gray-50 grid grid-cols-2 md:table-row gap-2 p-3 md:p-0"
                      }
                    >
                      <td className="px-3 py-1 md:px-4 md:py-3 flex items-center">
                        <input
                          type="checkbox"
                          checked={checkedRows.has(student.studentId)}
                          onChange={() => toggleRow(student.studentId)}
                          className="h-3 w-3 md:h-4 md:w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 md:hidden text-sm font-medium">
                          เลือก
                        </span>
                      </td>

                      <td className="col-span-2 md:col-span-1 px-3 py-1 md:px-4 md:py-3 text-sm font-medium text-gray-900">
                        <div className="font-medium">
                          {student.fname}{" "}
                          <span className="text-xs text-gray-500">
                            #{student.examSeatNumber}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          #{student.studentId}
                        </div>
                      </td>

                      {/* แสดงคะแนน 3 ช่องเสมอ */}
                      {[1, 2, 3].map((term) => {
                        const score = getScoreByTerm(
                          student.scores || [],
                          String(term)
                        );
                        return (
                          <td className="px-2 py-1 md:px-4 md:py-3" key={term}>
                            <div className="flex flex-col md:block">
                              {/* Mobile label - only shows on small screens */}
                              <span className="text-xs text-gray-500 mb-1 md:hidden">
                                ภาค {term}
                              </span>

                              {/* Input field */}
                              <div className="flex justify-end md:justify-center">
                                <input
                                  disabled={!checkedRows.has(student.studentId)}
                                  value={
                                    scoresData[student.studentId]?.[
                                      String(term)
                                    ] ?? score
                                  }
                                  onChange={(e) =>
                                    updateScore(
                                      student.studentId,
                                      String(term),
                                      e.target.value
                                    )
                                  }
                                  placeholder={`${term}`}
                                  className={`
              w-full max-w-[80px] md:w-20 
              border rounded px-2 py-1 
              text-sm md:text-base 
              focus:outline-none focus:ring-2 
              text-right md:text-center
              ${
                checkedRows.has(student.studentId)
                  ? "focus:ring-green-300 border-gray-300"
                  : "bg-gray-100 border-gray-200"
              }
            `}
                                />
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Button */}
            <div className="mt-3 md:mt-4 flex justify-end">
              <button
                onClick={handleSendScores}
                disabled={checkedRows.size === 0}
                className={`inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent rounded-md shadow-sm text-xs md:text-sm font-medium text-white ${
                  checkedRows.size > 0
                    ? "bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <span className="material-symbols-outlined mr-1 text-sm md:text-base">
                  save
                </span>
                ส่งคะแนนที่เลือก ({checkedRows.size})
              </button>
            </div>
          </div>
        )}

        {/* Certificate Upload Table - ปรับสำหรับมือถือ */}
        {activeTab === "cert" && (
          <div className="p-2 md:p-4">
            <div className="mb-3 md:mb-4 bg-blue-50 border-l-4 border-blue-400 p-3 md:p-4 rounded">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="material-symbols-outlined text-blue-400 text-sm md:text-base">
                    info
                  </span>
                </div>
                <div className="ml-2 md:ml-3">
                  <h3 className="text-xs md:text-sm font-medium text-blue-800">
                    คำแนะนำ
                  </h3>
                  <div className="mt-1 text-xs md:text-sm text-blue-700">
                    <p>อัปโหลดลิงก์ E-Certificate ให้ผู้เข้าสอบที่เลือก</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead
                  className={`bg-gradient-to-r from-purple-50 to-purple-100 hidden md:table-header-group`}
                >
                  <tr>
                    <th className="px-3 py-2 w-8 md:w-10">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const allIds = new Set(
                            selectedStudent?.map((s) => s.studentId)
                          );
                          setCheckedRows(e.target.checked ? allIds : new Set());
                        }}
                        className="h-3 w-3 md:h-4 md:w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                      />
                    </th>
                    {["ชื่อ-นามสกุล", "ลิงก์ใบประกาศ"].map((header) => (
                      <th
                        key={header}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents?.map((student: StudentData) => (
                    <tr
                      key={student.studentId}
                      className={
                        checkedRows.has(student.studentId)
                          ? "bg-purple-50"
                          : "hover:bg-gray-50 grid grid-cols-2 md:table-row gap-2 p-3 md:p-0"
                      }
                    >
                      <td className="px-3 py-1 md:px-4 md:py-3 flex items-center">
                        <input
                          type="checkbox"
                          checked={checkedRows.has(student.studentId)}
                          onChange={() => toggleRow(student.studentId)}
                          className="h-3 w-3 md:h-4 md:w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 md:hidden text-sm font-medium">
                          เลือก
                        </span>
                      </td>

                      <td className="col-span-2 md:col-span-1 px-3 py-1 md:px-4 md:py-3 text-sm font-medium text-gray-900">
                        <div className="font-medium">
                          {student.fname}{" "}
                          <span className="text-xs text-gray-500">
                            #{student.examSeatNumber}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          #{student.studentId}
                        </div>
                      </td>

                      <td className="col-span-2 md:col-span-1 px-3 py-1 md:px-4 md:py-3">
                        <div className="flex items-center">
                          <span className="material-symbols-outlined text-gray-400 mr-1 md:mr-2 text-sm">
                            link
                          </span>
                          <input
                            disabled={!checkedRows.has(student.studentId)}
                            type="text"
                            value={
                              certificateData[student.studentId] || // ค่าจาก state (สำหรับ edit)
                              student.certificates?.[0]?.downloadUrl?.trim() || // ค่าจาก database
                              ""
                            }
                            onChange={(e) =>
                              updateCertificate(
                                student.studentId,
                                e.target.value
                              )
                            }
                            placeholder="https://example.com/cert/123"
                            className={`flex-1 border rounded px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm focus:outline-none focus:ring-2 ${
                              checkedRows.has(student.studentId)
                                ? "focus:ring-purple-300 border-gray-300"
                                : "bg-gray-100 border-gray-200"
                            }`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 md:mt-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
              <p className="text-xs md:text-sm text-gray-500">
                เลือกแล้ว {checkedRows.size} รายการ
              </p>

              <button
                onClick={handleSendCertificates}
                disabled={checkedRows.size === 0}
                className={`inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent rounded-md shadow-sm text-xs md:text-sm font-medium text-white ${
                  checkedRows.size > 0
                    ? "bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-purple-500"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <span className="material-symbols-outlined mr-1 text-sm md:text-base">
                  cloud_upload
                </span>
                อัปโหลดลิงก์ใบประกาศ
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
