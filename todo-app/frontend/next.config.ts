import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Turbopack configuration (default in Next.js 16)
  // Turbopack handles module resolution automatically, so empty config is sufficient
  turbopack: {},
  // Webpack configuration (for use with --webpack flag)
  webpack: (config) => {
    // Ensure webpack resolves modules from the frontend directory first
    const frontendNodeModules = path.resolve(__dirname, "node_modules");
    config.resolve.modules = [
      frontendNodeModules,
      ...(config.resolve.modules || []).filter(
        (m: string) => path.resolve(m) !== frontendNodeModules
      ),
    ];
    
    return config;
  },
};

export default nextConfig;
