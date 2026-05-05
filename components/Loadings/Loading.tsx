import { motion } from "framer-motion";

const Loading = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50"
    >
      {/* Animated spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="relative w-16 h-16 mb-4"
      >
        <span className="material-symbols-outlined absolute inset-0 text-blue-600 text-4xl">
          progress_activity
        </span>
      </motion.div>

      {/* Text with fade animation */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-gray-600 animate-pulse">
          hourglass_top
        </span>
        <p className="text-gray-700 text-lg font-medium">กำลังโหลดข้อมูล...</p>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: ["0%", "30%", "70%", "100%"] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="mt-6 h-1.5 bg-gradient-to-r from-blue-500 to-blue-300 rounded-full w-64 max-w-xs"
      />

      {/* Optional decorative dots */}
      <div className="flex gap-2 mt-8">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -10, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            className="w-3 h-3 bg-blue-500 rounded-full"
          />
        ))}
      </div>
    </motion.div>
  );
};

export default Loading;
