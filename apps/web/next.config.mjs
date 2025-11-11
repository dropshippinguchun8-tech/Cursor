import nextI18NextConfig from "./next-i18next.config.mjs";

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true
  },
  i18n: nextI18NextConfig.i18n
};

export default nextConfig;
