// next.config.ts

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["static.toss.im", "img.hankyung.com"], // ✅ 필요한 도메인들 모두 추가
  },
};

export default nextConfig;
