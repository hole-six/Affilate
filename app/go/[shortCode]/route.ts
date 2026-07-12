import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { shortCode: string } }) {
  const link = await prisma.trackingLink.findUnique({
    where: { shortCode: params.shortCode },
  });

  if (!link || link.status !== "active") {
    return new NextResponse("Link khong ton tai hoac da ngung hoat dong", { status: 404 });
  }

  await prisma.trackingLink.update({
    where: { id: link.id },
    data: {
      clicks: { increment: 1 },
      lastClickedAt: new Date(),
    },
  });

  return NextResponse.redirect(link.affiliateUrl, { status: 302 });
}
