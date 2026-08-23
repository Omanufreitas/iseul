import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Upload de imagem de produto (até 2 MB + overhead do multipart)
      bodySizeLimit: "3mb",
    },
  },
};

export default nextConfig;
