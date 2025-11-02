import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    svgr: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      // 만약 다른 이미지 도메인도 사용한다면 여기에 추가하면 됩니다.
    ],
  }
};


export default nextConfig;
