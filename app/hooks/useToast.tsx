import { useState } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export const useToast = () => {
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: ToastType;
  }>({
    isVisible: false,
    message: "",
    type: "success",
  });

  const showToast = (message: string, type: ToastType) => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  return {
    toast,
    showToast,
    hideToast,
  };
};
