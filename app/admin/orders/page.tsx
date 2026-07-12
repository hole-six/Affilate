import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminOrdersClient } from "@/components/admin/AdminOrdersClient";
import { Upload } from "lucide-react";

export default async function AdminOrdersPage() {
  const [orders, customers] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 200, // Fetch more for fast filtering
      include: { platform: true, customer: true },
    }),
    prisma.customer.findMany({ orderBy: { fullName: "asc" } }),
  ]);

  const customerOptions = customers.map((c) => ({ id: c.id, label: `${c.fullName} (${c.customerCode})` }));

  const mappedOrders = orders.map(o => ({
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

      <AdminOrdersClient orders={mappedOrders} customers={customerOptions} />
    </div>
  );
}
