import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { CustomerOrdersClient } from "@/components/customer/CustomerOrdersClient";

export default async function CustomerOrdersPage() {
  const session = await getSession();
  if (!session?.customerId) redirect("/admin");

  const orders = await prisma.order.findMany({
    where: { customerId: session.customerId },
    orderBy: { createdAt: "desc" },
    include: { platform: true },
  });

  const formattedOrders = orders.map((o) => ({
    id: o.id,
    orderExternalId: o.orderExternalId,
    platformName: o.platform.name,
    createdAt: formatDate(o.createdAt),
    orderAmount: formatCurrency(Number(o.orderAmount ?? 0)),
    customerRewardAmount: formatCurrency(Number(o.customerRewardAmount)),
    orderStatus: o.orderStatus,
    payoutStatus: o.payoutStatus,
  }));

  return <CustomerOrdersClient orders={formattedOrders} />;
}
