import { usePermission } from "@/app/context/UsePermission";
import { useUser } from "@/app/context/UserContext";
import { GetCheckinNew } from "@/app/routers/cmuvc/GetRouter";
import PermissionGuard from "@/components/Guards/PermissionGuard";
import Loading from "@/components/Loadings/Loading";
import { Check, Download, Loader2, ScanLine, Search } from "lucide-react";
import { useMemo, useState } from "react";
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

const PROJECT_TYPE: { label: string; value: "pre" | "main" }[] = [
  { label: "PRE-CONGRESS", value: "pre" },
  { label: "MAIN CONFERENCE", value: "main" },
];

const EVENT_OPTIONS: {
  label: string;
  value: EventType;
  description: string;
}[] = [
  { label: "VET", value: "vet", description: "สัตวแพทย์" },
  { label: "PARTICIPANT", value: "pat", description: "ผู้เข้าร่วมทั่วไป" },
  {
    label: "PARTICIPANT SPONSOR",
    value: "patsponser",
    description: "ผู้เข้าร่วมจากสปอนเซอร์",
  },
  {
    label: "PARTICIPANT BOOTH",
    value: "patboot",
    description: "ผู้เข้าร่วมประจำบูธ",
  },
];

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
  const [selectedTitleTheme, setSelectedTitleTheme] =
    useState<EventType>("vet");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedProjectType, setSelectedProjectType] = useState<
    "pre" | "main"
  >("pre");
  const [scannedSelection, setScannedSelection] = useState<{
    title: EventType;
    year: number;
  } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { canView } = usePermission(SUB_MENU_ID, PROJECT_ID);
  const yearOptions = Array.from({ length: 6 }, (_, index) => {
    const year = new Date().getFullYear() - index;
    return { value: year, label: String(year) };
  });

  const filteredUsers = useMemo(() => {
    if (!scannedSelection) return users;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter((row) => {
      const details = getEventDetails(row, scannedSelection.title);
      return [details.fname, details.lname, details.ce, details.category].some(
        (value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
      );
    });
  }, [users, searchQuery, scannedSelection]);

  const dayStats = useMemo(() => {
    if (!scannedSelection || users.length === 0) return [];
    return getCheckinDayLabels(scannedSelection.year).map((label, index) => ({
      label,
      count: users.filter(
        (row) => getCheckinDays(row, scannedSelection.year)[index]?.checked,
      ).length,
    }));
  }, [users, scannedSelection]);

  const handleScan = async () => {
    setIsScanning(true);
    setUsers([]);
    setScannedSelection(null);
    setSearchQuery("");

    try {
      const response = await GetCheckinNew(
        new Date(selectedYear, 0, 1),
        selectedTitleTheme,
        selectedProjectType,
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
        column.width = Math.min(
          maxWidths[index],
          Math.max(10, longestValue + 2),
        );
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
        <header className="relative isolate overflow-hidden rounded-[28px] bg-[#173c34] px-6 py-7 text-white shadow-[0_20px_60px_-35px_rgba(23,60,52,0.75)] sm:px-9">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-16 h-56 w-56 rounded-full border border-white/10"
          />
          <div className="relative">
            <p className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#bad8c8]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d8ac69]" />
              CMU VETERINARY · EVENT ARCHIVE
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              ตรวจสอบการเข้าร่วมกิจกรรม
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
              ดึงข้อมูลการเช็คอินย้อนหลัง 5 ปี
              และส่งออกรายงานเป็นไฟล์ Excel ได้ในหน้าเดียว
            </p>
            <ol className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-white/85">
              {[
                "เลือกเงื่อนไข",
                "กดสแกนข้อมูล",
                "ตรวจสอบ / ส่งออก Excel",
              ].map((step, index) => (
                <li key={step} className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1.5 pl-1.5 pr-3">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-[#d8ac69] text-[11px] font-bold text-[#173c34]">
                      {index + 1}
                    </span>
                    {step}
                  </span>
                  {index < 2 && (
                    <span aria-hidden="true" className="text-white/40">
                      →
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </header>

        <section
          aria-label="เลือกข้อมูลสำหรับสแกน"
          className="space-y-6 rounded-2xl border border-[#e4e9e4] bg-white p-5 shadow-[0_8px_30px_-24px_rgba(30,54,46,0.45)] sm:p-6"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#176b56] text-sm font-bold text-white">
              1
            </span>
            <div>
              <h2 className="text-base font-semibold text-[#243a32]">
                เลือกเงื่อนไขข้อมูล
              </h2>
              <p className="mt-0.5 text-xs text-[#718078]">
                เมื่อเปลี่ยนเงื่อนไข ต้องกดสแกนใหม่ทุกครั้ง
              </p>
            </div>
          </div>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-[#52645b]">
              ประเภทโครงการ
            </legend>
            <div
              role="radiogroup"
              aria-label="ประเภทโครงการ"
              className="grid grid-cols-2 gap-1.5 rounded-xl bg-[#eef3ef] p-1.5"
            >
              {PROJECT_TYPE.map((option) => {
                const active = selectedProjectType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={isScanning}
                    onClick={() => {
                      setSelectedProjectType(option.value);
                      setUsers([]);
                      setScannedSelection(null);
                      setSearchQuery("");
                    }}
                    className={`h-11 rounded-lg text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#176b56]/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                      active
                        ? "bg-white text-[#125844] shadow-sm ring-1 ring-[#d8e0da]"
                        : "text-[#617168] hover:text-[#243a32]"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold text-[#52645b]">
              ประเภทผู้เข้าร่วม
            </legend>
            <div
              role="radiogroup"
              aria-label="ประเภทผู้เข้าร่วม"
              className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
            >
              {EVENT_OPTIONS.map((option) => {
                const active = selectedTitleTheme === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={isScanning}
                    onClick={() => {
                      setSelectedTitleTheme(option.value);
                      setUsers([]);
                      setScannedSelection(null);
                      setSearchQuery("");
                    }}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#176b56]/20 disabled:cursor-not-allowed disabled:opacity-60 ${
                      active
                        ? "border-[#176b56] bg-[#f0f7f3]"
                        : "border-[#dfe6e1] bg-[#fbfcfa] hover:border-[#aec4b6]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
                        active
                          ? "border-[#176b56] bg-[#176b56] text-white"
                          : "border-[#c4d0c7] text-transparent"
                      }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span>
                      <span
                        className={`block text-sm font-semibold leading-5 ${
                          active ? "text-[#125844]" : "text-[#34483e]"
                        }`}
                      >
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-xs text-[#718078]">
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 border-t border-[#eef1ee] pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-5 w-5 place-items-center rounded-md bg-[#e8f2ed] text-[11px] font-bold text-[#176b56]">
                  2
                </span>
                <label
                  htmlFor="event-year"
                  className="text-xs font-semibold text-[#52645b]"
                >
                  เลือกปีที่จัดกิจกรรม แล้วกดสแกน
                </label>
              </div>
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
                    setSearchQuery("");
                  }
                }}
                className="h-12 w-full max-w-xs rounded-xl border border-[#d8e0da] bg-[#fbfcfa] px-3.5 text-sm text-[#243a32] outline-none transition focus-visible:border-[#32745d] focus-visible:ring-4 focus-visible:ring-[#32745d]/10 disabled:cursor-not-allowed disabled:opacity-60"
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
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#176b56] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125844] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#176b56]/20 disabled:cursor-wait disabled:opacity-70 sm:min-w-48"
            >
              {isScanning ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <ScanLine size={17} aria-hidden="true" />
              )}
              {isScanning ? "กำลังสแกน..." : "สแกนข้อมูล"}
            </button>
          </div>
        </section>

        {scannedSelection ? (
          <section className="overflow-hidden rounded-2xl border border-[#e4e9e4] bg-white shadow-[0_8px_30px_-24px_rgba(30,54,46,0.45)]">
            <div className="border-b border-[#e9eeea] px-5 py-5 sm:px-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#176b56] text-sm font-bold text-white">
                    3
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-[#243a32]">
                        ผลการสแกน
                      </h2>
                      <span className="rounded-full bg-[#e8f2ed] px-2.5 py-1 text-[11px] font-semibold text-[#176b56]">
                        {EVENT_OPTIONS.find(
                          (option) => option.value === scannedSelection.title,
                        )?.label ?? scannedSelection.title}
                      </span>
                      <span className="rounded-full bg-[#f4efe5] px-2.5 py-1 text-[11px] font-semibold text-[#8a6a33]">
                        ปี {scannedSelection.year}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#718078]">
                      พบ {users.length.toLocaleString("th-TH")} รายการ
                    </p>
                  </div>
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
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#176b56] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#125844] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#176b56]/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download size={16} aria-hidden="true" />
                  ส่งออก Excel
                </button>
              </div>

              {users.length > 0 && (
                <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {dayStats.map(({ label, count }) => (
                    <div
                      key={label}
                      className="rounded-xl bg-[#f6f8f5] px-3.5 py-2.5 ring-1 ring-[#e7ede8]"
                    >
                      <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#718078]">
                        {label} · เช็คอิน
                      </dt>
                      <dd className="mt-0.5 text-sm font-bold tabular-nums text-[#243a32]">
                        {count.toLocaleString("th-TH")}
                        <span className="text-xs font-medium text-[#8b978f]">
                          {" "}
                          / {users.length.toLocaleString("th-TH")}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
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
              <>
                <div className="flex flex-col gap-2 border-b border-[#e9eeea] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="relative w-full sm:max-w-xs">
                    <Search
                      size={16}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a39a]"
                    />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) =>
                        setSearchQuery(event.currentTarget.value)
                      }
                      placeholder="ค้นหาชื่อ, CE หรือประเภท..."
                      aria-label="ค้นหาในผลการสแกน"
                      className="h-10 w-full rounded-xl border border-[#d8e0da] bg-[#fbfcfa] pl-9 pr-3 text-sm text-[#243a32] outline-none transition placeholder:text-[#9aa8a0] focus-visible:border-[#32745d] focus-visible:ring-4 focus-visible:ring-[#32745d]/10"
                    />
                  </div>
                  <p className="text-xs tabular-nums text-[#718078]">
                    แสดง {filteredUsers.length.toLocaleString("th-TH")} จาก{" "}
                    {users.length.toLocaleString("th-TH")} รายการ
                  </p>
                </div>

                {filteredUsers.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <p className="text-sm font-semibold text-[#34483e]">
                      ไม่พบรายชื่อที่ตรงกับ “{searchQuery.trim()}”
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mt-3 inline-flex h-9 items-center rounded-xl border border-[#c8d8cf] px-4 text-xs font-semibold text-[#176b56] transition hover:bg-[#edf5f0] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#176b56]/15"
                    >
                      ล้างการค้นหา
                    </button>
                  </div>
                ) : (
                  <div className="max-h-[560px] overflow-auto">
                    <table className="w-full min-w-[900px] border-collapse text-left">
                      <thead className="sticky top-0 z-10 bg-[#f6f8f5] shadow-[0_1px_0_#e4e9e4]">
                        <tr>
                          {[
                            "ชื่อ - นามสกุล",
                            "CE",
                            "ประเภท",
                            ...getCheckinDayLabels(scannedSelection.year),
                          ].map((heading, index) => (
                            <th
                              key={heading}
                              scope="col"
                              className={`px-4 py-3.5 text-xs font-semibold text-[#52645b] first:pl-6 last:pr-6 ${
                                index >= 3 ? "text-center" : ""
                              }`}
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#edf0ed]">
                        {filteredUsers.map((row, rowIndex) => {
                          const details = getEventDetails(
                            row,
                            scannedSelection.title,
                          );
                          const checkinDays = getCheckinDays(
                            row,
                            scannedSelection.year,
                          );

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
                                  {checked ? (
                                    <span className="inline-flex min-w-24 items-center justify-center gap-1 rounded-full bg-[#e8f4ed] px-2.5 py-1 text-[11px] font-semibold text-[#18794e]">
                                      <Check
                                        size={12}
                                        strokeWidth={3}
                                        aria-hidden="true"
                                      />
                                      เช็คอินแล้ว
                                      <span className="sr-only">({label})</span>
                                    </span>
                                  ) : (
                                    <span
                                      aria-label={`${label}: ยังไม่เช็คอิน`}
                                      className="text-sm text-[#c3ccc5]"
                                    >
                                      —
                                    </span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
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
