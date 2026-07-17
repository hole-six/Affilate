import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LandingPage } from "@/components/marketing/LandingPage";

export const metadata: Metadata = {
  title: "iviback — Mua sắm Shopee, TikTok Shop nhận hoàn tiền tự động",
  description:
    "Dán link Shopee hoặc TikTok Shop, nhận link hoàn tiền tự động. Rút tiền từ 10.000đ, tích hợp bot Telegram, miễn phí hoàn toàn.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "iviback — Mua sắm thông minh, nhận hoàn tiền tự động",
    description:
      "Nền tảng affiliate hoàn tiền cho Shopee và TikTok Shop. Rút tiền từ 10.000đ, tích hợp bot Telegram.",
    type: "website",
    locale: "vi_VN",
    url: "/",
    siteName: "iviback",
    images: [{ url: "/icontitle.png", width: 1536, height: 1024, alt: "iviback - Nền tảng hoàn tiền affiliate" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "iviback — Mua sắm thông minh, nhận hoàn tiền tự động",
    description:
      "Nền tảng affiliate hoàn tiền cho Shopee và TikTok Shop. Rút tiền từ 10.000đ, tích hợp bot Telegram.",
    images: ["/icontitle.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://iviback.vn/#website",
      url: "https://iviback.vn",
      name: "iviback",
      description: "Nền tảng affiliate hoàn tiền cho Shopee và TikTok Shop tại Việt Nam.",
      inLanguage: "vi-VN",
    },
    {
      "@type": "Organization",
      "@id": "https://iviback.vn/#organization",
      name: "iviback",
      url: "https://iviback.vn",
      logo: "https://iviback.vn/icontitle.png",
      telephone: "+84965965439",
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+84965965439",
        contactType: "customer service",
        areaServed: "VN",
        availableLanguage: "Vietnamese",
      },
      sameAs: [
        "https://www.facebook.com/share/1BShYKizDV/?mibextid=wwXIfr",
        "https://www.tiktok.com/@vi_ha790?_r=1&_t=ZS-983XgTM1aum",
        "https://www.instagram.com/imviihaaa?igsh=M2RqZml1NHpzbmgx&utm_source=qr",
        "https://youtube.com/@hoanphihoahongaff?si=aNywoErGCAi7BGxV",
      ],
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
            text: "Mức rút tối thiểu là 10.000đ. Bạn có thể nhận về tài khoản ngân hàng sau khi đơn hàng được duyệt.",
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
