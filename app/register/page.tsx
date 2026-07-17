import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";
import { ArrowLeft } from "lucide-react";
import { TrustBadgesCard } from "@/components/marketing/TrustBadgesCard";

export const metadata: Metadata = {
  title: "Đăng ký tài khoản — iviback",
  description: "Tạo tài khoản iviback miễn phí để bắt đầu nhận hoàn tiền tự động khi mua sắm trên Shopee, TikTok Shop.",
  alternates: { canonical: "/register" },
  openGraph: {
    title: "Đăng ký tài khoản — iviback",
    description: "Tạo tài khoản iviback miễn phí để bắt đầu nhận hoàn tiền tự động khi mua sắm trên Shopee, TikTok Shop.",
    type: "website",
    locale: "vi_VN",
    url: "/register",
    siteName: "iviback",
  },
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen bg-canvas relative">
      {/* Back button positioned at top left of the form column on desktop, or top left of screen on mobile */}
      <Link 
        href="/" 
        className="absolute left-lg top-lg z-20 flex items-center gap-xs rounded-full bg-white/50 px-md py-sm text-[13px] font-bold text-ink backdrop-blur-md transition-all hover:bg-white hover:shadow-sm lg:left-lg"
      >
        <ArrowLeft size={16} />
        Trang chủ
      </Link>

      {/* Left Column - Form */}
      <div className="flex w-full flex-col items-center justify-center p-lg lg:w-1/2 relative">
        <div className="w-full max-w-[420px] fade-in">
          {/* Logo & Brand */}
          <div className="mb-xl text-center">
            <h2 className="text-[28px] font-black text-ink tracking-tight">Tạo tài khoản mới</h2>
            <p className="mt-xs text-[15px] text-mute">Đăng ký để bắt đầu quản lý link và nhận hoàn tiền</p>
          </div>

          <TrustBadgesCard className="mb-xl rounded-2xl border border-primary/15 bg-primary/[0.04] p-lg" />

          {/* Register card */}
          <div className="w-full">
            <RegisterForm />
          </div>

          {/* Login link */}
          <div className="mt-xl text-center text-[14px] text-mute">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-bold text-primary hover:text-primary-active hover:underline transition-colors">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column - Image & Slogan */}
      <div className="relative hidden w-1/2 overflow-hidden bg-ink lg:block">
        <div className="absolute inset-0 z-0">
          <img
            src="/register.png"
            alt="Hoàn tiền mua sắm đăng ký"
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 flex h-full flex-col justify-end p-3xl text-right">
          <h1 className="text-[44px] font-black leading-tight text-canvas">
            Quản lý link và doanh thu
            <br />
            của bạn dễ dàng.
          </h1>
          <p className="mt-md max-w-lg text-[18px] text-canvas-soft/80 ml-auto">
            Tham gia cùng hàng ngàn affiliate tạo link an toàn, tỷ lệ chuyển đổi cao và theo dõi hoa hồng theo thời gian thực.
          </p>
        </div>
      </div>
    </main>
  );
}
