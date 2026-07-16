import Link from "next/link";
import {
  FacebookIcon,
  ZaloIcon,
  YoutubeIcon,
  TiktokIcon,
  InstagramIcon,
  ThreadsIcon,
} from "@/components/icons/PlatformIcons";

const SOCIAL_LINKS = [
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/share/1BShYKizDV/?mibextid=wwXIfr", Icon: FacebookIcon },
  { key: "zalo", label: "Zalo", href: "https://zalo.me/0965965439", Icon: ZaloIcon },
  { key: "youtube", label: "Youtube", href: "https://youtube.com/@hoanphihoahongaff?si=aNywoErGCAi7BGxV", Icon: YoutubeIcon },
  { key: "tiktok", label: "Tiktok", href: "https://www.tiktok.com/@vi_ha790?_r=1&_t=ZS-983XgTM1aum", Icon: TiktokIcon },
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/imviihaaa?igsh=M2RqZml1NHpzbmgx&utm_source=qr", Icon: InstagramIcon },
  { key: "threads", label: "Threads", href: "https://www.threads.com/@imviihaaa?igshid=NTc4MTIwNjQ2YQ==", Icon: ThreadsIcon },
];

export function MarketingFooter() {
  return (
    <footer className="bg-canvas-soft border-t border-primary/10">
      <div className="max-w-[1200px] mx-auto px-lg py-3xl flex flex-col md:flex-row justify-between gap-3xl">
        {/* Brand & Info */}
        <div className="space-y-lg max-w-sm">
          <div className="flex items-center gap-sm">
            <img src="/icontitle.png" alt="iviback" className="h-12 w-12 object-cover rounded-full shadow-sm" />
            <span className="text-[24px] font-black text-primary tracking-tight">iviback</span>
          </div>
          <p className="text-mute text-[15px] leading-relaxed font-medium">
            Nền tảng hoàn tiền affiliate hàng đầu Việt Nam. Mang lại giá trị thật cho hàng triệu người tiêu dùng trên mọi mặt trận mua sắm.
          </p>
          <div className="space-y-sm">
            <h5 className="font-black text-[14px] text-ink">Kết nối với chúng tôi</h5>
            <div className="flex flex-wrap items-center gap-sm">
              {SOCIAL_LINKS.map(({ key, label, href, Icon }) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="transition-transform hover:-translate-y-0.5"
                >
                  <Icon size={32} />
                </a>
              ))}
            </div>
          </div>
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
          <p className="text-mute font-medium text-[14px]">© {new Date().getFullYear()} iviback. Đã đăng ký bản quyền.</p>
          <div className="flex gap-lg text-[14px] text-primary font-bold">
            <span>Đẳng cấp & Tinh tế 🚀</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
