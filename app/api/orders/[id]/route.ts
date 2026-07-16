import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notifyCustomerTelegram } from "@/lib/telegramNotify";
import { buildOrderApprovedMessage } from "@/lib/telegramBot";
import { notifyCustomerInApp } from "@/lib/notifications";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { customerId, orderStatus } = await req.json();
  const order = await prisma.order.findUnique({ where: { id: params.id } });
  if (!order) return NextResponse.json({ error: "Không tìm thấy đơn" }, { status: 404 });

  // Kiểm tra chuyển trạng thái hợp lệ
  const VALID_TRANSITIONS: Record<string, string[]> = {
    pending:   ["completed", "cancelled", "approved"],
    completed: ["approved", "cancelled"],   // Shopee đã trả → approved; hoặc phát hiện lỗi → cancelled
    approved:  ["clawback"],                // Shopee đòi lại
    cancelled: ["pending"],                 // Khôi phục nếu nhầm
    clawback:  [],                          // Trạng thái cuối, không thay đổi
  };

  if (orderStatus && order.orderStatus !== orderStatus) {
    const allowed = VALID_TRANSITIONS[order.orderStatus] ?? [];
    if (!allowed.includes(orderStatus)) {
      return NextResponse.json(
        { error: `Không thể chuyển từ "${order.orderStatus}" sang "${orderStatus}"` },
        { status: 400 }
      );
    }
  }

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

  // ============================================================
  // Xử LÝ APPROVED (Admin xác nhận Shopee đã trả hoa hồng)
  // Chạy referral bonus + thông báo Telegram khi đơn VỪA chuyển sang
  // approved, HOẶC khi đơn đã approved từ trước (import tự động) nhưng
  // chưa map khách — và admin vừa gán khách vào (thao tác "Gán khách" ở
  // tab "Chưa map khách" rất phổ biến, trước đây bị bỏ sót không tính
  // referral bonus / không báo Telegram vì chỉ check khi đổi orderStatus
  // trong CÙNG request).
  // ============================================================
  const justBecameApproved = updated.orderStatus === "approved" && order.orderStatus !== "approved";
  const justGotCustomerOnApprovedOrder = updated.orderStatus === "approved" && !order.customerId && !!customerId;

  if ((justBecameApproved || justGotCustomerOnApprovedOrder) && targetCustomerId) {
    // Thông báo Telegram
    void notifyCustomerTelegram(
      targetCustomerId,
      buildOrderApprovedMessage({
        orderExternalId: updated.orderExternalId,
        customerRewardAmount: Number(updated.customerRewardAmount),
        shopName: updated.shopName,
      })
    );

    void notifyCustomerInApp(targetCustomerId, {
      type: "order_approved",
      title: "💰 Tiền đã về!",
      message: `Đơn hàng ${updated.orderExternalId}${updated.shopName ? ` (${updated.shopName})` : ""} đã được duyệt — bạn sẽ nhận ${Number(updated.customerRewardAmount).toLocaleString("vi-VN")}đ hoàn tiền.`,
      link: "/app/orders",
    });

    // Xử lý Referral Bonus
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

      const expirationDate = new Date(customerData.createdAt);
      expirationDate.setMonth(expirationDate.getMonth() + validMonths);
      const isTimeValid = new Date() <= expirationDate;

      if (isTimeValid) {
        const f1OrderCount = await prisma.order.count({
          where: {
            customerId: targetCustomerId,
            orderStatus: "approved",
            sourceType: { not: "referral" },
          },
        });

        if (f1OrderCount <= maxOrders) {
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

          void notifyCustomerInApp(customerData.referredById, {
            type: "referral_bonus",
            title: "🎁 Hoa hồng giới thiệu",
            message: `Bạn vừa nhận ${bonusAmount.toLocaleString("vi-VN")}đ hoa hồng giới thiệu từ đơn hàng của bạn bè.`,
            link: "/app/referral",
          });
        }
      }
    }
  }

  // ============================================================
  // Xử LÝ CLAWBACK (Shopee đòi lại hoa hồng)
  // Nếu đơn đã được duyệt và chưa thanh toán cho khách:
  //   → Chỉ đổi trạng thái, không có tác động tài chính thêm
  // Nếu đơn đã thanh toán cho khách (payoutStatus=paid):
  //   → Tạo bụt toán đảo (Order âm) để trừ tiền ví
  // ============================================================
  if (orderStatus === "clawback") {
    // Đảo referral bonus nếu có
    const refOrder = await prisma.order.findUnique({
      where: { platformId_orderExternalId: { platformId: updated.platformId, orderExternalId: `REF-${updated.orderExternalId}` } },
    });
    if (refOrder && refOrder.orderStatus === "approved") {
      await prisma.order.update({
        where: { id: refOrder.id },
        data: { orderStatus: "clawback" },
      });

      // Nếu hoa hồng giới thiệu đã được trả cho người giới thiệu rồi,
      // phải trừ lại ví của họ — nếu không họ vẫn giữ tiền cho một đơn
      // hàng gốc đã bị Shopee đòi lại hoa hồng.
      if (refOrder.payoutStatus === "paid") {
        await prisma.order.create({
          data: {
            platformId: refOrder.platformId,
            orderExternalId: `CLAWBACK-${refOrder.orderExternalId}`,
            customerId: refOrder.customerId,
            trackingCode: "REFERRAL",
            channel: "CLAWBACK",
            itemName: `[Clawback hoa hồng giới thiệu] ${updated.orderExternalId}`,
            orderAmount: refOrder.orderAmount,
            grossCommissionAmount: 0,
            netCommissionAmount: 0,
            commissionAmount: 0,
            customerRewardAmount: -Number(refOrder.customerRewardAmount),
            systemProfitAmount: 0,
            orderStatus: "clawback",
            payoutStatus: "unpaid",
            sourceType: "clawback",
          },
        });
      }
    }

    if (updated.payoutStatus === "paid" && targetCustomerId) {
      // Tạo bụt toán trừ ví khách
      await prisma.order.create({
        data: {
          platformId: updated.platformId,
          orderExternalId: `CLAWBACK-${updated.orderExternalId}`,
          customerId: targetCustomerId,
          trackingCode: updated.trackingCode,
          channel: "CLAWBACK",
          orderedAt: updated.orderedAt,
          completedAt: updated.completedAt,
          shopName: updated.shopName,
          itemName: `[Clawback] ${updated.itemName ?? updated.orderExternalId}`,
          orderAmount: updated.orderAmount,
          grossCommissionAmount: 0,
          netCommissionAmount: 0,
          commissionAmount: 0,
          customerRewardAmount: -Number(updated.customerRewardAmount), // Số âm = trừ ví
          systemProfitAmount: -Number(updated.systemProfitAmount),
          orderStatus: "clawback",
          payoutStatus: "unpaid",
          sourceType: "clawback",
        },
      });
    }
  }

  return NextResponse.json({ order: updated });
}
