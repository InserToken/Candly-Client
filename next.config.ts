// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1) ESLint 오류 무시
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 2) TypeScript 타입 검사 무시
  typescript: {
    ignoreBuildErrors: true,
  },
  // 3) 기존 이미지 도메인 설정
  images: {
    domains: ["static.toss.im", "img.hankyung.com", "rcd1.rassiro.com"],
  },
};

export default nextConfig;
