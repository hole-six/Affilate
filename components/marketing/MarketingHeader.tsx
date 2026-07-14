import Link from "next/link";

export function MarketingHeader({ activePath = "/" }: { activePath?: string }) {
  return (
    <header className="bg-canvas/80 backdrop-blur-xl fixed top-0 w-full z-50 border-b border-primary/10">
      <nav className="flex justify-between items-center w-full px-lg md:px-3xl py-md max-w-[1200px] mx-auto h-20">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-sm hover:opacity-90 transition-opacity">
          <img src="/anhlogo.png" alt="Lvi Hoàn Tiền" className="h-10 w-auto object-contain drop-shadow-sm" />
          <span className="text-[24px] font-black text-primary tracking-tight">Lvi Hoàn Tiền</span>
        </Link>
        {/* Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-xl">
          <Link
            className={`${activePath === "/" ? "text-primary border-b-2 border-primary pb-1 font-bold" : "text-mute hover:text-primary transition-colors font-medium"} text-[14px]`}
            href="/"
          >
            Trang chủ
          </Link>
          <Link
            className={`${activePath === "/cua-hang" ? "text-primary border-b-2 border-primary pb-1 font-bold" : "text-mute hover:text-primary transition-colors font-medium"} text-[14px]`}
            href="/cua-hang"
          >
            Cửa hàng
          </Link>
          <Link
            className={`${activePath === "/huong-dan" ? "text-primary border-b-2 border-primary pb-1 font-bold" : "text-mute hover:text-primary transition-colors font-medium"} text-[14px]`}
            href="/huong-dan"
          >
            Hướng dẫn
          </Link>
          <Link
            className={`${activePath === "/faq" ? "text-primary border-b-2 border-primary pb-1 font-bold" : "text-mute hover:text-primary transition-colors font-medium"} text-[14px]`}
            href="/faq"
          >
            FAQ
          </Link>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-md">
          <Link href="/login" className="hidden sm:block text-mute hover:text-primary font-bold text-[14px]">
            Đăng nhập
          </Link>
          <Link href="/register" className="bg-gradient-to-r from-primary to-primary-active hover:shadow-lg hover:-translate-y-0.5 text-white px-xl py-sm rounded-xl font-bold text-[14px] transition-all shadow-primary/30 shadow-md">
            Đăng ký
          </Link>
        </div>
      </nav>
    </header>
  );
}
