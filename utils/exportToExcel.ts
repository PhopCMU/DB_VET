import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface ExportData {
  [sheetName: string]: any[];
}

/**
 * ส่งออกข้อมูลหลาย sheet ลงในไฟล์ Excel เดียว โดยใช้ ExcelJS
 */
export const exportMultipleSheetsToExcel = async (
  exportData: ExportData,
  filename: string = "reports.xlsx"
) => {
  const workbook = new ExcelJS.Workbook();

  for (const [sheetName, data] of Object.entries(exportData)) {
    const worksheet = workbook.addWorksheet(sheetName);

    if (data.length === 0) continue;

    // สร้าง column headers
    const columns = Object.keys(data[0]).map((key) => ({
      header: key,
      key,
      width: 20,
    }));
    worksheet.columns = columns;

    // เติมข้อมูลแถว
    data.forEach((row) => {
      worksheet.addRow(row);
    });

    // จัด styling หัวตาราง
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFEEEEEE" }, // เทาอ่อน
      };
    });

    // จัดสี cell: true = เขียว, false = แดง
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // ข้ามหัวตาราง
      row.eachCell((cell) => {
        if (cell.value === true) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFCCFFCC" }, // เขียวอ่อน
          };
        } else if (cell.value === false) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFCCCC" }, // แดงอ่อน
          };
        }
      });
    });

    // ปรับความกว้างอัตโนมัติ
    worksheet.columns.forEach((column) => {
      let maxLength = column.header?.toString().length || 10;

      worksheet.eachRow((row) => {
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
  }

  //  Export เป็น Excel
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, filename);
};
