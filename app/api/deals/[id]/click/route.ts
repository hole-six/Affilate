import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Đếm click và redirect đến affiliate URL
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const deal = await prisma.dealPost.findUnique({ where: { id: params.id } });
  if (!deal) {
    return NextResponse.json({ error: "Không tìm thấy deal" }, { status: 404 });
  }

  // Tăng click count async (không block redirect)
  prisma.dealPost.update({
    where: { id: params.id },
    data: { clicks: { increment: 1 } },
  }).catch(() => {});

  return NextResponse.redirect(deal.affiliateUrl);
}
