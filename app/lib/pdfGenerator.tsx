import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable;
    getNumberOfPages(): number;
  }
}

/**
 * ReceiptData — A5 CMU tax invoice (matches /docs/Ex_.jpg reference)
 */
export interface ReceiptData {
  // ── [DB] pulled from database ──────────────────────────────────────────────
  customerName: string; // ชื่อลูกค้า
  customerAddress: string; // ที่อยู่
  customerTaxId: string; // เลขประจำตัวผู้เสียภาษี
  description: string; // รายการ (may be multi-line)
  totalPrice: number; // ราคารวม
  amountInWords: string; // จำนวนเงิน(ตัวอักษร) Thai  e.g. "สี่พันบาทถ้วน"
  // ── optional / auto-generated ──────────────────────────────────────────────
  amountInWordsEN?: string; // Amount in Words (English)
  docNumber?: string; // receipt number (auto if omitted)
  date?: string; // formatted date string (auto = today Buddhist Era)
  vatRate?: number; // 0 = VAT-exempt (default), 7 = 7% VAT
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

// ─── Helpers for generateReceiptPDF ─────────────────────────────────────────

/** Load a /public font file as base64 string for jsPDF addFileToVFS */
async function loadFontAsBase64(publicPath: string): Promise<string> {
  try {
    const res = await fetch(publicPath);
    if (!res.ok) return "";
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    const chunk = 8192;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(
        ...Array.from(bytes.subarray(i, i + chunk)),
      );
    }
    return btoa(binary);
  } catch {
    return "";
  }
}

/** Format a Date as Thai Buddhist-Era string: "12 พฤษภาคม 2569/ 12 MAY 2026" */
function getThaiBuddhistDate(d: Date = new Date()): string {
  const thMonth = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const enMonth = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  const m = d.getMonth();
  return `${d.getDate()} ${thMonth[m]} ${d.getFullYear() + 543}/ ${d.getDate()} ${enMonth[m]} ${d.getFullYear()}`;
}

/**
 * Generate A6 CMU Tax Invoice PDF (half of A5 = 105×148mm)
 * Layout matches /docs/Ex_.jpg — two-column header, items table,
 * summary, footer, and e-signature block.
 *
 * E-sign image must be placed at:  public/docs/e-sign.png
 */
export async function generateReceiptPDF(data: ReceiptData): Promise<void> {
  // ── Page setup (A6 = 105×148mm) ─────────────────────────────────────────
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a6" });
  const pageW = 105;
  const margin = 8;

  // ── Thai font (THSarabunNew from /public/fonts/SarabunNew/) ────────────
  const FONT_NAME = "THSarabunNew";
  let usedFont = "helvetica";
  try {
    const [regular, bold] = await Promise.all([
      loadFontAsBase64("/fonts/SarabunNew/THSarabunNew.ttf"),
      loadFontAsBase64("/fonts/SarabunNew/THSarabunNew Bold.ttf"),
    ]);
    if (regular) {
      doc.addFileToVFS("THSarabunNew.ttf", regular);
      doc.addFont("THSarabunNew.ttf", FONT_NAME, "normal");
    }
    if (bold) {
      doc.addFileToVFS("THSarabunNew-Bold.ttf", bold);
      doc.addFont("THSarabunNew-Bold.ttf", FONT_NAME, "bold");
    }
    if (regular && bold) usedFont = FONT_NAME;
  } catch {
    /* fallback to helvetica */
  }

  // ── E-sign image (public/docs/e-sign.png) ───────────────────────────────
  let eSignDataUrl: string | null = null;
  try {
    const b64 = await loadFontAsBase64("/docs/e-sign.png");
    if (b64) eSignDataUrl = `data:image/png;base64,${b64}`;
  } catch {
    /* no e-sign — leave blank */
  }

  // ── Colours ──────────────────────────────────────────────────────────────
  const navy: [number, number, number] = [26, 60, 124];
  const black: [number, number, number] = [0, 0, 0];
  const gray: [number, number, number] = [85, 85, 85];
  const lightBg: [number, number, number] = [245, 245, 245];

  // ── Layout constants (A6, scaled ≈ 70% of A5) ───────────────────────────
  const col1X = margin; // 8 mm  — left edge
  const col2X = pageW - margin; // 97 mm — right edge
  const midX = pageW / 2; // 52.5 mm
  const colW = 42; // max column width for 2-col wrapping
  const lineH = 2.8; // detail-text line pitch
  let y = margin;

  const setF = (style: "normal" | "bold", size: number) => {
    doc.setFont(usedFont, style);
    doc.setFontSize(size);
  };
  // splitTextToSize helper capped at colW (42mm) for header columns
  const splitR = (text: string, w = colW): string[] =>
    doc.splitTextToSize(text, w) as string[];

  // ─────────────────────────────────────────────────────────────────────────
  // A  TWO-COLUMN HEADER
  // ─────────────────────────────────────────────────────────────────────────
  setF("bold", 6);
  doc.setTextColor(...navy);

  // Wrap long org names to colW so left/right columns don't collide
  const leftTitleLines = splitR("มหาวิทยาลัยเชียงใหม่");
  const rightTitleLines = splitR("คณะสัตวแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่");

  leftTitleLines.forEach((l, i) => {
    doc.text(l, col1X, y + i * lineH);
  });
  rightTitleLines.forEach((l, i) => {
    doc.text(l, col2X, y + i * lineH, { align: "right" });
  });

  let yL = y + leftTitleLines.length * lineH;
  let yR = y + rightTitleLines.length * lineH;

  setF("normal", 5);
  doc.setTextColor(...black);

  const leftHdrLines = [
    "Chiang Mai University",
    "239 ถนนห้วยแก้ว ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200",
    "239 Huaykaew Rd. T.Suthep A.Mueang, Chiang Mai 50200",
    "โทรศัพท์/Tel : 053-941000",
    "เลขประจำตัวผู้เสียภาษีอากร/TIN",
    "099 4 00042317 9",
  ];
  const rightHdrLines = [
    "Faculty of Veterinary Medicine CMU",
    "155 หมู่ 2 ต.แม่เหียะ อ.เมือง จ.เชียงใหม่ 50100",
    "Moo 2 Mae Hia, Mueang, Chiang Mai 50100",
    "โทรศัพท์/Tel : 053-948069",
  ];

  leftHdrLines.forEach((l) => {
    splitR(l).forEach((ll) => {
      doc.text(ll, col1X, yL);
      yL += lineH;
    });
  });
  rightHdrLines.forEach((l) => {
    splitR(l).forEach((ll) => {
      doc.text(ll, col2X, yR, { align: "right" });
      yR += lineH;
    });
  });

  // "ใบกำกับภาษี" centred — placed at row 4 of the detail lines
  const titleY = y + leftTitleLines.length * lineH + lineH * 3.5;
  setF("bold", 6);
  doc.setTextColor(...black);
  doc.text("ใบเสร็จรับเงิน/Receipt", midX, titleY, { align: "center" });

  y = Math.max(yL, yR) + 2;

  // ─────────────────────────────────────────────────────────────────────────
  // B  CUSTOMER INFO (left) + DOCUMENT INFO (right)
  // ─────────────────────────────────────────────────────────────────────────
  setF("normal", 5.5);
  doc.setTextColor(...black);

  const sectionBTop = y;
  doc.text(`ชื่อลูกค้า/Customer Name : ${data.customerName}`, col1X, y);
  doc.text(
    `เลขที่ใบสำคัญรับ/Document No.  ${data.docNumber ?? "draft"}`,
    col2X,
    y,
    { align: "right" },
  );
  y += 3.5;

  const addrLines: string[] = splitR(
    `ที่อยู่/Address : ${data.customerAddress}`,
    60,
  );
  addrLines.forEach((line, i) => {
    doc.text(line, col1X, y + i * 3);
  });

  const dateDisplay = data.date ?? getThaiBuddhistDate();
  doc.text(`วันที่/Date  ${dateDisplay}`, col2X, sectionBTop + 3.5 + 3, {
    align: "right",
  });

  y += addrLines.length * 3 + 1;

  setF("normal", 5);
  doc.text(`(เลขประจำตัวผู้เสียภาษี ${data.customerTaxId})`, col1X, y);
  y += 4;

  // ─────────────────────────────────────────────────────────────────────────
  // C  ITEMS TABLE
  // ─────────────────────────────────────────────────────────────────────────
  const vatRate = data.vatRate ?? 0;
  const subtotal = data.totalPrice;
  const vat =
    vatRate > 0 ? parseFloat(((subtotal * vatRate) / 100).toFixed(2)) : 0;
  const total = subtotal + vat;
  const fmtTH = (n: number) =>
    n.toLocaleString("th-TH", { minimumFractionDigits: 2 });

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [
      [
        { content: "ใบแจ้งหนี้/INV.", styles: { halign: "center" } },
        { content: "ลำดับ/No.", styles: { halign: "center" } },
        { content: "รายการ/Description", styles: { halign: "center" } },
        { content: "ราคารวม/Total", styles: { halign: "right" } },
      ],
    ],
    body: [
      [
        { content: "", styles: { halign: "center" } },
        { content: "1", styles: { halign: "center" } },
        { content: data.description, styles: { halign: "left" } },
        { content: fmtTH(subtotal), styles: { halign: "right" } },
      ],
    ],
    styles: {
      font: usedFont,
      fontSize: 5,
      cellPadding: 1.5,
      lineColor: black,
      lineWidth: 0.2,
      textColor: black,
    },
    headStyles: {
      fillColor: lightBg,
      textColor: black,
      fontStyle: "bold",
      fontSize: 5,
    },
    columnStyles: {
      0: { cellWidth: 14 }, // INV   — 14mm
      1: { cellWidth: 8 }, // No    —  8mm
      2: { cellWidth: 49 }, // Desc  — 49mm
      3: { cellWidth: 18 }, // Total — 18mm  (sum = 89mm = pageW – 2*margin)
    },
    theme: "grid" as const,
  });

  y = (doc as any).lastAutoTable.finalY + 2;

  // ─────────────────────────────────────────────────────────────────────────
  // D  SUMMARY (left labels / right values, full-width underlines)
  // ─────────────────────────────────────────────────────────────────────────
  type SRow = { label: string; value: string; bold: boolean };
  const summaryRows: SRow[] = [
    {
      label: "มูลค่าสินค้าหรือบริการก่อนภาษีมูลค่าเพิ่ม/Exclude VAT",
      value: fmtTH(subtotal),
      bold: false,
    },
    { label: "ภาษีมูลค่าเพิ่ม 7%/VAT", value: fmtTH(vat), bold: false },
    { label: "จำนวนเงินรวม/Total", value: fmtTH(total), bold: true },
  ];

  summaryRows.forEach(({ label, value, bold }, i) => {
    setF(bold ? "bold" : "normal", 5);
    doc.setTextColor(...black);
    doc.text(label, col1X, y);
    doc.text(value, col2X, y, { align: "right" });

    const isLast = i === summaryRows.length - 1;
    doc.setDrawColor(
      ...(isLast ? black : ([200, 200, 200] as [number, number, number])),
    );
    doc.setLineWidth(isLast ? 0.3 : 0.1);
    doc.line(col1X, y + 1, col2X, y + 1);

    y += 4;
  });

  y += 2;

  // ─────────────────────────────────────────────────────────────────────────
  // E  FOOTER
  // ─────────────────────────────────────────────────────────────────────────
  setF("bold", 5.5);
  doc.setTextColor(...black);
  doc.text(`จำนวนเงิน(ตัวอักษร) :  ${data.amountInWords}`, col1X, y);
  y += 3.5;

  setF("normal", 5.5);
  if (data.amountInWordsEN) {
    doc.text(`Amount in Words : ${data.amountInWordsEN}`, col1X, y);
    y += 3.5;
  }

  doc.text("ช่องทางการชำระเงิน/Pay By : ธนาคารส่วนงาน", col1X, y);
  y += 5;
  doc.text("ชำระโดย/By………………………………………………", col1X, y);
  y += 4;

  setF("normal", 5);
  doc.setTextColor(...gray);
  doc.text("เงินโอนเข้า SCB#12002-0", col1X, y);
  y += 4;

  // ─────────────────────────────────────────────────────────────────────────
  // F  SIGNATURE BLOCK — นางสาววริยา อ้นด้วง  นักการเงินและบัญชี
  // ─────────────────────────────────────────────────────────────────────────
  doc.setTextColor(...black);

  // Right-aligned block: 38mm wide, right edge at col2X (97mm)
  const sigRX = col2X; // 97 mm
  const sigW = 38; // block width
  const sigCX = sigRX - sigW / 2; // centre of block at 78 mm

  if (eSignDataUrl) {
    // Place e-sign image centred in the block (22mm × 10mm)
    try {
      doc.addImage(eSignDataUrl, "PNG", sigCX - 11, y, 22, 10);
    } catch {
      /* ignore render errors — name/title still printed */
    }
    y += 11;
  } else {
    // Blank signature placeholder
    doc.setDrawColor(...([180, 180, 180] as [number, number, number]));
    doc.setLineWidth(0.2);
    doc.line(sigRX - sigW, y + 6, sigRX, y + 6);
    y += 9;
  }

  setF("normal", 5.5);
  doc.setTextColor(...black);
  doc.text("นางสาววริยา อ้นด้วง", sigCX, y, { align: "center" });
  y += 3;
  doc.text("นักการเงินและบัญชี", sigCX, y, { align: "center" });

  // ── Save PDF ─────────────────────────────────────────────────────────────
  const safeDate = (data.date ?? new Date().toISOString().slice(0, 10))
    .replace(/[/\\\s:]+/g, "-")
    .replace(/-{2,}/g, "-");
  doc.save(`receipt-${data.docNumber ?? "draft"}-${safeDate}.pdf`);
}

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
