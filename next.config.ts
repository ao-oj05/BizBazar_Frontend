import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  env: {
    API_URL: 'http://34.200.85.73:3001',
  },
};

export default nextConfig;
