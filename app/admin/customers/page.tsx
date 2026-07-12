import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreateCustomerForm } from "@/components/admin/CreateCustomerForm";
import { AdminCustomersClient } from "@/components/admin/AdminCustomersClient";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { trackingLinks: true, orders: true } },
      orders: { select: { customerRewardAmount: true, payoutStatus: true } },
    },
  });

  const rows = customers.map((c) => {
    const totalReward = c.orders.reduce((s, o) => s + Number(o.customerRewardAmount), 0);
    const debt = c.orders
      .filter((o) => o.payoutStatus !== "paid")
      .reduce((s, o) => s + Number(o.customerRewardAmount), 0);

    return {
      id: c.id,
      fullName: c.fullName,
      customerCode: c.customerCode,
      phone: c.phone,
      zaloUserId: c.zaloUserId,
      telegramUsername: c.telegramUsername,
      telegramUserId: c.telegramUserId,
      status: c.status,
      linkCount: c._count.trackingLinks,
      totalReward,
      debt,
    };
  });

  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader
        title="Quản lý khách hàng"
        subtitle={`${customers.length} khách hàng đang hoạt động trong hệ thống.`}
        action={<CreateCustomerForm />}
      />

      <AdminCustomersClient customers={rows} />
    </div>
  );
}
