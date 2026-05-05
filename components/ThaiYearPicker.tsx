import React, { useState, useEffect } from "react";
import { startOfYear } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";

// แปลงปี ค.ศ. เป็น พ.ศ.
const toBuddhistYear = (year: number): number => year + 543;

interface ThaiYearPickerProps {
  selectedYear: Date;
  onChange: (year: Date) => void;
}

const ThaiYearPicker: React.FC<ThaiYearPickerProps> = ({
  selectedYear,
  onChange,
}) => {
  const currentYear = new Date().getFullYear(); // ค.ศ.
  const [viewStartYear, setViewStartYear] = useState<number>(currentYear - 9); // เริ่มจาก 10 ปีย้อนหลัง
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // สร้าง array ของปี (ค.ศ.) ครั้งละ 9 ปี
  const generateYears = (startYear: number): number[] => {
    return Array.from({ length: 9 }, (_, i) => startYear + i);
  };

  const years = generateYears(viewStartYear);

  // ตรวจสอบว่าสามารถเลือกปีได้หรือไม่ (ห้ามเลือกปีในอนาคต)
  const isSelectable = (year: number): boolean => year <= currentYear;

  const handleSelectYear = (year: number) => {
    if (!isSelectable(year)) return;
    const date = startOfYear(new Date(year, 0, 1));
    onChange(date);
    setIsOpen(false);
  };

  const goToPreviousDecade = () => {
    setViewStartYear((prev) => Math.max(prev - 9, currentYear - 10)); // จำกัดไม่ให้ย้อนเกิน 10 ปี
  };

  const goToNextDecade = () => {
    if (viewStartYear + 9 <= currentYear) {
      setViewStartYear((prev) => prev + 9);
    }
  };

  // ปิด dropdown เมื่อคลิกนอกพื้นที่
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const picker = document.getElementById("year-picker");
      if (picker && !picker.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.div
      id="year-picker"
      className="relative w-full sm:w-64"
      tabIndex={0}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Input Field */}
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`pl-10 pr-3 py-3 w-full border ${
          isOpen
            ? "border-blue-400 ring-2 ring-blue-200/50 shadow-sm"
            : "border-gray-200 hover:border-gray-300"
        } rounded-xl bg-white/80 backdrop-blur-sm text-sm cursor-pointer flex justify-between items-center transition-all duration-200 shadow-xs hover:shadow-sm`}
      >
        <span className="text-gray-800 font-medium">
          {toBuddhistYear(selectedYear.getFullYear())}
        </span>
        <span
          className={`material-symbols-rounded transition-all duration-200 ${
            isOpen
              ? "rotate-180 text-blue-500"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          expand_more
        </span>
      </motion.div>

      {/* Calendar Icon */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="material-symbols-rounded text-gray-500 hover:text-gray-600 transition-colors">
          calendar_month
        </span>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-40 mt-2 w-full bg-white/90 backdrop-blur-lg border border-gray-200/50 rounded-xl shadow-xl overflow-hidden"
          >
            {/* Decade Navigation */}
            <div className="flex justify-between items-center px-4 py-3 sticky top-0 bg-white/80 backdrop-blur-sm z-10 border-b border-gray-100">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={goToPreviousDecade}
                disabled={viewStartYear <= currentYear - 10}
                className="p-1 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors"
                aria-label="Previous decade"
              >
                <span className="material-symbols-rounded text-lg">
                  chevron_left
                </span>
              </motion.button>

              <span className="font-medium text-gray-700 text-sm">
                {toBuddhistYear(viewStartYear)} –{" "}
                {toBuddhistYear(viewStartYear + 8)}
              </span>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={goToNextDecade}
                disabled={viewStartYear + 9 > currentYear}
                className="p-1 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors"
                aria-label="Next decade"
              >
                <span className="material-symbols-rounded text-lg">
                  chevron_right
                </span>
              </motion.button>
            </div>

            {/* Year Grid */}
            <div className="grid grid-cols-3 gap-2 p-3">
              {years.map((year) => (
                <motion.button
                  key={year}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectYear(year)}
                  disabled={!isSelectable(year)}
                  className={`py-2.5 px-2 text-center rounded-lg transition-all ${
                    isSelectable(year)
                      ? "hover:bg-blue-50/50"
                      : "text-gray-400 cursor-not-allowed"
                  } ${
                    year === selectedYear.getFullYear()
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium shadow-md"
                      : ""
                  } ${
                    year === new Date().getFullYear() &&
                    year !== selectedYear.getFullYear()
                      ? "ring-1 ring-blue-200 bg-blue-50/30"
                      : ""
                  }`}
                >
                  <span
                    className={`text-sm ${
                      year === new Date().getFullYear() &&
                      year !== selectedYear.getFullYear()
                        ? "text-blue-600 font-medium"
                        : ""
                    }`}
                  >
                    {toBuddhistYear(year)}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Current Year Quick Select */}
            <div className="border-t border-gray-100/50 px-4 py-2.5 bg-white/50">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectYear(new Date().getFullYear())}
                className="w-full py-2 text-sm text-blue-600 font-medium flex items-center justify-center gap-2 hover:bg-blue-50/50 rounded-lg transition-colors"
              >
                <span className="material-symbols-rounded text-base">
                  autorenew
                </span>
                ปีปัจจุบัน
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ThaiYearPicker;
