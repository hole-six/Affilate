import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { ArrowLeft } from "lucide-react";
import { TrustBadgesCard } from "@/components/marketing/TrustBadgesCard";

export const metadata: Metadata = {
  title: "Đăng Nhập Tài Khoản — iviback Hoàn Tiền Shopee, TikTok Shop",
  description: "Đăng nhập vào iviback để quản lý ví hoàn tiền, đơn hàng và rút tiền dễ dàng.",
  alternates: { canonical: "/login" },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <main className="flex min-h-screen bg-canvas relative">
      {/* Back button positioned at top left of the form column on desktop, or top left of screen on mobile */}
      <Link 
        href="/" 
        className="absolute left-lg top-lg z-20 flex items-center gap-xs rounded-full bg-white/50 px-md py-sm text-[13px] font-bold text-ink backdrop-blur-md transition-all hover:bg-white hover:shadow-sm lg:left-[50%] lg:ml-lg"
      >
        <ArrowLeft size={16} />
        Trang chủ
      </Link>

      {/* Left Column - Image & Slogan */}
      <div className="relative hidden w-1/2 overflow-hidden bg-ink lg:block">
        <div className="absolute inset-0 z-0">
          <img
            src="/login.png"
            alt="Hoàn tiền mua sắm"
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 flex h-full flex-col justify-end p-3xl">
          <h1 className="text-[44px] font-black leading-tight text-canvas">
            Quản lý link và doanh thu
            <br />
            của bạn dễ dàng.
          </h1>
          <p className="mt-md max-w-lg text-[18px] text-canvas-soft/80">
            Tham gia cùng hàng ngàn affiliate tạo link an toàn, tỷ lệ chuyển đổi cao và theo dõi hoa hồng theo thời gian thực.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex w-full flex-col items-center justify-center p-lg lg:w-1/2 relative">
        <div className="w-full max-w-[420px] fade-in">
          {/* Logo & Brand */}
          <div className="mb-xl text-center">
            <h2 className="text-[28px] font-black text-ink tracking-tight">Chào mừng trở lại</h2>
            <p className="mt-xs text-[15px] text-mute">Đăng nhập vào tài khoản của bạn để tiếp tục</p>
          </div>

          <TrustBadgesCard className="mb-xl rounded-2xl border border-primary/15 bg-primary/[0.04] p-lg" />

          {/* Login card */}
          <div className="w-full">
            <LoginForm next={searchParams.next} />
          </div>

          {/* Register link */}
          <div className="mt-xl text-center text-[14px] text-mute">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-bold text-primary hover:text-primary-active hover:underline transition-colors">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
