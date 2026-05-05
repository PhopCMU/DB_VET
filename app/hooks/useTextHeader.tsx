import { useState, useEffect } from "react";

export const useTextHeader = (defaultValue: string = "Dashboard") => {
  const [textHeader, setTextHeader] = useState(defaultValue);

  useEffect(() => {
    const savedTextHeader = localStorage.getItem("textHeader");
    if (savedTextHeader) {
      setTextHeader(savedTextHeader);
    }
  }, []);

  const updateTextHeader = (text: string) => {
    setTextHeader(text);
    localStorage.setItem("textHeader", text);
  };

  return [textHeader, updateTextHeader] as const;
};
