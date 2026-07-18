import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

/**
 * Xoá cứng (hard delete) một khách hàng — không thể khôi phục.
 *
 * Order/PaymentBatchItem là dữ liệu đối soát/tài chính thật nên KHÔNG xoá
 * order — chỉ gỡ liên kết (customerId, trackingLinkId = null) để giữ lại
 * lịch sử doanh thu/hoa hồng hệ thống đã ghi nhận. Các bảng con phụ thuộc
 * cứng vào customerId (WithdrawRequest, TelegramLinkCode, PaymentBatch,
 * TrackingLink...) thì xoá theo đúng thứ tự để không vỡ ràng buộc khoá ngoại.
 */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: { trackingLinks: { select: { id: true } } },
  });
  if (!customer) {
    return NextResponse.json({ error: "Không tìm thấy khách hàng" }, { status: 404 });
  }

  const trackingLinkIds = customer.trackingLinks.map((l) => l.id);

  await prisma.$transaction([
    prisma.withdrawRequest.deleteMany({ where: { customerId: customer.id } }),
    prisma.telegramLinkCode.deleteMany({ where: { customerId: customer.id } }),
    prisma.zaloMessageLog.deleteMany({ where: { customerId: customer.id } }),
    prisma.telegramMessageLog.deleteMany({ where: { customerId: customer.id } }),
    prisma.paymentBatch.deleteMany({ where: { customerId: customer.id } }),
    // Giữ lại order (lịch sử đối soát thật) — chỉ gỡ liên kết khách hàng/link.
    prisma.order.updateMany({
      where: { customerId: customer.id },
      data: { customerId: null, trackingLinkId: null },
    }),
    ...(trackingLinkIds.length > 0
      ? [
          prisma.order.updateMany({
            where: { trackingLinkId: { in: trackingLinkIds } },
            data: { trackingLinkId: null },
          }),
        ]
      : []),
    prisma.trackingLink.deleteMany({ where: { customerId: customer.id } }),
    // Khách khác từng được người này giới thiệu — gỡ liên kết giới thiệu, không xoá họ.
    prisma.customer.updateMany({
      where: { referredById: customer.id },
      data: { referredById: null },
    }),
    prisma.user.deleteMany({ where: { customerId: customer.id } }),
    prisma.customer.delete({ where: { id: customer.id } }),
  ]);

  return NextResponse.json({ success: true });
}
