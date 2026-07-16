import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Hướng Dẫn — Ivi Hoàn tiền",
  description: "Cách sử dụng nền tảng hoàn tiền: 3 bước đơn giản để mua sắm thông minh.",
};

const STEPS = [
  {
    title: "Đăng ký tài khoản",
    description: "Tạo tài khoản miễn phí trong chưa đầy 1 phút, không cần thẻ thanh toán. Bạn chỉ cần điền thông tin cơ bản để hệ thống tạo ví nhận hoàn tiền cho bạn.",
  },
  {
    title: "Dán link sản phẩm",
    description: "Copy link Shopee hoặc TikTok Shop bạn muốn mua, dán vào hệ thống để lấy link hoàn tiền. Hệ thống sẽ tự động sinh ra một link dành riêng cho bạn.",
  },
  {
    title: "Mua sắm & nhận hoàn tiền",
    description: "Bấm vào link vừa tạo rồi mua sắm như bình thường. Khi đơn hàng giao thành công, hoàn tiền sẽ tự động ghi nhận vào ví và có thể rút bất cứ lúc nào.",
  },
];

export default function HuongDanPage() {
  return (
    <div className="min-h-screen bg-canvas font-sans overflow-x-hidden text-ink">
      <MarketingHeader activePath="/huong-dan" />

      <main className="pt-[80px]">
        {/* Header Hero */}
        <section className="bg-gradient-to-b from-[#fff0e6] to-white py-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-pale/30 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
          <div className="max-w-[1200px] mx-auto px-lg relative z-10 text-center">
            <h1 className="text-[40px] md:text-[56px] font-black text-ink tracking-tight mb-md">
              Hướng dẫn <span className="text-primary">Sử Dụng</span>
            </h1>
            <p className="text-[18px] text-mute max-w-2xl mx-auto leading-relaxed">
              Chỉ với 3 bước cực kỳ đơn giản, bạn đã có thể bắt đầu tích luỹ hoàn tiền cho mỗi đơn mua sắm trực tuyến.
            </p>
          </div>
        </section>

        {/* Steps Grid */}
        <section className="py-3xl max-w-[1200px] mx-auto px-lg">
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
        </section>
        
        <section className="py-xl max-w-[800px] mx-auto px-lg">
            <div className="bg-primary/5 rounded-[32px] p-2xl border border-primary/20 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none"></div>
                <h3 className="text-[24px] font-black text-ink mb-md">Mẹo nhỏ nâng cao (Tuỳ chọn)</h3>
                <p className="text-[16px] text-mute mb-md leading-relaxed">
                    Bạn cũng có thể không cần phải mở Website để đổi link! Hãy liên kết với <span className="font-bold text-primary">Bot Telegram</span> của chúng tôi trong Cài đặt Cá nhân.
                </p>
                <p className="text-[16px] text-mute leading-relaxed">
                    Mỗi khi lướt thấy đồ muốn mua trên Shopee/TikTok, chỉ việc gửi link đó vào khung chat Telegram, Bot sẽ gửi lại ngay link hoàn tiền trong 1 giây. Mọi tin nhắn duyệt hoàn tiền cũng sẽ được thông báo ngay lập tức qua Telegram.
                </p>
            </div>
        </section>

        {/* CTA Section */}
        <section className="bg-canvas pb-3xl pt-xl max-w-[1200px] mx-auto px-lg">
          <div className="bg-gradient-to-r from-primary to-primary-active rounded-[32px] p-3xl flex flex-col items-center text-center shadow-2xl shadow-primary/20 relative overflow-hidden">
            <Sparkles className="absolute top-10 left-10 text-white/30 w-16 h-16" />
            <Sparkles className="absolute bottom-10 right-10 text-white/30 w-16 h-16" />
            
            <h2 className="text-[32px] font-black text-white mb-md relative z-10">Bắt đầu ngay hôm nay!</h2>
            <Link href="/register" className="bg-white text-primary font-black px-2xl py-lg rounded-2xl flex items-center gap-sm hover:scale-105 hover:shadow-xl transition-all relative z-10">
              Tạo tài khoản & lấy link <ArrowRight size={20} />
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
