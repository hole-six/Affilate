import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { CustomerDealsClient } from "@/components/customer/CustomerDealsClient";

export default async function CustomerDealsPage() {
  const vouchers = await prisma.voucher.findMany({
    where: { status: "active" },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    include: {
      platform: true,
      linkMatches: { include: { trackingLink: true }, take: 1, orderBy: { createdAt: "desc" } },
    },
  });

  const rows = vouchers.map((v) => ({
    id: v.id,
    title: v.title,
    benefitText: v.benefitText,
    productImage: v.productImage,
    platformName: v.platform.name,
    endsAt: v.endsAt,
    link: v.linkMatches[0]?.trackingLink.shortUrl ?? v.voucherUrl,
  }));

  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader
        title="Ưu đãi hôm nay"
        subtitle="Deal giới hạn từ hệ thống — bấm vào link riêng của bạn để mua trước khi hết ưu đãi."
      />
      <CustomerDealsClient deals={rows} />
    </div>
  );
}
