import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createTrackingLink } from "@/lib/trackingLinkService";

export async function GET(_: NextRequest, { params }: { params: { shortCode: string } }) {
  // 1. Thử tìm trong TrackingLink trước
  const link = await prisma.trackingLink.findUnique({
    where: { shortCode: params.shortCode },
  });

  if (link) {
    if (link.status !== "active") {
      return new NextResponse("Link không tồn tại hoặc đã ngừng hoạt động", { status: 404 });
    }
    await prisma.trackingLink.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 }, lastClickedAt: new Date() },
    });
    return NextResponse.redirect(link.affiliateUrl, { status: 302 });
  }

  // 2. Thử tìm trong DealPost (deal giảm giá)
  const deal = await prisma.dealPost.findUnique({
    where: { shortCode: params.shortCode },
  });

  if (deal) {
    if (deal.status !== "active") {
      return new NextResponse("Deal không còn hoạt động", { status: 404 });
    }

    // ============================================================
    // Nếu khách ĐÃ ĐĂNG NHẬP bấm vào deal — bắt buộc map đúng link cá
    // nhân của CHÍNH KHÁCH ĐÓ (không map vào SYSTEM nữa), để hoa hồng
    // tính đúng cho họ y hệt như tự tay tạo link ở mục "Tạo link hoàn
    // tiền". Tái dùng link cá nhân đã có (nếu khách từng bấm deal này
    // rồi) để tránh sinh trùng lặp mỗi lần bấm lại.
    // ============================================================
    const session = await getSession();
    if (session?.customerId) {
      try {
        let personalLink = await prisma.trackingLink.findFirst({
          where: { customerId: session.customerId, normalizedUrl: deal.cleanLink },
          orderBy: { createdAt: "desc" },
        });

        if (!personalLink) {
          const platform = await prisma.platform.findFirst({ where: { code: deal.platformCode } });
          if (platform) {
            const result = await createTrackingLink({
              originalUrl: deal.cleanLink,
              platformId: platform.id,
              customerId: session.customerId,
              channelSource: "web",
            });
            personalLink = result.link;
          }
        }

        if (personalLink) {
          await prisma.trackingLink.update({
            where: { id: personalLink.id },
            data: { clicks: { increment: 1 }, lastClickedAt: new Date() },
          });
          prisma.dealPost.update({ where: { id: deal.id }, data: { clicks: { increment: 1 } } }).catch(() => {});
          return NextResponse.redirect(personalLink.affiliateUrl, { status: 302 });
        }
      } catch {
        // Tạo link cá nhân thất bại (vd thiếu SHOPEE_AFFILIATE_ID) — rơi
        // xuống dùng link chung bên dưới, không chặn khách mua hàng.
      }
    }

    // Khách chưa đăng nhập, hoặc tạo link cá nhân thất bại — dùng link
    // công khai chung (map vào SYSTEM) như trước.
    prisma.dealPost.update({
      where: { id: deal.id },
      data: { clicks: { increment: 1 } },
    }).catch(() => {});
    return NextResponse.redirect(deal.affiliateUrl, { status: 302 });
  }

  return new NextResponse("Link không tồn tại", { status: 404 });
}
