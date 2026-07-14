import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notifyCustomerTelegram } from "@/lib/telegramNotify";
import { buildOrderApprovedMessage } from "@/lib/telegramBot";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { customerId, orderStatus } = await req.json();
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Không tìm thấy đơn" }, { status: 404 });

  let data: Record<string, unknown> = {};

  if (customerId) data.customerId = customerId;
  if (orderStatus) {
    data.orderStatus = orderStatus;
    if (orderStatus === "approved") data.approvedAt = new Date();
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Không có gì để cập nhật" }, { status: 400 });
  }

  const updated = await prisma.order.update({ where: { id: params.id }, data });

  const targetCustomerId = updated.customerId;
  if (orderStatus === "approved" && targetCustomerId) {
    // Notify customer
    void notifyCustomerTelegram(
      targetCustomerId,
      buildOrderApprovedMessage({
        orderExternalId: updated.orderExternalId,
        customerRewardAmount: Number(updated.customerRewardAmount),
        shopName: updated.shopName,
      })
    );

    // Handle Referral Bonus
    const customerData = await prisma.customer.findUnique({
      where: { id: targetCustomerId },
      select: { referredById: true, createdAt: true },
    });

    if (customerData?.referredById) {
      const activeRule = await prisma.commissionRule.findFirst({
        where: { active: true },
        orderBy: { createdAt: "desc" },
      });
      
      const maxOrders = activeRule?.maxReferralOrders ?? 5;
      const validMonths = activeRule?.referralValidityMonths ?? 6;
      const referralRate = activeRule?.referralRate ? Number(activeRule.referralRate) : 0.05;

      // Check validity by time
      const expirationDate = new Date(customerData.createdAt);
      expirationDate.setMonth(expirationDate.getMonth() + validMonths);
      const isTimeValid = new Date() <= expirationDate;

      if (isTimeValid) {
        // Check order count
        const f1OrderCount = await prisma.order.count({
          where: {
            customerId: targetCustomerId,
            orderStatus: "approved",
            sourceType: { not: "referral" },
          },
        });

        if (f1OrderCount < maxOrders) {
          const bonusAmount = Number(updated.customerRewardAmount) * referralRate;

          await prisma.order.upsert({
            where: { platformId_orderExternalId: { platformId: updated.platformId, orderExternalId: `REF-${updated.orderExternalId}` } },
            update: {
              customerId: customerData.referredById,
              orderAmount: updated.orderAmount,
              commissionAmount: 0,
              customerRewardAmount: bonusAmount,
              systemProfitAmount: 0,
              orderStatus: "approved",
            },
            create: {
              platformId: updated.platformId,
              orderExternalId: `REF-${updated.orderExternalId}`,
              customerId: customerData.referredById,
              trackingCode: "REFERRAL",
              channel: "REFERRAL",
              orderedAt: updated.orderedAt,
              completedAt: updated.completedAt,
              shopName: updated.shopName,
              itemName: `Hoa hồng giới thiệu: ${updated.orderExternalId}`,
              orderAmount: updated.orderAmount,
              grossCommissionAmount: 0,
              netCommissionAmount: 0,
              commissionAmount: 0,
              customerRewardAmount: bonusAmount,
              systemProfitAmount: 0,
              orderStatus: "approved",
              sourceType: "referral",
            },
          });
        }
      }
    }
  }

  return NextResponse.json({ order: updated });
}
