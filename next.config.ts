import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ปิด React Strict Mode ใน production เพื่อลด overhead
  reactStrictMode: false,

  // ปิด ESLint และ TypeScript errors ระหว่าง build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // กำหนด images remote patterns
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vmapi.vet.cmu.ac.th",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/uploads/**",
      },
    ],
    // ป้องกันการแคชรูปภาพมากเกินไป
    minimumCacheTTL: 60, // แคชขั้นต่ำ 60 วินาที
    unoptimized: false, // เปิด optimization รูปภาพ
  },

  // ลด logging ใน production
  logging: {
    fetches: {
      fullUrl: false,
    },
  },

  // ป้องกันการแคชหน้าเพจ
  async headers() {
    return [
      {
        // ใช้กับทุกหน้า
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
    ];
  },

  // ปิด trailingSlash เพื่อความสอดคล้องของ URL
  trailingSlash: false,

  // ปิด source maps ใน production
  productionBrowserSourceMaps: false,

  // เพิ่มการตั้งค่าเพิ่มเติมสำหรับ production
  poweredByHeader: false, // ปิด X-Powered-By header เพื่อความปลอดภัย
  compress: true, // เปิด compression เพื่อลดขนาด response
};

export default nextConfig;
