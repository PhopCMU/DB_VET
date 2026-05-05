import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { exportMultipleSheetsToExcel } from "../utils/exportToExcel";
import { fetchUsers, fetchReportData } from "@/mock/mockApi";

interface User {
  id: number;
  name: string;
}

interface UserData {
  userId: number;
  reportData: string;
}

const ITEMS_PER_PAGE = 20;

export default function ReportTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingExport, setIsLoadingExport] = useState(false); // เพิ่ม state สำหรับการโหลดข้อมูล

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page: number) => {
    setIsLoading(true);
    try {
      const result = await fetchUsers(page, ITEMS_PER_PAGE); // ใช้ mock api
      setUsers(result.items);
      setTotalPages(Math.ceil(result.total / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleExportSelected = async () => {
    if (selectedUsers.length === 0) return;

    setIsLoadingExport(true);

    const exportData: { [key: string]: any[] } = {};
    let allSuccess = true;

    for (const userId of selectedUsers) {
      try {
        const data = await fetchReportData(userId);
        const username =
          users.find((u) => u.id === userId)?.name || `user_${userId}`;
        exportData[username] = data;
      } catch (err) {
        console.error(`Error fetching report for user ${userId}:`, err);
        allSuccess = false;
      }
    }

    try {
      // ลองเปิด popup เพื่อดูว่า browser block หรือไม่
      const popup = window.open("", "_blank");
      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        alert("กรุณาอนุญาตให้เปิด popup บนเบราว์เซอร์ของคุณ");
        setIsLoadingExport(false);
        return;
      }
      popup.close();

      // Export ไฟล์
      exportMultipleSheetsToExcel(exportData, "360_Reports.xlsx");
    } catch (err) {
      console.error("Export error:", err);
      allSuccess = false;
    } finally {
      setIsLoadingExport(false);
    }
  };

  return (
    <div className="p-6">
      {/* Export Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleExportSelected}
        disabled={selectedUsers.length === 0 || isLoadingExport}
        className={`px-4 py-2 rounded-md mb-4 ${
          selectedUsers.length > 0 && !isLoadingExport
            ? "bg-green-600 text-white"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {isLoadingExport ? "กำลังโหลดข้อมูล..." : "Export Selected to Excel"}
      </motion.button>

      {/* Table */}
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border-b">Select</th>
              <th className="py-2 px-4 border-b">ID</th>
              <th className="py-2 px-4 border-b">Name</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="py-2 px-4 border-b text-center">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleCheckboxChange(user.id)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="py-2 px-4 border-b">{user.id}</td>
                <td className="py-2 px-4 border-b">{user.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Loading Modal */}
      {isLoadingExport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg animate-pulse">
            <h3 className="text-lg font-semibold">กำลังเตรียมข้อมูล...</h3>
            <p className="mt-2 text-sm text-gray-600">กรุณารอสักครู่</p>
          </div>
        </div>
      )}
    </div>
  );
}
