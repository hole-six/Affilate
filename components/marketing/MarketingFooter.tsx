import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="bg-canvas-soft border-t border-primary/10">
      <div className="max-w-[1200px] mx-auto px-lg py-3xl flex flex-col md:flex-row justify-between gap-3xl">
        {/* Brand & Info */}
        <div className="space-y-lg max-w-sm">
          <div className="flex items-center gap-sm">
            <img src="/anhlogo.png" alt="lvi Hoàn Tiền" className="h-12 w-auto object-contain drop-shadow-sm" />
            <span className="text-[24px] font-black text-primary tracking-tight">lvi Hoàn Tiền</span>
          </div>
          <p className="text-mute text-[15px] leading-relaxed font-medium">
            Nền tảng hoàn tiền affiliate hàng đầu Việt Nam. Mang lại giá trị thật cho hàng triệu người tiêu dùng trên mọi mặt trận mua sắm.
          </p>
        </div>
        {/* Links Grid */}
        <div className="grid grid-cols-2 gap-3xl">
          <div className="space-y-md">
            <h5 className="font-black text-[18px] text-ink">Hỗ trợ</h5>
            <ul className="space-y-md text-mute font-medium text-[15px]">
              <li><Link className="hover:text-primary hover:translate-x-1 inline-block transition-all" href="/faq">Trung tâm trợ giúp</Link></li>
              <li><a className="hover:text-primary hover:translate-x-1 inline-block transition-all" href="#">Điều khoản sử dụng</a></li>
              <li><a className="hover:text-primary hover:translate-x-1 inline-block transition-all" href="#">Chính sách bảo mật</a></li>
            </ul>
          </div>
          <div className="space-y-md">
            <h5 className="font-black text-[18px] text-ink">Hành động</h5>
            <ul className="space-y-md text-mute font-medium text-[15px]">
              <li><Link className="hover:text-primary hover:translate-x-1 inline-block transition-all" href="/login">Đăng nhập ngay</Link></li>
              <li><Link className="hover:text-primary hover:translate-x-1 inline-block transition-all" href="/register">Tạo tài khoản</Link></li>
            </ul>
          </div>
        </div>
      </div>
      {/* Copyright */}
      <div className="border-t border-primary/10 px-lg py-lg bg-white">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-sm">
          <p className="text-mute font-medium text-[14px]">© 2024 Lvi Hoàn Tiền. Đã đăng ký bản quyền.</p>
          <div className="flex gap-lg text-[14px] text-primary font-bold">
            <span>Đẳng cấp & Tinh tế 🚀</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
