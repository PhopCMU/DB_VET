"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GetSponsors_Vetrun } from "@/app/routers/vetrun/GetRouter";
import { config } from "@/config/config_api";
import { Post_UpdateSponsorCryptoJS } from "@/app/routers/vetrun/PostRouter";
import ToastNotification from "@/components/Tooltips/ToastNotification";
import { LoadingModal } from "@/components/Modal";
import { DeleteVetrunSponsorLogo } from "@/app/routers/vetrun/DeleteRouter";
import { AlertConfirm } from "@/components/AlertMessage";
import { useToast } from "@/app/hooks/useToast";
import { useVisitor } from "@/lib/fingerprintjs-shim";
import { usePermission } from "@/app/context/UsePermission";

type SponsorType =
  | "Bronze"
  | "Silver"
  | "Gold"
  | "Platinum"
  | "Diamond"
  | "Titanium";

type Sponsor = {
  sponsorId?: string | number;
  name: string;
  image: string; // สำหรับ preview (data URL)
  imageFile?: File; // 👈 ใช้เก็บไฟล์จริง (binary)
  link: string;
  price: string;
  type: SponsorType;
};
const SUB_MENU_ID = "9b940740-d1e9-4a41-af0d-4e1faa90464d";
const PRODUCT_ID = "d3a154e2-9e0a-48e6-b69b-63f3c7c9f406";

export default function AddLogoSponsors() {
  const [logoSponsors, setLogoSponsors] = useState<Sponsor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [onUploadProgress, setUploadProgress] = useState<number>(0);
  const [sponsorId, setSponsorId] = useState<string | number>("");

  const [sponsors, setSponsors] = useState<Sponsor[]>([
    {
      name: "",
      image: "",
      link: "",
      price: "",
      type: "Bronze",
    },
  ]);
  const { data } = useVisitor();

  const { toast, showToast, hideToast } = useToast();

  const { canCreate, canDelete } = usePermission(SUB_MENU_ID, PRODUCT_ID);

  const visitorId = data ? data?.visitorId : null;

  const fetchDataLogoSponsors = async () => {
    try {
      const response: any = await GetSponsors_Vetrun();
      if (response.success && Array.isArray(response.data)) {
        setLogoSponsors(response.data);
      } else {
        setLogoSponsors([]);
      }
    } catch (error) {
      console.error("Failed to fetch sponsors:", error);
      setLogoSponsors([]);
    }
  };

  useEffect(() => {
    fetchDataLogoSponsors();
  }, []);

  const handleChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const updatedSponsors = [...sponsors];
    updatedSponsors[index] = { ...updatedSponsors[index], [name]: value };

    if (
      name === "image" &&
      e.target instanceof HTMLInputElement &&
      e.target.files?.[0]
    ) {
      const file = e.target.files[0];

      updatedSponsors[index] = {
        ...updatedSponsors[index],
        image: URL.createObjectURL(file),
        imageFile: file, //
      };
    }

    setSponsors(updatedSponsors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sponsor = sponsors[0];

    if (!sponsor.name)
      return showToast("Please fill in Sponsor Name field.", "warning");
    if (!sponsor.link)
      return showToast("Please fill in Website Link field.", "warning");
    if (!sponsor.price)
      return showToast("Please fill in Sponsorship Amount field.", "warning");
    if (!sponsor.type)
      return showToast("Please fill in Sponsorship Tier field.", "warning");

    if (!sponsor.imageFile) return showToast("Please upload image.", "warning");

    setIsLoading(true);
    setUploadProgress(0);

    if (!sponsor.imageFile?.name) {
      showToast("Please upload both files.", "warning");
      setIsLoading(false);
    }

    const formDataToSend = new FormData();
    formDataToSend.append("imageFile", sponsor.imageFile);
    formDataToSend.append("name", sponsor.name);
    formDataToSend.append("link", sponsor.link);
    formDataToSend.append("price", sponsor.price);
    formDataToSend.append("type", sponsor.type);
    const visitorIdValue = await visitorId;
    const response = await Post_UpdateSponsorCryptoJS(
      formDataToSend,
      visitorIdValue,
      setUploadProgress,
    );

    if (response.success) {
      setTimeout(async () => {
        setIsLoading(false);
        showToast("Upload successful.", "success");
        await fetchDataLogoSponsors();
        setSponsors([
          {
            name: "",
            image: "",
            link: "",
            price: "",
            type: "Bronze",
          },
        ]);
      }, 1000);
    }
  };

  const handleConfirmDeleteSponsor = (sponsor: Sponsor) => {
    if (canDelete) {
      setIsConfirmOpen(true);
      setSponsorId(sponsor.sponsorId ?? "");
    }
  };

  const handleDeleteSponsor = async () => {
    try {
      if (typeof sponsorId !== "string")
        return showToast("Invalid sponsor ID.", "warning");

      setIsLoading(true);
      setUploadProgress(0);

      const response = await DeleteVetrunSponsorLogo(
        sponsorId,
        visitorId,
        setUploadProgress,
      );

      if (response.success) {
        setTimeout(async () => {
          await fetchDataLogoSponsors();
          setIsLoading(false);
          showToast("Delete successful.", "success");
        }, 1000);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-3 h-full w-full bg-gradient-to-br from-blue-50 to-purple-50 p-3 text-xs">
      {/* Toast Notification */}
      <ToastNotification
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      {/* Loading Indicator */}
      <LoadingModal isOpen={isLoading} progress={onUploadProgress} />

      {/* Alert Confirm */}

      {isConfirmOpen && (
        <AlertConfirm
          message="คุณต้องการลบข้อมูลนี้ใช่หรือไม่?"
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDeleteSponsor}
        />
      )}

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6 overflow-y-auto border border-gray-100"
      >
        <AddSponsorForm
          sponsors={sponsors}
          handleChange={handleChange}
          handleSubmit={canCreate && handleSubmit}
          refreshSponsors={fetchDataLogoSponsors}
        />
      </motion.div>

      {/* Sponsor Display Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 overflow-y-auto border border-gray-100"
      >
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
          Sponsor Gallery
        </h2>

        {["Diamond", "Platinum", "Titanium", "Gold", "Silver", "Bronze"].map(
          (type) => {
            const filtered = logoSponsors.filter((s) => s.type === type);
            if (filtered.length === 0) return null;

            return (
              <div key={type} className="mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className={getTypeIconStyle(type)}>
                    {getTypeIcon(type)}
                  </span>
                  <span className={getTypeTextStyle(type)}>
                    {type} Sponsors
                  </span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filtered.map((sponsor, index) => (
                    <motion.div
                      key={sponsor.sponsorId || `${type}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.05 }}
                      className={`p-1 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition-all ${getTypeCardBg(
                        type,
                      )} relative group`} // เพิ่ม relative และ group
                    >
                      {/* ปุ่มลบ */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // ป้องกันการ bubbling ไป triggering การคลิกที่ card
                          handleConfirmDeleteSponsor(sponsor);
                        }}
                        className={`${
                          canDelete
                            ? "bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            : "bg-gray-400 text-white rounded hover:bg-gray-500 cursor-not-allowed absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        }"  pt-1 px-1 shadow-md z-10" `}
                        aria-label="Delete sponsor"
                      >
                        <span
                          className="material-symbols-outlined "
                          style={{ fontSize: "16px" }}
                        >
                          {canDelete ? "delete" : "delete_forever"}
                        </span>
                      </button>

                      <img
                        src={
                          sponsor.image
                            ? `${config.URL_API}/uploads/dataVetRun/logo_sponsors/${sponsor.image}`
                            : "/placeholder.svg?height=80&text=No+Image"
                        }
                        alt={sponsor.name}
                        className="w-full h-20 object-contain mx-auto"
                        loading="lazy"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          },
        )}
      </motion.div>
    </div>
  );
}

// Helper functions for styling
const getTypeIcon = (type: string) => {
  switch (type) {
    case "Diamond":
      return "💎";
    case "Platinum":
      return "🥈";
    case "Titanium":
      return "⚙️";
    case "Gold":
      return "🌟";
    case "Silver":
      return "⭐";
    case "Bronze":
      return "🥉";
    default:
      return "🏢";
  }
};

const getTypeIconStyle = (type: string) => {
  switch (type) {
    case "Diamond":
      return "text-yellow-500";
    case "Platinum":
      return "text-gray-400";
    case "Titanium":
      return "text-blue-500";
    case "Gold":
      return "text-yellow-400";
    case "Silver":
      return "text-gray-500";
    case "Bronze":
      return "text-orange-600";
    default:
      return "text-gray-600";
  }
};

const getTypeTextStyle = (type: string) => {
  switch (type) {
    case "Diamond":
      return "text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-300";
    case "Platinum":
      return "text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-200";
    case "Titanium":
      return "text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-300";
    case "Gold":
      return "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-200";
    case "Silver":
      return "text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-300";
    case "Bronze":
      return "text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400";
    default:
      return "text-gray-600";
  }
};

const getTypeCardBg = (type: string) => {
  switch (type) {
    case "Diamond":
      return "bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-100";
    case "Platinum":
      return "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100";
    case "Titanium":
      return "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100";
    case "Gold":
      return "bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-100";
    case "Silver":
      return "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-100";
    case "Bronze":
      return "bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-100";
    default:
      return "bg-white";
  }
};

// Form Component
const AddSponsorForm = ({
  sponsors,
  handleChange,
  handleSubmit,
  refreshSponsors,
}: {
  sponsors: Sponsor[];
  handleChange: (index: number, e: React.ChangeEvent<any>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  refreshSponsors: () => void;
}) => {
  const { canCreate } = usePermission(SUB_MENU_ID, PRODUCT_ID);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Add New Sponsor
        </h1>
        <button
          type="button"
          onClick={refreshSponsors}
          className="flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
        >
          <span>🔄</span>
          <span>Refresh</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {sponsors.map((sponsor, index) => (
          <div
            key={index}
            className="border border-gray-200 p-5 rounded-xl bg-gradient-to-br from-gray-50 to-white"
          >
            <h2 className="font-semibold text-gray-700 mb-4 flex items-center">
              <span className="w-6 h-6 flex items-center justify-center bg-blue-500 text-white rounded-full mr-2 text-sm">
                {index + 1}
              </span>
              Sponsor Details
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <InputField
                  label="Sponsor Name"
                  name="name"
                  value={sponsor.name}
                  onChange={(e: any) => handleChange(index, e)}
                />
                <InputField
                  label="Website Link"
                  name="link"
                  value={sponsor.link}
                  onChange={(e: any) => handleChange(index, e)}
                  type="url"
                  placeholder="https://example.com"
                />
                <InputField
                  label="Sponsorship Amount"
                  name="price"
                  value={sponsor.price}
                  onChange={(e: any) => handleChange(index, e)}
                  placeholder="e.g. $5,000"
                />
                <SelectField
                  label="Sponsorship Tier"
                  name="type"
                  value={sponsor.type}
                  onChange={(e: any) => handleChange(index, e)}
                >
                  {[
                    "Bronze",
                    "Silver",
                    "Gold",
                    "Platinum",
                    "Diamond",
                    "Titanium",
                  ].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </SelectField>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">
                    Logo Image
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg px-3 py-8 text-center hover:border-blue-400 transition-colors">
                        {sponsor.image ? (
                          <span className="text-green-500">
                            ✓ Image Selected
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            Click to upload logo
                          </span>
                        )}
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          onChange={(e) => handleChange(index, e)}
                          className="hidden"
                        />
                      </div>
                    </label>
                  </div>
                </div>

                {/* Image Preview */}
                <div className="mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">Preview</h3>
                  <div className="border p-3 rounded-lg bg-gradient-to-br from-gray-50 to-white text-center shadow-inner">
                    {sponsor.image ? (
                      <>
                        <img
                          src={sponsor.image}
                          alt="Preview"
                          className="w-full h-24 object-contain mx-auto mb-2"
                        />
                        <p className="text-sm font-medium truncate">
                          {sponsor.name || "Sponsor Name"}
                        </p>
                        <p
                          className={`text-xs ${getTypeTextStyle(
                            sponsor.type,
                          )}`}
                        >
                          {sponsor.type}
                        </p>
                      </>
                    ) : (
                      <div className="w-full h-24 flex flex-col items-center justify-center text-gray-400">
                        <svg
                          className="w-8 h-8 mb-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>No image selected</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex flex-wrap gap-3">
          <motion.button
            type={canCreate ? "submit" : "button"}
            whileHover={canCreate ? { scale: 1.03 } : {}}
            whileTap={canCreate ? { scale: 0.98 } : {}}
            className={`relative overflow-hidden flex items-center gap-2 px-5 py-2.5 rounded-xl shadow-md transition-all duration-300 ${
              canCreate
                ? "bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/20"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {/* Animated background for active state */}
            {canCreate && (
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              />
            )}

            <span className="material-symbols-outlined text-lg z-10">
              {canCreate ? "save" : "block"}
            </span>

            <span className="font-medium z-10">
              {canCreate ? "เพิ่มรูปผู้สนับสนุน" : "ไม่มีสิทธิ์เข้าถึง"}
            </span>

            {/* Shine effect on hover */}
            {canCreate && (
              <motion.span
                className="absolute top-0 left-0 w-1/3 h-full bg-white/30 -skew-x-12"
                initial={{ x: "-150%" }}
                whileHover={{ x: "250%" }}
                transition={{ duration: 0.7 }}
              />
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

// Subcomponents
const InputField = ({ label, ...props }: any) => (
  <div>
    <label className="block font-medium text-gray-700 mb-1">{label}</label>
    <input
      {...props}
      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 "
    />
  </div>
);

const SelectField = ({ label, children, ...props }: any) => (
  <div>
    <label className="block font-medium text-gray-700 mb-1">{label}</label>
    <select
      {...props}
      className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 "
    >
      {children}
    </select>
  </div>
);
