import { useUser } from "@/app/context/UserContext";
import { motion } from "framer-motion";

export default function Footer() {
  const { userData } = useUser();

  return (
    <motion.footer
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 150, damping: 20 }}
      className=" bottom-0 w-full bg-[#111829] text-white p-3 md:pl-64 border-t border-gray-700/50 backdrop-blur-sm z-10"
    >
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
        {/* Copyright text with subtle animation */}
        <motion.p
          whileHover={{ scale: 1.02 }}
          className="text-xs md:text-sm text-gray-300 hover:text-white transition-colors flex items-center"
        >
          <span className="material-symbols-outlined text-base mr-1 text-blue-400">
            copyright
          </span>
          © 2025 คณะสัตวแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่
        </motion.p>

        {/* User info with interactive elements */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex items-center space-x-2 bg-gray-800/50 px-3 py-1.5 rounded-full"
        >
          <span className="material-symbols-outlined text-blue-400 text-base">
            mail
          </span>
          <span className="font-medium text-xs md:text-sm bg-gradient-to-r from-amber-200 to-amber-100 bg-clip-text text-transparent">
            {userData?.cmuitaccount || "Guest"}
          </span>

          {/* Optional status indicator */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2 h-2 rounded-full bg-green-400 ml-1"
          />
        </motion.div>

        {/* Optional additional links */}
        <div className="hidden md:flex items-center space-x-4">
          <motion.a
            whileHover={{ y: -2 }}
            href="#"
            className="text-xs text-gray-400 hover:text-blue-300 transition-colors flex items-center"
          >
            <span className="material-symbols-outlined text-sm mr-1">help</span>
            Help Center
          </motion.a>
          <motion.a
            whileHover={{ y: -2 }}
            href="#"
            className="text-xs text-gray-400 hover:text-blue-300 transition-colors flex items-center"
          >
            <span className="material-symbols-outlined text-sm mr-1">
              policy
            </span>
            Privacy Policy
          </motion.a>
        </div>
      </div>
    </motion.footer>
  );
}
