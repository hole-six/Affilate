import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";

export const metadata: Metadata = {
  title: "Câu Hỏi Thường Gặp (FAQ) — iviback",
  description: "Giải đáp các thắc mắc về hệ thống hoàn tiền thông minh: rút tiền, phí sử dụng, sàn hỗ trợ và liên kết Telegram.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Câu Hỏi Thường Gặp (FAQ) — iviback",
    description: "Giải đáp các thắc mắc về hệ thống hoàn tiền thông minh: rút tiền, phí sử dụng, sàn hỗ trợ và liên kết Telegram.",
    type: "website",
    locale: "vi_VN",
    url: "/faq",
    siteName: "iviback",
  },
};

const FAQ_ITEMS = [
  {
    question: "Hệ thống hoạt động như thế nào?",
    answer:
      "Khi bạn mua hàng qua link hoàn tiền của hệ thống, sàn thương mại điện tử sẽ trả một khoản hoa hồng affiliate. Chúng tôi chia lại phần lớn khoản này cho bạn dưới dạng tiền hoàn vào ví.",
  },
  {
    question: "Rút tiền tối thiểu bao nhiêu?",
    answer:
      "Mức rút tối thiểu là 10.000đ. Bạn có thể nhận về tài khoản ngân hàng sau khi đơn hàng được duyệt.",
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

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://iviback.vn/" },
    { "@type": "ListItem", position: 2, name: "FAQ", item: "https://iviback.vn/faq" },
  ],
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-canvas font-sans overflow-x-hidden text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <MarketingHeader activePath="/faq" />

      <main className="pt-[80px]">
        {/* Header Hero */}
        <section className="bg-gradient-to-b from-[#fff0e6] to-white py-3xl relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-lg relative z-10 text-center">
            <img src="/heoQA.png" alt="Câu hỏi thường gặp iviback" className="mx-auto h-24 w-24 object-contain mb-md" />
            <h1 className="text-[40px] md:text-[56px] font-black text-ink tracking-tight mb-md">
              Câu Hỏi <span className="text-primary">Thường Gặp</span>
            </h1>
            <p className="text-[18px] text-mute max-w-2xl mx-auto leading-relaxed">
              Bạn có thắc mắc? Chúng tôi có câu trả lời. Khám phá cách hệ thống hoạt động và tối ưu số tiền hoàn của bạn.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-2xl max-w-[800px] mx-auto px-lg pb-3xl">
          <div className="bg-white rounded-[32px] p-2xl border border-primary/10 shadow-lg shadow-primary/5">
             <FaqAccordion items={FAQ_ITEMS} />
          </div>
        </section>

      </main>

      <MarketingFooter />
    </div>
  );
}
