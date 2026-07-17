import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Quên mật khẩu — iviback",
  description: "Đặt lại mật khẩu tài khoản iviback của bạn.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-lg relative">
      <Link
        href="/login"
        className="absolute left-lg top-lg z-20 flex items-center gap-xs rounded-full bg-white/50 px-md py-sm text-[13px] font-bold text-ink backdrop-blur-md transition-all hover:bg-white hover:shadow-sm"
      >
        <ArrowLeft size={16} />
        Đăng nhập
      </Link>

      <div className="w-full max-w-[420px] fade-in">
        <div className="mb-xl text-center">
          <h2 className="text-[28px] font-black text-ink tracking-tight">Quên mật khẩu?</h2>
          <p className="mt-xs text-[15px] text-mute">
            Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
          </p>
        </div>

        <ForgotPasswordForm />

        <div className="mt-xl text-center text-[14px] text-mute">
          Nhớ ra mật khẩu rồi?{" "}
          <Link href="/login" className="font-bold text-primary hover:text-primary-active hover:underline transition-colors">
            Đăng nhập
          </Link>
        </div>
      </div>
    </main>
  );
}
