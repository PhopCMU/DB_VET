"use client";
import { useEffect, useState } from "react";
import { useVisitor } from "@/lib/fingerprintjs-shim";
import { motion } from "framer-motion";
import { useUser } from "../context/UserContext";

const cardVariants = {
  offscreen: {
    y: 30,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.3,
      duration: 0.6,
    },
  },
};

const DashboardCard = ({ icon, title, value, color, delay = 0 }: any) => {
  const colors: any = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      text: "text-blue-800",
      value: "text-blue-700",
      icon: "text-blue-500",
      border: "border-blue-200",
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-green-100",
      text: "text-green-800",
      value: "text-green-700",
      icon: "text-green-500",
      border: "border-green-200",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-purple-100",
      text: "text-purple-800",
      value: "text-purple-700",
      icon: "text-purple-500",
      border: "border-purple-200",
    },
    amber: {
      bg: "bg-gradient-to-br from-amber-50 to-amber-100",
      text: "text-amber-800",
      value: "text-amber-700",
      icon: "text-amber-500",
      border: "border-amber-200",
    },
  };

  return (
    <motion.div
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: 0.1 }}
      variants={cardVariants}
      transition={{ delay: delay * 0.15 }}
      className={`p-5 ${colors[color].bg} rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border ${colors[color].border} hover:scale-[1.02]`}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colors[color].bg} bg-white/50`}>
          <span
            className={`material-symbols-outlined ${colors[color].icon} text-2xl`}
          >
            {icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h2
            className={`text-sm font-medium ${colors[color].text} mb-1 truncate`}
          >
            {title}
          </h2>
          <p className={`text-2xl font-bold ${colors[color].value} truncate`}>
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const DataCard = ({ title, subtitle, children, color = "purple" }: any) => {
  const colors: any = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      text: "text-blue-800",
      border: "border-blue-200",
      accent: "bg-blue-500",
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-green-100",
      text: "text-green-800",
      border: "border-green-200",
      accent: "bg-green-500",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-purple-100",
      text: "text-purple-800",
      border: "border-purple-200",
      accent: "bg-purple-500",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`p-6 ${colors[color].bg} rounded-xl shadow-lg border ${colors[color].border}`}
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-1 h-6 ${colors[color].accent} rounded-full`}></div>
          <h2 className={`text-xl font-semibold ${colors[color].text}`}>
            {title}
          </h2>
        </div>
        {subtitle && (
          <p className="text-gray-600 text-sm leading-relaxed ml-4">
            {subtitle}
          </p>
        )}
      </div>
      <div className={`text-sm ${colors[color].text}`}>{children}</div>
    </motion.div>
  );
};

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const { isLoading, error, data, getData } = useVisitor(
    { extendedResult: true },
    { immediate: true },
  );
  const { userData } = useUser();

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    setToken(storedToken);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl shadow-md border border-gray-200">
              <span className="material-symbols-outlined text-purple-500 text-2xl">
                dashboard
              </span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Welcome to Admin Dashboard
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage and monitor your system efficiently
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            icon="person"
            title="Full Name"
            value={`${userData?.firstname_EN || "N/A"} ${
              userData?.lastname_EN || ""
            }`}
            color="blue"
            delay={0}
          />
          <DashboardCard
            icon="email"
            title="Email Address"
            value={userData?.cmuitaccount || "N/A"}
            color="green"
            delay={1}
          />
          <DashboardCard
            icon="badge"
            title="Account Type"
            value={userData?.itaccounttype_EN || "N/A"}
            color="purple"
            delay={2}
          />
          <DashboardCard
            icon="verified"
            title="Verification Status"
            value={token ? "Verified" : "Loading..."}
            color="amber"
            delay={3}
          />
        </div>

        {/* Visitor Data Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DataCard
            title="Browser Identification"
            subtitle="Unique visitor ID for request blocking and security monitoring"
            color="purple"
          >
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-all duration-200 border border-purple-200 shadow-sm"
                onClick={() => getData({ ignoreCache: true })}
              >
                <span className="material-symbols-outlined text-lg">
                  refresh
                </span>
                Refresh Visitor Data
              </motion.button>

              <div className="space-y-3">
                <div>
                  <div className="font-medium text-gray-700 mb-2">
                    Visitor ID:
                  </div>
                  <div className="font-mono text-sm bg-white/80 p-3 rounded-lg border border-gray-200 break-all">
                    {isLoading ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                        Loading visitor data...
                      </div>
                    ) : (
                      data?.visitorId || "No data available"
                    )}
                  </div>
                </div>

                <div>
                  <div className="font-medium text-gray-700 mb-2">
                    Full Visitor Data:
                  </div>
                  <div className="bg-white/80 p-3 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap break-words">
                      {error
                        ? `Error: ${error.message}`
                        : isLoading
                          ? "Loading detailed data..."
                          : JSON.stringify(data, null, 2) ||
                            "No data available"}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </DataCard>

          {/* Additional Info Card (Optional) */}
          <DataCard
            title="System Information"
            subtitle="Current session and platform details"
            color="blue"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">User Status</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Last Login</span>
                <span className="font-medium text-gray-700">Just now</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Platform</span>
                <span className="font-medium text-gray-700">Web Browser</span>
              </div>
            </div>
          </DataCard>
        </div>

        {/* Footer Space */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}
