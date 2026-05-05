import { useUser } from "@/app/context/UserContext";
import { CmuvcInternRA } from "@/app/model/cmuvc/dashboardModel";
import Loading from "@/components/Loadings/Loading";
import { useRef, useState } from "react";

// หน้ารายชื่อผู้เข้าร่วม Internship + RA
export default function InternshipRAtList() {
  type FormMode = "add" | "edit";
  const [intern_RA, setIntern_RA] = useState<CmuvcInternRA[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isModalConfirmOpen, setIsModalConfirmOpen] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<FormMode>("add");
  const [currentVets, setCurrentVets] = useState<CmuvcInternRA | null>(null);
  const [onUploadProgress, setOnUploadProgress] = useState<number>(0);
  const hasData = useRef(false);
  const { userData, loading } = useUser();

  if (loading) return <Loading />;

  const fetchData = async () => {};

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">รายชื่อผู้เข้าร่วมทั้งหมด</h1>
      <p>หน้านี้สำหรับแสดงรายชื่อผู้เข้าร่วมทั้งหมด</p>
    </div>
  );
}
