"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/app/hooks/useToast";
import ToastNotification from "@/components/Tooltips/ToastNotification";
import { PutprojectToggleClient } from "@/app/routers/updateService";
import { useVisitor } from "@/lib/fingerprintjs-shim";
import { GetProjectToggle } from "@/app/routers/getService";

export const Settings = () => {
  const [clientEnabled, setClientEnabled] = useState(true);
  const [colors, setColors] = useState<string[]>([
    "#8b5cf6",
    "#ec4899",
    "#f97316",
  ]);
  const { toast, showToast, hideToast } = useToast();
  const { data, isLoading } = useVisitor();
  const visitorId = data ? data?.visitorId : null;
  const hasProject = useRef(false);

  const fetchProjects = async () => {
    const response = await GetProjectToggle(visitorId);
    if (response.success) {
      const isEnabled = Boolean(response.data);
      setClientEnabled(isEnabled);
    }
  };

  useEffect(() => {
    if (!hasProject.current) {
      if (visitorId && !isLoading) {
        fetchProjects();
        hasProject.current = true;
      }
    }
  }, [visitorId, isLoading]);

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
  };

  const toggleClient = useCallback(
    async (switchValue: boolean) => {
      const newStatus = !switchValue;
      setClientEnabled(newStatus);

      try {
        const response = await PutprojectToggleClient(newStatus, visitorId);
        if (!response.success) {
          setClientEnabled(switchValue);
          showToast("Update failed", "error");
        } else {
          showToast(
            `Client system ${newStatus ? "enabled" : "disabled"}`,
            "success",
          );
        }
      } catch (err) {
        setClientEnabled(switchValue);
        showToast("Update failed, try again", "error");
      }
    },
    [visitorId],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <ToastNotification
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">
                settings
              </span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                System Settings
              </h1>
              <p className="text-sm text-gray-500">
                Manage your system preferences
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Settings Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client System Toggle */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-sm">
                    power
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Client System</h3>
                  <p className="text-xs text-gray-500">
                    Enable/disable client access
                  </p>
                </div>
              </div>

              <button
                onClick={() => toggleClient(clientEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  clientEnabled ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    clientEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>
                System is currently {clientEnabled ? "active" : "inactive"}
              </span>
            </div>
          </motion.div>

          {/* Color Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 text-sm">
                  palette
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Theme Colors</h3>
                <p className="text-xs text-gray-500">
                  Customize your gradient theme
                </p>
              </div>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {colors.map((color, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <label className="text-xs text-gray-600 mb-2">
                    Color {idx + 1}
                  </label>
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(idx, e.target.value)}
                      className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                    />
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Preview */}
            <div>
              <p className="text-xs text-gray-600 mb-2">Preview</p>
              <div
                className="w-full h-8 rounded-lg shadow-inner"
                style={{
                  background: `linear-gradient(90deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200"
        >
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-500 text-sm mt-0.5">
              info
            </span>
            <div>
              <p className="text-sm text-blue-800 font-medium">
                Settings Information
              </p>
              <p className="text-xs text-blue-600 mt-1">
                All changes are automatically saved and applied immediately to
                your system.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
