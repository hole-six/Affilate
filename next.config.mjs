/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Middleware chay tren Edge Runtime, khong tu doc duoc bien moi truong
  // thuong nhu process.env.SESSION_SECRET tu .env luc runtime — phai khai
  // bao o day de Next.js nhung gia tri that vao bundle middleware luc build.
  env: {
    SESSION_SECRET: process.env.SESSION_SECRET,
  },
};

export default nextConfig;
