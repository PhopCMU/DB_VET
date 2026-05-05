"use client";
import { ReactNode, useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidedar/Sidebar";
import UserProvider from "@/app/context/UserContext";
import { useTextHeader } from "@/app/hooks/useTextHeader";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <UserProvider>
      <MainLayout>{children}</MainLayout>
    </UserProvider>
  );
}

function MainLayout({ children }: { children: ReactNode }) {
  const [textHeader, setTextHeader] = useTextHeader("Dashboard");

  // โหลดค่าจาก localStorage เมื่อ component โหลด
  useEffect(() => {
    const savedTextHeader = localStorage.getItem("textHeader");
    if (savedTextHeader) {
      setTextHeader(savedTextHeader);
    }
  }, []);

  // บันทึกค่าลง localStorage เมื่อมีการเปลี่ยนแปลง
  const handleSetTextHeader = (text: string) => {
    setTextHeader(text);
    localStorage.setItem("textHeader", text);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header textHeader={textHeader} />
      <div className="flex flex-1">
        <Sidebar setTextHeader={handleSetTextHeader} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-white mt-16 md:ml-64 ml-16">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
