import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 图片优化
  images: {
    // 或者使用 remotePatterns 配置（Next.js 12.2+）
    remotePatterns: [
      {
        protocol: "https",
        hostname: "insuremo.com",
        port: "",
        pathname: "/en/wp-content/uploads/sites/7/2025/03/**",
      },
    ],
  },

  // 性能优化
  swcMinify: true,
  poweredByHeader: false,

  // 实验性功能
  experimental: {
    cacheComponents: true,
  },

  // 环境变量
  env: {
    NEXT_PUBLIC_SITE_NAME: "Insuremo",
  },
};

export default nextConfig;
