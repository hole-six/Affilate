import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LandingPage } from "@/components/marketing/LandingPage";

export const metadata: Metadata = {
  title: "iviback — Mua sắm Shopee, TikTok Shop nhận hoàn tiền tự động",
  description:
    "Dán link Shopee hoặc TikTok Shop, nhận link hoàn tiền tự động. Rút tiền từ 10.000đ, tích hợp bot Telegram, miễn phí hoàn toàn.",
  openGraph: {
    title: "iviback — Mua sắm thông minh, nhận hoàn tiền tự động",
    description:
      "Nền tảng affiliate hoàn tiền cho Shopee và TikTok Shop. Rút tiền từ 10.000đ, tích hợp bot Telegram.",
    type: "website",
    locale: "vi_VN",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "iviback",
      description: "Nền tảng affiliate hoàn tiền cho Shopee và TikTok Shop tại Việt Nam.",
    },
    {
      "@type": "Organization",
      name: "iviback",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Hệ thống hoạt động như thế nào?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Khi bạn mua hàng qua link hoàn tiền của hệ thống, sàn thương mại điện tử sẽ trả một khoản hoa hồng affiliate. Chúng tôi chia lại phần lớn khoản này cho bạn dưới dạng tiền hoàn vào ví.",
          },
        },
        {
          "@type": "Question",
          name: "Rút tiền tối thiểu bao nhiêu?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Mức rút tối thiểu là 10.000đ. Bạn có thể nhận về tài khoản ngân hàng hoặc ví Momo sau khi đơn hàng được duyệt.",
          },
        },
        {
          "@type": "Question",
          name: "Có mất phí sử dụng không?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Hoàn toàn miễn phí — không thu phí đăng ký, tạo link hay rút tiền.",
          },
        },
        {
          "@type": "Question",
          name: "Hệ thống hỗ trợ những sàn nào?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Hiện tại hỗ trợ Shopee và TikTok Shop. Các sàn khác sẽ được bổ sung trong thời gian tới.",
          },
        },
      ],
    },
  ],
};

export default async function RootPage() {
  const session = await getSession();

  if (session) {
    redirect(session.role === "admin" ? "/admin" : "/app");
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingPage />
    </>
  );
}
