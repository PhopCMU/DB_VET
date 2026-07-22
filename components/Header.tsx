"use client";
import { useUser } from "@/app/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Header({ textHeader }: { textHeader: string }) {
  const router = useRouter();
  const hasAuth = useRef(false);
  const { logout, userData } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!hasAuth.current) {
      const auth = localStorage.getItem("authToken");
      if (!auth) {
        router.replace("/");
        return;
      }
      hasAuth.current = true;
    }
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    logout();
    router.replace("/");
  };

  const getUserInitial = () => {
    if (userData?.firstname_EN) {
      return userData.firstname_EN.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 25,
        duration: 0.6,
      }}
      className="bg-[#1d2736] backdrop-blur-xl border-b border-gray-700/60 p-4 flex justify-between items-center fixed top-0 left-0 w-full z-40 "
    >
      {/* Left side - Logo/Title */}
      <div className="flex items-center space-x-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            delay: 0.2,
            stiffness: 200,
            damping: 15,
          }}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
        >
          <span className="material-symbols-outlined text-white text-lg">
            dashboard
          </span>
        </motion.div>

        <div className="flex flex-col">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="font-bold text-lg md:text-xl text-white"
          >
            {textHeader}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xs text-gray-400 hidden sm:block"
          >
            Welcome back, {userData?.firstname_EN || "User"}
          </motion.p>
        </div>
      </div>

      {/* Right side - User controls */}
      <div className="flex items-center space-x-3">
        {/* User Profile Dropdown */}
        <motion.div className="relative" whileHover={{ scale: 1.02 }}>
          <motion.button
            whileHover={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(255, 255, 255, 0.2)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl border border-gray-600/50 transition-all duration-200 bg-gray-800/50"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-white font-semibold text-sm">
                {getUserInitial()}
              </span>
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-white">
                {userData?.firstname_EN || "User"}
              </span>
              <span className="text-xs text-gray-100">
                {userData?.itaccounttype_EN || "Admin"}
              </span>
            </div>
            <motion.span
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              className="material-symbols-outlined text-gray-100 text-lg"
            >
              expand_more
            </motion.span>
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-56 bg-[#111828] backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/60 py-2 z-50"
              >
                <div className="px-4 py-3 border-b border-gray-700/50">
                  <p className="text-sm font-medium text-white">
                    {userData?.firstname_EN} {userData?.lastname_EN}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-1">
                    {userData?.cmuitaccount}
                  </p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-xs text-gray-400">Online</span>
                  </div>
                </div>

                <button className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800/80 transition-colors flex items-center space-x-3 border-b border-gray-700/30">
                  <span className="material-symbols-outlined text-gray-400 text-lg">
                    person
                  </span>
                  <span>Profile</span>
                </button>

                <button className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800/80 transition-colors flex items-center space-x-3 border-b border-gray-700/30">
                  <span className="material-symbols-outlined text-gray-400 text-lg">
                    settings
                  </span>
                  <span>Settings</span>
                </button>

                <button className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800/80 transition-colors flex items-center space-x-3">
                  <span className="material-symbols-outlined text-gray-400 text-lg">
                    help
                  </span>
                  <span>Help & Support</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Logout Button */}
        <motion.button
          whileHover={{
            scale: 1.05,
            backgroundColor: "rgba(239, 68, 68, 0.2)",
            borderColor: "rgba(239, 68, 68, 0.4)",
          }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center space-x-2 px-4 py-3.5 rounded-xl border border-gray-600/50 transition-all duration-200 bg-gray-800/50 relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {isLoggingOut ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="flex items-center space-x-2"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full"
                />
                <span className="text-sm font-medium text-red-400">
                  Logging out...
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="logout"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-2"
              >
                <span className="material-symbols-outlined text-red-400 text-lg">
                  logout
                </span>
                <span className="text-sm font-medium text-red-400 hidden md:inline">
                  ออกจากระบบ
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Backdrop for dropdown */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDropdownOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>
    </motion.header>
  );
}
