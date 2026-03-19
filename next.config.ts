import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Lock Next.js root to this app folder to avoid mixed-root manifest issues.
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    optimizePackageImports: ["antd", "@ant-design/icons", "@ant-design/charts", "@ant-design/plots", "react-icons"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["images.unsplash.com", "lnkly.tech", "fonts.googleapis.com"],
  },
};

export default nextConfig;
