import { motion } from "framer-motion";
import React from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface ExportMenuProps {
  exportData: any[]; // ข้อมูลสำหรับ export
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

interface ExportConfig {
  selectedFields: string[];
  headerMap?: Record<string, string>;
  sheetName?: string;
  fileName?: string;
}

const ExportMenu: React.FC<ExportMenuProps> = ({
  exportData,
  isOpen,
  setIsOpen,
}) => {
  // === Config Header ===
  let tableConfig: ExportConfig = {
    selectedFields: [],
    headerMap: {},
    sheetName: "",
    fileName: "",
  };

  // === กำหนดค่า tableConfig ตามประเภทข้อมูล ===
  // === Payment CMUVC ===
  if (
    exportData.length > 0 &&
    exportData[0].participantId &&
    !exportData[0].nameBib
  ) {
    tableConfig = {
      selectedFields: [
        "participantId",
        "fname",
        "lname",
        "foods.foodType",
        "email",
        "phone",
        "selectday.day",
        "organization",
        "packages.category_en",
        "price",
        "country",
        "address",
        "subDistrict",
        "district",
        "province",
        "zipCode",
        "payments",
      ],
      headerMap: {
        participantId: "ID",
        fname: "ชื่อ",
        lname: "นามสกุล",
        "foods.foodType": "อาหารที่เลือก",
        email: "อีเมล",
        phone: "เบอร์ติดต่อ",
        "selectday.day": "วันที่เข้าร่วม",
        organization: "หน่วยงานสังกัด",
        "packages.category_en": "ประเภท",
        price: "ราคา",
        country: "ประเทศ",
        address: "ที่อยู่",
        subDistrict: "ตำบล",
        district: "อำเภอ",
        province: "จังหวัด",
        zipCode: "รหัสไปรษณีย์",
        payments: "สถานะการชำระเงิน",
      },
      sheetName: `Payment_Cmuvc_${new Date().toDateString()}`,
      fileName: `Payment_Cmuvc_${new Date().toDateString()}`,
    };
  }
  // === Payment CMUVC Abstract ===
  else if (
    exportData.length > 0 &&
    exportData[0].abstractId &&
    !exportData[0].nameBib
  ) {
    tableConfig = {
      selectedFields: [
        "abstractId",
        "fname",
        "lname",
        "foods.foodType",
        "email",
        "phone",
        "abstractType.adstractType",
        "statusAbstract",
        "titleAbstarct",
        "organization",
        "price",
        "country",
        "address",
        "subDistrict",
        "district",
        "province",
        "zipCode",
        "payments",
      ],
      headerMap: {
        abstractId: "ID",
        fname: "ชื่อ",
        lname: "นามสกุล",
        "foods.foodType": "อาหารที่เลือก",
        email: "อีเมล",
        phone: "เบอร์ติดต่อ",
        organization: "หน่วยงานสังกัด",
        "abstractType.adstractType": "ประเภทบทคัดย่อ",
        price: "ราคา",
        statusAbstract: "สถานะ",
        titleAbstarct: "ชื่อบทคัดย่อ",
        country: "ประเทศ",
        address: "ที่อยู่",
        subDistrict: "ตำบล",
        district: "อำเภอ",
        province: "จังหวัด",
        zipCode: "รหัสไปรษณีย์",
        payments: "สถานะการชำระเงิน",
      },
      sheetName: `Abstract_${new Date().toDateString()}`,
      fileName: `Abstract_${new Date().toDateString()}`,
    };
  }
  // === Payment Anatomy ===
  else if (exportData.length > 0 && exportData[0].studentId) {
    tableConfig = {
      selectedFields: [
        "examSeatNumber",
        "studentId",
        "fname",
        "age",
        "email",
        "phone",
        "school",
        "levelup",
        "address",
        "payments",
      ],
      headerMap: {
        examSeatNumber: "เลขที่นั่งสอบ",
        abstractId: "ID",
        fname: "ชื่อ-นามสกุล",
        age: "อายุ",
        email: "อีเมล",
        phone: "เบอร์ติดต่อ",
        school: "โรงเรียน",
        levelup: "ชั้นปี",
        address: "ที่อยู",
        payments: "สถานะการชำระเงิน",
      },
      sheetName: `Payment_Anatomy_${new Date().toDateString()}`,
      fileName: `Payment_Anatomy_${new Date().toDateString()}`,
    };
  }
  // === Payment VETRUN ===
  else if (
    exportData.length > 0 &&
    exportData[0].nameBib &&
    exportData[0].numberBib
  ) {
    tableConfig = {
      selectedFields: [
        "nameBib",
        "numberBib",
        "firstName",
        "lastName",
        "email",
        "phone",
        "sex",
        "age",
        "size_sh.size",
        "address",
        "Animal[0].name",
        "Animal[0].breed",
        "Animal[0].weight",
        "Animal[0].sex",
        "Animal[0].fancys",
        "Items_vip[0].items",
        "Items_vip[0].model_shirt",
        "Items_vip[0].size_sh.size",
        "year",
        "payment",
      ],
      headerMap: {
        nameBib: "Bib",
        numberBib: "Number",
        firstName: "ชื่อ",
        lastName: "นามสกุล",
        email: "อีเมล",
        phone: "เบอร์ติดต่อ",
        sex: "เพศ",
        age: "อายุ",
        "size_sh.size": "ไซส์เสื้อ",
        address: "ที่อยู่",
        "Animal[0].name": "ชื่อสัตว์",
        "Animal[0].breed": "สายพันธุ์",
        "Animal[0].weight": "น้ำหนัก",
        "Animal[0].sex": "เพศสุนัข",
        "Animal[0].fancys": "ประกวดแฟนซี",
        "Items_vip[0].items": "VIP รางวัล",
        "Items_vip[0].model_shirt": "เสื้อรุ่น",
        "Items_vip[0].size_sh.size": "ไซส์เสื้อ 2",
        year: "ปี",
        payment: "สถานะการชำระ",
      },
      sheetName: `Payment_Vetrun_${new Date().toDateString()}`,
      fileName: `Payment_Vetrun_${new Date().toDateString()}`,
    };
  } // === Payment VETRUN Sale Shirt ===
  else if (
    exportData.length > 0 &&
    exportData[0].total_amount !== undefined &&
    exportData[0].userId
  ) {
    tableConfig = {
      selectedFields: [
        "userId",
        "fullname",
        "email",
        "phone",
        "sh_collection_method",
        "delivery_address",
        "total_amount",
        "payment",
        "ems_tracking",
        "OrderItem.length", // จำนวนเสื้อ
        "OrderItem.combos", // ขนาดเสื้อ และ รุ่นเสื้อที่เลือก (จะแปลงโดยฟังก์ชัน)
      ],
      headerMap: {
        userId: "ID",
        fullname: "ชื่อ-นามสกุล",
        email: "อีเมล",
        phone: "เบอร์ติดต่อ",
        sh_collection_method: "วิธีรับ",
        delivery_address: "ที่อยู่",
        total_amount: "ยอดรวม",
        payment: "สถานะการชำระ",
        ems_tracking: "เลขพัสดุ",
        "OrderItem.length": "จำนวนเสื้อ",
        "OrderItem.combos": "ขนาดเสื้อ+รุ่น",
      },
      sheetName: `SaleShirt_Vetrun_${new Date().toISOString().split("T")[0]}`,
      fileName: `SaleShirt_Vetrun_${new Date().toISOString().split("T")[0]}`,
    };
  } else if (exportData[0].sponserParticipantId) {
    tableConfig = {
      selectedFields: [
        "sponserParticipantId",
        "prefix",
        "ce",
        "fname",
        "lname",
        "email",
        "organization",
        "foods.foodType",
        "companys.name",
        "updateAt",
      ],
      headerMap: {
        sponserParticipantId: "ID",
        prefix: "คำนำหน้า",
        ce: "เลขที่บัตรประชาชน",
        fname: "ชื่อ",
        lname: "นามสกุล",
        email: "อีเมล",
        organization: "หน่วยงานสังกัด",
        "companys.name": "ชื่อบริษัท",
        "foods.foodType": "ประเภทอาหาร",
        updateAt: "วันที่สร้าง",
      },
      sheetName: `Sponsor_Cmuvc_${new Date().toDateString()}`,
      fileName: `Sponsor_Cmuvc_${new Date().toDateString()}`,
    };
  }
  // === ฟังก์ชันแปลง nested object เป็น flat ===
  const flattenAndSelectFields = (data: any[], selectedFields: string[]) => {
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => {
      const flattened: Record<string, any> = {};

      const flatten = (obj: any, parentKey = "") => {
        if (typeof obj !== "object" || obj === null) return;

        Object.entries(obj).forEach(([key, value]) => {
          const newKey = parentKey ? `${parentKey}.${key}` : key;

          if (Array.isArray(value)) {
            // กรณีพิเศษ: OrderItem → แปลงเป็น string ของ size
            if (key === "OrderItem" && value.length > 0) {
              const combos = value
                .map((item) => {
                  const size = item.size?.size;
                  const model = item.shirtmodel?.name;
                  if (size && model) return `${size} ${model}`;
                  return null;
                })
                .filter(Boolean);

              // กำหนดฟิลด์ใหม่ (เช่น OrderItem.combos)
              if (selectedFields.includes("OrderItem.combos")) {
                flattened["OrderItem.combos"] = combos.join(", ");
              }

              // กรณีเดิมๆ
              if (selectedFields.includes("OrderItem.length")) {
                flattened["OrderItem.length"] = value.length;
              }
              if (selectedFields.includes("OrderItem[].size.size")) {
                flattened["OrderItem[].size.size"] = value
                  .map((item) => item.size?.size)
                  .filter(Boolean)
                  .join(", ");
              }
            } else {
              // กรณี array อื่น
              value.forEach((arrItem: any, index: number) => {
                const arrayKey = `${newKey}[${index}]`;
                if (typeof arrItem === "object" && arrItem !== null) {
                  flatten(arrItem, arrayKey);
                } else {
                  if (selectedFields.includes(arrayKey)) {
                    flattened[arrayKey] = arrItem;
                  }
                }
              });
            }
          } else if (typeof value === "object" && value !== null) {
            flatten(value, newKey);
          } else {
            if (selectedFields.includes(newKey)) {
              flattened[newKey] = value;
            }
          }
        });
      };

      flatten(item);

      // 🟢 แปลงค่า boolean payment เป็นภาษาไทย
      if (flattened.payment !== undefined) {
        flattened.payment = flattened.payment ? "ชำระแล้ว" : "ยังไม่ชำระ";
      }

      // 🟢 แปลงค่า sh_collection_method
      if (flattened.sh_collection_method === "pickup") {
        flattened.sh_collection_method = "มารับเอง";
      } else if (flattened.sh_collection_method === "delivery") {
        flattened.sh_collection_method = "จัดส่ง";
      }

      // 🟢 แปลง total_amount เป็นรูปแบบเงินไทย
      if (flattened.total_amount !== undefined) {
        flattened.total_amount = new Intl.NumberFormat("th-TH", {
          style: "currency",
          currency: "THB",
        }).format(flattened.total_amount);
      }

      return flattened;
    });
  };

  // === เปลี่ยนชื่อ header ===
  const mapHeaders = (data: any[], headerMap: Record<string, string>) => {
    return data.map((item) => {
      const newItem: Record<string, any> = {};
      Object.entries(item).forEach(([key, value]) => {
        newItem[headerMap[key] || key] = value;
      });
      return newItem;
    });
  };

  // === Export to Excel ===
  const exportToExcel = async (data: any[], config: ExportConfig) => {
    const {
      selectedFields,
      headerMap = {},
      sheetName = "Data",
      fileName = "exported_data",
    } = config;

    const processedData = flattenAndSelectFields(data, selectedFields);
    const renamedData = mapHeaders(processedData, headerMap);

    if (renamedData.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // สร้าง columns + header
    const columns = selectedFields.map((key) => {
      const header = headerMap[key] || key;
      return {
        header,
        key: header,
        width: 20,
      };
    });
    worksheet.columns = columns;

    // เติมข้อมูลแถว
    renamedData.forEach((row) => {
      worksheet.addRow(row);
    });

    // สไตล์ header แถวแรก
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEEEEEE" }, // เทาอ่อน
      };
    });

    // สีเขียว/แดงใน cell ที่เป็น boolean true/false
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // ข้าม header

      row.eachCell((cell) => {
        if (cell.value === true || cell.value === "ชำระแล้ว") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFCCFFCC" }, // เขียวอ่อน
          };
        } else if (cell.value === false || cell.value === "ยังไม่ชำระ") {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFCCCC" }, // แดงอ่อน
          };
        }
      });
    });

    // ปรับความกว้างอัตโนมัติจากค่าที่อยู่ในแต่ละ column
    worksheet.columns.forEach((column) => {
      let maxLength = column.header?.toString().length || 10;

      worksheet.eachRow((row, rowNumber) => {
        const cell = row.getCell(column.key as string);
        const value = cell?.value;
        if (value) {
          const str =
            typeof value === "object"
              ? JSON.stringify(value)
              : value.toString();
          if (str.length > maxLength) {
            maxLength = str.length;
          }
        }
      });

      column.width = maxLength + 2;
    });

    // ดาวน์โหลดไฟล์
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
  };

  // === Export to CSV ===
  const exportToCSV = (data: any[], config: ExportConfig) => {
    const {
      selectedFields,
      headerMap = {},
      fileName = "exported_data",
    } = config;

    const processedData = flattenAndSelectFields(data, selectedFields);
    const renamedData = mapHeaders(processedData, headerMap);

    if (renamedData.length === 0) return;

    const headers = selectedFields.map((key) => headerMap[key] || key);
    const csvRows = renamedData.map((row) =>
      headers.map((h) => `"${row[h] || ""}"`).join(",")
    );

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    link.click();
  };

  // === จัดการ Export ===
  const handleExport = (type: string) => {
    console.log(`Exporting as ${type}...`);

    switch (type) {
      case "excel":
        exportToExcel(exportData, tableConfig);
        break;
      case "csv":
        exportToCSV(exportData, tableConfig);
        break;
      default:
        console.warn("Unsupported export format");
    }

    setIsOpen(false);
  };

  const exportOptions = [
    {
      id: 1,
      label: "Excel",
      icon: "table_view",
      action: () => handleExport("excel"),
    },
    {
      id: 2,
      label: "CSV",
      icon: "file_download",
      action: () => handleExport("csv"),
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="export-menu">
      {exportOptions.map((option) => (
        <motion.button
          key={option.id}
          onClick={option.action}
          whileHover={{ x: 2 }}
          className="flex items-center w-full gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150"
        >
          <span className="material-symbols-outlined text-base">
            {option.icon}
          </span>
          {option.label}
        </motion.button>
      ))}
    </div>
  );
};

export default ExportMenu;
