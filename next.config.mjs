/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Node.js 네이티브 모듈 및 서버 액션 설정
  experimental: {
    serverComponentsExternalPackages: ["@libsql/client", "bcryptjs"],
  },
};

export default nextConfig;
