import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { QuickLinkForm } from "@/components/admin/QuickLinkForm";
import { AdminLinksClient } from "@/components/admin/AdminLinksClient";
import { Link2 } from "lucide-react";

export default async function AdminLinksPage({ searchParams }: { searchParams: { q?: string; page?: string; sort?: string; order?: string; tab?: string } }) {
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const q = searchParams.q || "";

  const where: any = {};
  if (q) {
    where.OR = [
      { trackingCode: { contains: q } },
      { shortCode: { contains: q } },
      { channelSource: { contains: q } },
      { customer: { fullName: { contains: q } } },
    ];
  }

  const orderByField = searchParams.sort || "createdAt";
  const orderByDir = searchParams.order || "desc";
  const orderBy = { [orderByField]: orderByDir };

  const tab = searchParams.tab || "all";
  if (tab === "active") where.status = "active";
  if (tab === "stopped") where.status = "stopped";

  const [customers, platforms, links, filteredCount, totalCount, activeCount, stoppedCount, clicksAgg] = await Promise.all([
    prisma.customer.findMany({ where: { status: "active" }, orderBy: { fullName: "asc" } }),
    prisma.platform.findMany({ where: { status: "active" }, orderBy: { name: "asc" } }),
    prisma.trackingLink.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { customer: true, platform: true },
    }),
    prisma.trackingLink.count({ where }),
    prisma.trackingLink.count(),
    prisma.trackingLink.count({ where: { status: "active" } }),
    prisma.trackingLink.count({ where: { status: "stopped" } }),
    prisma.trackingLink.aggregate({ where, _sum: { clicks: true } }),
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
    productTitle: l.productTitle,
    productImage: l.productImage,
  }));

  const totalPages = Math.ceil(filteredCount / limit);
  const counts = { all: totalCount, active: activeCount, stopped: stoppedCount };
  const totalClicks = clicksAgg._sum.clicks ?? 0;

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
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-pale text-ink-deep">
            <Link2 size={16} strokeWidth={1.75} />
          </span>
          Lịch sử link đã tạo
        </h2>
        <AdminLinksClient links={rows} totalPages={totalPages} currentPage={page} counts={counts} totalClicks={totalClicks} />
      </div>
    </div>
  );
}
