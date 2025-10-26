import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: [
      "sharp",
      "@aws-sdk/client-s3",
      "@aws-sdk/client-rekognition",
    ],
  },
};

export default nextConfig;
