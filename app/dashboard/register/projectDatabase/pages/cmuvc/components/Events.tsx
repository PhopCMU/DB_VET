import { usePermission } from "@/app/context/UsePermission";
import { useUser } from "@/app/context/UserContext";
import { GetCheckin } from "@/app/routers/cmuvc/GetRouter";
import PermissionGuard from "@/components/Guards/PermissionGuard";
import Loading from "@/components/Loadings/Loading";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ExcelJS from "exceljs";

const SUB_MENU_ID = "9b940740-d1e9-4a41-af0d-4e1faa90464d";
const PROJECT_ID = "ee9ce62b-2e02-4682-9ecf-9f9b564ee5e3";
type typeEvent = "vet" | "pat" | "abstract" | "patsponser" | "patboot";
export default function Events() {
  const { loading } = useUser();
  const [users, setUsers] = useState<any>([]);
  const [selectedTitleTheme, setSelectedTitleTheme] =
    useState<typeEvent>("vet");
  const [selectedYear, setSelectedYear] = useState<Date | null>(new Date());
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const { canView } = usePermission(SUB_MENU_ID, PROJECT_ID);

  /** ------ Fetch data ------- */
  const fetchDataUser = async (date: Date, title?: string) => {
    const response = await GetCheckin(date, title);
    if (!response.success) return toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    setUsers(response.data);
  };

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (selectedYear) {
      debounceTimer.current = setTimeout(() => {
        fetchDataUser(new Date() || selectedYear, selectedTitleTheme || "main");
      }, 1000);
    }
  }, [selectedYear]);

  /** ------ Fetch data ------- */

  /** ------ Export Excel ------- */

  const handleExportXlsx = async () => {
    try {
      const rows = Array.isArray(users) ? users : users ? [users] : [];

      const mapByType = (row: any) => {
        const dict: Record<
          string,
          { fname?: string; lname?: string; ce?: any; category?: any }
        > = {
          vet: {
            fname: row?.vet?.fname,
            lname: row?.vet?.lname,
            ce: row?.vet?.number_ce,
            category: row?.vet?.packages?.category_th,
          },
          pat: {
            fname: row?.participant?.fname,
            lname: row?.participant?.lname,
            ce: row?.participant?.ce,
            category: row?.participant?.packages?.category_th,
          },
          abstract: {
            fname: row?.abstract?.fname,
            lname: row?.abstract?.lname,
            ce: row?.abstract?.ce,
            category: row?.abstract?.abstractType?.adstractType,
          },
          patsponser: {
            fname: row?.sponsersParticipant?.fname,
            lname: row?.sponsersParticipant?.lname,
            ce: row?.sponsersParticipant?.ce,
            category: row?.sponsersParticipant?.companys?.name,
          },
          patboot: {
            fname: row?.sponsersBoot?.fname,
            lname: row?.sponsersBoot?.lname,
            ce: row?.sponsersBoot?.ce,
            category: row?.sponsersBoot?.companys?.name,
          },
        };
        return dict[selectedTitleTheme] ?? {};
      };

      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Export");

      sheet.columns = [
        { header: "ชื่อ - นามสกุล", key: "fullname", width: 26 },
        { header: "CE", key: "ce", width: 12 },
        { header: "ประเภท", key: "category", width: 20 },
        { header: "Day 8", key: "day8", width: 10 },
        { header: "Day 9", key: "day9", width: 10 },
        { header: "Day 10", key: "day10", width: 10 },
        { header: "Day 11", key: "day11", width: 10 },
        { header: "Day 12", key: "day12", width: 10 },
      ];

      // สีที่ใช้ (ARGB): เขียว/แดง
      const GREEN = { argb: "FF2E7D32" }; // Green 700
      const RED = { argb: "FFD32F2F" }; // Red 700

      rows.forEach((row: any) => {
        const inc = mapByType(row);

        // เพิ่มแถว
        const r = sheet.addRow({
          fullname: `${inc?.fname ?? ""} ${inc?.lname ?? ""}`.trim(),
          ce: inc?.ce ?? "",
          category: inc?.category ?? "",
          day8: row?.day8 ? "✔" : "✖",
          day9: row?.day9 ? "✔" : "✖",
          day10: row?.day10 ? "✔" : "✖",
          day11: row?.day11 ? "✔" : "✖",
          day12: row?.day12 ? "✔" : "✖",
        });

        // จัดกึ่งกลางสถานะ
        ["D", "E", "F", "G", "H"].forEach((col) => {
          r.getCell(col).alignment = {
            horizontal: "center",
            vertical: "middle",
          };
        });

        // ใส่สีฟอนต์ตามค่า ✔ / ✖
        const setColor = (col: string, isTrue: boolean) => {
          r.getCell(col).font = {
            color: isTrue ? GREEN : RED,
            bold: true,
          };
        };

        setColor("D", !!row?.day8);
        setColor("E", !!row?.day9);
        setColor("F", !!row?.day10);
        setColor("G", !!row?.day11);
        setColor("H", !!row?.day12);
      });

      // สไตล์หัวตาราง
      const header = sheet.getRow(1);
      header.font = { bold: true };
      header.alignment = { horizontal: "center", vertical: "middle" };
      header.height = 22;
      header.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE3F2FD" }, // ฟ้าอ่อน
      };
      ["D", "E", "F", "G", "H"].forEach((col) => {
        sheet.getColumn(col).alignment = { horizontal: "center" };
      });

      // Auto filter
      sheet.autoFilter = { from: "A1", to: "H1" };

      // สร้างไฟล์และดาวน์โหลด
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const now = new Date();
      const fileName = `export_${selectedTitleTheme}_${now
        .toLocaleDateString("th-TH")
        .replace(/\//g, "-")}.xlsx`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("เกิดข้อผิดพลาดในการสร้างไฟล์ Excel");
    }
  };

  /** ------ Export Excel ------- */
  if (!canView) {
    toast.error("You don't have permission to view this page");
    return null;
  }

  if (loading) return <Loading />;

  return (
    <>
      <PermissionGuard submenuIdCode={SUB_MENU_ID} />
      <div className="flex justify-between gap-2">
        <div className="flex flex-row  gap-2 bg-gray-50/80 rounded-xl p-1.5 backdrop-blur-sm">
          {[
            {
              name: "VMCMU",
              title: "vet",
            },
            {
              name: "Participant",
              title: "pat",
            },
            {
              name: "Abstract",
              title: "abstract",
            },
            {
              name: " Participant Sponser",
              title: "patsponser",
            },
            {
              name: " Participant boots",
              title: "patboot",
            },
          ].map((type, index) => (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                fetchDataUser(new Date(), type.title);
                setSelectedTitleTheme(type.title as typeEvent);
              }}
              key={index}
              className={`relative px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                selectedTitleTheme === type.title
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {type.name}
              {/* Active indicator */}
              {selectedTitleTheme === type.title && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 -z-10"
                  transition={{ type: "spring", duration: 0.5 }}
                />
              )}
            </motion.button>
          ))}
        </div>
        <div className="flex flex-row  gap-2 bg-gray-50/80 rounded-xl p-1.5 backdrop-blur-sm">
          <button
            onClick={handleExportXlsx}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
            title="ส่งออกเป็น Excel (.xlsx)"
          >
            <span className="material-symbols-rounded text-gray-700">
              download
            </span>
            ส่งออก Excel
          </button>
        </div>
      </div>

      {/* ----- Table Section ----- */}
      <div className="mt-4 bg-white rounded-xl shadow border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            รายชื่อข้อมูลจากฐานข้อมูล
          </h2>
          <span className="text-sm text-gray-500">
            {Array.isArray(users) ? users.length : users ? 1 : 0} รายการ
          </span>
        </div>

        {/* Helper: normalize to array */}
        {(() => {
          const rows = Array.isArray(users) ? users : users ? [users] : [];

          return rows.length === 0 ? (
            <div className="p-6 text-center text-gray-500">ไม่พบข้อมูล</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      ชื่อ - นามสกุล
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      CE
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      ประเภท
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      Day 8
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      Day 9
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      Day 10
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      Day 11
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      Day 12
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row: any, idx: number) => {
                    const inclucdeByTilte: Record<string, any> = {
                      vet: {
                        fname: row?.vet?.fname,
                        lname: row?.vet?.lname,
                        ce: row?.vet?.number_ce,
                        category: row?.vet?.packages?.category_th,
                      },
                      pat: {
                        fname: row?.participant?.fname,
                        lname: row?.participant?.lname,
                        ce: row?.participant?.ce,
                        category: row?.participant?.packages?.category_th,
                      },
                      abstract: {
                        fname: row?.abstract?.fname,
                        lname: row?.abstract?.lname,
                        ce: row?.abstract?.ce,
                        category: row?.abstract?.abstractType?.adstractType,
                      },
                      patsponser: {
                        fname: row?.sponsersParticipant?.fname,
                        lname: row?.sponsersParticipant?.lname,
                        ce: row?.sponsersParticipant?.ce,
                        category: row?.sponsersParticipant?.companys?.name,
                      },
                      patboot: {
                        fname: row?.sponsersBoot?.fname,
                        lname: row?.sponsersBoot?.lname,
                        ce: row?.sponsersBoot?.ce,
                        category: row?.sponsersBoot?.companys?.name,
                      },
                    };

                    const inclucde = inclucdeByTilte[selectedTitleTheme] ?? {};

                    return (
                      <tr
                        key={row?.timetableId ?? idx}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {inclucde.fname} {inclucde.lname}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {inclucde.ce}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {inclucde.category}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span
                            className={`material-symbols-rounded ${
                              row?.day8 ? "text-green-600" : "text-red-600"
                            }`}
                            aria-label={
                              row?.day8 ? "เช็คอินแล้ว" : "ยังไม่เช็คอิน"
                            }
                          >
                            {row?.day8 ? "done" : "close"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span
                            className={`material-symbols-rounded ${
                              row?.day9 ? "text-green-600" : "text-red-600"
                            }`}
                            aria-label={
                              row?.day9 ? "เช็คอินแล้ว" : "ยังไม่เช็คอิน"
                            }
                          >
                            {row?.day9 ? "done" : "close"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span
                            className={`material-symbols-rounded ${
                              row?.day10 ? "text-green-600" : "text-red-600"
                            }`}
                            aria-label={
                              row?.day10 ? "เช็คอินแล้ว" : "ยังไม่เช็คอิน"
                            }
                          >
                            {row?.day10 ? "done" : "close"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span
                            className={`material-symbols-rounded ${
                              row?.day11 ? "text-green-600" : "text-red-600"
                            }`}
                            aria-label={
                              row?.day11 ? "เช็คอินแล้ว" : "ยังไม่เช็คอิน"
                            }
                          >
                            {row?.day11 ? "done" : "close"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          <span
                            className={`material-symbols-rounded ${
                              row?.day12 ? "text-green-600" : "text-red-600"
                            }`}
                            aria-label={
                              row?.day12 ? "เช็คอินแล้ว" : "ยังไม่เช็คอิน"
                            }
                          >
                            {row?.day12 ? "done" : "close"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>
    </>
  );
}
