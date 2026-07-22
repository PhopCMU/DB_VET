import { getUserDataFromAPI } from "@/app/routers/cmuvc/GetRouter";
import BarChartComponent from "@/components/PieChart";
import dayjs from "dayjs";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

/** ---------- Types ---------- */
// แถวเช็คอินหน้างานที่ผูกอยู่ใต้แต่ละบุคคล (นับจาก Timetable / timetables)
interface TimetableStamp {
  timetableId?: string;
  day8?: string | null;
  day9?: string | null;
  day10?: string | null;
  day11?: string | null;
  day12?: string | null;
  createAt?: string;
  updateAt?: string;
}

// โครงสร้างบุคคลของแต่ละกลุ่ม (participants / sponsors / lecturers ฯลฯ)
// ฟิลด์อาจต่างกันตามกลุ่ม จึงรองรับ key เพิ่มเติมแบบไม่ระบุชนิดตายตัว
interface EntityItem {
  prefix?: string;
  fname?: string;
  lname?: string;
  ce?: string;
  number_ce?: string;
  studentCode?: string;
  organization?: string;
  level?: string;
  packages?: { category_th?: string };
  companys?: { name?: string };
  abstractType?: { adstractType?: string };
  payments?: boolean;
  Timetable?: TimetableStamp[];
  timetables?: TimetableStamp[];
  [key: string]: unknown;
}

// resp.data = { participants: [...], sponsors: [...], lecturers: [...], ... }
type ApiData = Record<string, EntityItem[] | undefined>;

const DAY_KEYS = ["day8", "day9", "day10", "day11", "day12"] as const;
type DayKey = (typeof DAY_KEYS)[number];

// ป้ายกำกับวันเช็คอินไม่ตรงกันทุกปี จึงต้อง map ตามปีที่เลือกค้นหา
// เพิ่ม entry ปีใหม่ ๆ ที่นี่เมื่อ backend เปลี่ยนรอบวันของงาน
const DAY_LABELS_BY_YEAR: Record<number, Record<DayKey, string>> = {
  2025: {
    day8: "Day 8",
    day9: "Day 9",
    day10: "Day 10",
    day11: "Day 11",
    day12: "Day 12",
  },
  2026: {
    day8: "Day 15 (Pre-Congress)",
    day9: "Day 16 (Pre-Congress)",
    day10: "Day 17 (Pre-Congress + Main Conference)",
    day11: "Day 18 (Main Conference)",
    day12: "",
  },
};

const DEFAULT_DAY_LABELS = DAY_LABELS_BY_YEAR[2025];

// ป้าย/ไอคอน/สี ของกลุ่มที่ทราบชื่อคีย์แน่นอนจาก backend
const KNOWN_GROUP_META: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  participants: {
    label: "ผู้เข้าร่วมงาน (Participant)",
    icon: "groups",
    color: "blue",
  },
  sponsors: {
    label: "ผู้สนับสนุน (Sponsor)",
    icon: "handshake",
    color: "emerald",
  },
  sponsorsBoot: {
    label: "ผู้สนับสนุน (Booth)",
    icon: "storefront",
    color: "teal",
  },
  lecturers: {
    label: "สัตวแพทย์ (VMCMU)",
    icon: "medical_services",
    color: "rose",
  },
  students: { label: "นักศึกษา", icon: "school", color: "amber" },
  abstracts: { label: "ผู้ส่ง Abstract", icon: "article", color: "fuchsia" },
};

// สีสำรองสำหรับกลุ่มที่ backend เพิ่มมาใหม่โดยไม่รู้จักชื่อคีย์ล่วงหน้า
const FALLBACK_COLOR_CYCLE = ["slate", "indigo", "cyan", "orange"];

// Tailwind ต้อง compile จาก class เต็ม ๆ จึงประกาศ mapping แบบ static ไว้ล่วงหน้า
const COLOR_CLASSES: Record<
  string,
  { bg: string; text: string; ring: string; bar: string }
> = {
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    ring: "ring-rose-100",
    bar: "bg-rose-500",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    ring: "ring-blue-100",
    bar: "bg-blue-500",
  },
  fuchsia: {
    bg: "bg-fuchsia-50",
    text: "text-fuchsia-600",
    ring: "ring-fuchsia-100",
    bar: "bg-fuchsia-500",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    ring: "ring-emerald-100",
    bar: "bg-emerald-500",
  },
  teal: {
    bg: "bg-teal-50",
    text: "text-teal-600",
    ring: "ring-teal-100",
    bar: "bg-teal-500",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    ring: "ring-amber-100",
    bar: "bg-amber-500",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    ring: "ring-violet-100",
    bar: "bg-violet-500",
  },
  slate: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    ring: "ring-slate-100",
    bar: "bg-slate-500",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    ring: "ring-indigo-100",
    bar: "bg-indigo-500",
  },
  cyan: {
    bg: "bg-cyan-50",
    text: "text-cyan-600",
    ring: "ring-cyan-100",
    bar: "bg-cyan-500",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    ring: "ring-orange-100",
    bar: "bg-orange-500",
  },
};

interface GroupInfo {
  key: string;
  label: string;
  icon: string;
  color: string;
  items: EntityItem[];
}

const getEntityStamps = (item: EntityItem): TimetableStamp[] =>
  item.Timetable ?? item.timetables ?? [];

const getEntityName = (item: EntityItem) =>
  `${item.prefix ?? ""} ${item.fname ?? ""} ${item.lname ?? ""}`.trim() || "-";

const getEntityCode = (item: EntityItem) =>
  item.number_ce ?? item.ce ?? item.studentCode ?? "-";

const getEntityCategory = (item: EntityItem) =>
  item.packages?.category_th ??
  item.organization ??
  item.companys?.name ??
  item.abstractType?.adstractType ??
  item.level ??
  "-";

// เลือก "วันล่าสุด" ที่เช็คอินจากท้ายสุด (day12 -> day8) เพราะฟิลด์ day เป็นแค่วันที่ ไม่ใช่เวลาจริง
const getLatestDayKey = (stamp: TimetableStamp): DayKey | undefined =>
  [...DAY_KEYS].reverse().find((key) => !!stamp[key]);

// รายการปีย้อนหลังให้เลือกค้นหา (ปีปัจจุบัน ย้อนหลังได้ 10 ปี)
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

/** ---------- Component ---------- */
export default function Dashboards() {
  const [isUploading, setIsUploading] = useState(false);
  const [rawData, setRawData] = useState<ApiData>({});
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);

  const dayLabels = useMemo(
    () => DAY_LABELS_BY_YEAR[selectedYear] ?? DEFAULT_DAY_LABELS,
    [selectedYear],
  );

  const fetchUserData = async (year: number) => {
    setIsUploading(true);

    const coverYearString = year.toString();

    try {
      const resp = await getUserDataFromAPI(coverYearString);
      const data =
        resp.data && typeof resp.data === "object" && !Array.isArray(resp.data)
          ? (resp.data as ApiData)
          : {};
      setRawData(data);
      setLastFetchedAt(new Date());
    } catch {
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    fetchUserData(selectedYear);
  }, [selectedYear]);

  /** ---------- Groups (จำนวนผู้ลงทะเบียนแต่ละประเภท) ---------- */
  const groups = useMemo<GroupInfo[]>(() => {
    let fallbackIdx = 0;
    return Object.entries(rawData)
      .filter((entry): entry is [string, EntityItem[]] =>
        Array.isArray(entry[1]),
      )
      .map(([key, items]) => {
        const known = KNOWN_GROUP_META[key];
        const meta = known ?? {
          label: key,
          icon: "person",
          color:
            FALLBACK_COLOR_CYCLE[fallbackIdx++ % FALLBACK_COLOR_CYCLE.length],
        };
        return { key, items, ...meta };
      });
  }, [rawData]);

  const totalRegistered = useMemo(
    () => groups.reduce((sum, g) => sum + g.items.length, 0),
    [groups],
  );

  const registeredChartData = useMemo(
    () => groups.map((g) => ({ name: g.label, value: g.items.length })),
    [groups],
  );

  /** ---------- Check-in stats ---------- */
  const checkinEntries = useMemo(
    () =>
      groups.flatMap((group) =>
        group.items.flatMap((item) =>
          getEntityStamps(item).map((stamp) => ({ group, item, stamp })),
        ),
      ),
    [groups],
  );

  const stats = useMemo(() => {
    const byDay: Record<DayKey, number> = {
      day8: 0,
      day9: 0,
      day10: 0,
      day11: 0,
      day12: 0,
    };

    checkinEntries.forEach(({ stamp }) => {
      DAY_KEYS.forEach((key) => {
        if (stamp[key]) byDay[key] += 1;
      });
    });

    const byGroup = groups.map((group) => {
      const checkedIn = group.items.filter((item) =>
        getEntityStamps(item).some((stamp) =>
          DAY_KEYS.some((key) => !!stamp[key]),
        ),
      ).length;
      return { ...group, checkedIn };
    });

    const checkedInAtLeastOnce = byGroup.reduce(
      (sum, g) => sum + g.checkedIn,
      0,
    );
    const checkInRate = totalRegistered
      ? Math.round((checkedInAtLeastOnce / totalRegistered) * 100)
      : 0;

    const recentActivity = checkinEntries
      .map((entry) => ({ ...entry, latestDay: getLatestDayKey(entry.stamp) }))
      .filter(
        (entry): entry is typeof entry & { latestDay: DayKey } =>
          !!entry.latestDay,
      )
      .sort(
        (a, b) =>
          dayjs(b.stamp.updateAt).valueOf() - dayjs(a.stamp.updateAt).valueOf(),
      )
      .slice(0, 8);

    return {
      byDay,
      byGroup,
      checkedInAtLeastOnce,
      checkInRate,
      recentActivity,
    };
  }, [checkinEntries, groups, totalRegistered]);

  const dayChartData = useMemo(
    () =>
      DAY_KEYS.map((key) => ({
        name: dayLabels[key],
        value: stats.byDay[key],
      })),
    [stats, dayLabels],
  );

  const registeredKpiCards = [
    {
      key: "total",
      label: "ผู้ลงทะเบียนทั้งหมด",
      value: totalRegistered,
      icon: "how_to_reg",
      color: "violet",
    },
    ...groups.map((g) => ({
      key: g.key,
      label: g.label,
      value: g.items.length,
      icon: g.icon,
      color: g.color,
    })),
  ];

  const isEmpty = !isUploading && totalRegistered === 0;

  return (
    <div className="space-y-6">
      {/* ----- Header ----- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            ภาพรวมการเช็คอินหน้างาน
          </h1>
          <p className="text-sm text-gray-500">
            สรุปข้อมูลจาก Timetable ของผู้เข้าร่วมงานทุกประเภท ({dayLabels.day8}{" "}
            – {dayLabels.day11})
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastFetchedAt && (
            <span className="text-xs text-gray-400">
              อัปเดตล่าสุด {dayjs(lastFetchedAt).format("DD/MM/YYYY HH:mm")}
            </span>
          )}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            disabled={isUploading}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-violet-200"
          >
            {YEAR_OPTIONS.map((year) => (
              <option key={year} value={year}>
                ปี {year}
              </option>
            ))}
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchUserData(selectedYear)}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 disabled:opacity-60"
          >
            <span
              className={`material-symbols-rounded text-base ${isUploading ? "animate-spin" : ""}`}
            >
              refresh
            </span>
            รีเฟรช
          </motion.button>
        </div>
      </div>

      {/* ----- KPI Cards: จำนวนผู้ลงทะเบียนแต่ละประเภท ----- */}
      <div>
        <h2 className="text-sm font-semibold text-gray-800 mb-3">
          จำนวนผู้ลงทะเบียนแต่ละประเภท
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {registeredKpiCards.map((card, index) => {
            const palette = COLOR_CLASSES[card.color];
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div
                  className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${palette.bg} ${palette.text} mb-2`}
                >
                  <span className="material-symbols-rounded text-lg">
                    {card.icon}
                  </span>
                </div>
                <p className="text-2xl font-semibold text-gray-900 tabular-nums">
                  {isUploading ? "–" : card.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                  {card.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ----- Empty state ----- */}
      {isEmpty && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
          <span className="material-symbols-rounded text-4xl text-gray-300">
            event_busy
          </span>
          <p className="mt-2 text-sm font-medium text-gray-600">
            ยังไม่มีข้อมูลผู้ลงทะเบียนในระบบ
          </p>
          <p className="text-xs text-gray-400">
            เมื่อมีผู้ลงทะเบียนหรือเช็คอินหน้างาน ข้อมูลจะแสดงที่นี่โดยอัตโนมัติ
          </p>
        </div>
      )}

      {!isEmpty && (
        <>
          {/* ----- Charts ----- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-800">
                  สัดส่วนผู้ลงทะเบียนตามประเภท
                </h2>
                <span className="text-xs text-gray-400">
                  {totalRegistered.toLocaleString()} คน
                </span>
              </div>
              <BarChartComponent data={registeredChartData} />
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-semibold text-gray-800">
                  เช็คอินรายวัน
                </h2>
                <span className="text-xs text-gray-400">
                  {dayLabels.day8} – {dayLabels.day11}
                </span>
              </div>
              <BarChartComponent data={dayChartData} />
            </div>
          </div>

          {/* ----- Check-in completion by day ----- */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-800">
                อัตราการเช็คอินต่อวัน
              </h2>
              <span className="text-xs text-gray-500">
                เช็คอินอย่างน้อย 1 วัน {stats.checkInRate}% (
                {stats.checkedInAtLeastOnce}/{totalRegistered})
              </span>
            </div>
            <div className="space-y-3">
              {DAY_KEYS.filter((key) => dayLabels[key]).map((key) => {
                const count = stats.byDay[key];
                const pct = totalRegistered
                  ? Math.round((count / totalRegistered) * 100)
                  : 0;

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span className="font-medium">{dayLabels[key]}</span>
                      <span className="tabular-nums text-gray-400">
                        {count.toLocaleString()} คน · {pct}%
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full bg-violet-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ----- Check-in rate by category ----- */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">
              อัตราการเช็คอินแยกตามประเภท
            </h2>
            <div className="space-y-3">
              {stats.byGroup.map((group) => {
                const palette = COLOR_CLASSES[group.color];
                const pct = group.items.length
                  ? Math.round((group.checkedIn / group.items.length) * 100)
                  : 0;
                return (
                  <div key={group.key}>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span className="font-medium">{group.label}</span>
                      <span className="tabular-nums text-gray-400">
                        {group.checkedIn.toLocaleString()}/
                        {group.items.length.toLocaleString()} คน · {pct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={`h-full rounded-full ${palette.bar}`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ----- Recent activity ----- */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">
                เช็คอินล่าสุด
              </h2>
              <span className="text-xs text-gray-400">
                แสดง {stats.recentActivity.length} รายการล่าสุด
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                      ชื่อ - นามสกุล
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                      ประเภท
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                      รหัส / กลุ่ม
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                      เช็คอินล่าสุด
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600">
                      เวลา
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {stats.recentActivity.map(
                      ({ group, item, stamp, latestDay }, idx) => {
                        const palette = COLOR_CLASSES[group.color];
                        const category = getEntityCategory(item);
                        return (
                          <motion.tr
                            key={stamp.timetableId ?? `${group.key}-${idx}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-2.5 text-sm text-gray-800">
                              {getEntityName(item)}
                            </td>
                            <td className="px-4 py-2.5 text-sm">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${palette.bg} ${palette.text}`}
                              >
                                <span className="material-symbols-rounded text-sm">
                                  {group.icon}
                                </span>
                                {group.label}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-sm text-gray-600">
                              {getEntityCode(item)}
                              {category !== "-" ? ` · ${category}` : ""}
                            </td>
                            <td className="px-4 py-2.5 text-sm font-medium text-gray-700">
                              {dayLabels[latestDay]}
                            </td>
                            <td className="px-4 py-2.5 text-sm text-gray-500">
                              {stamp.updateAt
                                ? dayjs(stamp.updateAt).format(
                                    "DD/MM/YYYY HH:mm",
                                  )
                                : "-"}
                            </td>
                          </motion.tr>
                        );
                      },
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
