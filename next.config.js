/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = { nextConfig, images: { loader: "custom" } }

module.exports = {
  env: {
    BASE_SEPOLIA_PROVIDER: process.env.BASE_SEPOLIA_PROVIDER,
  },
};

