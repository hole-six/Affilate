import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    // Tăng click async, không block redirect
    prisma.dealPost.update({
      where: { id: deal.id },
      data: { clicks: { increment: 1 } },
    }).catch(() => {});
    return NextResponse.redirect(deal.affiliateUrl, { status: 302 });
  }

  return new NextResponse("Link không tồn tại", { status: 404 });
}
