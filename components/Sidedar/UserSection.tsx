import Image from "next/image";
import { UserInfoGet } from "@/app/model/authModel";
import { motion } from "framer-motion";
import { images } from "@/constant";

interface Props {
  userData: UserInfoGet | null;
  isExpanded: boolean;
}

export default function UserSection({ userData, isExpanded }: Props) {
  if (!userData) return null;

  return (
    <motion.div
      className="mb-6 py-4 flex flex-col items-center gap-3 rounded-xl bg-gray-700/50 backdrop-blur-sm relative mt-20"
      whileHover={{ scale: 1.02 }}
    >
      {/* Status Badge - 12px text */}
      {userData.status_user === "active" && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-green-600 to-emerald-500 px-2 py-0.5 rounded-full flex items-center shadow-md">
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: "12px" }}
          >
            check_circle
          </span>
          <span className="text-white ml-1" style={{ fontSize: "12px" }}>
            ปกติ
          </span>
        </div>
      )}
      {userData.status_user === "reject" && (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-red-600 to-rose-500 px-2 py-0.5 rounded-full flex items-center shadow-md">
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: "12px" }}
          >
            block
          </span>
          <span className="text-white ml-1" style={{ fontSize: "12px" }}>
            ยกเลิก
          </span>
        </div>
      )}

      {/* Avatar - unchanged */}
      <div className="relative">
        <Image
          src={images.logo}
          alt="User Avatar"
          width={80}
          height={80}
          className="rounded-full  shadow-lg"
          priority
        />
      </div>

      {/* User Info - 12px text */}
      <motion.div
        className="text-center hidden md:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <h3
          className="text-white"
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          {userData.firstname_EN} {userData.lastname_EN}
        </h3>
        <p className="text-gray-300 mt-1" style={{ fontSize: "12px" }}>
          {userData.cmuitaccount || "Guest"}
        </p>
      </motion.div>
    </motion.div>
  );
}
