import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminPaymentsClient } from "@/components/admin/AdminPaymentsClient";

export default async function AdminPaymentsPage() {
  const [pendingOrders, batches] = await Promise.all([
    prisma.order.findMany({
      where: { payoutStatus: "unpaid", orderStatus: "approved" },
      include: { customer: true },
    }),
    prisma.paymentBatch.findMany({
      orderBy: { createdAt: "desc" },
      include: { customer: true, items: true },
      take: 100, // fetch more for quick searching
    }),
  ]);

  const byCustomer = new Map<string, any>();
  for (const o of pendingOrders) {
    if (!o.customer) continue;
    const cur = byCustomer.get(o.customer.id) ?? {
      id: o.customer.id,
      name: o.customer.fullName,
      code: o.customer.customerCode,
      amount: 0,
      count: 0,
      bankName: o.customer.bankName,
      bankAccountNumber: o.customer.bankAccountNumber,
      bankAccountName: o.customer.bankAccountName,
      momoNumber: o.customer.momoNumber,
      momoName: o.customer.momoName,
    };
    cur.amount += Number(o.customerRewardAmount);
    cur.count += 1;
    byCustomer.set(o.customer.id, cur);
  }

  const pendingList = Array.from(byCustomer.values());

  const mappedBatches = batches.map(b => ({
    id: b.id,
    paymentCode: b.paymentCode,
    customerName: b.customer.fullName,
    totalAmount: Number(b.totalAmount),
    status: b.status,
    paidAt: b.paidAt ? formatDate(b.paidAt) : null,
  }));

  return (
    <div className="flex flex-col gap-2xl">
      <PageHeader
        title="Đối soát & Thanh toán"
        subtitle="Quản lý công nợ, xem nhanh thông tin chuyển khoản và thao tác tức thì."
      />

      <AdminPaymentsClient pendingList={pendingList} batches={mappedBatches} />
    </div>
  );
}
