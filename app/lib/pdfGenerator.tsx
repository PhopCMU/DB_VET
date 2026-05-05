import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: typeof autoTable;
    getNumberOfPages(): number;
  }
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
      currentY + 17
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
      { align: "right" }
    );
  }

  // Save the PDF
  doc.save(
    `ผลประเมิน_${user.fullname_th}_${new Date().toISOString().slice(0, 10)}.pdf`
  );
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
