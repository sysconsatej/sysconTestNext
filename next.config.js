/** @type {import('next').NextConfig} */
require("dotenv").config();

const nextConfig = {
  images: {
    domains: ["source.unsplash.com"],
  },
  reactStrictMode: false,
  env: {
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    AES_TOKEN: process.env.AES_TOKEN,
    HMAC_TOKEN: process.env.HMAC_TOKEN,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  webpack(config) {
    // ✅ Treat PDF.js worker files as assets (not JS chunks to minify)
    config.module.rules.push({
      test: /pdf\.worker(\.min)?\.(js|mjs)$/,
      type: "asset/resource",
    });

    return config;
  },
};

module.exports = nextConfig;