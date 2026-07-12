import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { QuickLinkForm } from "@/components/admin/QuickLinkForm";
import { AdminLinksClient } from "@/components/admin/AdminLinksClient";
import { Link2 } from "lucide-react";

export default async function AdminLinksPage() {
  const [customers, platforms, links] = await Promise.all([
    prisma.customer.findMany({ where: { status: "active" }, orderBy: { fullName: "asc" } }),
    prisma.platform.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
    prisma.trackingLink.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { customer: true, platform: true },
    }),
  ]);

  const rows = links.map((l) => ({
    id: l.id,
    createdAt: l.createdAt,
    customerName: l.customer.fullName,
    platformName: l.platform.name,
    trackingCode: l.trackingCode,
    shortCode: l.shortCode,
    channelSource: l.channelSource,
    clicks: l.clicks,
    status: l.status,
  }));

  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader
        title="Tạo link nhanh"
        subtitle="Dán link sản phẩm, chọn khách hàng — hệ thống tự động build link Shopee affiliate, sinh short link và tracking code."
      />

      <QuickLinkForm
        customers={customers.map((c) => ({ id: c.id, label: `${c.fullName} (${c.customerCode})` }))}
        platforms={platforms.map((p) => ({ id: p.id, label: p.name }))}
      />

      <div>
        <h2 className="display-xs mb-lg flex items-center gap-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-pale text-gray-900-deep">
            <Link2 size={16} strokeWidth={1.75} />
          </span>
          Lịch sử link đã tạo
        </h2>
        <AdminLinksClient links={rows} />
      </div>
    </div>
  );
}
