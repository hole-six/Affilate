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
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

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
    <div className="min-h-screen bg-canvas font-sans overflow-x-hidden text-ink">
      <MarketingHeader activePath="/" />

      <main className="pt-[80px]">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#fff0e6]">
          {/* Background — full-bleed on desktop where the image already reserves
              empty space on the left for copy; on mobile the wide aspect ratio
              crops badly, so it drops down as a banner below the text instead. */}
          <div className="absolute inset-0 hidden md:block">
            <img
              src="/background.png"
              alt=""
              className="h-full w-full object-cover object-left"
              aria-hidden="true"
            />
          </div>

          <div className="relative z-10 max-w-[1200px] mx-auto px-lg md:px-3xl py-3xl md:py-[110px]">
            <div className="max-w-xl space-y-lg fade-in">
             
              <h1 className="text-[40px] md:text-[56px] font-black leading-tight text-ink tracking-tight">
                Mua Sắm Hoàn Tiền Đến <span className="text-primary relative inline-block">80%<svg className="absolute -bottom-2 left-0 w-full text-primary-pale -z-10" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0 15 Q 50 0 100 15 L 100 20 L 0 20 Z" fill="currentColor"/></svg></span> trên Shopee & TikTok Shop
              </h1>
              <p className="text-[18px] text-mute max-w-lg leading-relaxed">
                Nhận tiền mặt trực tiếp vào tài khoản ngân hàng của bạn. Gia nhập cộng đồng mua sắm thông thái ngay hôm nay!
              </p>
              <div className="flex flex-col sm:flex-row gap-md pt-md">
                <Link href="/register" className="bg-gradient-to-r from-primary to-primary-active hover:shadow-lg hover:-translate-y-0.5 text-white px-2xl py-lg rounded-2xl font-bold text-[16px] flex items-center justify-center gap-sm transition-all shadow-primary/30 shadow-md">
                  Bắt đầu tiết kiệm ngay
                  <ArrowRight size={20} />
                </Link>
                <a href="#how-it-works" className="bg-white hover:bg-primary-pale text-primary px-2xl py-lg rounded-2xl font-bold text-[16px] flex items-center justify-center gap-sm transition-all border border-primary/20 shadow-sm">
                  Tìm hiểu thêm
                </a>
              </div>
            </div>

            {/* Mobile-only banner — the wide desktop background would crop away
                the graphic elements entirely on a portrait phone screen. */}
            <div className="mt-2xl rounded-[24px] overflow-hidden shadow-lg md:hidden">
              <img src="/background.png" alt="" className="w-full h-auto object-cover" />
            </div>
          </div>
        </section>

        {/* Featured Stores */}
        <section className="bg-white py-2xl border-y border-primary/10 shadow-sm relative z-20">
          <div className="max-w-[1200px] mx-auto px-lg">
            <p className="text-center font-bold text-[14px] text-primary mb-lg uppercase tracking-widest opacity-80">Hợp tác cùng các siêu nền tảng</p>
            <div className="flex flex-wrap justify-center items-center gap-3xl">
              <div className="flex items-center gap-sm bg-canvas-soft px-xl py-sm rounded-full border border-ink/5 hover:border-primary/30 hover:shadow-md transition-all cursor-default">
                <ShopeeIcon size={32} />
                <span className="text-[20px] font-black text-ink">Shopee</span>
              </div>
              <div className="flex items-center gap-sm bg-canvas-soft px-xl py-sm rounded-full border border-ink/5 hover:border-primary/30 hover:shadow-md transition-all cursor-default">
                <TiktokIcon size={32} />
                <span className="text-[20px] font-black text-ink">TikTok Shop</span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-3xl bg-canvas relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-pale/30 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          
          <div className="max-w-[1200px] mx-auto px-lg">
            <div className="text-center mb-3xl">
              <div className="inline-flex items-center justify-center mb-sm">
                <Sparkles className="text-primary mr-2" size={24} />
                <h2 className="font-black text-[36px] md:text-[48px] text-ink tracking-tight">3 Bước Nhận Hoàn Tiền</h2>
              </div>
              <p className="text-mute text-[18px] max-w-2xl mx-auto">Chưa bao giờ việc tiết kiệm tiền lại dễ dàng và minh bạch đến thế.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-xl">
              {STEPS.map((step, index) => (
                <div key={index} className="group relative p-2xl bg-white border border-primary/10 rounded-[32px] hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 overflow-hidden">
                  <div className="absolute -right-4 -top-4 font-black text-[120px] text-primary/[0.03] select-none group-hover:text-primary/[0.08] transition-colors">{index + 1}</div>
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-pale to-white border border-primary/20 rounded-2xl flex items-center justify-center mb-xl group-hover:from-primary group-hover:to-primary-active transition-all duration-300 shadow-sm">
                    <span className="text-[24px] font-black text-primary group-hover:text-white transition-colors">{index + 1}</span>
                  </div>
                  <h3 className="font-bold text-[24px] text-ink mb-sm relative z-10">{step.title}</h3>
                  <p className="text-mute text-[15px] leading-relaxed relative z-10">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits & Features Bento */}
        <section id="features" className="py-3xl bg-primary-pale/20 border-t border-primary/5">
          <div className="max-w-[1200px] mx-auto px-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-lg h-auto md:h-[600px]">
              {/* Main Feature */}
              <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-primary to-primary-active rounded-[40px] p-3xl flex flex-col justify-between overflow-hidden relative shadow-xl shadow-primary/20">
                <div className="z-10 relative">
                  <h2 className="font-black text-[36px] md:text-[44px] text-white mb-lg leading-tight tracking-tight drop-shadow-md">Tại sao bạn nên<br/>chọn chúng tôi?</h2>
                  <p className="text-white/90 mb-xl text-[16px] max-w-md leading-relaxed font-medium">Hàng triệu người dùng đã tiết kiệm hàng chục triệu đồng mỗi năm nhờ cơ chế hoàn tiền thông minh.</p>
                  <ul className="space-y-md">
                    {[
                      "Tỉ lệ hoàn tiền cao nhất thị trường",
                      "Cập nhật trạng thái đơn hàng thời gian thực",
                      "Hàng ngàn mã giảm giá độc quyền"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-md font-bold text-[16px] text-white bg-white/10 w-fit px-md py-sm rounded-xl backdrop-blur-sm">
                        <ShieldCheck className="text-white shrink-0 drop-shadow-sm" size={20} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="absolute -bottom-10 -right-10 w-[400px] h-[400px] opacity-20">
                  <PiggyBank className="w-full h-full text-white" />
                </div>
              </div>

              {/* Quick Withdraw */}
              <div className="md:col-span-2 bg-white rounded-[40px] p-2xl flex flex-col sm:flex-row items-center sm:items-start gap-xl border border-primary/10 shadow-lg shadow-primary/5 hover:-translate-y-1 transition-transform">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-pale to-white rounded-3xl flex-shrink-0 flex items-center justify-center shadow-sm border border-primary/20">
                  <Wallet className="text-primary drop-shadow-sm" size={40} />
                </div>
                <div className="text-center sm:text-left mt-2">
                  <h4 className="font-black text-[24px] text-ink mb-xs">Rút tiền siêu tốc</h4>
                  <p className="text-mute text-[15px] leading-relaxed">Tiền hoàn về thẳng thẻ ngân hàng của bạn chỉ trong 24h. Mức tối thiểu cực thấp: chỉ từ 10.000đ.</p>
                </div>
              </div>

              {/* Support 24/7 */}
              <div className="bg-white rounded-[40px] p-2xl flex flex-col justify-between border border-primary/10 shadow-lg shadow-primary/5 hover:-translate-y-1 transition-transform group">
                <div className="w-16 h-16 bg-canvas-soft rounded-2xl flex items-center justify-center group-hover:bg-primary-pale transition-colors">
                  <Send className="text-primary" size={32} />
                </div>
                <div className="mt-xl">
                  <h4 className="font-black text-[20px] text-ink mb-xs">Bot Telegram</h4>
                  <p className="text-mute text-[14px] leading-relaxed">Theo dõi đơn hàng tự động thông minh không cần mở ứng dụng.</p>
                </div>
              </div>

              {/* Coupons */}
              <div className="bg-gradient-to-br from-[#fff0e6] to-white rounded-[40px] p-2xl flex flex-col justify-between border border-primary/10 shadow-lg shadow-primary/5 hover:-translate-y-1 transition-transform group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-primary/10">
                  <TicketPercent className="text-primary" size={32} />
                </div>
                <div className="mt-xl">
                  <h4 className="font-black text-[20px] text-ink mb-xs">Mã giảm giá</h4>
                  <p className="text-mute text-[14px] leading-relaxed">Kho voucher độc quyền Freeship và giảm sâu lên tới 50%.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Auth Access Section */}
        <section className="py-3xl bg-canvas relative">
          <div className="max-w-[1200px] mx-auto px-lg">
            <div className="bg-gradient-to-br from-white to-primary-pale/30 rounded-[40px] p-3xl md:p-[60px] border border-primary/20 shadow-2xl shadow-primary/10 grid md:grid-cols-2 gap-3xl items-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-orange/5 rounded-full blur-[60px] pointer-events-none"></div>

              <div className="space-y-xl relative z-10">
                <h2 className="text-[36px] md:text-[44px] font-black text-ink leading-tight tracking-tight">
                  Trở thành bậc thầy <br/><span className="text-primary">mua sắm thông minh</span>
                </h2>
                <p className="text-[18px] text-mute leading-relaxed">Đăng ký tài khoản ngay để nhận đặc quyền hoàn tiền lên tới 30% và hàng ngàn voucher độc quyền mỗi ngày.</p>
                <div className="flex flex-wrap gap-xl pt-sm">
                  <div className="flex items-center gap-sm font-bold text-[16px] text-ink bg-white px-md py-xs rounded-full border border-primary/10 shadow-sm">
                    <ShieldCheck className="text-primary" size={20} />
                    Bảo mật 100%
                  </div>
                  <div className="flex items-center gap-sm font-bold text-[16px] text-ink bg-white px-md py-xs rounded-full border border-primary/10 shadow-sm">
                    <Wallet className="text-primary" size={20} />
                    Rút tiền 24/7
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-md relative z-10 bg-white/50 backdrop-blur-md p-lg rounded-[32px] border border-white shadow-sm">
                <Link href="/register" className="w-full bg-gradient-to-r from-primary to-primary-active hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 text-white py-xl rounded-2xl font-black text-[18px] text-center transition-all">
                  Đăng ký tài khoản miễn phí
                </Link>
                <Link href="/login" className="w-full bg-white hover:bg-canvas-soft border-2 border-primary/20 hover:border-primary text-primary py-xl rounded-2xl font-black text-[18px] text-center transition-all shadow-sm">
                  Tôi đã có tài khoản
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
