import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable;
    getNumberOfPages(): number;
  }
}

/**
 * ReceiptData interface for generateReceiptPDF function
 * Matches CMU tax invoice template structure
 */
export interface ReceiptData {
  docNumber: string; // e.g. "690214101694"
  date: string; // e.g. "12 พฤษภาคม 2569"
  dateEN: string; // e.g. "12 MAY 2026"
  customerName: string;
  customerAddress: string;
  customerTaxId: string;
  invoiceRef: string;
  description: string; // can be multi-line
  subtotal: number;
  vat: number; // 0 if VAT-exempt
  total: number;
  amountInWords: string; // Thai words e.g. "สี่พันบาทถ้วน"
  amountInWordsEN: string; // English e.g. "Four thousand Baht"
  paymentMethod: string; // e.g. "ธนาคารส่วนงาน"
  paymentNote: string; // e.g. "เงินโอนเข้า SCB#12002-0 ลว.12/5/69"
}

export const exportEvaluation = (user: any) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Add university logo or header
  //   const img = new Image();
  //   img.src = "/assets/images/logo.png"; // Replace with your logo path
  //   doc.addImage(img, "PNG", 15, 10, 30, 15);

  // Set document metadata
  doc.setProperties({
    title: `ผลประเมิน ${user.fullname_th}`,
    subject: "ผลการประเมินพนักงาน",
    author: "ระบบประเมินผล",
    keywords: "evaluation, report",
    creator: "ระบบประเมินผล",
  });

  // Add title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("ผลการประเมินพนักงาน", 105, 30, { align: "center" });

  // Add user information
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`ชื่อ: ${user.fullname_th}`, 20, 45);
  doc.text(`ตำแหน่ง: ${user.positiontitle_th}`, 20, 52);
  doc.text(`หน่วยงาน: ${user.level3agency_th}`, 20, 59);
  doc.text(`จำนวนการประเมิน: ${user.evaluations.length} ครั้ง`, 20, 66);

  // Summary table
  let currentY = 75;

  const summaryResult: any = autoTable(doc, {
    startY: currentY,
    head: [["สรุปผลการประเมิน", "คะแนน"]],
    body: [
      ["คะแนนเฉลี่ย", calculateAverageScore(user.evaluations).toFixed(1)],
      ["คะแนนสูงสุด", findMaxScore(user.evaluations)],
      ["ระดับการประเมิน", user.ratenumber || "-"],
      ["ประเมินล่าสุด", formatDate(user.updatedAt)],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    styles: {
      cellPadding: 5,
      fontSize: 10,
    },
  });

  currentY = summaryResult?.finalY || currentY;

  // Add detailed evaluations
  user.evaluations.forEach((evaluation: any, index: number) => {
    // Add evaluation header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`การประเมินครั้งที่ ${index + 1}`, 20, currentY + 10);

    // Add evaluation date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      `วันที่ประเมิน: ${formatDate(evaluation.createdAt)}`,
      20,
      currentY + 17,
    );

    currentY += 25; // เพิ่มระยะห่างก่อนเริ่มตาราง

    // Evaluation scores table
    const tableResult: any = autoTable(doc, {
      startY: currentY,
      head: [["หัวข้อการประเมิน", "คะแนน", "รายละเอียด"]],
      body: [
        [
          "หัวข้อที่ 1: Professional Skills",
          evaluation.topic1,
          "ทักษะทางวิชาชีพ",
        ],
        ["หัวข้อที่ 2: Teamwork", evaluation.topic2, "การทำงานเป็นทีม"],
        ["หัวข้อที่ 3: Communication", evaluation.topic3, "การสื่อสาร"],
        ["หัวข้อที่ 4: Leadership", evaluation.topic4, "ภาวะผู้นำ"],
        ["คะแนนรวม", calculateTotalScore(evaluation), ""],
      ],
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 30 },
        2: { cellWidth: "auto" },
      },
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240],
      },
      styles: {
        cellPadding: 5,
        fontSize: 10,
      },
    });

    currentY = tableResult?.finalY || currentY;

    // Add comments if available
    if (evaluation.comment) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("ข้อคิดเห็นเพิ่มเติม:", 20, currentY + 10);

      doc.setFont("helvetica", "normal");
      const splitComments = doc.splitTextToSize(evaluation.comment, 170);
      doc.text(splitComments, 20, currentY + 15);

      currentY += splitComments.length * 5 + 10; // ปรับ Y ตามความยาวของ comment
    }

    // Add page break if not last evaluation
    if (index < user.evaluations.length - 1) {
      doc.addPage();
      currentY = 20;
    }
  });

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`หน้า ${i} จาก ${pageCount}`, 105, 287, { align: "center" });
    doc.text(
      `เอกสารนี้สร้างเมื่อ: ${new Date().toLocaleDateString("th-TH")}`,
      195,
      287,
      { align: "right" },
    );
  }

  // Save the PDF
  doc.save(
    `ผลประเมิน_${user.fullname_th}_${new Date().toISOString().slice(0, 10)}.pdf`,
  );
};

export const exportReceipt = async (opts: {
  shopName?: string;
  logoUrl?: string | null;
  transactionDate?: string | Date | null;
  refNumber?: string | null;
  amount?: number | string | null;
  paymentMethod?: string | null;
}) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 20;
  let y = 20;

  // Try to load logo if provided (best-effort)
  if (opts.logoUrl) {
    try {
      const res = await fetch(opts.logoUrl);
      if (res.ok) {
        const blob = await res.blob();
        const reader = new FileReader();
        const dataUrl: string = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        // place logo top-right
        try {
          doc.addImage(dataUrl, "PNG", 170, 12, 28, 28);
        } catch (e) {
          // ignore image errors
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Header / shop name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(opts.shopName || "ร้านค้า", margin, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  const dt = opts.transactionDate ? new Date(opts.transactionDate) : new Date();
  const formattedDate = dt.toLocaleString("th-TH");

  doc.text(`วันที่: ${formattedDate}`, margin, y + 8);
  doc.text(`อ้างอิง: ${opts.refNumber || "-"}`, margin, y + 16);

  const amountNum = Number(opts.amount || 0);
  doc.text(
    `จำนวน: ${isNaN(amountNum) ? String(opts.amount || "-") : amountNum.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท`,
    margin,
    y + 24,
  );

  doc.text(`ช่องทางการชำระ: ${opts.paymentMethod || "SCB QR"}`, margin, y + 32);

  y += 44;

  // Draw a separator
  doc.setDrawColor(220);
  doc.setLineWidth(0.3);
  doc.line(margin, y, 210 - margin, y);
  y += 8;

  // Thank you message
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("ขอบคุณที่ใช้บริการ", margin, y);

  // Footer with filename
  const dateStr = dt.toISOString().slice(0, 10).replace(/-/g, "");
  const safeRef = (opts.refNumber || "unknown").replace(/[^a-zA-Z0-9-_]/g, "_");
  const filename = `receipt-${safeRef}-${dateStr}.pdf`;
  doc.save(filename);
};

/**
 * Generate a professional CMU tax invoice PDF receipt
 * Matches the CMU_รายงานใบเสร็จรับเงิน template structure
 *
 * @param data - ReceiptData containing receipt information
 */
export const generateReceiptPDF = (data: ReceiptData): void => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Page setup
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // ─── HEADER SECTION ───────────────────────────────────────────────────
  // Organization name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("มหาวิทยาลัยเชียงใหม่", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 6;

  // Organization address and contact
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "239 ม.1 ต.บ้านป่า อ.ฮ่องไคร่ จ.เชียงใหม่ 50230",
    pageWidth / 2,
    yPosition,
    {
      align: "center",
    },
  );
  yPosition += 4;
  doc.text("โทรศัพท์ 0-5394-3999", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 4;
  doc.text(
    "เลขประจำตัวผู้เสียภาษีอากร 0165538000160",
    pageWidth / 2,
    yPosition,
    {
      align: "center",
    },
  );
  yPosition += 8;

  // Divider line
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 4;

  // Document title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("ใบกำกับภาษี / TAX INVOICE", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 6;

  // Divider line
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  // Faculty/Branch name
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("คณะสัตวแพทยศาสตร์", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 4;
  doc.setFontSize(9);
  doc.text("Faculty of Veterinary Medicine", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 4;
  doc.text("โทรศัพท์ 0-5394-3999 ต่อ 4050", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 10;

  // ─── CUSTOMER SECTION ─────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  // Customer info block
  const leftX = margin;
  doc.text("ชื่อลูกค้า / Customer Name :", leftX, yPosition);
  doc.text(data.customerName, leftX + 60, yPosition);
  yPosition += 5;

  doc.text("ที่อยู่ / Address :", leftX, yPosition);
  const addressLines = doc.splitTextToSize(
    data.customerAddress,
    contentWidth - 60,
  );
  doc.text(addressLines, leftX + 60, yPosition);
  yPosition += addressLines.length * 4 + 2;

  doc.setFontSize(8);
  doc.text(
    `(เลขประจำตัวผู้เสียภาษี ${data.customerTaxId})`,
    leftX + 60,
    yPosition,
  );
  yPosition += 6;

  doc.setFontSize(10);

  // ─── DOCUMENT INFO SECTION (Right-aligned) ────────────────────────────
  const infoStartY = yPosition - 18; // Align with customer info start
  const rightInfoX = pageWidth - margin - 50;

  doc.text("เลขที่ใบสำคัญรับ / Document No. :", rightInfoX, infoStartY);
  doc.setFont("helvetica", "bold");
  doc.text(data.docNumber, rightInfoX + 55, infoStartY);

  doc.setFont("helvetica", "normal");
  doc.text("วันที่ / Date :", rightInfoX, infoStartY + 6);
  doc.text(data.date, rightInfoX + 55, infoStartY + 6);

  yPosition += 8;

  // ─── ITEMS TABLE ──────────────────────────────────────────────────────
  const tableData = [
    ["ใบแจ้งหนี้/INV.", "ลำดับ/No.", "รายการ/Description", "ราคารวม/Total"],
    [data.invoiceRef, "1", data.description, `${data.total.toFixed(2)}`],
  ];

  const tableConfig: any = {
    startY: yPosition,
    head: [tableData[0]],
    body: [tableData[1]],
    margin: margin,
    didDrawCell: function (cell: any) {
      // Custom styling for table
    },
    headStyles: {
      fillColor: [79, 129, 189],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 35, halign: "center" },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: contentWidth - 80, halign: "left" },
      3: { cellWidth: 25, halign: "right" },
    },
    theme: "grid" as const,
  };

  autoTable(doc, tableConfig);
  yPosition = (doc as any).lastAutoTable.finalY + 8;

  // ─── SUMMARY SECTION (Right-aligned totals) ──────────────────────────
  const summaryX = pageWidth - margin - 60;
  const labelX = summaryX - 5;
  const valueX = pageWidth - margin - 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  // Exclude VAT
  doc.text(
    "มูลค่าสินค้าหรือบริการก่อนภาษีมูลค่าเพิ่ม",
    labelX - 50,
    yPosition,
    {
      align: "right",
    },
  );
  doc.text("Exclude VAT", labelX - 50, yPosition + 4, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.text(`: ${data.subtotal.toFixed(2)}`, labelX, yPosition, {
    align: "right",
  });
  yPosition += 9;

  // VAT (only if applicable)
  doc.setFont("helvetica", "normal");
  if (data.vat > 0) {
    doc.text("ภาษีมูลค่าเพิ่ม 7%", labelX - 50, yPosition, { align: "right" });
    doc.text("VAT", labelX - 50, yPosition + 4, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text(`: ${data.vat.toFixed(2)}`, labelX, yPosition, { align: "right" });
    yPosition += 9;
  }

  // Divider line
  doc.setDrawColor(100);
  doc.setLineWidth(0.5);
  doc.line(labelX - 50, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("จำนวนเงินรวม / Total", labelX - 50, yPosition, { align: "right" });
  doc.text(`: ${data.total.toFixed(2)}`, labelX, yPosition, { align: "right" });

  yPosition += 12;

  // ─── FOOTER SECTION ───────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text("จำนวนเงิน (ตัวอักษร):", margin, yPosition);
  doc.text(`${data.amountInWords}`, margin + 40, yPosition);
  yPosition += 5;

  doc.text("Amount in Words:", margin, yPosition);
  doc.text(`${data.amountInWordsEN}`, margin + 40, yPosition);
  yPosition += 10;

  doc.text("ช่องทางการชำระเงิน / Pay By :", margin, yPosition);
  doc.text(`${data.paymentMethod}`, margin + 55, yPosition);
  yPosition += 6;

  doc.text("ชำระโดย / By :", margin, yPosition);
  doc.text("……………………………………………", margin + 30, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  const noteLines = doc.splitTextToSize(data.paymentNote, contentWidth - 10);
  doc.text(noteLines, margin, yPosition);

  yPosition += noteLines.length * 4 + 10;

  // Thank you message
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("ขอบคุณที่ใช้บริการ / Thank you", pageWidth / 2, yPosition, {
    align: "center",
  });

  // Footer text
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`หน้า ${i} จาก ${pageCount}`, pageWidth / 2, pageHeight - 10, {
      align: "center",
    });
    doc.text(
      `เอกสารนี้สร้างเมื่อ: ${new Date().toLocaleDateString("th-TH")}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: "right" },
    );
  }

  // Save the PDF with proper filename
  const filename = `receipt-${data.docNumber}-${data.dateEN.replace(/\s/g, "-")}.pdf`;
  doc.save(filename);
};

// Helper functions
const calculateAverageScore = (evaluations: any[]) => {
  const total = evaluations.reduce((sum, evaluations) => {
    return (
      sum +
      (evaluations.topic1 +
        evaluations.topic2 +
        evaluations.topic3 +
        evaluations.topic4) /
        4
    );
  }, 0);
  return total / evaluations.length;
};

const calculateTotalScore = (evaluation: any) => {
  return (
    evaluation.topic1 +
    evaluation.topic2 +
    evaluation.topic3 +
    evaluation.topic4
  );
};

const findMaxScore = (evaluations: any[]) => {
  const scores = evaluations.map(calculateTotalScore);
  return Math.max(...scores);
};

const formatDate = (dateString: any) => {
  const options: any = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("th-TH", options);
};

// ─── UTILITY FUNCTIONS FOR RECEIPT PDF ────────────────────────────────

/**
 * Convert number to Thai words
 * @param num - Number to convert
 * @returns Thai words representation
 */
export const numberToThaiWords = (num: number): string => {
  const ones = [
    "",
    "หนึ่ง",
    "สอง",
    "สาม",
    "สี่",
    "ห้า",
    "หก",
    "เจ็ด",
    "แปด",
    "เก้า",
  ];
  const tens = [
    "",
    "สิบ",
    "ยี่สิบ",
    "สามสิบ",
    "สี่สิบ",
    "ห้าสิบ",
    "หกสิบ",
    "เจ็ดสิบ",
    "แปดสิบ",
    "เก้าสิบ",
  ];
  const scales = ["", "พัน", "หมื่น", "แสน", "ล้าน"];

  if (num === 0) return "ศูนย์";

  let result = "";
  let scaleIndex = 0;

  // Handle fractional part (satang = ส ตางค์)
  const parts = num.toString().split(".");
  const intPart = parseInt(parts[0]);
  const fracPart = parts[1] ? parseInt(parts[1].padEnd(2, "0")) : 0;

  // Convert integer part
  let tempNum = intPart;
  while (tempNum > 0) {
    const digit = tempNum % 1000;
    if (digit > 0) {
      let hundreds = Math.floor(digit / 100);
      let remainder = digit % 100;
      let textSegment = "";

      if (hundreds > 0) {
        textSegment += ones[hundreds] + "ร้อย";
      }

      if (remainder >= 20) {
        textSegment += tens[Math.floor(remainder / 10)];
        const onesDigit = remainder % 10;
        if (onesDigit > 0) {
          textSegment += ones[onesDigit];
        }
      } else if (remainder === 10) {
        textSegment += "สิบ";
      } else if (remainder > 0) {
        if (remainder === 1 && scaleIndex > 0) {
          textSegment += "";
        } else {
          textSegment += ones[remainder];
        }
      }

      if (scaleIndex > 0) {
        textSegment += scales[scaleIndex];
      }
      result = textSegment + result;
    }

    tempNum = Math.floor(tempNum / 1000);
    scaleIndex++;
  }

  // Add "บาท"
  result += "บาท";

  // Add satang if present
  if (fracPart > 0) {
    result += numberToThaiWords(fracPart) + "สตางค์";
  } else {
    result += "ถ้วน";
  }

  return result;
};

/**
 * Convert number to English words
 * @param num - Number to convert
 * @returns English words representation
 */
export const numberToEnglishWords = (num: number): string => {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const scales = ["", "Thousand", "Million", "Billion", "Trillion"];

  if (num === 0) return "Zero";

  let result = "";
  let scaleIndex = 0;

  // Handle fractional part
  const parts = num.toString().split(".");
  const intPart = parseInt(parts[0]);
  const fracPart = parts[1] ? parseInt(parts[1].padEnd(2, "0")) : 0;

  // Convert integer part
  let tempNum = intPart;
  while (tempNum > 0) {
    const digit = tempNum % 1000;
    if (digit > 0) {
      let textSegment = "";

      const hundreds = Math.floor(digit / 100);
      const remainder = digit % 100;

      if (hundreds > 0) {
        textSegment += ones[hundreds] + " Hundred";
      }

      if (remainder >= 20) {
        if (hundreds > 0) textSegment += " ";
        textSegment += tens[Math.floor(remainder / 10)];
        const onesDigit = remainder % 10;
        if (onesDigit > 0) {
          textSegment += " " + ones[onesDigit];
        }
      } else if (remainder >= 10) {
        if (hundreds > 0) textSegment += " ";
        textSegment += teens[remainder - 10];
      } else if (remainder > 0) {
        if (hundreds > 0) textSegment += " ";
        textSegment += ones[remainder];
      }

      if (scaleIndex > 0) {
        textSegment += " " + scales[scaleIndex];
      }
      result = textSegment + (result.length > 0 ? " " : "") + result;
    }

    tempNum = Math.floor(tempNum / 1000);
    scaleIndex++;
  }

  // Add "Baht"
  result += " Baht";

  // Add satang if present
  if (fracPart > 0) {
    result +=
      " and " +
      numberToEnglishWords(fracPart)
        .replace(" Baht", "")
        .replace(" and ", " ") +
      " Satang";
  } else {
    result += " Only";
  }

  return result;
};
