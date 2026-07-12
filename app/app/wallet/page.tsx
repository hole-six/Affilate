import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { CustomerWalletClient } from "@/components/customer/CustomerWalletClient";

export default async function CustomerWalletPage() {
  const session = await getSession();
  if (!session?.customerId) redirect("/admin");

  const [customer, orders, paymentBatches] = await Promise.all([
    prisma.customer.findUnique({ where: { id: session.customerId } }),
    prisma.order.findMany({ where: { customerId: session.customerId } }),
    prisma.paymentBatch.findMany({
      where: { customerId: session.customerId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!customer) redirect("/login");

  const available = orders
    .filter((o) => o.orderStatus === "approved" && o.payoutStatus === "unpaid")
    .reduce((s, o) => s + Number(o.customerRewardAmount), 0);
  const processing = orders
    .filter((o) => o.payoutStatus === "processing")
    .reduce((s, o) => s + Number(o.customerRewardAmount), 0);
  const paid = orders
    .filter((o) => o.payoutStatus === "paid")
    .reduce((s, o) => s + Number(o.customerRewardAmount), 0);

  const history = paymentBatches.map(p => ({
    time: p.paidAt ? formatDate(p.paidAt) : formatDate(p.createdAt),
    amount: formatCurrency(Number(p.totalAmount)),
    status: p.status,
    code: p.paymentCode,
  }));

  return (
    <CustomerWalletClient
      stats={{ available, pending: processing, paid }}
      history={history}
      paymentInfo={{
        bankName: customer.bankName,
        bankAccountNumber: customer.bankAccountNumber,
        bankAccountName: customer.bankAccountName,
        momoNumber: customer.momoNumber,
        momoName: customer.momoName,
      }}
    />
  );
}
