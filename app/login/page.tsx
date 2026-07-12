import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { Sparkles, Shield } from "lucide-react";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas-soft px-lg">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-canvas/60 blur-2xl" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] fade-in">
        {/* Logo & Brand */}
        <div className="mb-2xl text-center">
          <div className="mx-auto mb-lg inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-ink text-primary text-[28px] font-black shadow-lg">
            A
          </div>
          <h1 className="text-[26px] font-black text-ink leading-tight">Affiliate Hoàn Tiền</h1>
          <p className="mt-xs text-[14px] text-mute">Đăng nhập để tiếp tục</p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-ink/8 bg-canvas p-2xl shadow-lg">
          <LoginForm next={searchParams.next} />
        </div>

        {/* Register link */}
        <div className="mt-lg text-center text-[13px] text-mute">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-semibold text-ink-deep hover:underline">
            Đăng ký ngay
          </Link>
        </div>

        {/* Demo accounts hint */}
        <div className="mt-lg rounded-xl border border-primary/20 bg-primary-pale/60 p-lg">
          <div className="flex items-center gap-xs mb-sm">
            <Shield size={13} strokeWidth={1.75} className="text-ink-deep" />
            <span className="text-[12px] font-semibold text-ink-deep">Tài khoản demo</span>
          </div>
          <div className="space-y-[3px]">
            <div className="text-[12px] text-body">
              <span className="font-medium text-ink">Admin:</span> admin@demo.vn / Demo@123
            </div>
            <div className="text-[12px] text-body">
              <span className="font-medium text-ink">Khách hàng:</span> khach@demo.vn / Demo@123
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-lg text-center">
          <div className="flex items-center justify-center gap-xs text-[11px] text-mute">
            <Sparkles size={11} strokeWidth={1.75} className="text-primary" />
            Nền tảng affiliate hoàn tiền tích hợp Zalo & Telegram
          </div>
        </div>
      </div>
    </main>
  );
}
