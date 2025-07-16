import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

module.exports = {
  images: {
    domains: ["img.hankyung.com"], // ← 이 부분 추가
  },
};

export default nextConfig;
