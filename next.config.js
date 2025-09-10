/** @type {import('next').NextConfig} */
require('dotenv').config();
const nextConfig = {
    images: {
        domains: ['source.unsplash.com'],
    },
    reactStrictMode: false,
    env: {
        BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        AES_TOKEN: process.env.AES_TOKEN,
        HMAC_TOKEN: process.env.HMAC_TOKEN
    },
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },

}

module.exports = nextConfig
