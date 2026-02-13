import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "insuremo.com",
        port: "",
        pathname: "/en/wp-content/uploads/sites/7/2025/03/**",
      },
    ],
  },

  poweredByHeader: false,

  env: {
    NEXT_PUBLIC_SITE_NAME: "Insuremo",
  },
};

export default nextConfig;
