import { usePermission } from "@/app/context/UsePermission";
import { useUser } from "@/app/context/UserContext";
import { GetCheckinNew } from "@/app/routers/cmuvc/GetRouter";
import PermissionGuard from "@/components/Guards/PermissionGuard";
import Loading from "@/components/Loadings/Loading";
import { Download, Search, ScanLine } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const SUB_MENU_ID = "9b940740-d1e9-4a41-af0d-4e1faa90464d";
const PROJECT_ID = "ee9ce62b-2e02-4682-9ecf-9f9b564ee5e3";
type EventType = "vet" | "pat" | "patsponser" | "patboot";

interface EventPerson {
  fname?: string | null;
  lname?: string | null;
  number_ce?: string | number | null;
  ce?: string | number | null;
  packages?: { category_th?: string | null } | null;
  companys?: { name?: string | null } | null;
}

interface CheckinRecord {
  timetableId?: string | number | null;
  vet?: EventPerson | null;
  participant?: EventPerson | null;
  sponsersParticipant?: EventPerson | null;
  sponsersBoot?: EventPerson | null;
  day8?: boolean | null;
  day9?: boolean | null;
  day10?: boolean | null;
  day11?: boolean | null;
  day12?: boolean | null;
}

interface EventDetails {
  fname?: string | null;
  lname?: string | null;
  ce?: string | number | null;
  category?: string | null;
}

const EVENT_OPTIONS: { label: string; value: EventType }[] = [
  { label: "VET", value: "vet" },
  { label: "PARTICIPANT", value: "pat" },
  { label: "PARTICIPANT SPONSOR", value: "patsponser" },
  { label: "PARTICIPANT BOOTH", value: "patboot" },
];

const isEventType = (value: string): value is EventType =>
  EVENT_OPTIONS.some((option) => option.value === value);

const getEventDetails = (
  row: CheckinRecord,
  eventType: EventType,
): EventDetails => {
  switch (eventType) {
    case "vet":
      return {
        fname: row.vet?.fname,
        lname: row.vet?.lname,
        ce: row.vet?.number_ce,
        category: row.vet?.packages?.category_th,
      };
    case "pat":
      return {
        fname: row.participant?.fname,
        lname: row.participant?.lname,
        ce: row.participant?.ce,
        category: row.participant?.packages?.category_th,
      };
    case "patsponser":
      return {
        fname: row.sponsersParticipant?.fname,
        lname: row.sponsersParticipant?.lname,
        ce: row.sponsersParticipant?.ce,
        category: row.sponsersParticipant?.companys?.name,
      };
    case "patboot":
      return {
        fname: row.sponsersBoot?.fname,
        lname: row.sponsersBoot?.lname,
        ce: row.sponsersBoot?.ce,
        category: row.sponsersBoot?.companys?.name,
      };
  }
};

const isCheckinRecord = (value: unknown): value is CheckinRecord =>
  typeof value === "object" && value !== null;

const normalizeCheckinRecords = (value: unknown): CheckinRecord[] => {
  if (Array.isArray(value)) {
    return value.filter(isCheckinRecord);
  }
  return isCheckinRecord(value) ? [value] : [];
};

const getCheckinDayLabels = (year: number) =>
  year === 2026
    ? ["Day 15", "Day 16", "Day 17", "Day 18"]
    : ["Day 8", "Day 9", "Day 10", "Day 11", "Day 12"];

const getCheckinDays = (row: CheckinRecord, year: number) => {
  const values =
    year === 2026
      ? [row.day8, row.day9, row.day10, row.day11]
      : [row.day8, row.day9, row.day10, row.day11, row.day12];

  return getCheckinDayLabels(year).map((label, index) => ({
    label,
    checked: values[index],
  }));
};

export default function Events() {
  const { loading } = useUser();
  const [users, setUsers] = useState<CheckinRecord[]>([]);
  const [selectedTitleTheme, setSelectedTitleTheme] = useState<EventType>("vet");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [scannedSelection, setScannedSelection] = useState<{
    title: EventType;
    year: number;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { canView } = usePermission(SUB_MENU_ID, PROJECT_ID);
  const yearOptions = Array.from({ length: 6 }, (_, index) => {
    const year = new Date().getFullYear() - index;
    return { value: year, label: String(year) };
  });

  const handleScan = async () => {
    setIsScanning(true);
    setUsers([]);
    setScannedSelection(null);

    try {
      const response = await GetCheckinNew(
        new Date(selectedYear, 0, 1),
        selectedTitleTheme,
      );
      if (!response.success) {
        toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
        return;
      }
      setUsers(normalizeCheckinRecords(response.data));
      setScannedSelection({ title: selectedTitleTheme, year: selectedYear });
      toast.success("สแกนข้อมูลเรียบร้อยแล้ว");
    } catch {
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setIsScanning(false);
    }
  };

  const handleExportXlsx = async () => {
    if (!scannedSelection) {
      toast.error("กรุณากดสแกนข้อมูลก่อนส่งออก");
      return;
    }
    if (users.length === 0) {
      toast.info("ไม่พบข้อมูลสำหรับส่งออก");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Check-in", {
        properties: { tabColor: { argb: "FF176B56" } },
        pageSetup: {
          paperSize: 9,
          orientation: "landscape",
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
        },
      });
      const eventLabel =
        EVENT_OPTIONS.find(({ value }) => value === scannedSelection.title)
          ?.label ?? scannedSelection.title;
      const headers = [
        "ชื่อ - นามสกุล",
        "CE",
        "ประเภท",
        ...getCheckinDayLabels(scannedSelection.year),
      ];
      const rows = users.map((row) => {
        const person = getEventDetails(row, scannedSelection.title);
        return [
          `${person.fname ?? ""} ${person.lname ?? ""}`.trim(),
          person.ce ?? "",
          person.category ?? "",
          ...getCheckinDays(row, scannedSelection.year).map(({ checked }) =>
            checked ? "เข้าร่วม" : "ไม่เข้าร่วม",
          ),
        ];
      });

      const lastColumn = sheet.getColumn(headers.length).letter;
      sheet.mergeCells(`A1:${lastColumn}1`);
      sheet.getCell("A1").value = "รายงานข้อมูลการเข้าร่วมกิจกรรม";
      sheet.getCell("A1").font = {
        name: "Tahoma",
        size: 16,
        bold: true,
        color: { argb: "FFFFFFFF" },
      };
      sheet.getCell("A1").alignment = { vertical: "middle" };
      sheet.getCell("A1").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF17483C" },
      };
      sheet.getRow(1).height = 32;
      sheet.mergeCells(`A2:${lastColumn}2`);
      sheet.getCell("A2").value =
        `ประเภท: ${eventLabel}    ปี: ${scannedSelection.year}    จำนวน: ${users.length} รายการ`;
      sheet.getCell("A2").font = {
        name: "Tahoma",
        size: 11,
        color: { argb: "FF34423D" },
      };
      sheet.getCell("A2").alignment = { vertical: "middle" };
      sheet.getRow(2).height = 24;

      sheet.addTable({
        name: "CheckinRecords",
        ref: "A4",
        headerRow: true,
        totalsRow: false,
        style: {
          theme: "TableStyleMedium4",
          showRowStripes: true,
          showColumnStripes: false,
        },
        columns: headers.map((name) => ({ name, filterButton: true })),
        rows,
      });

      const maxWidths = [
        32,
        16,
        28,
        ...getCheckinDayLabels(scannedSelection.year).map(() => 16),
      ];
      headers.forEach((header, index) => {
        const longestValue = rows.reduce(
          (longest, row) => Math.max(longest, String(row[index] ?? "").length),
          header.length,
        );
        const column = sheet.getColumn(index + 1);
        column.width = Math.min(maxWidths[index], Math.max(10, longestValue + 2));
        column.alignment = {
          vertical: "middle",
          horizontal: index >= 3 ? "center" : "left",
          wrapText: true,
        };
      });
      sheet.getRow(4).height = 30;
      sheet.getRow(4).eachCell((cell) => {
        cell.font = { name: "Tahoma", bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF176B56" },
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
          wrapText: true,
        };
      });
      rows.forEach((row, index) => {
        const sheetRow = sheet.getRow(index + 5);
        sheetRow.font = { name: "Tahoma" };
        for (let column = 4; column <= headers.length; column += 1) {
          const cell = sheetRow.getCell(column);
          cell.font = {
            name: "Tahoma",
            bold: true,
            color: {
              argb: row[column - 1] === "เข้าร่วม" ? "FF18794E" : "FF9A3412",
            },
          };
        }
      });
      sheet.views = [{ state: "frozen", ySplit: 4 }];
      sheet.pageSetup.printTitlesRow = "4:4";

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(
        blob,
        `cmuvc-checkin_${scannedSelection.title}_${scannedSelection.year}.xlsx`,
      );
      toast.success("ส่งออกไฟล์ Excel สำเร็จ");
    } catch {
      toast.error("เกิดข้อผิดพลาดในการสร้างไฟล์ Excel");
    }
  };

  if (!canView) {
    toast.error("You don't have permission to view this page");
    return null;
  }

  if (loading) return <Loading />;

  return (
    <>
      <PermissionGuard submenuIdCode={SUB_MENU_ID} />
      <main className="mx-auto max-w-[1440px] space-y-6 px-3 pb-8 pt-2 sm:px-6">
        <section className="relative isolate overflow-hidden rounded-[28px] bg-[#173c34] px-6 py-7 text-white shadow-[0_20px_60px_-35px_rgba(23,60,52,0.75)] sm:px-9 sm:py-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-16 h-56 w-56 rounded-full border border-white/10"
          />
          <div className="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#bad8c8]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d8ac69]" />
                CMU VETERINARY · EVENT ARCHIVE
              </p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                ตรวจสอบการเข้าร่วมกิจกรรม
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
                เลือกประเภทผู้เข้าร่วมและปีที่ต้องการ จากนั้นกดสแกนเพื่อดึงข้อมูล
                ก่อนตรวจสอบหรือส่งออกเป็น Excel
              </p>
            </div>
            <div className="flex items-center gap-3 self-start rounded-2xl border border-white/15 bg-white/[0.07] px-4 py-3 sm:self-auto">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#d8ac69] text-[#173c34]">
                <ScanLine size={21} aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
                  Archive range
                </p>
                <p className="mt-0.5 text-sm font-semibold">ย้อนหลัง 5 ปี</p>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-label="เลือกข้อมูลสำหรับสแกน"
          className="rounded-2xl border border-[#e4e9e4] bg-white p-5 shadow-[0_8px_30px_-24px_rgba(30,54,46,0.45)] sm:p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-[#b58a4c]" />
            <div>
              <h2 className="text-base font-semibold text-[#243a32]">
                กำหนดข้อมูลที่ต้องการ
              </h2>
              <p className="mt-0.5 text-xs text-[#718078]">
                ต้องสแกนก่อนทุกครั้ง จึงจะแสดงและส่งออกข้อมูลได้
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)_auto] md:items-end">
            <div>
              <label
                htmlFor="event-type"
                className="mb-2 block text-xs font-semibold text-[#52645b]"
              >
                ประเภทผู้เข้าร่วม
              </label>
              <select
                id="event-type"
                value={selectedTitleTheme}
                disabled={isScanning}
                onChange={(event) => {
                  if (isEventType(event.currentTarget.value)) {
                    setSelectedTitleTheme(event.currentTarget.value);
                    setUsers([]);
                    setScannedSelection(null);
                  }
                }}
                className="h-12 w-full rounded-xl border border-[#d8e0da] bg-[#fbfcfa] px-3.5 text-sm text-[#243a32] outline-none transition focus-visible:border-[#32745d] focus-visible:ring-4 focus-visible:ring-[#32745d]/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {EVENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="event-year"
                className="mb-2 block text-xs font-semibold text-[#52645b]"
              >
                ปีที่จัดกิจกรรม
              </label>
              <select
                id="event-year"
                value={selectedYear}
                disabled={isScanning}
                onChange={(event) => {
                  const year = Number(event.currentTarget.value);
                  if (yearOptions.some((option) => option.value === year)) {
                    setSelectedYear(year);
                    setUsers([]);
                    setScannedSelection(null);
                  }
                }}
                className="h-12 w-full rounded-xl border border-[#d8e0da] bg-[#fbfcfa] px-3.5 text-sm text-[#243a32] outline-none transition focus-visible:border-[#32745d] focus-visible:ring-4 focus-visible:ring-[#32745d]/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {yearOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleScan}
              disabled={isScanning}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#176b56] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125844] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#176b56]/20 disabled:cursor-wait disabled:opacity-70 md:min-w-40"
            >
              <Search size={17} aria-hidden="true" />
              {isScanning ? "กำลังสแกน..." : "สแกนข้อมูล"}
            </button>
          </div>
        </section>

        {scannedSelection ? (
          <section className="overflow-hidden rounded-2xl border border-[#e4e9e4] bg-white shadow-[0_8px_30px_-24px_rgba(30,54,46,0.45)]">
            <div className="flex flex-col gap-4 border-b border-[#e9eeea] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-[#243a32]">
                    รายชื่อผู้เข้าร่วม
                  </h2>
                  <span className="rounded-full bg-[#e8f2ed] px-2.5 py-1 text-[11px] font-semibold text-[#176b56]">
                    {scannedSelection.year}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[#718078]">
                  {EVENT_OPTIONS.find(
                    (option) => option.value === scannedSelection.title,
                  )?.label}{" "}
                  · {users.length.toLocaleString("th-TH")} รายการ
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportXlsx}
                disabled={users.length === 0}
                title={
                  users.length === 0
                    ? "ไม่พบข้อมูลสำหรับส่งออก"
                    : "ส่งออกผลสแกนเป็น Excel"
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#c8d8cf] bg-[#f7faf7] px-4 text-sm font-semibold text-[#176b56] transition hover:border-[#176b56] hover:bg-[#edf5f0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#176b56]/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download size={16} aria-hidden="true" />
                ส่งออก Excel
              </button>
            </div>

            {users.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f2f5f1] text-[#718078]">
                  <Search size={20} aria-hidden="true" />
                </div>
                <p className="mt-4 text-sm font-semibold text-[#34483e]">
                  ไม่พบข้อมูลในปีที่เลือก
                </p>
                <p className="mt-1 text-xs text-[#718078]">
                  ลองเลือกประเภทหรือปีอื่น แล้วกดสแกนอีกครั้ง
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead className="bg-[#f6f8f5]">
                    <tr>
                      {[
                        "ชื่อ - นามสกุล",
                        "CE",
                        "ประเภท",
                        ...getCheckinDayLabels(scannedSelection.year),
                      ].map((heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className="px-4 py-3.5 text-xs font-semibold text-[#52645b] first:pl-6 last:pr-6"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf0ed]">
                    {users.map((row, rowIndex) => {
                      const details = getEventDetails(
                        row,
                        scannedSelection.title,
                      );
                      const checkinDays = getCheckinDays(row, scannedSelection.year);

                      return (
                        <tr
                          key={
                            row.timetableId ??
                            `${scannedSelection.year}-${rowIndex}`
                          }
                          className="transition-colors hover:bg-[#f9fbf9]"
                        >
                          <td className="px-4 py-3.5 pl-6 text-sm font-medium text-[#293d34]">
                            {[details.fname, details.lname]
                              .filter(Boolean)
                              .join(" ") || "—"}
                          </td>
                          <td className="px-4 py-3.5 text-sm tabular-nums text-[#617168]">
                            {details.ce ?? "—"}
                          </td>
                          <td className="px-4 py-3.5 text-sm text-[#617168]">
                            {details.category ?? "—"}
                          </td>
                          {checkinDays.map(({ checked, label }) => (
                            <td
                              key={label}
                              className="px-4 py-3.5 text-center"
                            >
                              <span
                                aria-label={
                                  checked ? "เช็คอินแล้ว" : "ยังไม่เช็คอิน"
                                }
                                className={`inline-flex min-w-20 justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                  checked
                                    ? "bg-[#e8f4ed] text-[#18794e]"
                                    : "bg-[#f4f2ed] text-[#857657]"
                                }`}
                              >
                                {checked ? "เช็คอินแล้ว" : "—"}
                              </span>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-[#cfd9d1] bg-[#f9fbf8] px-6 py-14 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-[#176b56] shadow-sm ring-1 ring-[#e5ebe6]">
              <ScanLine size={23} aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-sm font-semibold text-[#34483e]">
              พร้อมสแกนข้อมูล
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-xs leading-5 text-[#718078]">
              เลือกประเภทผู้เข้าร่วมและปี แล้วกด “สแกนข้อมูล”
              เพื่อแสดงรายชื่อและเปิดใช้งานการส่งออก Excel
            </p>
          </section>
        )}
      </main>
    </>
  );
}
