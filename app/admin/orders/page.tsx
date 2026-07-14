import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";
import { Upload } from "lucide-react";

export default async function AdminOrdersPage({ searchParams }: { searchParams: { q?: string; page?: string; tab?: string; sort?: string; order?: string } }) {
  const page = Number(searchParams.page) || 1;
  const limit = 50;
  const skip = (page - 1) * limit;
  const q = searchParams.q || "";
  const tab = searchParams.tab || "all";

  const where: any = {};
  if (q) {
    where.OR = [
      { orderExternalId: { contains: q } },
      { trackingCode: { contains: q } },
      { customer: { fullName: { contains: q } } },
    ];
  }

  if (tab === "unassigned") where.customerId = null;
  if (tab === "pending_payout") where.payoutStatus = "pending";
  if (tab === "paid") where.payoutStatus = "paid";

  const orderByField = searchParams.sort || "createdAt";
  const orderByDir = searchParams.order || "desc";
  const orderBy = { [orderByField]: orderByDir };

  const [allCount, unassignedCount, pendingPayoutCount, paidCount, orders, customers, filteredCount, sumsAgg] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { customerId: null } }),
    prisma.order.count({ where: { payoutStatus: "pending" } }),
    prisma.order.count({ where: { payoutStatus: "paid" } }),
    prisma.order.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: { platform: true, customer: true },
    }),
    prisma.customer.findMany({ orderBy: { fullName: "asc" } }),
    prisma.order.count({ where }),
    prisma.order.aggregate({
      where,
      _sum: { orderAmount: true, customerRewardAmount: true, systemProfitAmount: true },
    }),
  ]);

  const customerOptions = customers.map((c) => ({ id: c.id, label: `${c.fullName} (${c.customerCode})` }));

  const mappedOrders = orders.map((o) => ({
    id: o.id,
    orderExternalId: o.orderExternalId,
    platformName: o.platform.name,
    customerName: o.customer?.fullName ?? null,
    customerId: o.customerId,
    trackingCode: o.trackingCode,
    orderAmount: Number(o.orderAmount ?? 0),
    customerRewardAmount: Number(o.customerRewardAmount),
    systemProfitAmount: Number(o.systemProfitAmount),
    orderStatus: o.orderStatus,
    payoutStatus: o.payoutStatus,
  }));

  const totalPages = Math.ceil(filteredCount / limit);
  const counts = { all: allCount, unassigned: unassignedCount, pending: pendingPayoutCount, paid: paidCount };
  const sums = {
    orderAmount: Number(sumsAgg._sum.orderAmount ?? 0),
    customerRewardAmount: Number(sumsAgg._sum.customerRewardAmount ?? 0),
    systemProfitAmount: Number(sumsAgg._sum.systemProfitAmount ?? 0),
  };

  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader
        title="Quản lý đơn hàng"
        subtitle={`Tìm kiếm, phân luồng và gán khách hàng tức thì cho ${orders.length} đơn gần nhất.`}
        action={
          <Link href="/admin/orders/import">
            <Button variant="primary" size="md">
              <Upload size={16} strokeWidth={2} />
              Import đối soát
            </Button>
          </Link>
        }
      />

      <AdminOrdersClient
        orders={mappedOrders}
        customers={customerOptions}
        totalPages={totalPages}
        currentPage={page}
        counts={counts}
        sums={sums}
      />
    </div>
  );
}
