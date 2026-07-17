import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PublicFloatingSupport } from "@/components/marketing/PublicFloatingSupport";
import { DealGrid } from "@/components/customer/DealGrid";
import { ServerSearchInput } from "@/components/ui/ServerSearchInput";
import { Flame } from "lucide-react";

export const metadata: Metadata = {
  title: "Ưu Đãi & Mã Giảm Giá Shopee, TikTok Shop Mới Nhất — iviback",
  description: "Cập nhật liên tục mã giảm giá, deal sập sàn Shopee và TikTok Shop. Mua qua link iviback vừa được giá tốt vừa nhận thêm hoàn tiền.",
  alternates: { canonical: "/uu-dai" },
  openGraph: {
    title: "Ưu Đãi & Mã Giảm Giá Shopee, TikTok Shop Mới Nhất — iviback",
    description: "Cập nhật liên tục mã giảm giá, deal sập sàn Shopee và TikTok Shop. Mua qua link iviback vừa được giá tốt vừa nhận thêm hoàn tiền.",
    type: "website",
    locale: "vi_VN",
    url: "/uu-dai",
    siteName: "iviback",
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Trang chủ", item: "https://iviback.vn/" },
    { "@type": "ListItem", position: 2, name: "Ưu đãi", item: "https://iviback.vn/uu-dai" },
  ],
};

export default async function PublicDealsPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;
  const q = searchParams.q || "";

  const where: any = { status: "active" };
  if (q) {
    where.OR = [{ title: { contains: q } }, { description: { contains: q } }];
  }

  const [totalCount, activeDealsCount, deals] = await Promise.all([
    prisma.dealPost.count({ where }),
    prisma.dealPost.count({ where: { status: "active" } }),
    prisma.dealPost.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  const formattedDeals = deals.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    originalPrice: d.originalPrice ? Number(d.originalPrice) : null,
    salePrice: d.salePrice ? Number(d.salePrice) : null,
    discountPercent: d.discountPercent,
    imageUrl: d.uploadedImageUrl || d.shopeeImageUrl || null,
    shortUrl: d.shortUrl,
    clicks: d.clicks,
    createdAt: d.createdAt.toISOString(),
  }));

  const totalPages = Math.ceil(totalCount / limit);

  // ItemList JSON-LD cho các ưu đãi đang hiện trên trang — hỗ trợ rich snippet.
  const itemListJsonLd =
    formattedDeals.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: formattedDeals.map((d, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            url: d.shortUrl || "https://iviback.vn/uu-dai",
            name: d.title,
          })),
        }
      : null;

  return (
    <div className="min-h-screen bg-canvas font-sans overflow-x-hidden text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      )}
      <MarketingHeader activePath="/uu-dai" />

      <main className="pt-[80px]">
        {/* Header Hero */}
        <section className="bg-gradient-to-b from-[#fff0e6] to-white py-3xl relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-lg relative z-10 text-center">
            <img src="/heogiamgia.png" alt="Ưu đãi và mã giảm giá iviback" className="mx-auto h-24 w-24 object-contain mb-md" />
            <h1 className="text-[40px] md:text-[56px] font-black text-ink tracking-tight mb-md">
              Ưu Đãi & <span className="text-primary">Mã Giảm Giá</span>
            </h1>
            <p className="text-[18px] text-mute max-w-2xl mx-auto leading-relaxed">
              Deal sập sàn Shopee, TikTok Shop được cập nhật mỗi ngày. Mua qua link iviback vừa được giá tốt, vừa nhận thêm hoàn tiền.
            </p>
          </div>
        </section>

        {/* Deals Section */}
        <section className="py-2xl max-w-[1200px] mx-auto px-lg pb-3xl">
          <div className="mb-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
            <div className="flex items-center gap-sm">
              <Flame size={18} className="text-primary" />
              <span className="text-[14px] font-bold text-ink">{activeDealsCount} ưu đãi đang có</span>
            </div>
            <ServerSearchInput placeholder="Tìm kiếm ưu đãi..." className="sm:max-w-[280px]" />
          </div>

          {formattedDeals.length === 0 ? (
            <div className="flex flex-col items-center py-3xl text-center">
              <div className="text-6xl mb-lg">🛒</div>
              <p className="text-[16px] font-bold text-gray-400">
                {q ? "Không tìm thấy ưu đãi phù hợp" : "Chưa có ưu đãi nào"}
              </p>
              <p className="text-[13px] text-gray-300 mt-xs">
                {q ? "Thử tìm kiếm với từ khoá khác xem sao!" : "Quay lại sau nhé, admin đang cập nhật deal mới!"}
              </p>
            </div>
          ) : (
            <DealGrid deals={formattedDeals} totalPages={totalPages} currentPage={page} />
          )}
        </section>
      </main>

      <MarketingFooter />
      <PublicFloatingSupport />
    </div>
  );
}
