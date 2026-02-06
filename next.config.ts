import type { NextConfig } from "next";

// next-pwa 패키지를 불러옴 
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", 
  
  // 푸시 알림 로직을 담을 사용자 정의 Service Worker 파일 경로를 지정
  customWorkerDir: "public",
  swSrc: "public/custom-sw.js", 
});


/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};


// withPWA 함수로 nextConfig를 래핑 -> PWA 기능 활성화
module.exports = withPWA(nextConfig);