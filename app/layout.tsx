import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "material-symbols";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  description: "Dashboard Admin",
};

const notoSansThai = localFont({
  src: [
    {
      path: "../public/fonts/NotoSansThai/NotoSansThai-Thin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/fonts/NotoSansThai/NotoSansThai-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    // เพิ่มน้ำหนักอื่นๆ ในทำนองเดียวกัน
  ],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={notoSansThai.className}>
      <body className={`w-full h-full`}>{children}</body>
    </html>
  );
}
