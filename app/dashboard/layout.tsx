import type { Metadata } from "next";
import Layout from "@/components/Layout";
import "material-symbols";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: "Dashboard Admin",
  description: "Admin Dashboard Management",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Layout>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={3000} // ปิดอัตโนมัติ 3 วิ
        limit={5}
        hideProgressBar={false} // แถบ progress
        newestOnTop={true} // toast ใหม่ขึ้นบน
        closeOnClick // คลิกเพื่อปิด
        rtl={false}
        pauseOnFocusLoss
        draggable // ลากย้ายตำแหน่งได้
        pauseOnHover // hover แล้วหยุดเวลา
        theme="light" // แบบ colored (info=ฟ้า, success=เขียว, error=แดง, warning=ส้ม)
      />
    </Layout>
  );
}
