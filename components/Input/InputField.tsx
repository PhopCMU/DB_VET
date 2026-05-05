import { useEffect, useRef, useState } from "react";

export const InputField = ({
  label,
  name,
  value,
  onChange,
  icon,
  type = "text",
  ...props
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  type?: string;
  [key: string]: any;
}) => (
  <div className="relative">
    <div className="flex justify-between items-center mb-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {name === "icon" && (
        <span
          onClick={() =>
            window.open("https://fonts.google.com/icons", "_blank")
          }
          className="text-xs text-gray-500 ml-1 hover:text-blue-600 cursor-pointer"
        >
          https://fonts.google.com/icons
        </span>
      )}
    </div>

    <div className="relative">
      <input
        name={name}
        value={value ?? ""}
        onChange={onChange}
        type={type}
        required={props.required}
        placeholder={props.placeholder}
        {...props}
        className={`w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ${
          props.className || ""
        }`}
      />
      {icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
      )}
    </div>
  </div>
);

export const SelectedField = ({
  label,
  name,
  value,
  onChange,
  icon,
  options,
  ...props
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  icon?: React.ReactNode;
  options: { value: string | number; label: string }[];
  [key: string]: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // ค้นหาตัวเลือกตาม search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ดึง label ปัจจุบันจาก value
  const currentLabel = options.find((opt) => opt.value === value)?.label || "";

  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: { value: string | number; label: string }) => {
    onChange({
      target: { name, value: option.value },
    } as React.ChangeEvent<HTMLSelectElement>);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredOptions[focusedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="flex justify-between items-center mb-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {name === "icon" && (
          <span
            onClick={() =>
              window.open("https://fonts.google.com/icons", "_blank")
            }
            className="text-xs text-gray-500 ml-1 hover:text-blue-600 cursor-pointer"
          >
            https://fonts.google.com/icons
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type="text"
          name={name}
          value={searchTerm || currentLabel}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          required={props.required}
          className={`w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white ${
            props.className || ""
          }`}
          placeholder={props.placeholder}
        />
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </span>
        )}
        {/* Dropdown arrow */}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>

        {/* Dropdown list */}
        {isOpen && (
          <ul className="absolute z-10 w-full mb-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto bottom-full">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 ${
                    index === focusedIndex ? "bg-indigo-100" : ""
                  }`}
                >
                  {option.label}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">ไม่พบผลลัพธ์</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};
