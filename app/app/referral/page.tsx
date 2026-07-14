import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReferralClient } from "@/components/customer/ReferralClient";

export default async function ReferralPage() {
  const session = await getSession();
  if (!session?.customerId) redirect("/admin");

  const [customer, referralOrders, activeRule] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: session.customerId },
      include: {
        _count: {
          select: { referredUsers: true }
        }
      }
    }),
    prisma.order.findMany({
      where: {
        customerId: session.customerId,
        sourceType: "referral",
        orderStatus: "approved"
      },
      select: { customerRewardAmount: true }
    }),
    prisma.commissionRule.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    })
  ]);

  if (!customer) redirect("/login");

  const totalReferralCommission = referralOrders.reduce((sum, order) => sum + Number(order.customerRewardAmount), 0);
  const referralRate = activeRule?.referralRate ? Number(activeRule.referralRate) : 0.05;
  const maxReferralOrders = activeRule?.maxReferralOrders ?? 5;
  const referralValidityMonths = activeRule?.referralValidityMonths ?? 6;

  return (
    <ReferralClient 
      customerCode={customer.customerCode} 
      totalFriends={customer._count.referredUsers}
      totalCommission={totalReferralCommission}
      referralRate={referralRate}
      maxReferralOrders={maxReferralOrders}
      referralValidityMonths={referralValidityMonths}
    />
  );
}
