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
        },
        referredUsers: {
          orderBy: { createdAt: "desc" },
          select: { id: true, fullName: true, customerCode: true, createdAt: true },
        },
      }
    }),
    prisma.order.findMany({
      where: {
        customerId: session.customerId,
        sourceType: "referral"
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        platformId: true,
        orderExternalId: true,
        customerRewardAmount: true,
        orderStatus: true,
        createdAt: true,
        referralSourceCustomerId: true,
      }
    }),
    prisma.commissionRule.findFirst({
      where: { active: true },
      orderBy: { createdAt: "desc" },
    })
  ]);

  if (!customer) redirect("/login");

  const approvedReferralOrders = referralOrders.filter((o) => o.orderStatus === "approved");
  const totalReferralCommission = approvedReferralOrders.reduce((sum, order) => sum + Number(order.customerRewardAmount), 0);
  const referralRate = activeRule?.referralRate ? Number(activeRule.referralRate) : 0.05;
  const maxReferralOrders = activeRule?.maxReferralOrders ?? 5;
  const referralValidityMonths = activeRule?.referralValidityMonths ?? 6;

  // Truy vết mỗi khoản hoa hồng giới thiệu về đúng đơn hàng gốc + người bạn
  // đã tạo ra nó (mã đơn hoa hồng giới thiệu luôn có dạng REF-{mã đơn gốc}),
  // để người giới thiệu biết chính xác khoản tiền đến từ đâu.
  const originalOrderConditions = referralOrders
    .filter((o) => o.orderExternalId.startsWith("REF-"))
    .map((o) => ({
      platformId: o.platformId,
      orderExternalId: o.orderExternalId.slice(4),
    }));

  const originalOrders = originalOrderConditions.length
    ? await prisma.order.findMany({
        where: { OR: originalOrderConditions },
        select: {
          platformId: true,
          orderExternalId: true,
          shopName: true,
          itemName: true,
          trackingLink: { select: { productTitle: true } },
          customer: { select: { fullName: true, customerCode: true } },
        },
      })
    : [];

  const originalByKey = new Map(
    originalOrders.map((o) => [`${o.platformId}:${o.orderExternalId}`, o])
  );

  const bonusHistory = referralOrders.map((o) => {
    const originalExtId = o.orderExternalId.startsWith("REF-") ? o.orderExternalId.slice(4) : o.orderExternalId;
    const original = originalByKey.get(`${o.platformId}:${originalExtId}`);
    return {
      id: o.id,
      amount: Number(o.customerRewardAmount),
      status: o.orderStatus,
      createdAt: o.createdAt.toISOString(),
      friendName: original?.customer?.fullName ?? null,
      friendCode: original?.customer?.customerCode ?? null,
      originalOrderExternalId: originalExtId,
      shopName: original?.shopName ?? null,
      itemName: original?.trackingLink?.productTitle ?? original?.itemName ?? null,
    };
  });

  // Danh sách TOÀN BỘ bạn bè đã mời — kể cả người CHƯA từng tạo ra khoản hoa
  // hồng nào (chỉ mới đăng ký, chưa mua gì) — khác với bonusHistory chỉ có
  // các giao dịch đã phát sinh. Đối tác đặc biệt cần xem được danh sách này
  // để theo dõi toàn bộ khách mình quản lý, không chỉ phần đã có tiền về.
  const friends = customer.referredUsers.map((f) => {
    const theirBonusOrders = approvedReferralOrders.filter((o) => o.referralSourceCustomerId === f.id);
    return {
      id: f.id,
      fullName: f.fullName,
      customerCode: f.customerCode,
      joinedAt: f.createdAt.toISOString(),
      bonusOrderCount: theirBonusOrders.length,
      totalEarned: theirBonusOrders.reduce((s, o) => s + Number(o.customerRewardAmount), 0),
    };
  });

  return (
    <ReferralClient
      customerCode={customer.customerCode}
      totalFriends={customer._count.referredUsers}
      totalCommission={totalReferralCommission}
      referralRate={referralRate}
      maxReferralOrders={maxReferralOrders}
      referralValidityMonths={referralValidityMonths}
      isPartner={customer.isPartner}
      bonusHistory={bonusHistory}
      friends={friends}
    />
  );
}
