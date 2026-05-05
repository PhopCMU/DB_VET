import React from "react";
import { motion } from "framer-motion";

interface AlertMessageProps {
  message: string;
  onClose: () => void;
  variant?: "error" | "success" | "warning" | "info"; // เพิ่ม variant เพื่อความยืดหยุ่น
}

interface AlertConfirmProps {
  message: string;
  onClose: () => void;
  onConfirm?: () => void; // เพิ่ม prop สำหรับปุ่มตกลง
  variant?: "error" | "success" | "warning" | "info";
}

// สไตล์สำหรับแต่ละ variant
const variantStyles2 = {
  info: {
    icon: <span className="material-symbols-outlined">info</span>,
    title: "แจ้งเตือน",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    bgColor: "bg-blue-50",
    textColor: "text-blue-800",
  },
  success: {
    icon: <span className="material-symbols-outlined">check_circle</span>,
    title: "สำเร็จ",
    buttonColor: "bg-green-600 hover:bg-green-700",
    bgColor: "bg-green-50",
    textColor: "text-green-800",
  },
  warning: {
    icon: <span className="material-symbols-outlined">warning</span>,
    title: "คำเตือน",
    buttonColor: "bg-amber-600 hover:bg-amber-700",
    bgColor: "bg-amber-50",
    textColor: "text-amber-800",
  },
  error: {
    icon: <span className="material-symbols-outlined">error</span>,
    title: "เกิดข้อผิดพลาด",
    buttonColor: "bg-red-600 hover:bg-red-700",
    bgColor: "bg-red-50",
    textColor: "text-red-800",
  },
  question: {
    icon: <span className="material-symbols-outlined">help</span>,
    title: "ยืนยันการดำเนินการ",
    buttonColor: "bg-indigo-600 hover:bg-indigo-700",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-800",
  },
};

const variantStyles = {
  success: {
    icon: (
      <svg
        className="w-16 h-16 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    ),
    title: "Success",
    buttonColor: "bg-green-600 hover:bg-green-700",
  },
  error: {
    icon: (
      <svg
        className="w-16 h-16 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    title: "Error",
    buttonColor: "bg-red-600 hover:bg-red-700",
  },
  warning: {
    icon: (
      <svg
        className="w-16 h-16 text-yellow-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Warning",
    buttonColor: "bg-yellow-600 hover:bg-yellow-700",
  },
  info: {
    icon: (
      <svg
        className="w-16 h-16 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    title: "Info",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
  },
};

export const AlertMessage: React.FC<AlertMessageProps> = ({
  message,
  onClose,
  variant = "error",
}) => {
  // กำหนดสีตาม variant
  const variantStyles = {
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`${variantStyles[variant]} border rounded-lg shadow-md px-6 py-4 relative w-full mx-auto my-2`}
      role="alert"
    >
      {/* ไอคอนตาม variant */}
      <div className="flex items-start">
        <div className="mr-3">
          {variant === "error" && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {variant === "success" && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {variant === "info" && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {variant === "warning" && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>

        {/* ข้อความ */}
        <span className="block text-sm font-medium">{message}</span>
      </div>

      {/* ปุ่มปิด */}
      <button
        onClick={onClose}
        className="absolute top-3 right-2 p-1 rounded-full hover:bg-gray-200/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        aria-label="Close alert"
      >
        <svg
          className="w-5 h-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </motion.div>
  );
};

export const AlertMessageSuccess: React.FC<AlertMessageProps> = ({
  message,
  onClose,
  variant = "success", // ค่าเริ่มต้นเป็น success
}) => {
  // การตั้งค่าแอนิเมชันด้วย Framer Motion
  const modalVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -50, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  // Enhanced variant styles with gradients
  const variantStyles = {
    success: {
      icon: (
        <div className="p-3 rounded-full bg-gradient-to-br from-green-100 to-green-200">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      ),
      title: "Success!",
      buttonColor:
        "bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600",
      cardBorder: "border-t-4 border-green-400",
      cardGradient: "from-white to-green-50",
    },
    error: {
      icon: (
        <div className="p-3 rounded-full bg-gradient-to-br from-red-100 to-red-200">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      ),
      title: "Error!",
      buttonColor:
        "bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600",
      cardBorder: "border-t-4 border-red-400",
      cardGradient: "from-white to-red-50",
    },
    warning: {
      icon: (
        <div className="p-3 rounded-full bg-gradient-to-br from-amber-100 to-amber-200">
          <svg
            className="w-8 h-8 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      ),
      title: "Warning!",
      buttonColor:
        "bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600",
      cardBorder: "border-t-4 border-amber-400",
      cardGradient: "from-white to-amber-50",
    },
    info: {
      icon: (
        <div className="p-3 rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
          <svg
            className="w-8 h-8 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      ),
      title: "Information",
      buttonColor:
        "bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600",
      cardBorder: "border-t-4 border-blue-400",
      cardGradient: "from-white to-blue-50",
    },
  };

  const { icon, title, buttonColor, cardBorder, cardGradient } =
    variantStyles[variant];

  return (
    <motion.div
      className="fixed inset-0 backdrop-blur bg-opacity-50 flex items-center justify-center z-50"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className={`bg-gradient-to-b ${cardGradient} rounded-lg shadow-xl p-6 w-full max-w-md flex flex-col items-center gap-4 ${cardBorder}`}
        variants={modalVariants}
      >
        {/* ไอคอน */}
        {icon}

        {/* หัวข้อ */}
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>

        {/* ข้อความ */}
        <p className="text-gray-600 text-center">{message}</p>

        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className={`mt-4 px-6 py-2 ${buttonColor} text-white rounded-md transition-all duration-300 transform hover:scale-105 shadow-md`}
        >
          OK
        </button>
      </motion.div>
    </motion.div>
  );
};

export const AlertMessageFailed: React.FC<AlertMessageProps> = ({
  message,
  onClose,
  variant = "error",
}) => {
  const modalVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -50, transition: { duration: 0.2, ease: "easeIn" } },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  // เลือกสไตล์ตาม variant
  const { icon, title, buttonColor } = variantStyles[variant];

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={(e) => e.target === e.currentTarget && onClose()} // ปิดเมื่อคลิกนอก Modal
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md flex flex-col items-center gap-4"
        variants={modalVariants}
        role="dialog"
        aria-labelledby="modal-title"
      >
        {/* ไอคอน */}
        {icon}

        {/* หัวข้อ */}
        <h2 id="modal-title" className="text-xl font-semibold text-gray-800">
          {title}
        </h2>

        {/* ข้อความ */}
        <p className="text-gray-600 text-center">{message}</p>

        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className={`mt-4 px-4 py-2 ${buttonColor} text-white rounded-md transition-colors`}
        >
          OK
        </button>
      </motion.div>
    </motion.div>
  );
};

export const AlertConfirm: React.FC<AlertConfirmProps> = ({
  message,
  onClose,
  onConfirm,
  variant = "info",
}) => {
  const { icon, title, buttonColor } = variantStyles2[variant];

  const getGradientColor = (colorType: string) => {
    switch (colorType) {
      case "bg-red-500":
        return "from-rose-500 via-red-500 to-pink-500";
      case "bg-blue-500":
        return "from-blue-500 via-indigo-500 to-violet-500";
      case "bg-green-500":
        return "from-emerald-500 via-green-500 to-teal-500";
      case "bg-yellow-500":
        return "from-amber-500 via-yellow-500 to-orange-500";
      case "bg-purple-500":
        return "from-violet-500 via-purple-500 to-fuchsia-500";
      default:
        return "from-gray-500 via-gray-600 to-gray-700";
    }
  };

  const getButtonGradient = (colorType: string) => {
    switch (colorType) {
      case "bg-red-500":
        return "bg-gradient-to-br from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700";
      case "bg-blue-500":
        return "bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700";
      case "bg-green-500":
        return "bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700";
      case "bg-yellow-500":
        return "bg-gradient-to-br from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700";
      case "bg-purple-500":
        return "bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700";
      default:
        return "bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700";
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-[999]"
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
      exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Overlay with gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-black/40 to-black/60"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal container */}
      <motion.div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full mx-4 border border-white/20 backdrop-blur-lg"
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 300,
          delay: 0.1,
        }}
      >
        {/* Header with dynamic color */}
        <div
          className={`p-6 bg-gradient-to-r ${getGradientColor(
            buttonColor
          )} flex items-center gap-4`}
        >
          <motion.div
            className="p-3 rounded-xl bg-white/10 backdrop-blur-sm"
            whileHover={{ rotate: 10 }}
          >
            <span className="material-symbols-outlined text-4xl text-white">
              {icon}
            </span>
          </motion.div>
          <div>
            <h3 className={`text-2xl font-bold text-white drop-shadow-md`}>
              {title}
            </h3>
            <p className="text-white/90 text-sm mt-1.5">
              โปรดยืนยันการดำเนินการ
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 bg-gradient-to-b from-white to-gray-50">
          <div className="flex justify-center mb-4">
            <span className="material-symbols-outlined text-5xl text-gray-400 opacity-80">
              {icon}
            </span>
          </div>
          <p className="text-gray-700 text-center text-lg mb-6 px-4 leading-relaxed">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            {onConfirm && (
              <motion.button
                whileHover={{
                  y: -2,
                  scale: 1.02,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-3.5 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-medium transition-all flex items-center justify-center gap-2 flex-1 shadow-sm"
              >
                <span className="material-symbols-outlined text-xl">close</span>
                ยกเลิก
              </motion.button>
            )}

            <motion.button
              whileHover={{
                y: -2,
                scale: 1.02,
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={
                onConfirm
                  ? () => {
                      onConfirm();
                      onClose();
                    }
                  : onClose
              }
              className={`px-6 py-3.5 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 flex-1 shadow-lg ${getButtonGradient(
                buttonColor
              )}`}
            >
              <span className="material-symbols-outlined text-xl">check</span>
              {onConfirm ? "ตกลง" : "เข้าใจแล้ว"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
