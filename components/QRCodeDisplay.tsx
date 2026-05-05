"use client";

interface QRCodeDisplayProps {
  base64Data: string;
  altText?: string;
  width?: number;
  height?: number;
}

export default function QRCodeDisplay({
  base64Data,
  altText = "QR Code",
  width = 256,
  height = 256,
}: QRCodeDisplayProps) {
  // ตรวจสอบและเติม prefix ถ้ายังไม่มี
  const imageDataUrl = base64Data.startsWith("data:image/")
    ? base64Data
    : `data:image/png;base64,${base64Data}`;

  return (
    <div style={{ margin: "1rem", textAlign: "center" }}>
      <img
        src={imageDataUrl}
        alt={altText}
        width={width}
        height={height}
        style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        onError={(e) => {
          console.error("Failed to load QR Code image");
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}
