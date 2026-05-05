"use client";
import { useUser } from "@/app/context/UserContext";
import PermissionGuard from "@/components/Guards/PermissionGuard";
import { config } from "@/config/config_api";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";

type Props = {
  apiUrl?: string;
  initialFolder?: string;
  initialService?: string;
  initialFile?: "info" | "error";
  folders?: string[];
  services?: string[];
};

const SUB_MENU_ID = "ed17e7fe-7c7e-4bd1-b971-a16318ae0a72";

export default function LogViewer({
  apiUrl = "/role/logger/logs",
  initialFolder = "Role",
  initialService = "authen",
  initialFile = "info",
  folders = ["Role", "Cmuvc"],
  services = ["authen", "payment"],
}: Props) {
  const [currentFolder, setCurrentFolder] = useState(initialFolder);
  const [currentService, setCurrentService] = useState(initialService);
  const [currentFile, setCurrentFile] = useState<"info" | "error">(initialFile);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableFolders, setAvailableFolders] = useState(folders);
  const [availableServices, setAvailableServices] = useState(services);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");

  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const fullApiUrl = `${config.URL_API.replace(/\/+$/, "")}${apiUrl}`;

  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    setToken(storedToken as any);
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `${fullApiUrl}/${currentFolder}/${currentService}/${currentFile}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setLogLines(data.lines);
    } catch (err: any) {
      setError("❌ " + err.message);
      setLogLines([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLines = logLines.filter((line) => {
    return line.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const Highlight = ({
    text,
    highlight,
  }: {
    text: string;
    highlight: string;
  }) => {
    const term = highlight.trim();
    if (!term) return <>{text}</>;

    const regex = new RegExp(`(${escapeRegExp(term)})`, "gi");
    const parts = text.split(regex).filter((part) => part.length > 0);

    return (
      <>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {regex.test(part) ? (
              <mark className="bg-yellow-200 text-yellow-900 font-semibold px-1 rounded">
                {part}
              </mark>
            ) : (
              <span>{part}</span>
            )}
          </React.Fragment>
        ))}
      </>
    );
  };

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logLines]);

  useEffect(() => {
    return () => {
      lineRefs.current = [];
    };
  }, []);

  const switchLog = (
    folder?: string,
    service?: string,
    file?: "info" | "error"
  ) => {
    if (folder) setCurrentFolder(folder);
    if (service) setCurrentService(service);
    if (file) setCurrentFile(file);
  };

  const addFolder = (name: string) => {
    if (name && !availableFolders.includes(name)) {
      setAvailableFolders((prev) => [...prev, name]);
    }
  };

  const addService = (name: string) => {
    if (name && !availableServices.includes(name)) {
      setAvailableServices((prev) => [...prev, name]);
    }
  };

  const clearLogs = () => {
    setLogLines([]);
  };

  const downloadLogs = () => {
    const blob = new Blob([logLines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentFolder}_${currentService}_${currentFile}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PermissionGuard submenuIdCode={SUB_MENU_ID} />
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        {/* Header Section */}
        <motion.div
          className="flex flex-col md:flex-row gap-4 items-start md:items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Token Status */}
          <motion.div
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 shadow-inner"
            whileHover={{ scale: 1.02 }}
          >
            <span className="material-symbols-outlined text-indigo-500">
              token
            </span>
            <span className="text-sm font-medium text-gray-700">
              Token:{" "}
              {token ? (
                <span className="text-green-500">Authenticated</span>
              ) : (
                <span className="text-red-500">Missing</span>
              )}
            </span>
          </motion.div>

          {/* Folder Selector */}
          <motion.div
            className="flex flex-wrap gap-2 ml-auto"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {availableFolders.map((f) => (
              <motion.button
                key={f}
                onClick={() => switchLog(f)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  f === currentFolder
                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {f}
              </motion.button>
            ))}
            <motion.div whileHover={{ scale: 1.03 }}>
              <input
                placeholder="Add folder..."
                className="border border-gray-300 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addFolder((e.target as HTMLInputElement).value.trim());
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Service & Actions */}
        <motion.div
          className="flex flex-col md:flex-row gap-4 items-start md:items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Service Selector */}
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
          >
            {availableServices.map((s) => (
              <motion.button
                key={s}
                onClick={() => switchLog(undefined, s)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  s === currentService
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {s}
              </motion.button>
            ))}
            <motion.div whileHover={{ scale: 1.03 }}>
              <input
                placeholder="Add service..."
                className="border border-gray-300 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addService((e.target as HTMLInputElement).value.trim());
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
            </motion.div>
          </motion.div>

          {/* File Selector */}
          <motion.div
            className="flex items-center gap-2 ml-auto"
            whileHover={{ scale: 1.02 }}
          >
            <label className="text-sm font-medium text-gray-600">
              Log File:
            </label>
            <motion.select
              value={currentFile}
              onChange={(e) =>
                switchLog(
                  undefined,
                  undefined,
                  e.target.value as "info" | "error"
                )
              }
              className="border border-gray-300 rounded-full px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300"
              whileHover={{ scale: 1.02 }}
              whileFocus={{ scale: 1.02 }}
            >
              <option value="info">info.log</option>
              <option value="error">error.log</option>
            </motion.select>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex gap-2 ml-auto md:ml-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.button
              onClick={fetchLogs}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 ${
                loading
                  ? "bg-gray-400 text-white"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="material-symbols-outlined text-sm"
                  >
                    progress_activity
                  </motion.span>
                  Loading...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">
                    refresh
                  </span>
                  Refresh
                </>
              )}
            </motion.button>

            <motion.button
              onClick={clearLogs}
              whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-1.5 rounded-full text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Clear
            </motion.button>

            <motion.button
              onClick={downloadLogs}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-md flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">
                download
              </span>
              Download
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-red-500">
                error
              </span>
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Log Display */}
        <motion.div
          className="rounded-xl overflow-hidden shadow-lg border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-3 text-gray-100 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-green-400">
              folder
            </span>
            <span className="text-green-400 font-medium">{currentFolder}</span>
            <span className="text-gray-400">/</span>
            <span className="text-blue-300 font-medium">{currentService}</span>
            <span className="text-gray-400">/</span>
            <span className="text-amber-300 font-medium">
              {currentFile}.log
            </span>
          </div>

          {/* Log Content */}
          <motion.div
            ref={containerRef}
            className="h-[32rem] overflow-auto bg-gray-950 text-green-100 font-mono text-sm relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {/* Search & Navigation Bar */}
            <motion.div
              className="sticky top-0  p-2 z-10 flex items-center gap-2 "
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative flex-1 max-w-md">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 material-symbols-outlined text-gray-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentMatchIndex(null); // รีเซ็ตเมื่อพิมพ์ใหม่
                  }}
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-700 bg-gray-800 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setCurrentMatchIndex(null);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
                  >
                    <span className="material-symbols-outlined text-sm">
                      close
                    </span>
                  </button>
                )}
              </div>
            </motion.div>

            {/* แสดงทุกบรรทัด */}
            <pre className="whitespace-pre-wrap p-4 pt-16">
              {filteredLines.length > 0 ? (
                filteredLines.map((line, index) => (
                  <motion.span
                    key={index}
                    ref={(el: HTMLSpanElement | any) =>
                      (lineRefs.current[index] = el)
                    }
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.001 * index }}
                    className="block"
                  >
                    <Highlight text={line} highlight={searchTerm} />
                  </motion.span>
                ))
              ) : (
                <div className="text-gray-500 text-center py-4">
                  {loading ? "Loading logs..." : "No logs found."}
                </div>
              )}
            </pre>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
