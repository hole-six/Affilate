import Link from "next/link";
import {
  ArrowRight,
  Link2,
  ClipboardList,
  Wallet,
  Send,
  TicketPercent,
  ShieldCheck,
  Sparkles,
  PiggyBank,
  TrendingUp,
} from "lucide-react";
import { ShopeeIcon, TiktokIcon } from "@/components/icons/PlatformIcons";
import { Reveal } from "@/components/marketing/Reveal";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";

const FEATURES = [
  {
    icon: Link2,
    title: "Tạo link hoàn tiền tức thì",
    description: "Dán link sản phẩm Shopee hoặc TikTok Shop — hệ thống tự sinh link riêng cho bạn ngay lập tức.",
  },
  {
    icon: ClipboardList,
    title: "Theo dõi đơn hàng minh bạch",
    description: "Mọi đơn hàng được ghi nhận rõ ràng: chờ xác nhận, đã duyệt, số tiền hoàn từng đơn.",
  },
  {
    icon: Wallet,
    title: "Rút tiền từ 10.000đ",
    description: "Đủ ngưỡng tối thiểu là rút được ngay về ngân hàng hoặc Momo, không phí ẩn.",
  },
  {
    icon: Send,
    title: "Bot Telegram tự động",
    description: "Gửi link thẳng vào Telegram, bot tự đổi link và báo khi đơn được duyệt — không cần mở web.",
  },
  {
    icon: TicketPercent,
    title: "Kho voucher độc quyền",
    description: "Cập nhật voucher, mã giảm giá theo từng sàn để tối ưu thêm phần tiết kiệm mỗi đơn.",
  },
  {
    icon: ShieldCheck,
    title: "Đối soát minh bạch",
    description: "Dữ liệu đối soát hoa hồng từ sàn được nhập và tính toán rõ ràng, không mập mờ.",
  },
];

const STEPS = [
  {
    title: "Đăng ký tài khoản",
    description: "Tạo tài khoản miễn phí trong chưa đầy 1 phút, không cần thẻ thanh toán.",
  },
  {
    title: "Dán link sản phẩm",
    description: "Copy link Shopee hoặc TikTok Shop bạn muốn mua, dán vào hệ thống để lấy link hoàn tiền.",
  },
  {
    title: "Mua sắm & nhận hoàn tiền",
    description: "Bấm vào link vừa tạo rồi mua sắm như bình thường — hoàn tiền tự động ghi nhận vào ví.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Hệ thống hoạt động như thế nào?",
    answer:
      "Khi bạn mua hàng qua link hoàn tiền của hệ thống, sàn thương mại điện tử sẽ trả một khoản hoa hồng affiliate. Chúng tôi chia lại phần lớn khoản này cho bạn dưới dạng tiền hoàn vào ví.",
  },
  {
    question: "Rút tiền tối thiểu bao nhiêu?",
    answer:
      "Mức rút tối thiểu là 10.000đ. Bạn có thể nhận về tài khoản ngân hàng hoặc ví Momo sau khi đơn hàng được duyệt.",
  },
  {
    question: "Có mất phí sử dụng không?",
    answer: "Hoàn toàn miễn phí — không thu phí đăng ký, tạo link hay rút tiền.",
  },
  {
    question: "Hệ thống hỗ trợ những sàn nào?",
    answer: "Hiện tại hỗ trợ Shopee và TikTok Shop. Các sàn khác sẽ được bổ sung trong thời gian tới.",
  },
  {
    question: "Tôi có thể dùng Telegram thay vì vào web không?",
    answer:
      "Có. Liên kết tài khoản Telegram trong mục Cá nhân, sau đó gửi link sản phẩm thẳng vào bot — bot tự đổi link và báo khi đơn được duyệt.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas-soft">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-ink/6 bg-canvas-soft/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-lg py-md">
          <Link href="/" className="flex items-center gap-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-primary text-[18px] font-black">
              A
            </span>
            <span className="text-[18px] font-black tracking-tight text-ink">
              Affiliate<span className="text-ink-deep"> Hoàn Tiền</span>
            </span>
          </Link>
          <div className="hidden items-center gap-2xl md:flex">
            <a href="#features" className="text-[14px] font-semibold text-body hover:text-ink transition-colors">
              Tính năng
            </a>
            <a href="#how-it-works" className="text-[14px] font-semibold text-body hover:text-ink transition-colors">
              Cách hoạt động
            </a>
            <a href="#faq" className="text-[14px] font-semibold text-body hover:text-ink transition-colors">
              Câu hỏi thường gặp
            </a>
          </div>
          <div className="flex items-center gap-sm">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center rounded-xl px-lg py-sm text-[14px] font-semibold text-ink hover:bg-ink/5 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-xs rounded-xl bg-ink px-lg py-sm text-[14px] font-bold text-primary hover:bg-ink-deep transition-colors shadow-sm"
            >
              Đăng ký miễn phí
              <ArrowRight size={14} strokeWidth={2} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden px-lg pt-3xl pb-3xl md:pt-[80px] md:pb-[96px]">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-primary/25 blur-3xl" />
          <div className="absolute -right-40 top-20 h-[380px] w-[380px] rounded-full bg-accent-cyan/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 items-center gap-3xl lg:grid-cols-[1.1fr_0.9fr]">
            <div className="fade-in">
              <div className="inline-flex items-center gap-xs rounded-pill bg-ink px-lg py-sm">
                <Sparkles size={14} strokeWidth={2} className="text-primary" />
                <span className="text-[12px] font-bold uppercase tracking-widest text-primary">
                  100% miễn phí
                </span>
              </div>

              <h1 className="mt-lg text-[36px] font-black leading-[1.08] tracking-tight text-ink sm:text-[48px] lg:text-[56px]">
                Mua sắm Shopee, TikTok Shop
                <br />
                <span className="text-ink-deep">nhận hoàn tiền tự động</span>
              </h1>

              <p className="mt-lg max-w-lg text-[16px] leading-relaxed text-body md:text-[18px]">
                Dán link sản phẩm, mua sắm như bình thường — phần hoa hồng affiliate sẽ tự động
                chuyển thành tiền hoàn về ví của bạn. Đơn giản, minh bạch, rút được từ 10.000đ.
              </p>

              <div className="mt-xl flex flex-wrap gap-md">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-sm rounded-xl bg-primary px-2xl py-lg text-[15px] font-bold text-ink-deep shadow-sm hover:bg-primary-active transition-all hover:-translate-y-0.5"
                >
                  Đăng ký ngay
                  <ArrowRight size={16} strokeWidth={2} />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-sm rounded-xl bg-canvas px-2xl py-lg text-[15px] font-bold text-ink border border-ink/10 hover:bg-ink/5 transition-all"
                >
                  Xem cách hoạt động
                </a>
              </div>

              <div className="mt-2xl flex flex-wrap gap-lg">
                <div className="flex items-center gap-sm">
                  <ShopeeIcon size={28} />
                  <span className="text-[13px] font-semibold text-mute">Shopee</span>
                </div>
                <div className="flex items-center gap-sm">
                  <TiktokIcon size={28} />
                  <span className="text-[13px] font-semibold text-mute">TikTok Shop</span>
                </div>
                <div className="flex items-center gap-sm">
                  <Send size={22} strokeWidth={1.75} className="text-mute" />
                  <span className="text-[13px] font-semibold text-mute">Bot Telegram</span>
                </div>
              </div>
            </div>

            {/* Illustrative dashboard preview (not a real screenshot) */}
            <div className="fade-in">
              <div className="relative mx-auto max-w-[380px] rounded-[28px] bg-ink p-2xl shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-xs text-primary/70">
                      <PiggyBank size={16} strokeWidth={1.75} />
                      <span className="text-[11px] font-semibold uppercase tracking-widest">
                        Tổng thu nhập
                      </span>
                    </div>
                    <div className="mt-xs text-[28px] font-black text-primary">2.480.000đ</div>
                  </div>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <TrendingUp size={20} strokeWidth={1.75} />
                  </span>
                </div>

                <div className="mt-xl grid grid-cols-2 gap-md">
                  <div className="rounded-2xl bg-canvas/10 p-lg">
                    <div className="text-[11px] font-semibold text-primary/60">Chờ xác nhận</div>
                    <div className="mt-xs text-[18px] font-bold text-primary">340.000đ</div>
                  </div>
                  <div className="rounded-2xl bg-canvas/10 p-lg">
                    <div className="text-[11px] font-semibold text-primary/60">Khả dụng</div>
                    <div className="mt-xs text-[18px] font-bold text-primary">1.120.000đ</div>
                  </div>
                </div>

                <div className="mt-xl flex flex-col gap-sm">
                  <div className="flex items-center justify-between rounded-xl bg-canvas/10 px-lg py-md">
                    <div className="flex items-center gap-sm">
                      <ShopeeIcon size={20} />
                      <span className="text-[13px] font-medium text-primary/80">Đơn Shopee #4821</span>
                    </div>
                    <span className="text-[13px] font-bold text-primary">+45.000đ</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-canvas/10 px-lg py-md">
                    <div className="flex items-center gap-sm">
                      <TiktokIcon size={20} />
                      <span className="text-[13px] font-medium text-primary/80">Đơn TikTok #1190</span>
                    </div>
                    <span className="text-[13px] font-bold text-primary">+22.000đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-lg py-3xl">
        <div className="mx-auto max-w-[1200px]">
          <Reveal className="mx-auto max-w-xl text-center">
            <h2 className="text-[28px] font-black tracking-tight text-ink sm:text-[36px]">
              Mọi thứ bạn cần để tiết kiệm hơn
            </h2>
            <p className="mt-sm text-[16px] text-mute">
              Một hệ thống duy nhất cho việc tạo link, theo dõi đơn và rút tiền.
            </p>
          </Reveal>

          <div className="mt-2xl grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 60}>
                <div className="h-full rounded-2xl border border-ink/8 bg-canvas p-xl hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-pale text-ink-deep">
                    <feature.icon size={22} strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-lg text-[17px] font-bold text-ink">{feature.title}</h3>
                  <p className="mt-xs text-[14px] leading-relaxed text-body">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="bg-ink px-lg py-3xl">
        <div className="mx-auto max-w-[1200px]">
          <Reveal className="mx-auto max-w-xl text-center">
            <h2 className="text-[28px] font-black tracking-tight text-primary sm:text-[36px]">
              Chỉ 3 bước đơn giản
            </h2>
            <p className="mt-sm text-[16px] text-primary/60">
              Không cần cài đặt phức tạp, bắt đầu kiếm hoàn tiền ngay hôm nay.
            </p>
          </Reveal>

          <div className="mt-2xl grid grid-cols-1 gap-lg md:grid-cols-3">
            {STEPS.map((step, index) => (
              <Reveal key={step.title} delay={index * 80}>
                <div className="relative h-full rounded-2xl bg-canvas/5 p-xl">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-[16px] font-black text-ink-deep">
                    {index + 1}
                  </span>
                  <h3 className="mt-lg text-[17px] font-bold text-primary">{step.title}</h3>
                  <p className="mt-xs text-[14px] leading-relaxed text-primary/60">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-lg py-3xl">
        <div className="mx-auto max-w-[720px]">
          <Reveal className="text-center">
            <h2 className="text-[28px] font-black tracking-tight text-ink sm:text-[36px]">
              Câu hỏi thường gặp
            </h2>
          </Reveal>
          <div className="mt-2xl">
            <Reveal>
              <FaqAccordion items={FAQ_ITEMS} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-lg pb-3xl">
        <Reveal className="mx-auto max-w-[1000px]">
          <div className="relative overflow-hidden rounded-[32px] bg-ink px-2xl py-3xl text-center">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <h2 className="relative text-[26px] font-black text-primary sm:text-[34px]">
              Bắt đầu nhận hoàn tiền ngay hôm nay
            </h2>
            <p className="relative mt-sm text-[15px] text-primary/60">
              Đăng ký miễn phí — không cần thẻ thanh toán, không ràng buộc.
            </p>
            <Link
              href="/register"
              className="relative mt-xl inline-flex items-center gap-sm rounded-xl bg-primary px-2xl py-lg text-[15px] font-bold text-ink-deep shadow-sm hover:bg-primary-active transition-all hover:-translate-y-0.5"
            >
              Đăng ký miễn phí
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-ink/6 px-lg py-2xl">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-md sm:flex-row">
          <div className="flex items-center gap-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-primary text-[14px] font-black">
              A
            </span>
            <span className="text-[14px] font-bold text-ink">Affiliate Hoàn Tiền</span>
          </div>
          <div className="flex items-center gap-xl text-[13px] font-medium text-mute">
            <Link href="/login" className="hover:text-ink transition-colors">
              Đăng nhập
            </Link>
            <Link href="/register" className="hover:text-ink transition-colors">
              Đăng ký
            </Link>
          </div>
          <p className="text-[12px] text-mute">
            © {new Date().getFullYear()} Affiliate Hoàn Tiền. Mọi quyền được bảo lưu.
          </p>
        </div>
      </footer>
    </div>
  );
}
