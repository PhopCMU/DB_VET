import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

const toastStyles = {
  success: {
    container: "bg-green-50 border-2 border-green-100 shadow-lg",
    icon: "text-green-500",
    title: "text-green-800",
    message: "text-green-600",
    iconSymbol: "check_circle",
    progress: "bg-green-400",
  },
  error: {
    container: "bg-red-50 border-2 border-red-100 shadow-lg",
    icon: "text-red-500",
    title: "text-red-800",
    message: "text-red-600",
    iconSymbol: "error",
    progress: "bg-red-400",
  },
  info: {
    container: "bg-blue-50 border-2 border-blue-100 shadow-lg",
    icon: "text-blue-500",
    title: "text-blue-800",
    message: "text-blue-600",
    iconSymbol: "info",
    progress: "bg-blue-400",
  },
  warning: {
    container: "bg-amber-50 border-2 border-amber-100 shadow-lg",
    icon: "text-amber-500",
    title: "text-amber-800",
    message: "text-amber-600",
    iconSymbol: "warning",
    progress: "bg-amber-400",
  },
};

const positionClasses = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
};

const ToastNotification = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 2000,
  position = "top-right",
}: ToastProps) => {
  const styles = toastStyles[type];
  const titleMap: Record<ToastType, string> = {
    success: "สำเร็จ",
    error: "ข้อผิดพลาด",
    info: "ข้อมูล",
    warning: "คำเตือน",
  };

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{
            opacity: 0,
            y: position.includes("top") ? -50 : 50,
            scale: 0.9,
          }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: position.includes("top") ? -20 : 20,
            transition: { duration: 0.15 },
          }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`fixed z-[9999] ${positionClasses[position]}`}
        >
          <div
            className={`relative max-w-xs rounded-xl overflow-hidden ${styles.container}`}
          >
            {/* Progress bar */}
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              className={`h-1 ${styles.progress}`}
            />

            <div className="flex p-4 items-start">
              <div className={`flex-shrink-0 mt-0.5 ${styles.icon}`}>
                <span className="material-symbols-outlined text-xl">
                  {styles.iconSymbol}
                </span>
              </div>

              <div className="ml-3 flex-1">
                <h3 className={`text-sm font-semibold ${styles.title}`}>
                  {titleMap[type]}
                </h3>
                <div className={`mt-1 text-sm ${styles.message}`}>
                  <p>{message}</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className={`ml-4 flex-shrink-0 rounded-full px-2 pt-2 hover:bg-opacity-20 ${styles.icon}  hover:bg-opacity-10 transition-colors cursor-pointer`}
                aria-label="ปิด"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ToastNotification;
