import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { getActiveCommissionRule, isWithinReferralWindow } from "./commission";
import { notifyCustomerTelegram } from "./telegramNotify";
import { buildReferralBonusMessage } from "./telegramBot";
import { notifyCustomerInApp } from "./notifications";

/**
 * Bù hoa hồng giới thiệu cho các đơn ĐÃ approved từ trước của một khách,
 * dùng khi admin gán/đổi người giới thiệu (referredById) SAU KHI đơn đã
 * duyệt — luồng approved bình thường (import CSV / duyệt tay) chỉ tạo hoa
 * hồng đúng lúc đơn CHUYỂN sang approved, nên nếu quan hệ giới thiệu được
 * gán muộn hơn, các đơn cũ sẽ không bao giờ được tính trừ khi có hàm này
 * quét lại. Bỏ qua đơn đã có sẵn REF-... (đã tính rồi, tránh tính đúp).
 */
export async function backfillReferralBonusForCustomer(
  customerId: string
): Promise<{ created: number; totalBonus: Prisma.Decimal }> {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { referredById: true, createdAt: true, referredBy: { select: { isPartner: true } } },
  });

  if (!customer?.referredById) return { created: 0, totalBonus: new Prisma.Decimal(0) };

  const referrerId = customer.referredById;
  const isPartner = customer.referredBy?.isPartner ?? false;
  const rule = await getActiveCommissionRule();
  const maxOrders = rule?.maxReferralOrders ?? 5;
  const validMonths = rule?.referralValidityMonths ?? 6;
  const referralRate = rule?.referralRate ?? new Prisma.Decimal(0.05);

  const candidateOrders = await prisma.order.findMany({
    where: { customerId, orderStatus: "approved", sourceType: { not: "referral" } },
    orderBy: { completedAt: "asc" },
  });

  let runningBonusCount = isPartner
    ? 0
    : await prisma.order.count({
        where: {
          customerId: referrerId,
          sourceType: "referral",
          orderStatus: "approved",
          referralSourceCustomerId: customerId,
        },
      });

  let created = 0;
  let totalBonus = new Prisma.Decimal(0);

  for (const order of candidateOrders) {
    const existingRef = await prisma.order.findUnique({
      where: { platformId_orderExternalId: { platformId: order.platformId, orderExternalId: `REF-${order.orderExternalId}` } },
    });
    if (existingRef) continue; // Đã tính rồi (có thể cho referrer khác) — không đụng vào

    const referenceDate = order.orderedAt ?? order.completedAt ?? new Date();
    const isTimeValid = isPartner || isWithinReferralWindow(customer.createdAt, validMonths, referenceDate);
    if (!isTimeValid) continue;
    if (!isPartner && runningBonusCount >= maxOrders) continue;

    const afterTaxAmount = new Prisma.Decimal(order.customerRewardAmount).add(new Prisma.Decimal(order.systemProfitAmount));
    const bonusAmount = afterTaxAmount.mul(referralRate).toDecimalPlaces(0);
    const systemProfitAfterReferral = new Prisma.Decimal(order.systemProfitAmount).sub(bonusAmount);

    await prisma.order.update({
      where: { id: order.id },
      data: { systemProfitAmount: systemProfitAfterReferral, referralBonusDeducted: bonusAmount },
    });

    await prisma.order.create({
      data: {
        platformId: order.platformId,
        orderExternalId: `REF-${order.orderExternalId}`,
        customerId: referrerId,
        trackingCode: "REFERRAL",
        channel: "REFERRAL",
        orderedAt: order.orderedAt,
        completedAt: order.completedAt,
        shopName: order.shopName,
        itemName: `Hoa hồng giới thiệu: ${order.orderExternalId}`,
        orderAmount: order.orderAmount,
        grossCommissionAmount: 0,
        netCommissionAmount: 0,
        commissionAmount: 0,
        customerRewardAmount: bonusAmount,
        systemProfitAmount: 0,
        orderStatus: "approved",
        sourceType: "referral",
        referralSourceCustomerId: customerId,
      },
    });

    void notifyCustomerInApp(referrerId, {
      type: "referral_bonus",
      title: "🎁 Hoa hồng giới thiệu",
      message: `Bạn vừa nhận ${Number(bonusAmount).toLocaleString("vi-VN")}đ hoa hồng giới thiệu từ đơn hàng của bạn bè.`,
      link: "/app/referral",
    });

    void notifyCustomerTelegram(
      referrerId,
      buildReferralBonusMessage({ bonusAmount: Number(bonusAmount), friendOrderExternalId: order.orderExternalId })
    );

    runningBonusCount++;
    created++;
    totalBonus = totalBonus.add(bonusAmount);
  }

  return { created, totalBonus };
}
