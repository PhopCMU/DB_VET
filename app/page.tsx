"use client";

import images from "@/constant/images";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { AuthServiceCmu } from "./routers/authServer";
import {
  LogIn,
  LogOut,
  Loader2,
  Info,
  X,
  Shield,
  Building2,
  Sparkles,
  Fingerprint,
  Lock,
  HelpCircle,
  Mail,
  Phone,
  Clock,
  AlertTriangle,
  BookOpen,
  ShieldCheck,
  Smartphone,
  ArrowUpFromLine,
} from "lucide-react";
import packageVsersion from "../package.json";

export default function Home() {
  const [alertMessage, setAlertMessage] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleClose = () => {
    setAlertMessage(false);
  };

  const authUrlBase = process.env.NEXT_PUBLIC_AUTH_URL ?? "";
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID ?? "";
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI ?? "";
  const scope = process.env.NEXT_PUBLIC_SCOPE ?? "";
  const responseType = "code";

  const handleChangeDashboard = async () => {
    setIsLoading(true);
    try {
      await AuthServiceCmu({
        authUrlBase,
        clientId,
        redirectUri,
        scope,
        responseType,
      });
    } catch (error) {
      console.error("Authentication failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 30, 0, -30, 0],
            y: [0, -30, 0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -40, 0, 40, 0],
            y: [0, 40, 0, -40, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-indigo-400/15 to-pink-400/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-blue-400/30 rounded-full"
            animate={{
              y: [null, -30, 0, 30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full min-h-screen flex flex-col justify-center items-center p-4 sm:p-6">
        <div className="container max-w-5xl w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full"
          >
            {/* Main Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Login Card - Left (3 columns) */}
              <div className="lg:col-span-3">
                <div className="relative bg-white/70 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/40 shadow-blue-500/5 h-full">
                  {/* Animated Gradient Border */}
                  <motion.div
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-1.5 bg-gradient-to-r from-[#325e8c] via-[#9878b0] to-[#325e8c] bg-[length:200%_auto]"
                  />

                  <div className="p-6 sm:p-8 lg:p-10">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative">
                        <motion.div
                          animate={{
                            scale: [1, 1.02, 1],
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="absolute inset-0 bg-gradient-to-r from-[#9878b0]/30 to-[#325e8c]/30 rounded-full blur-2xl"
                        />
                        <motion.div
                          whileHover={{
                            scale: 1.05,
                            rotate: [0, -3, 3, 0],
                            transition: { duration: 0.5 },
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          className="relative"
                        >
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#9878b0]/20 to-[#325e8c]/20 blur-md" />
                          <Image
                            src={images.logo}
                            alt="Logo CMUVC"
                            width={110}
                            height={110}
                            className="object-cover rounded-full border-4 border-white/90 shadow-xl"
                            priority
                          />
                        </motion.div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="mt-4 text-center"
                      >
                        <div className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-[#325e8c] via-[#9878b0] to-[#325e8c] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
                          ระบบสารสนเทศ
                        </div>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 8,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Building2 className="w-3.5 h-3.5 text-stone-400" />
                          </motion.div>
                          <p className="text-stone-600 font-medium text-sm">
                            คณะสัตวแพทยศาสตร์ มหาวิทยาลัยเชียงใหม่
                          </p>
                        </div>
                      </motion.div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                        <Image
                          src={images.microsoft}
                          alt="Microsoft"
                          width={100}
                          height={100}
                          className="object-contain"
                        />

                        <div className="w-px h-6 bg-stone-300" />

                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-semibold text-stone-700">
                            Microsoft Entra ID
                          </span>
                        </div>

                        <div className="w-px h-6 bg-stone-300" />

                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-indigo-600" />
                          <span className="text-xs font-semibold text-indigo-700">
                            2FA Required
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Alert Message */}
                    {alertMessage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-5 overflow-hidden"
                      >
                        <div className="bg-blue-50/90 backdrop-blur-sm border border-blue-200/60 text-blue-700 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="p-1.5 bg-blue-100 rounded-lg shrink-0"
                          >
                            <Info className="w-4 h-4 text-blue-600" />
                          </motion.div>
                          <span className="text-sm font-medium flex-1">
                            เข้าสู่ระบบด้วย CMU IT Account
                            เพื่อใช้งานระบบสารสนเทศ
                          </span>
                          <button
                            onClick={handleClose}
                            className="p-1 hover:bg-blue-100 rounded-lg transition-all duration-200 shrink-0 hover:scale-110"
                          >
                            <X className="w-4 h-4 text-blue-600" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    <div className="mb-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                      <div className="flex gap-3">
                        <div className="p-2 rounded-xl bg-indigo-100">
                          <Smartphone className="w-5 h-5 text-indigo-600" />
                        </div>

                        <div>
                          <p className="font-semibold text-indigo-700">
                            Microsoft Authenticator
                          </p>

                          <p className="text-xs text-indigo-600 mt-1 leading-relaxed">
                            หลังจากเข้าสู่ระบบด้วย CMU IT Account
                            ระบบจะส่งคำขอยืนยันตัวตนไปยังแอป
                            <strong> Microsoft Authenticator </strong>
                            กรุณากด <strong>Approve</strong>
                            เพื่อเข้าสู่ระบบ
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Login Button */}
                    <motion.button
                      whileHover={
                        !isLoading
                          ? {
                              scale: 1.02,
                              y: -2,
                              transition: { duration: 0.2 },
                            }
                          : {}
                      }
                      whileTap={!isLoading ? { scale: 0.98 } : {}}
                      onClick={handleChangeDashboard}
                      disabled={isLoading}
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                      className={`w-full py-3.5 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 font-medium relative overflow-hidden group
                        ${
                          isLoading
                            ? "bg-stone-100 cursor-not-allowed text-stone-400"
                            : "bg-white border-2 border-[#325e8c] hover:bg-[#325e8c] hover:text-white text-[#325e8c] shadow-lg hover:shadow-xl hover:shadow-[#325e8c]/20"
                        }`}
                    >
                      {!isLoading && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-[#325e8c] to-[#1e3a5f]"
                          initial={{ x: "-100%" }}
                          animate={{ x: isHovered ? "0%" : "-100%" }}
                          transition={{
                            duration: 0.4,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      )}

                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 text-[#325e8c] animate-spin" />
                          <span className="text-[#325e8c] font-medium relative z-10">
                            กำลังดำเนินการ...
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="relative z-10 flex items-center gap-3">
                            <motion.div
                              animate={
                                isHovered ? { rotate: 360 } : { rotate: 0 }
                              }
                              transition={{ duration: 0.6 }}
                            >
                              <Image
                                src={images.logocmu ?? ""}
                                alt="CMU Logo"
                                width={32}
                                height={32}
                                className="object-contain transition-all duration-300 rounded-full group-hover:scale-110 group-hover:rotate-12"
                              />
                            </motion.div>
                            <span className="font-semibold transition-colors duration-300">
                              เข้าสู่ระบบด้วย CMU IT Account
                            </span>

                            <motion.div
                              animate={{ x: isHovered ? 5 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <LogIn className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                            </motion.div>
                          </div>
                        </>
                      )}
                    </motion.button>
                    <p className="text-center text-xs text-stone-500 mt-3">
                      ใช้บัญชีเดียวกับ CMU Mail และระบบ CMU MIS
                    </p>

                    <p className="text-center text-[11px] text-indigo-600 mt-1">
                      รองรับการยืนยันตัวตนผ่าน Microsoft Authenticator (2FA)
                    </p>

                    {/* Divider */}
                    <div className="relative flex items-center my-5">
                      <div className="flex-grow border-t border-stone-200" />
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex-shrink mx-3 text-stone-400 text-xs font-medium tracking-wider uppercase"
                      >
                        หรือ
                      </motion.span>
                      <div className="flex-grow border-t border-stone-200" />
                    </div>

                    {/* Logout Button */}
                    <motion.button
                      whileHover={{
                        scale: 1.02,
                        y: -2,
                        transition: { duration: 0.2 },
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        (location.href =
                          process.env.NEXT_PUBLIC_LOGOUT_URL ?? "")
                      }
                      className="w-full bg-gradient-to-r from-[#325e8c] to-[#1e3a5f] py-3.5 px-4 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:shadow-[#325e8c]/30 transition-all duration-300 flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-[#1e3a5f] to-[#325e8c]"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: "0%" }}
                        transition={{ duration: 0.4 }}
                      />
                      <LogOut className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform" />
                      <span className="relative z-10">
                        ออกจากระบบ CMU IT ACCOUNT
                      </span>
                    </motion.button>

                    {/* Quick Info */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className="mt-5"
                    >
                      <div className="flex items-center gap-2 justify-center px-3 py-2 bg-amber-50/80 border border-amber-200/50 rounded-xl">
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 10, -10, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        </motion.div>
                        <div className="flex flex-col items-center">
                          <p className="text-amber-700 font-semibold text-sm">
                            ใช้ CMU IT Account เดียวกันกับ
                          </p>

                          <p className="text-amber-600 text-xs mt-1">
                            CMU Mail • CMU MIS • Microsoft 365
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Information (2 columns) */}
              <div className="lg:col-span-2 space-y-4">
                {/* How to Use Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-xl overflow-hidden border border-white/40 p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/20">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-stone-800 font-bold text-base">
                        วิธีการใช้งาน
                      </h3>
                      <p className="text-stone-400 text-xs">How to use</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        step: "1",
                        text: 'กดปุ่ม "เข้าสู่ระบบด้วย CMU IT Account"',
                      },
                      {
                        step: "2",
                        text: "ลงชื่อเข้าใช้ด้วย CMU E-Mail และ Password",
                      },
                      {
                        step: "3",
                        text: "เปิดแอป Microsoft Authenticator และกด Approve เพื่อยืนยันตัวตน",
                      },
                      {
                        step: "4",
                        text: "ระบบจะนำท่านเข้าสู่ Dashboard โดยอัตโนมัติ",
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-stone-50/50 transition-colors"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#325e8c]/10 text-[#325e8c] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {item.step}
                        </div>
                        <p className="text-stone-600 text-sm leading-relaxed">
                          {item.text}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Support Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="bg-white/70 backdrop-blur-2xl rounded-2xl shadow-xl overflow-hidden border border-white/40 p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg shadow-red-500/20">
                      <HelpCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-stone-800 font-bold text-base">
                        ต้องการความช่วยเหลือ?
                      </h3>
                      <p className="text-stone-400 text-xs">Need help?</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Cannot Login */}
                    <div className="p-3 bg-amber-50/80 border border-amber-200/50 rounded-xl">
                      <div className="flex items-center gap-2 mb-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span className="text-amber-700 font-semibold text-sm">
                          กรณีเข้าใช้งานไม่ได้
                        </span>
                      </div>
                      <p className="text-stone-600 text-xs leading-relaxed pl-6">
                        หากไม่สามารถเข้าสู่ระบบได้ กรุณาติดต่อผู้ดูแลระบบ
                      </p>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2.5 bg-stone-50/50 rounded-xl hover:bg-stone-100/50 transition-colors">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <Mail className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-stone-400 text-[10px] font-medium">
                            Email
                          </p>
                          <a
                            href="mailto:sophon.m@cmu.ac.th"
                            className="text-[#325e8c] text-sm font-semibold hover:underline"
                          >
                            sophon.m@cmu.ac.th
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2.5 bg-stone-50/50 rounded-xl hover:bg-stone-100/50 transition-colors">
                        <div className="p-1.5 bg-green-100 rounded-lg">
                          <Phone className="w-3.5 h-3.5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-stone-400 text-[10px] font-medium">
                            Phone
                          </p>
                          <a
                            href="tel:+6653948095"
                            className="text-[#325e8c] text-sm font-semibold hover:underline"
                          >
                            053-948095 (ภพ)
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-2.5 bg-stone-50/50 rounded-xl hover:bg-stone-100/50 transition-colors">
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-stone-400 text-[10px] font-medium">
                            เวลาทำการ
                          </p>
                          <span className="text-stone-700 text-sm font-medium">
                            จันทร์ - ศุกร์ 08:30 - 16:30 น.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="flex items-center justify-center gap-4 bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/40"
                >
                  {[
                    {
                      icon: Shield,
                      label: "Secure",
                      color: "text-emerald-500",
                    },
                    {
                      icon: Fingerprint,
                      label: "2FA Enabled",
                      color: "text-[#325e8c]",
                    },
                    {
                      icon: Lock,
                      label: "PDPA Compliant",
                      color: "text-purple-500",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-1.5"
                    >
                      <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                      <span className="text-xs text-stone-500">
                        {item.label}
                      </span>
                      {index < 2 && (
                        <div className="w-px h-3 bg-stone-200 ml-1.5" />
                      )}
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="flex items-center justify-center gap-4 bg-white/50 backdrop-blur-sm rounded-xl p-3 border border-white/40"
                >
                  {[
                    {
                      icon: ArrowUpFromLine,
                      label: packageVsersion.version,
                      color: "text-emerald-500",
                    },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center gap-1.5"
                    >
                      <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                      <span className="text-xs text-stone-500">
                        {item.label}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-center mt-6 space-y-1"
            >
              <p className="text-xs text-stone-400 font-medium">
                © {new Date().getFullYear()} คณะสัตวแพทยศาสตร์
                มหาวิทยาลัยเชียงใหม่
              </p>
              <p className="text-[10px] text-stone-300">
                Faculty of Veterinary Medicine, Chiang Mai University
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Loading Modal */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-md z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-xs w-full mx-4 border border-white/30"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-full">
                <motion.div className="absolute inset-0 rounded-full border-4 border-stone-100" />
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-t-[#325e8c] border-r-[#9878b0] border-b-transparent border-l-transparent"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent border-b-[#325e8c] border-l-[#9878b0]"
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              </div>
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Lock className="w-6 h-6 text-[#325e8c]" />
              </motion.div>
            </div>

            <motion.p
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-stone-800 font-semibold mt-4 text-base"
            >
              กำลังเชื่อมต่อกับ CMU Authentication
            </motion.p>
            <p className="text-stone-400 text-sm mt-1 text-center">
              กรุณายืนยันตัวตนผ่าน Microsoft Authenticator...
            </p>
            <motion.div
              animate={{
                width: ["0%", "100%", "0%"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="h-0.5 bg-gradient-to-r from-[#325e8c] to-[#9878b0] rounded-full mt-3"
            />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
