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
    // Đóng dấu thời điểm build — dùng làm query-string "?v=" cho vài ảnh
    // hay bị admin thay nội dung nhưng giữ nguyên tên file (logo, ảnh lưu
    // ý...). Ảnh /uploads/ đã có UUID riêng nên không cần cái này; đây chỉ
    // cho các ảnh tĩnh nằm sẵn trong public/ và tái dùng nguyên tên.
    NEXT_PUBLIC_ASSET_VERSION: String(Date.now()),
  },
};

export default nextConfig;
